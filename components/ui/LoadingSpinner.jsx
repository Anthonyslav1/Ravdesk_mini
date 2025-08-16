import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500'
  };

  return (
    <motion.div
      className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

const LoadingOverlay = ({ message = 'Loading...', children }) => {
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

const TransactionLoader = ({ status, txHash }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'orange';
      case 'confirmed': return 'green';
      case 'failed': return 'red';
      default: return 'blue';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending': return 'Transaction pending...';
      case 'confirmed': return 'Transaction confirmed!';
      case 'failed': return 'Transaction failed';
      default: return 'Processing transaction...';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <LoadingSpinner size="md" color={getStatusColor()} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {getStatusMessage()}
        </p>
        {txHash && (
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
          >
            View on Explorer
          </a>
        )}
      </div>
    </div>
  );
};

LoadingSpinner.Overlay = LoadingOverlay;
LoadingSpinner.Transaction = TransactionLoader;

export default LoadingSpinner;
