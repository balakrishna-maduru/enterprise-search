// src/utils/employeeSearch.ts
import { User } from '../types';
import { availableUsers } from '../data/users';

export const searchEmployees = (query: string): User[] => {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  // Filter employees based on name, position, department, or email
  const matchingEmployees = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm) ||
    user.position.toLowerCase().includes(searchTerm) ||
    user.department.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm)
  );
  
  return matchingEmployees;
};
