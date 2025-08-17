'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  useMiniKit, 
  useAddFrame, 
  useOpenUrl, 
  useClose, 
  usePrimaryButton,
  useViewProfile,
  useNotification 
} from '@coinbase/onchainkit/minikit';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { 
  useContractState, 
  useTotalAmount, 
  useCurrentMilestone, 
  useMilestoneCount, 
  useIsTimeLock,
  useDeposit,
  useCompleteMilestone,
  formatContractAmount,
} from './lib/hooks';
const DashboardLegacy = dynamic(() => import('../components/Dashboard.jsx'), { ssr: false });

interface Contract {
  id: string;
  totalAmount: string;
  isActive: boolean;
  isCancelled: boolean;
  isTimeLock: boolean;
  currentMilestone: number;
  milestoneCount: number;
}

export default function RavdeskEscrowApp() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  
  // Set frame ready when component mounts
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Show the legacy Dashboard at the root route so users can create contracts
  return <DashboardLegacy hideChrome />;

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [viewMode, setViewMode] = useState<'home' | 'contracts' | 'create'>('home');
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useAccount();

  // Initialize MiniKit hooks
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const close = useClose();
  const viewProfile = useViewProfile();
  const sendNotification = useNotification();

  // Contract read hooks
  const { data: contractState } = useContractState();
  const { data: totalAmount } = useTotalAmount();
  const { data: currentMilestone } = useCurrentMilestone();
  const { data: milestoneCount } = useMilestoneCount();
  const { data: isTimeLock } = useIsTimeLock();

  // Contract write hooks
  const { deposit } = useDeposit();
  const { completeMilestone } = useCompleteMilestone();

  // Update contracts from real contract data
  useEffect(() => {
    if (isConnected && contractState !== undefined && totalAmount !== undefined) {
      const contractData: Contract = {
        id: '0x0000000000000000000000000000000000000000',
        totalAmount: formatContractAmount(totalAmount),
        isActive: contractState === 0, // ContractState.Active
        isCancelled: contractState === 1, // ContractState.Cancelled
        isTimeLock: isTimeLock || false,
        currentMilestone: Number(currentMilestone || 0),
        milestoneCount: Number(milestoneCount || 0),
      };
      setContracts([contractData]);
    } else {
      // Fallback mock data when not connected
      setContracts([
        {
          id: '0x1234...abcd',
          totalAmount: '0.05',
          isActive: true,
          isCancelled: false,
          isTimeLock: false,
          currentMilestone: 1,
          milestoneCount: 3,
        },
      ]);
    }
  }, [contractState, totalAmount, currentMilestone, milestoneCount, isTimeLock, isConnected]);

  // Primary button for global actions
  usePrimaryButton(
    { 
      text: viewMode === 'home' ? 'CREATE ESCROW' : 'BACK TO HOME'
    },
    () => {
      setViewMode(viewMode === 'home' ? 'create' : 'home');
    }
  );

  // Handle adding frame to user's list
  const handleAddFrame = async () => {
    try {
      const result = await addFrame();
      if (result?.url && result?.token) {
        console.log('Frame added:', result.url, result.token);
        // In production, save these to your database
      } else {
        console.log('Frame add result:', result);
      }
    } catch (error) {
      console.error('Failed to add frame:', error);
    }
  };

  // Handle profile viewing
  const handleViewProfile = () => {
    try {
      viewProfile();
    } catch (error) {
      console.error('Failed to view profile:', error);
    }
  };

  // Handle sending notifications
  const handleSendNotification = async () => {
    try {
      await sendNotification({
        title: 'Escrow Update! 🏦',
        body: 'New milestone completed in your contract'
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  // Handle contract actions
  const handleContractAction = async (action: string, contractId: string) => {
    if (!isConnected) {
      console.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    try {
      switch (action) {
        case 'deposit':
          // For demonstration, deposit 0.01 ETH
          await deposit('0.01');
          break;
        case 'complete':
          // Complete the current milestone
          await completeMilestone(Number(currentMilestone || 0));
          break;
        case 'create-milestone':
          console.log('Creating milestone-based contract...');
          // This would typically redirect to a contract creation flow
          break;
        case 'create-timelock':
          console.log('Creating time-locked contract...');
          // This would typically redirect to a contract creation flow
          break;
        default:
          console.log(`${action} for contract ${contractId}`);
      }
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHome = () => (
    <div className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ravdesk Escrow</h1>
        <div className="flex items-center space-x-2">
          {context?.client.added && (
            <button
              onClick={handleSendNotification}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              📢
            </button>
          )}
          <button
            onClick={handleViewProfile}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            👤
          </button>
          <button
            onClick={close}
            className="text-sm text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="mb-6">
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownLink
              icon="wallet"
              href="https://wallet.coinbase.com"
            >
              Wallet
            </WalletDropdownLink>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">
            {contracts.filter(c => c.isActive).length}
          </div>
          <div className="text-xs text-gray-600">Active</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">
            {contracts.filter(c => !c.isActive && !c.isCancelled).length}
          </div>
          <div className="text-xs text-gray-600">Complete</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-600">
            {contracts.reduce((sum, c) => sum + parseFloat(c.totalAmount), 0).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">ETH Total</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button
          onClick={() => setViewMode('contracts')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
        >
          📊 View My Contracts
        </button>
        
        {!context?.client.added && (
          <button
            onClick={handleAddFrame}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700"
          >
            ⭐ Save Frame
          </button>
        )}
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Contracts</h2>
        <button
          onClick={() => setViewMode('home')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">Contract {contract.id.slice(0, 8)}...</h3>
                <p className="text-sm text-gray-600">
                  {contract.totalAmount} ETH • {contract.isTimeLock ? 'Timelock' : 'Milestone'}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                contract.isActive 
                  ? 'bg-green-100 text-green-800'
                  : contract.isCancelled
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {contract.isActive ? 'Active' : contract.isCancelled ? 'Cancelled' : 'Complete'}
              </span>
            </div>
            
            {!contract.isTimeLock && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(contract.currentMilestone / contract.milestoneCount) * 100}%` }}
                />
              </div>
            )}

            {contract.isActive && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleContractAction('deposit', contract.id)}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  💰 Deposit
                </button>
                <button
                  onClick={() => handleContractAction('complete', contract.id)}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ Complete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create Escrow</h2>
        <button
          onClick={() => setViewMode('home')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleContractAction('create-milestone', 'new')}
          className="w-full border-2 border-gray-200 rounded-lg p-4 text-left hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold">Milestone-Based</h3>
              <p className="text-sm text-gray-600">Release funds upon milestone completion</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleContractAction('create-timelock', 'new')}
          className="w-full border-2 border-gray-200 rounded-lg p-4 text-left hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white">⏰</span>
            </div>
            <div>
              <h3 className="font-semibold">Time-Locked</h3>
              <p className="text-sm text-gray-600">Automatically release after time period</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {viewMode === 'home' && renderHome()}
      {viewMode === 'contracts' && renderContracts()}
      {viewMode === 'create' && renderCreate()}

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 flex justify-center">
        <button
          onClick={() => openUrl('https://ravdesk.com')}
          className="px-3 py-1 text-xs border border-gray-300 rounded-lg opacity-60 hover:opacity-80"
        >
          BUILT WITH MINIKIT
        </button>
      </footer>
    </div>
  );
}
