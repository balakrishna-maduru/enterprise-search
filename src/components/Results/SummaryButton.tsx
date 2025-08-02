// src/components/Results/SummaryButton.tsx
import React from 'react';
import { Button, Icon } from '../UI';

interface SummaryButtonProps {
  selectedCount: number;
  onGenerateSummary: () => void;
  isLoading?: boolean;
  className?: string;
}

const SummaryButton: React.FC<SummaryButtonProps> = ({
  selectedCount,
  onGenerateSummary,
  isLoading = false,
  className = ''
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Button
        variant="primary"
        onClick={onGenerateSummary}
        isLoading={isLoading}
        className="shadow-lg hover:shadow-xl"
      >
        <Icon name="document" size="sm" className="mr-2" />
        Generate Summary ({selectedCount} selected)
      </Button>
    </div>
  );
};

export default SummaryButton;
