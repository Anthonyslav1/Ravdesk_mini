import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Shield, AlertTriangle, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const WalletConnect = ({ 
  account, 
  isConnecting, 
  networkCorrect, 
  onConnect, 
  onDisconnect, 
  onNetworkSwitch 
}) => {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getNetworkName = () => {
    return networkCorrect ? 'Base Mainnet' : 'Unknown Network';
  };

  const getConnectionStatus = () => {
    if (isConnecting) return { status: 'connecting', color: 'blue' };
    if (!account) return { status: 'disconnected', color: 'gray' };
    if (!networkCorrect) return { status: 'wrong-network', color: 'orange' };
    return { status: 'connected', color: 'green' };
  };

  const { status, color } = getConnectionStatus();

  if (!account) {
    return (
      <Card className="max-w-md mx-auto" gradient>
        <Card.Header>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <Card.Title className="text-center">Connect Your Wallet</Card.Title>
          <Card.Description className="text-center">
            Connect your Web3 wallet to start using Ravdesk Escrow services securely
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <div className="space-y-4">
            {/* Security Features */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Secure & Decentralized
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Your funds are protected by smart contracts. We never have access to your private keys.
                  </p>
                </div>
              </div>
            </div>

            {/* Supported Wallets */}
            <div className="grid grid-cols-2 gap-3">
              {['MetaMask', 'WalletConnect', 'Coinbase', 'Trust Wallet'].map((wallet) => (
                <div
                  key={wallet}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">{wallet}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card.Content>

        <Card.Footer>
          <Button
            onClick={onConnect}
            loading={isConnecting}
            className="w-full"
            leftIcon={<Wallet className="w-5 h-5" />}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            By connecting, you agree to our{' '}
            <a href="#" className="text-blue-500 hover:text-blue-600">Terms of Service</a>
          </p>
        </Card.Footer>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <Card className="max-w-sm">
        <Card.Content className="p-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                color === 'green' ? 'bg-green-400' :
                color === 'orange' ? 'bg-orange-400' :
                color === 'blue' ? 'bg-blue-400' :
                'bg-gray-400'
              } ${status === 'connecting' ? 'animate-pulse' : ''}`} />
              
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {status === 'connected' ? 'Connected' :
                   status === 'connecting' ? 'Connecting...' :
                   status === 'wrong-network' ? 'Wrong Network' :
                   'Disconnected'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getNetworkName()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <motion.div
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.div>
            </button>
          </div>

          {/* Account Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  {truncateAddress(account)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your Wallet
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => copyToClipboard(account)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              <a
                href={`https://basescan.org/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Network Warning */}
          {!networkCorrect && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Wrong Network
                  </h4>
                  <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                    Please switch to Base Mainnet to continue
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={onNetworkSwitch}
                    className="mt-2"
                  >
                    Switch Network
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Extended Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Network:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {getNetworkName()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`font-medium ${
                      networkCorrect ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {networkCorrect ? 'Ready' : 'Network Issue'}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDisconnect}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default WalletConnect;
