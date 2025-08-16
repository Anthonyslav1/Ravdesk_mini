import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = ({
  label,
  error,
  success,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  helpText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseClasses = 'w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-400 dark:focus:ring-red-900/20'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-200 dark:border-green-600 dark:focus:border-green-400 dark:focus:ring-green-900/20'
    : focused
    ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-200 dark:border-blue-600 dark:focus:border-blue-400 dark:focus:ring-blue-900/20'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-900/20';

  const bgClasses = 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400';

  const inputClasses = `${baseClasses} ${stateClasses} ${bgClasses} ${leftIcon ? 'pl-12' : ''} ${(rightIcon || showPasswordToggle || error || success) ? 'pr-12' : ''} ${className}`;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">{leftIcon}</span>
          </div>
        )}
        
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {error && <AlertCircle className="w-5 h-5 text-red-500" />}
          {success && <CheckCircle className="w-5 h-5 text-green-500" />}
          {type === 'password' && showPasswordToggle && (
            <button
              type="button"
              onClick={handleTogglePassword}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          {rightIcon && !error && !success && !showPasswordToggle && (
            <span className="text-gray-400 dark:text-gray-500">{rightIcon}</span>
          )}
        </div>
      </div>
      
      {(error || success || helpText) && (
        <div className="text-sm">
          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-green-600 dark:text-green-400">{success}</p>}
          {helpText && !error && !success && (
            <p className="text-gray-500 dark:text-gray-400">{helpText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Input;
