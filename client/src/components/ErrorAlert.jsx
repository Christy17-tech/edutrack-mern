import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorAlert = ({ message, onRetry }) => {
  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-5 my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm text-red-900">Something went wrong</h4>
          <p className="text-sm text-red-700 mt-0.5">{message || 'An unexpected error occurred while communicating with the server.'}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
