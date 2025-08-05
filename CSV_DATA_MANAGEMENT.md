# Employee Data Management Scripts

This directory contains Python scripts for exporting and importing employee data to/from Elasticsearch.

## Scripts Overview

### 1. export_employees.py
Exports all employee data from Elasticsearch to a CSV file.

### 2. import_employees.py  
Imports employee data from CSV file to Elasticsearch with automatic hierarchy generation.

## Prerequisites

- Python 3.6+
- Elasticsearch running on `localhost:9200` 
- Required Python packages: `requests` (install with `pip install requests`)

## Export Script Usage

### Basic Export
```bash
python export_employees.py
```

This will:
- Export all employees from the `employees` index
- Save to `employees_export.csv` 
- Include all fields including hierarchy data

### Export Features
- Exports all employee fields (30+ columns)
- Converts JSON arrays (skills, projects, reports) to JSON strings for CSV compatibility
- Provides export statistics and preview
- UTF-8 encoding support

## Import Script Usage

### Basic Import
```bash
python import_employees.py --file your_data.csv
```

### Clear Existing Data Before Import
```bash
python import_employees.py --file your_data.csv --clear
```

### Import with Auto-Generated Hierarchy
The import script automatically detects missing hierarchy columns and builds them:

**Missing columns detected and auto-generated:**
- `level` - Organizational level (distance from CEO)
- `reports` - Array of direct reports with id, name, title
- `has_reports` - Boolean indicating if employee has direct reports  
- `report_count` - Number of direct reports
- `org_level` - Same as level (for compatibility)
- `hierarchy_path` - Full path from CEO to employee
- `tenure_years` - Calculated from start_date
- `manager_name` - Populated from manager_id lookup
- `last_updated` - Timestamp of import

### Required CSV Columns
**Minimum required columns for hierarchy generation:**
- `id` - Unique employee identifier
- `name` - Employee full name
- `manager_id` - ID of direct manager (empty for CEO)

**Recommended columns:**
- `email` - Employee email address
- `title` - Job title
- `department` - Department name
- `location` - Work location
- `phone` - Phone number
- `start_date` - Start date (YYYY-MM-DD format)
- `skills` - Comma-separated or JSON array
- `projects` - Comma-separated or JSON array
- `bio` - Employee biography

## CSV Format Examples

### Basic CSV (hierarchy will be auto-generated)
```csv
id,name,email,title,department,manager_id,start_date
1,John Smith,john@company.com,CEO,Executive,,2020-01-01
2,Jane Doe,jane@company.com,CTO,Engineering,1,2020-02-01
3,Bob Wilson,bob@company.com,Engineer,Engineering,2,2021-01-01
```

### Full CSV (with all columns)
```csv
id,name,email,title,department,location,phone,start_date,manager_id,skills,projects,bio
1,John Smith,john@company.com,CEO,Executive,NYC,555-0101,2020-01-01,,Leadership,"[""Strategy""]",CEO bio
```

## Hierarchy Generation Algorithm

The import script builds organizational hierarchy using this logic:

1. **Reports Mapping**: Creates manager → [reports] mapping
2. **Level Calculation**: Calculates distance from CEO (root node)
3. **Hierarchy Path**: Builds full path from CEO to employee
4. **Manager Names**: Populates manager names from manager_id lookups
5. **Tenure Calculation**: Calculates years of service from start_date

### Example Hierarchy Output
For an employee 3 levels down:
```json
{
  "level": 3,
  "hierarchy_path": "John Smith > Jane Doe > Bob Wilson > Alice Johnson",
  "reports": [{"id": "5", "name": "Charlie Brown", "title": "Junior Dev"}],
  "has_reports": true,
  "report_count": 1,
  "manager_name": "Bob Wilson",
  "tenure_years": 2.5
}
```

## Common Use Cases

### 1. Data Migration
```bash
# Export from old system
python export_employees.py

# Import to new system  
python import_employees.py --file employees_export.csv --clear
```

### 2. HR Data Import
```bash
# Import HR CSV with basic data
python import_employees.py --file hr_export.csv --clear
```

### 3. Backup and Restore
```bash
# Backup
python export_employees.py

# Restore
python import_employees.py --file employees_export.csv --clear
```

## Error Handling

### Common Issues and Solutions

**Elasticsearch Connection Failed**
- Ensure Elasticsearch is running on localhost:9200
- Check if Docker container is started: `docker ps`

**CSV File Not Found** 
- Verify file path is correct
- Use absolute paths if needed

**Circular Manager References**
- Script prevents infinite loops with visited tracking
- Maximum depth of 10 levels enforced

**Invalid Date Formats**
- Use YYYY-MM-DD format for start_date
- Invalid dates will result in 0.0 tenure_years

## Output and Logging

Both scripts provide detailed logging:
- 🔄 Progress indicators
- ✅ Success confirmations  
- ⚠️ Warnings for missing data
- ❌ Error messages with details
- 📊 Statistics and summaries

## Index Mapping

The import script creates an Elasticsearch index with optimized mapping:
- Text fields with keyword sub-fields for exact matching
- Proper date types for temporal fields
- Numeric types for counts and levels
- Object type for nested reports data

## Performance Notes

- Export handles up to 1000 employees by default (configurable)
- Import uses bulk API for efficient indexing
- Hierarchy calculation is O(n) complexity
- Large datasets (>10k employees) may need pagination adjustments
