import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  ArrowRight, 
  CheckCircle,
  Plus,
  Wallet,
  Target,
  ArrowLeft
} from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const FarcasterFrame = ({ frameState = "home", contracts = [], onAction }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Farcaster SDK if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      // We're in a frame/miniapp context
      try {
        // Try to load Farcaster SDK
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
          import { sdk } from 'https://esm.sh/@farcaster/miniapp-sdk';
          window.farcasterSDK = sdk;
          
          // Initialize SDK when ready
          if (document.readyState === 'complete') {
            sdk.ready();
          } else {
            window.addEventListener('load', () => sdk.ready());
          }
        `;
        document.head.appendChild(script);
      } catch (error) {
        console.log('Farcaster SDK not available:', error);
      }
    }
  }, []);

  const handleFrameAction = async (action, data = {}) => {
    setIsLoading(true);
    try {
      // Communicate with parent frame if in Farcaster context
      if (window.farcasterSDK) {
        window.farcasterSDK.actions.openUrl(`${window.location.origin}?action=${action}&data=${encodeURIComponent(JSON.stringify(data))}`);
      }
      
      // Call local action handler
      if (onAction) {
        await onAction(action, data);
      }
    } catch (error) {
      console.error('Frame action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHomeFrame = () => (
    <Card className="w-full max-w-2xl mx-auto" gradient>
      <Card.Content className="p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Ravdesk Escrow
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure multi-party blockchain contracts
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {contracts.filter(c => c.isActive).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {contracts.filter(c => !c.isActive && !c.isCancelled).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {contracts.reduce((sum, c) => sum + parseFloat(c.totalAmount || 0), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ETH Total</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="primary"
            onClick={() => handleFrameAction("create_contract")}
            loading={isLoading}
            leftIcon={<Plus className="w-5 h-5" />}
            className="w-full"
          >
            Create Escrow
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleFrameAction("view_contracts")}
            loading={isLoading}
            leftIcon={<Target className="w-5 h-5" />}
            className="w-full"
          >
            My Contracts
          </Button>
        </div>
      </Card.Content>
    </Card>
  );

  const renderContractsFrame = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <Card.Content className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Contracts
          </h2>
          <Button
            variant="ghost"
            onClick={() => handleFrameAction("go_home")}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        </div>

        {contracts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No contracts found
            </p>
            <Button
              onClick={() => handleFrameAction("create_contract")}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Your First Contract
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.slice(0, 3).map((contract, index) => (
              <motion.div
                key={contract.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Contract #{contract.id}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    contract.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : contract.isCancelled
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {contract.isActive ? 'Active' : contract.isCancelled ? 'Cancelled' : 'Complete'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{contract.totalAmount} ETH</span>
                  <span>{contract.isTimeLock ? 'Timelock' : 'Milestone'}</span>
                </div>

                {contract.isActive && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFrameAction("deposit_funds", { contractId: contract.id })}
                      leftIcon={<Wallet className="w-4 h-4" />}
                    >
                      Deposit
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleFrameAction("complete_milestone", { contractId: contract.id })}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      Complete
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
            
            {contracts.length > 3 && (
              <div className="text-center pt-4">
                <Button
                  variant="ghost"
                  onClick={() => handleFrameAction("view_all_contracts")}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View All ({contracts.length} total)
                </Button>
              </div>
            )}
          </div>
        )}
      </Card.Content>
    </Card>
  );

  const renderCreateFrame = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <Card.Content className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create Escrow
          </h2>
          <Button
            variant="ghost"
            onClick={() => handleFrameAction("go_home")}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        </div>

        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              Choose your escrow type
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFrameAction("create_milestone_contract")}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Milestone-Based
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Release funds upon completion of specific milestones
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFrameAction("create_timelock_contract")}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Time-Locked
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Automatically release funds after specified time period
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={frameState}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {frameState === "home" && renderHomeFrame()}
          {frameState === "contracts" && renderContractsFrame()}
          {frameState === "create" && renderCreateFrame()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FarcasterFrame;
