// src/components/Search/SearchInput.tsx
import React from 'react';
import { Input, Icon } from '../UI';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyPress,
  placeholder = "Search content, people, or ask me anything...",
  isLoading = false,
  className = ''
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        variant="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        leftIcon={<Icon name="search" size="md" color="secondary" />}
        className="pr-4"
      />
    </div>
  );
};

export default SearchInput;
