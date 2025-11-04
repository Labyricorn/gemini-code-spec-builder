
import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  isComplete: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, isComplete, isDisabled, onClick }) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-indigo-500";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";
  const disabledClasses = "text-gray-500 bg-gray-800 cursor-not-allowed";

  const getClasses = () => {
    if (isDisabled) return `${baseClasses} ${disabledClasses}`;
    if (isActive) return `${baseClasses} ${activeClasses}`;
    return `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <button onClick={onClick} disabled={isDisabled} className={getClasses()}>
      {isComplete && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      <span className="capitalize">{label}</span>
    </button>
  );
};
