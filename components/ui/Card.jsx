import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false, 
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm';
  
  const paddings = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800' : '';
  
  const cardClasses = `${baseClasses} ${hoverClasses} ${gradientClasses} ${paddings[padding]} ${className}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
