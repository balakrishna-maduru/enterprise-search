// src/data/users.js
import { getCurrentCompanyConfig } from '../config/branding';

const getCompanyDomain = () => {
  const config = getCurrentCompanyConfig();
  return config.company.domain;
};

export const availableUsers = [
  {
    id: 'balu_user',
    name: 'Balu',
    position: 'System Administrator',
    department: 'Administration',
    avatar: 'BA',
    email: 'balu@mymail.com',
    color: 'bg-blue-800'
  },
  {
    id: 'sarah_chen',
    name: 'Sarah Chen',
    position: 'Senior Product Manager',
    department: 'Digital Banking',
    avatar: 'SC',
    email: `sarah.chen@${getCompanyDomain()}`,
    color: 'bg-red-600'
  },
  {
    id: 'mike_rodriguez',
    name: 'Mike Rodriguez',
    position: 'Lead Software Engineer',
    department: 'Engineering',
    avatar: 'MR',
    email: `mike.rodriguez@${getCompanyDomain()}`,
    color: 'bg-blue-600'
  },
  {
    id: 'jennifer_tan',
    name: 'Jennifer Tan',
    position: 'VP Operations',
    department: 'Operations',
    avatar: 'JT',
    email: `jennifer.tan@${getCompanyDomain()}`,
    color: 'bg-green-600'
  },
  {
    id: 'david_wong',
    name: 'David Wong',
    position: 'Security Architect',
    department: 'Information Security',
    avatar: 'DW',
    email: `david.wong@${getCompanyDomain()}`,
    color: 'bg-purple-600'
  },
  {
    id: 'lisa_kumar',
    name: 'Lisa Kumar',
    position: 'Marketing Director',
    department: 'Marketing',
    avatar: 'LK',
    email: `lisa.kumar@${getCompanyDomain()}`,
    color: 'bg-pink-600'
  },
  {
    id: 'alex_thompson',
    name: 'Alex Thompson',
    position: 'Data Analyst',
    department: 'Business Intelligence',
    avatar: 'AT',
    email: `alex.thompson@${getCompanyDomain()}`,
    color: 'bg-indigo-600'
  }
];