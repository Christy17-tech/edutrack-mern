import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
      <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-3" />
      <p className="text-gray-500 font-medium text-sm">{text}</p>
      <span className="sr-only">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
