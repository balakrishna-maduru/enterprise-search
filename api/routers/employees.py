# api/routers/employees.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from elasticsearch import Elasticsearch, NotFoundError
from api.config import settings
import math

router = APIRouter(prefix="/employees", tags=["employees"])

def get_unified_es_client():
    """Get Elasticsearch client"""
    try:
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
    page: int = Query(1, description="Page number for pagination", ge=1),
    size: int = Query(20, description="Number of results to return", le=100),
    department: Optional[str] = Query(None, description="Filter by department"),
    location: Optional[str] = Query(None, description="Filter by location")
):
    """
    Search employees with optional filters and pagination
    """
    try:
        es = get_unified_es_client()
        
        query_should_clauses = [
            {
                "multi_match": {
                    "query": q,
                    "fields": [
                        "fullName^4",
                        "designations^3", 
                        "departments^2",
                        "lanIds^2",
                        "screenName"
                    ],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            }
        ]

        # Only add exact email search if query looks like an email
        if '@' in q:
            query_should_clauses.append({
                "term": {
                    "emailAddress": {
                        "value": q.lower(),
                        "boost": 5 # High boost for exact email match
                    }
                }
            })
        
        query = { "bool": { "should": query_should_clauses, "minimum_should_match": 1 } }
        
        # Add filters
        filters = []
        if department:
            filters.append({"term": {"departments.keyword": department}})
        if location:
            filters.append({"term": {"city.keyword": location}})
        
        # Calculate 'from' for pagination
        from_value = (page - 1) * size
        
        search_body = {
            "query": { "bool": { "must": [query], "filter": filters if filters else [] } },
            "from": from_value,
            "size": size,
            "sort": [ {"_score": {"order": "desc"}}, {"fullName.keyword": {"order": "asc", "missing": "_last"}} ]
        }

        result = es.search(index="new_people", **search_body)
        
        employees = [hit['_source'] for hit in result['hits']['hits']]
        total_hits = result['hits']['total']['value']

        return {
            "success": True,
            "data": { "employees": employees, "total": total_hits, "pagination": { "page": page, "size": size, "total_pages": math.ceil(total_hits / size) if size > 0 else 0 } }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/{employee_id}/hierarchy")
async def get_employee_hierarchy(employee_id: str):
    """
    Get employee hierarchy (org chart centered on the employee)
    """
    try:
        es = get_unified_es_client()
        HIERARCHY_INDEX = "employee_hierarchy"

        # 1. Get the target employee from the hierarchy index
        try:
            employee_doc = es.get(index=HIERARCHY_INDEX, id=employee_id)
            employee = employee_doc['_source']
        except NotFoundError:
            raise HTTPException(status_code=404, detail="Employee not found in hierarchy index")

        # 2. Build management chain using the pre-calculated management_chain_ids
        management_chain_docs = []
        management_chain_ids = employee.get('management_chain_ids', [])

        if management_chain_ids:
            # Fetch all employees in the management chain in one go
            mget_resp = es.mget(index=HIERARCHY_INDEX, body={'ids': management_chain_ids})
            
            # Create a map for quick lookup of fetched documents
            fetched_employees = {doc['_id']: doc['_source'] for doc in mget_resp['docs'] if doc['found']}
            
            # Reconstruct the management chain in the correct order
            for emp_id in management_chain_ids:
                if emp_id in fetched_employees:
                    management_chain_docs.append(fetched_employees[emp_id])
                else:
                    # This should ideally not happen if data is consistent
                    print(f"Warning: Employee ID {emp_id} in management_chain_ids not found during mget.")
        else:
            # If management_chain_ids is empty, the employee is likely the CEO or top-level
            management_chain_docs.append(employee)

        # 3. Get direct reports for the target employee
        report_ids = employee.get('reports', [])
        direct_reports = []
        if report_ids:
            reports_result = es.mget(index=HIERARCHY_INDEX, body={'ids': report_ids})
            direct_reports = [doc['_source'] for doc in reports_result['docs'] if doc['found']]


        # 4. Build the focused hierarchy tree and format the management chain for the response
        def format_node(emp_data, level, is_target=False, reports=[]):
            """Helper to create a consistent node structure."""
            return {
                "id": str(emp_data.get('employeeId')),
                "name": emp_data.get('fullName', 'Unknown'),
                "title": emp_data.get('designations', 'Unknown Title'),
                "department": emp_data.get('departments', 'Unknown Department'),
                "email": emp_data.get('emailAddress', f"{emp_data.get('fullName', 'unknown').lower().replace(' ', '.')}@company.com"),
                "level": level,
                "is_target": is_target,
                "reports": reports,
                "country": emp_data.get('country'), # Added
                "userImageUrl": emp_data.get('userImageUrl'), # Added
                "profileUrl": emp_data.get('profileUrl') # Added
            }

        target_employee_level = len(management_chain_docs) - 1
        direct_reports_nodes = [format_node(report, target_employee_level + 1) for report in direct_reports]
        
        if not management_chain_docs:
             raise HTTPException(status_code=404, detail="Employee not found")

        hierarchy_tree = format_node(management_chain_docs[-1], target_employee_level, is_target=True, reports=direct_reports_nodes)

        for i in range(len(management_chain_docs) - 2, -1, -1):
            manager_data = management_chain_docs[i]
            hierarchy_tree = format_node(manager_data, i, is_target=False, reports=[hierarchy_tree])

        management_chain_response = [format_node(emp, i, is_target=(str(emp.get('employeeId')) == employee_id)) for i, emp in enumerate(management_chain_docs)]

        return {
            "success": True,
            "data": {
                "employee": employee,
                "hierarchy_tree": hierarchy_tree,
                "management_chain": management_chain_response,
                "total_employees": len(management_chain_docs) + len(direct_reports)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hierarchy retrieval failed: {str(e)}")
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
                "term": {"employeeId": employee_id}
            },
            "size": 1
        }
        
        result = es.search(index="new_people", **search_body)

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
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/departments/list")
async def get_departments():
    """
    Get a list of all unique departments
    """
    try:
        es = get_unified_es_client()
        
        search_body = {
            "size": 0,
            "aggs": {
                "departments": {
                    "terms": {
                        "field": "departments.keyword",
                        "size": 100
                    }
                }
            }
        }
        
        result = es.search(index="new_people", **search_body)
        departments = [bucket['key'] for bucket in result['aggregations']['departments']['buckets']]
        
        return {"success": True, "data": {"departments": departments}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get departments: {str(e)}")


@router.get("/locations/list")
async def get_locations():
    """
    Get a list of all unique locations (cities)
    """
    try:
        es = get_unified_es_client()
        
        search_body = { "size": 0, "aggs": { "locations": { "terms": { "field": "city.keyword", "size": 100 } } } }
        
        result = es.search(index="new_people", **search_body)
        locations = [bucket['key'] for bucket in result['aggregations']['locations']['buckets']]
        
        return {"success": True, "data": {"locations": locations}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get locations: {str(e)}")
