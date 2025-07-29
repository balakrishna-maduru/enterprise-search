// Test script to verify search functionality
const { EmployeeService } = require('./src/services/employee_service.ts');
const { config } = require('./src/config/index.ts');

async function testSearch() {
  console.log('Testing employee search...');
  console.log('Config:', config);
  
  const employeeService = new EmployeeService();
  
  try {
    const results = await employeeService.searchEmployees('john', 10);
    console.log('Search results:', results);
  } catch (error) {
    console.error('Search failed:', error);
  }
}

testSearch();
