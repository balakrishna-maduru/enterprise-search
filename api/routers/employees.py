# api/routers/employees.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from elasticsearch import Elasticsearch
import os
from datetime import datetime

router = APIRouter(prefix="/employees", tags=["employees"])

# Initialize Elasticsearch client
def get_es_client():
    """Get Elasticsearch client"""
    es_host = os.getenv('ELASTICSEARCH_HOST', 'localhost')
    es_port = int(os.getenv('ELASTICSEARCH_PORT', '9200'))
    
    try:
        es = Elasticsearch([f"http://{es_host}:{es_port}"])
        if not es.ping():
            raise Exception("Cannot connect to Elasticsearch")
        return es
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Elasticsearch connection failed: {str(e)}")

@router.get("/search")
async def search_employees(
    q: str = Query(..., description="Search query"),
    size: int = Query(20, description="Number of results to return", le=100),
    department: Optional[str] = Query(None, description="Filter by department"),
    location: Optional[str] = Query(None, description="Filter by location"),
    level: Optional[int] = Query(None, description="Filter by organizational level")
):
    """
    Search employees with optional filters
    """
    try:
        es = get_es_client()
        
        # Build the search query
        query = {
            "bool": {
                "should": [
                    {
                        "multi_match": {
                            "query": q,
                            "fields": [
                                "name^3",
                                "title^2", 
                                "department^2",
                                "email",
                                "location",
                                "skills",
                                "bio"
                            ],
                            "type": "best_fields",
                            "fuzziness": "AUTO"
                        }
                    },
                    {
                        "wildcard": {
                            "name.keyword": f"*{q}*"
                        }
                    }
                ],
                "minimum_should_match": 1
            }
        }
        
        # Add filters
        filters = []
        if department:
            filters.append({"term": {"department.keyword": department}})
        if location:
            filters.append({"term": {"location.keyword": location}})
        if level is not None:
            filters.append({"term": {"level": level}})
        
        if filters:
            query["bool"]["filter"] = filters
        
        # Execute search
        search_body = {
            "query": query,
            "size": size,
            "sort": [
                {"level": {"order": "asc"}},
                {"_score": {"order": "desc"}},
                {"name.keyword": {"order": "asc"}}
            ]
        }
        
        result = es.search(index="employees", body=search_body)
        
        # Format results
        employees = []
        for hit in result['hits']['hits']:
            employee = hit['_source'].copy()
            employee['id'] = hit['_id']  # Add the document ID to the source
            employee['score'] = hit['_score']
            employees.append(employee)
        
        return {
            "success": True,
            "data": {
                "employees": employees,
                "total": result['hits']['total']['value'],
                "max_score": result['hits']['max_score']
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    """
    Get employee by ID
    """
    try:
        es = get_es_client()
        
        result = es.get(index="employees", id=employee_id)
        employee_data = result['_source'].copy()
        employee_data['id'] = result['_id']  # Add the document ID to the source
        
        return {
            "success": True,
            "data": employee_data
        }
        
    except Exception as e:
        if "not_found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Employee not found")
        raise HTTPException(status_code=500, detail=f"Failed to get employee: {str(e)}")

@router.get("/{employee_id}/hierarchy")
async def get_employee_hierarchy(employee_id: str):
    """
    Get employee hierarchy (org chart centered on the employee)
    """
    try:
        es = get_es_client()
        
        # Get the employee
        employee_doc = es.get(index="employees", id=employee_id)
        employee = employee_doc['_source'].copy()
        employee['id'] = employee_doc['_id']  # Add the document ID to the source
        
        # Get all employees to build hierarchy
        all_employees_result = es.search(
            index="employees",
            body={
                "query": {"match_all": {}},
                "size": 1000,
                "_source": ["name", "title", "department", "manager_id", "level", "email"]
            }
        )
        
        # Build employee dict using document _id as the key and include id in source
        all_employees = {}
        for emp_doc in all_employees_result['hits']['hits']:
            emp_source = emp_doc['_source'].copy()
            emp_source['id'] = emp_doc['_id']  # Add the document ID to the source
            all_employees[emp_doc['_id']] = emp_source
        
        # Build hierarchy tree
        def build_hierarchy_node(emp_id: str, employees_dict: Dict[str, Any]) -> Dict[str, Any]:
            if emp_id not in employees_dict:
                return None
                
            emp = employees_dict[emp_id]
            
            # Find direct reports
            reports = []
            for other_id, other_emp in employees_dict.items():
                if other_emp.get('manager_id') == emp_id:
                    report_node = build_hierarchy_node(other_id, employees_dict)
                    if report_node:
                        reports.append(report_node)
            
            return {
                "id": emp['id'],
                "name": emp['name'],
                "title": emp['title'],
                "department": emp['department'],
                "email": emp['email'],
                "level": emp.get('level', 0),
                "reports": reports,
                "is_target": emp_id == employee_id
            }
        
        # Find the root of the tree (top-level manager)
        current_emp = employee
        while current_emp.get('manager_id') and current_emp['manager_id'] in all_employees:
            current_emp = all_employees[current_emp['manager_id']]
        
        # Build the complete hierarchy from the root
        hierarchy_tree = build_hierarchy_node(current_emp['id'], all_employees)
        
        # Get management chain for the target employee
        management_chain = []
        current_emp = employee
        while current_emp.get('manager_id') and current_emp['manager_id'] in all_employees:
            manager = all_employees[current_emp['manager_id']]
            management_chain.append({
                "id": manager['id'],
                "name": manager['name'],
                "title": manager['title'],
                "level": manager.get('level', 0)
            })
            current_emp = manager
        
        return {
            "success": True,
            "data": {
                "employee": employee,
                "hierarchy_tree": hierarchy_tree,
                "management_chain": list(reversed(management_chain)),
                "total_employees": len(all_employees)
            }
        }
        
    except Exception as e:
        if "not_found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Employee not found")
        raise HTTPException(status_code=500, detail=f"Failed to get hierarchy: {str(e)}")

@router.get("/departments/list")
async def get_departments():
    """
    Get list of all departments
    """
    try:
        es = get_es_client()
        
        result = es.search(
            index="employees",
            body={
                "aggs": {
                    "departments": {
                        "terms": {
                            "field": "department.keyword",
                            "size": 100
                        }
                    }
                },
                "size": 0
            }
        )
        
        departments = [bucket['key'] for bucket in result['aggregations']['departments']['buckets']]
        
        return {
            "success": True,
            "data": {
                "departments": departments,
                "count": len(departments)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get departments: {str(e)}")

@router.get("/locations/list")
async def get_locations():
    """
    Get list of all locations
    """
    try:
        es = get_es_client()
        
        result = es.search(
            index="employees",
            body={
                "aggs": {
                    "locations": {
                        "terms": {
                            "field": "location.keyword",
                            "size": 100
                        }
                    }
                },
                "size": 0
            }
        )
        
        locations = [bucket['key'] for bucket in result['aggregations']['locations']['buckets']]
        
        return {
            "success": True,
            "data": {
                "locations": locations,
                "count": len(locations)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get locations: {str(e)}")
