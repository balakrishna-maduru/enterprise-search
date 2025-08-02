// src/utils/employeeFormatter.js

/**
 * Formats employee data from API response to consistent structure
 * @param {Object} apiEmployee - Employee data from API
 * @returns {Object} Formatted employee object
 */
export const formatEmployeeFromApi = (apiEmployee) => {
  return {
    id: apiEmployee.id || apiEmployee.employee_id || Math.random().toString(),
    name: apiEmployee.name || 'Unknown User',
    email: apiEmployee.email || generateEmailFromName(apiEmployee.name),
    title: apiEmployee.title || apiEmployee.position || 'Employee',
    department: apiEmployee.department || 'General',
    location: apiEmployee.location || '',
    level: apiEmployee.level || 1,
    phone: apiEmployee.phone || '',
    manager: apiEmployee.manager || '',
    startDate: apiEmployee.start_date || apiEmployee.startDate || '',
    skills: apiEmployee.skills || [],
    projects: apiEmployee.projects || []
  };
};

/**
 * Generates email from name if not provided
 * @param {string} name - Employee name
 * @returns {string} Generated email
 */
const generateEmailFromName = (name) => {
  if (!name) return 'employee@company.com';
  
  const cleanName = name.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '.');
  
  return `${cleanName}@company.com`;
};

/**
 * Formats employee list from API response
 * @param {Array} employees - Array of employee data from API
 * @returns {Array} Formatted employee array
 */
export const formatEmployeesFromApi = (employees) => {
  if (!Array.isArray(employees)) return [];
  
  return employees.map(formatEmployeeFromApi);
};

/**
 * Gets employee display name with title
 * @param {Object} employee - Employee object
 * @returns {string} Formatted display name
 */
export const getEmployeeDisplayName = (employee) => {
  if (!employee) return 'Unknown User';
  
  const name = employee.name || 'Unknown User';
  const title = employee.title || employee.position;
  
  return title ? `${name} - ${title}` : name;
};

/**
 * Gets employee department with location if available
 * @param {Object} employee - Employee object
 * @returns {string} Formatted department info
 */
export const getEmployeeDepartmentInfo = (employee) => {
  if (!employee) return '';
  
  const department = employee.department || 'General';
  const location = employee.location;
  
  return location ? `${department} • ${location}` : department;
};
