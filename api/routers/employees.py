# api/routers/employees.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from elasticsearch import Elasticsearch
from config import settings
from datetime import datetime

router = APIRouter(prefix="/employees", tags=["employees"])

# Initialize Elasticsearch client
def get_unified_es_client():
    """Get Elasticsearch client using settings from config"""
    try:
        # Parse URL from settings
        es_url = settings.ELASTICSEARCH_URL or "http://localhost:9200"
        es = Elasticsearch([es_url])
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
        es = get_unified_es_client()
        
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
        
        # Build the complete search body with proper bool query structure
        search_body = {
            "query": {
                "bool": {
                    "must": [query],  # Pass the complete query object
                    "filter": filters if filters else []
                }
            },
            "size": size,
            "sort": [
                {"level": {"order": "asc", "missing": "_last"}},
                {"_score": {"order": "desc"}},
                {"name.keyword": {"order": "asc", "missing": "_last"}}
            ]
        }
        
        result = es.search(index="employees", body=search_body)
        
        # Format results
        employees = []
        for hit in result['hits']['hits']:
            source = hit['_source']
            # The employee data is directly in the source for employees index
            employee = source.copy()
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
        es = get_unified_es_client()
        
        # Search for employee in employees index
        search_body = {
            "query": {
                "term": {"id": employee_id}
            },
            "size": 1
        }
        
        result = es.search(index="employees", body=search_body)
        
        if result['hits']['total']['value'] == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        hit = result['hits']['hits'][0]
        source = hit['_source']
        
        # For employees index, data is directly in source
        employee_data = source.copy()
        
        return {
            "success": True,
            "data": employee_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get employee: {str(e)}")

@router.get("/{employee_id}/hierarchy")
async def get_employee_hierarchy(employee_id: str):
    """
    Get employee hierarchy (org chart centered on the employee)
    """
    try:
        es = get_unified_es_client()
        
        # Get the employee from employees
        search_body = {
            "query": {
                "term": {"id": employee_id}
            },
            "size": 1
        }
        
        employee_result = es.search(index="employees", body=search_body)
        
        if employee_result['hits']['total']['value'] == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        hit = employee_result['hits']['hits'][0]
        source = hit['_source']
        
        # For employees index, data is directly in source
        employee = source.copy()
        
        # Get all employees to build hierarchy
        all_employees_result = es.search(
            index="employees",
            body={
                "query": {"match_all": {}},
                "size": 1000,
                "_source": ["id", "name", "title", "department", "email", "level", "manager_id", "reports"]
            }
        )
        
        # Build employee dict using the source data directly
        all_employees = {}
        for emp_doc in all_employees_result['hits']['hits']:
            emp_source = emp_doc['_source']
            emp_data = emp_source.copy()
            emp_id = str(emp_data.get('id', emp_doc['_id']))
            emp_data['id'] = emp_id
            all_employees[emp_id] = emp_data
        
        # Build hierarchy tree - simplified version
        # Just show the target employee with their direct reports
        target_emp = all_employees.get(employee_id, employee)
        
        # Find direct reports
        direct_reports = []
        for emp_id, emp_data in all_employees.items():
            if str(emp_data.get('manager_id', '')) == employee_id:
                direct_reports.append({
                    "id": emp_data.get('id', emp_id),
                    "name": emp_data.get('name', 'Unknown'),
                    "title": emp_data.get('title', 'Unknown Title'),
                    "department": emp_data.get('department', target_emp.get('department', 'Unknown Department')),
                    "email": emp_data.get('email', f"{emp_data.get('name', 'unknown').lower().replace(' ', '.')}@company.com"),
                    "level": emp_data.get('level', target_emp.get('level', 0) + 1),
                    "reports": [],
                    "is_target": False
                })
        
        # Create hierarchy tree with target employee and their reports
        hierarchy_tree = {
            "id": target_emp.get('id', employee_id),
            "name": target_emp.get('name', 'Unknown'),
            "title": target_emp.get('title', 'Unknown Title'),
            "department": target_emp.get('department', employee.get('department', 'Unknown Department')),
            "email": target_emp.get('email', employee.get('email', f"{target_emp.get('name', 'unknown').lower().replace(' ', '.')}@company.com")),
            "level": target_emp.get('level', employee.get('level', 0)),
            "reports": direct_reports,
            "is_target": True
        }
        
        # Get management chain for the target employee
        management_chain = []
        # Start with the target employee from all_employees dict
        current_emp = all_employees.get(employee_id, employee)
        while current_emp.get('manager_id') and str(current_emp['manager_id']) in all_employees:
            manager = all_employees[str(current_emp['manager_id'])]
            management_chain.append({
                "id": manager.get('id', str(current_emp['manager_id'])),
                "name": manager.get('name', 'Unknown Manager'),
                "title": manager.get('title', 'Unknown Title'),
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
        import traceback
        error_traceback = traceback.format_exc()
        print(f"ERROR in get_employee_hierarchy: {error_traceback}")
        if "not_found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Employee not found")
        raise HTTPException(status_code=500, detail=f"Failed to get hierarchy: {str(e)}")

@router.get("/departments/list")
async def get_departments():
    """
    Get list of all departments
    """
    try:
        es = get_unified_es_client()
        
        result = es.search(
            index="employees",
            body={
                "query": {"match_all": {}},
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
        es = get_unified_es_client()
        
        result = es.search(
            index="employees",
            body={
                "query": {"match_all": {}},
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
