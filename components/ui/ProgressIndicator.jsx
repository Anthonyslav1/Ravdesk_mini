import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

const ProgressIndicator = ({ steps, currentStep, variant = 'default' }) => {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'active':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        );
      case 'pending':
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
      default:
        return null;
    }
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'active':
        return 'bg-blue-500 border-blue-500';
      case 'pending':
        return 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  const getLineClasses = (stepIndex) => {
    const status = getStepStatus(stepIndex);
    return status === 'completed' 
      ? 'bg-green-500' 
      : 'bg-gray-200 dark:bg-gray-700';
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentStep + 1} of {steps.length}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepClasses(status)}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {getStepIcon(status)}
                </motion.div>
                
                {/* Step Label */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                  <p className={`text-sm font-medium ${
                    status === 'active' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : status === 'completed'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4">
                  <motion.div
                    className={`h-full rounded ${getLineClasses(index)}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: status === 'completed' ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MilestoneProgress = ({ milestones, currentMilestone }) => {
  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => {
        const isCompleted = index < currentMilestone;
        const isActive = index === currentMilestone;
        
        return (
          <motion.div
            key={index}
            className={`flex items-start space-x-4 p-4 rounded-xl border ${
              isCompleted 
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : isActive
                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isCompleted 
                ? 'bg-green-500'
                : isActive
                ? 'bg-blue-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : isActive ? (
                <Clock className="w-5 h-5 text-white" />
              ) : (
                <span className="text-xs font-bold text-white">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${
                isCompleted ? 'text-green-800 dark:text-green-200' :
                isActive ? 'text-blue-800 dark:text-blue-200' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {milestone.title}
              </h4>
              {milestone.description && (
                <p className={`text-sm mt-1 ${
                  isCompleted ? 'text-green-600 dark:text-green-300' :
                  isActive ? 'text-blue-600 dark:text-blue-300' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {milestone.description}
                </p>
              )}
              {milestone.amount && (
                <p className={`text-sm font-medium mt-2 ${
                  isCompleted ? 'text-green-700 dark:text-green-200' :
                  isActive ? 'text-blue-700 dark:text-blue-200' :
                  'text-gray-600 dark:text-gray-300'
                }`}>
                  Amount: {milestone.amount} ETH
                </p>
              )}
            </div>
            
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0 text-green-500"
              >
                <CheckCircle className="w-6 h-6" />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

ProgressIndicator.Milestone = MilestoneProgress;

export default ProgressIndicator;
