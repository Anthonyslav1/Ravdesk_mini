import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  MoreHorizontal,
  ArrowRight,
  Wallet,
  Target
} from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressIndicator from './ui/ProgressIndicator';

const EscrowCard = ({ 
  contract, 
  onDeposit, 
  onApprove, 
  onComplete, 
  onCancel, 
  onWithdraw
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      case 'emergency': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Pause className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '0';
    return parseFloat(amount).toFixed(4);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getProgressPercentage = () => {
    if (!contract.milestones || contract.milestones.length === 0) return 0;
    const completed = contract.milestones.filter(m => m.isCompleted).length;
    return (completed / contract.milestones.length) * 100;
  };

  const handleAction = async (action, ...args) => {
    setActionLoading(action);
    try {
      await action(...args);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = getStatusColor(contract.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card hover gradient className="overflow-hidden">
        {/* Header */}
        <Card.Content className="p-0">
          {/* Status Bar */}
          <div className={`h-1 bg-gradient-to-r ${
            statusColor === 'green' ? 'from-green-400 to-emerald-500' :
            statusColor === 'yellow' ? 'from-yellow-400 to-orange-500' :
            statusColor === 'blue' ? 'from-blue-400 to-purple-500' :
            statusColor === 'red' ? 'from-red-400 to-pink-500' :
            'from-gray-400 to-gray-500'
          }`} />

          <div className="p-6">
            {/* Top Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${
                  statusColor === 'green' ? 'from-green-400 to-emerald-500' :
                  statusColor === 'yellow' ? 'from-yellow-400 to-orange-500' :
                  statusColor === 'blue' ? 'from-blue-400 to-purple-500' :
                  statusColor === 'red' ? 'from-red-400 to-pink-500' :
                  'from-gray-400 to-gray-500'
                }`}>
                  {getStatusIcon(contract.status)}
                  <span className="text-white text-lg font-bold">
                    #{contract.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {contract.title || `Escrow Contract #${contract.id}`}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        statusColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {getStatusIcon(contract.status)}
                        {contract.status || 'Unknown'}
                      </span>
                    </div>
                    
                    {contract.isTimeLock && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Time-locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Total Value
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatAmount(contract.totalAmount)} ETH
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Parties
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {(contract.clients?.length || 0) + (contract.freelancers?.length || 0)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Progress
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {getProgressPercentage().toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {contract.milestones && contract.milestones.length > 0 && (
              <div className="mb-4">
                <ProgressIndicator 
                  variant="compact"
                  steps={contract.milestones}
                  currentStep={contract.currentMilestone || 0}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {contract.needsDeposit && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleAction(onDeposit, contract.id)}
                  loading={actionLoading === onDeposit}
                  leftIcon={<Wallet className="w-4 h-4" />}
                >
                  Deposit Funds
                </Button>
              )}

              {contract.canComplete && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleAction(onComplete, contract.id)}
                  loading={actionLoading === onComplete}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Complete Milestone
                </Button>
              )}

              {contract.canApprove && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleAction(onApprove, contract.id)}
                  loading={actionLoading === onApprove}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Approve
                </Button>
              )}

              {contract.canWithdraw && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleAction(onWithdraw, contract.id)}
                  loading={actionLoading === onWithdraw}
                  leftIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Withdraw
                </Button>
              )}

              {contract.canCancel && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleAction(onCancel, contract.id)}
                  loading={actionLoading === onCancel}
                  leftIcon={<Pause className="w-4 h-4" />}
                >
                  Cancel
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Details
              </Button>
            </div>

            {/* Extended Details */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {contract.isTimeLock ? 'Time-locked' : 'Milestone-based'}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400 block mb-2">Participants:</span>
                    <div className="space-y-1">
                      {contract.clients?.map((client, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">C</span>
                          </div>
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                            {formatAddress(client)}
                          </span>
                        </div>
                      ))}
                      {contract.freelancers?.map((freelancer, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-green-600 dark:text-green-400">F</span>
                          </div>
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                            {formatAddress(freelancer)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default EscrowCard;
