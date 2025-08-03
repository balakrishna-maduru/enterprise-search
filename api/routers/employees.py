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
        
        # Find the CEO (employee with no manager_id or manager_id is null/empty)
        ceo = None
        for emp_id, emp_data in all_employees.items():
            manager_id = emp_data.get('manager_id')
            if not manager_id or str(manager_id) == 'null' or str(manager_id) == '':
                ceo = emp_data
                break
        
        if not ceo:
            # Fallback: use the employee with the lowest level
            ceo = min(all_employees.values(), key=lambda x: x.get('level', 999))
        
        # Build complete hierarchy tree starting from CEO
        def build_hierarchy_node(emp_data, target_employee_id):
            emp_id = str(emp_data.get('id'))
            
            # Find direct reports
            direct_reports = []
            for other_emp_id, other_emp_data in all_employees.items():
                if str(other_emp_data.get('manager_id', '')) == emp_id:
                    direct_reports.append(build_hierarchy_node(other_emp_data, target_employee_id))
            
            return {
                "id": emp_id,
                "name": emp_data.get('name', 'Unknown'),
                "title": emp_data.get('title', 'Unknown Title'),
                "department": emp_data.get('department', 'Unknown Department'),
                "email": emp_data.get('email', f"{emp_data.get('name', 'unknown').lower().replace(' ', '.')}@company.com"),
                "level": emp_data.get('level', 0),
                "reports": direct_reports,
                "is_target": emp_id == target_employee_id
            }
        
        # Build the complete hierarchy tree from CEO
        hierarchy_tree = build_hierarchy_node(ceo, employee_id)
        
        # Build management chain for the target employee
        management_chain = []
        current_emp = all_employees.get(employee_id, employee)
        
        # Build chain from target employee up to CEO
        chain_path = []
        while current_emp:
            chain_path.append({
                "id": str(current_emp.get('id', current_emp.get('manager_id', 'unknown'))),
                "name": current_emp.get('name', 'Unknown Manager'),
                "title": current_emp.get('title', 'Unknown Title'),
                "department": current_emp.get('department', 'Unknown Department'),
                "email": current_emp.get('email', f"{current_emp.get('name', 'unknown').lower().replace(' ', '.')}@company.com"),
                "level": current_emp.get('level', 0),
                "is_target": str(current_emp.get('id')) == employee_id,
                "reports": []
            })
            
            manager_id = current_emp.get('manager_id')
            if manager_id and str(manager_id) in all_employees:
                current_emp = all_employees[str(manager_id)]
            else:
                current_emp = None
        
        # Reverse to get CEO -> ... -> Target Employee order
        management_chain = list(reversed(chain_path))
        
        return {
            "success": True,
            "data": {
                "employee": employee,
                "hierarchy_tree": hierarchy_tree,
                "management_chain": management_chain,
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
