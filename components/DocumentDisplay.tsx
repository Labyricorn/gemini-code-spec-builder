
import React from 'react';
import { DownloadIcon } from './Icons';

interface DocumentDisplayProps {
  title: string;
  content: string;
  isLoading: boolean;
  isApproved: boolean;
  onDownload: () => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
        </div>
        <div className="h-6 bg-gray-700 rounded w-1/4 mt-4"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);


export const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ title, content, isLoading, isApproved, onDownload }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white capitalize">{title}</h2>
            {isApproved && (
                <button
                onClick={onDownload}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-indigo-500"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download</span>
                </button>
            )}
        </div>
        {isLoading && !content ? (
            <LoadingSkeleton />
        ) : (
            <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-ul:text-gray-300 prose-ol:text-gray-300 prose-code:text-indigo-300">
                <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
            </div>
        )}
    </div>
  );
};
