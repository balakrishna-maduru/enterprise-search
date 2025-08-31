
import React from 'react';
import { useSearch } from '../../contexts/SearchContext';

const ResultsPerPage: React.FC = () => {
  const { pagination, setPageSize, isLoading } = useSearch();
  const options = [10, 20, 50, 100];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (setPageSize) {
      setPageSize(newSize);
    }
  };

  if (!pagination || pagination.totalResults === 0) {
    return null;
  }

  return (
    <div className="flex items-center text-sm text-gray-700">
      <label htmlFor="results-per-page" className="mr-2 whitespace-nowrap">Results per page:</label>
      <select
        id="results-per-page"
        value={pagination.pageSize}
        onChange={handleChange}
        disabled={isLoading}
        className="bg-white border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      >
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
};

export default ResultsPerPage;
