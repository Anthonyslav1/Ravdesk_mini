'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  CheckSquare, 
  DollarSign, 
  User, 
  Wallet, 
  Clock, 
  ArrowRight, 
  Menu, 
  X,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import axios from 'axios';
import Project from './Project';
import ABI from '../ABI.json';

// Wagmi / viem for Farcaster-native wallet integration
import { useAccount, useChainId, usePublicClient, useWalletClient, useSwitchChain, useDisconnect } from 'wagmi';
import { base as baseChain } from 'wagmi/chains';
import { isAddress, encodeFunctionData, parseEther } from 'viem';

import Navbar from './Navbar';
import Footer from './Footer';
import { 
  ConnectWallet as OckConnectWallet, 
  Wallet as OckWallet 
} from '@coinbase/onchainkit/wallet';
 

// The full ABI provided
const CONTRACT_ABI = ABI;

function Dashboard({ hideChrome = false }) {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkCorrect, setNetworkCorrect] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [depositAmounts, setDepositAmounts] = useState({});
  const [page, setPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dashboardStats, setDashboardStats] = useState({
    totalValue: '0',
    activeContracts: 0,
    completedContracts: 0,
    pendingPayments: '0'
  });
  const BASE_MAINNET_CHAIN_ID = '8453';
  const contractsPerPage = 6;

  // Wagmi hooks (Farcaster native)
  const { address: wagmiAddress } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  // Sidebar width adjusts for Farcaster/hideChrome
  const sidebarWidthClass = hideChrome ? 'w-40' : 'w-64';

  // **Derived Data**
  const filteredContracts = useMemo(() => {
    let list = Array.isArray(contracts) ? [...contracts] : [];
    const q = (searchTerm || '').toLowerCase();
    if (q) {
      list = list.filter((c) =>
        (c.address && c.address.toLowerCase().includes(q)) ||
        (Array.isArray(c.clients) && c.clients.some((a) => a?.toLowerCase().includes(q))) ||
        (Array.isArray(c.freelancers) && c.freelancers.some((a) => a?.toLowerCase().includes(q)))
      );
    }
    switch (filterStatus) {
      case 'active':
        list = list.filter((c) => c.isActive && !c.isCancelled);
        break;
      case 'completed':
        list = list.filter((c) => !c.isActive && !c.isCancelled);
        break;
      case 'pending':
        list = list.filter((c) => c.isActive && !c.isCancelled);
        break;
      default:
        break;
    }
    return list;
  }, [contracts, searchTerm, filterStatus]);

  // **Compute Dashboard Stats from Contracts**
  useEffect(() => {
    const list = Array.isArray(contracts) ? contracts : [];
    if (!list.length) {
      setDashboardStats({ totalValue: '0', activeContracts: 0, completedContracts: 0, pendingPayments: '0' });
      return;
    }
    const active = list.filter((c) => c.isActive && !c.isCancelled).length;
    const completed = list.filter((c) => !c.isActive && !c.isCancelled).length;
    const totalValueNum = list.reduce((sum, c) => {
      const v = parseFloat(c?.netAmount ?? c?.totalAmount ?? 0);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
    const pendingNum = list.reduce((sum, c) => {
      const total = parseFloat(c?.totalAmount ?? 0);
      const deposited = parseFloat(c?.depositedAmount ?? 0);
      const delta = total - deposited;
      return sum + (isNaN(delta) ? 0 : Math.max(0, delta));
    }, 0);
    setDashboardStats({
      totalValue: totalValueNum.toFixed(2),
      activeContracts: active,
      completedContracts: completed,
      pendingPayments: pendingNum.toFixed(2),
    });
  }, [contracts]);

  // Sync wagmi account -> local state for legacy code paths
  useEffect(() => {
    if (wagmiAddress) setAccount(wagmiAddress);
  }, [wagmiAddress]);

  // Set network correctness from wagmi chainId when available
  useEffect(() => {
    if (chainId != null) {
      setNetworkCorrect(chainId.toString() === BASE_MAINNET_CHAIN_ID);
    }
  }, [chainId]);

  // **Helper Functions**
  const safeJSONParse = (str, fallback = null) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str.trim());
    } catch (error) {
      console.error('JSON parse error:', error, str);
      return fallback;
    }
  };

  const safeFromWei = (value, fallback = '0') => {
    try {
      const strValue = value !== undefined && value !== null ? value.toString().trim() : '';
      if (!strValue || isNaN(strValue) || parseFloat(strValue) < 0) {
        console.warn('Invalid or negative value detected:', value);
        return fallback;
      }
      return web3.utils.fromWei(strValue, 'ether');
    } catch (error) {
      console.error('fromWei conversion error:', error.message, value);
      return fallback;
    }
  };

  const includesCaseInsensitive = (array, item) => {
    if (!array || !item) return false;
    const itemLower = item.toLowerCase();
    return array.some((element) => element.toLowerCase() === itemLower);
  };

  // **Web3 Initialization** (no auto-connect)
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      checkNetwork(web3Instance);

      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
        if (accounts.length > 0) fetchUserContracts();
      });
      window.ethereum.on('chainChanged', () => checkNetwork(web3Instance));
    } else {
      // No injected provider; in Farcaster/OnchainKit we rely on wagmi/viem.
    }

    return () => console.log('Dashboard unmounted');
  }, []);

  // **Network Handling**
  const checkNetwork = async (web3Instance) => {
    try {
      const chainId = await web3Instance.eth.getChainId();
      const isCorrect = chainId.toString() === BASE_MAINNET_CHAIN_ID;
      setNetworkCorrect(isCorrect);
      if (!isCorrect) setError('Please switch to Base Mainnet');
    } catch (error) {
      setNetworkCorrect(false);
      setError('Failed to check network: ' + error.message);
    }
  };

  const switchToBaseMainnet = async () => {
    try {
      // Prefer wagmi switchChain for WalletConnect/Coinbase Wallet and Farcaster wallet
      if (switchChain) {
        await switchChain({ chainId: baseChain.id });
        setError('');
        return;
      }
    } catch (e) {
      console.warn('wagmi switchChain failed, falling back to injected provider:', e?.message || e);
    }

    // Fallback to injected provider path
    if (!web3 || !window.ethereum) {
      setError('Unable to switch network automatically. Please switch to Base network in your wallet.');
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(BASE_MAINNET_CHAIN_ID).toString(16)}` }],
      });
      setError('');
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${parseInt(BASE_MAINNET_CHAIN_ID).toString(16)}`,
              chainName: 'Base Mainnet',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org/'],
            },
          ],
        });
      } else {
        setError('Failed to switch network: ' + switchError.message);
      }
    }
  };

  // **Wallet Connection**
  const handleWalletConnect = async () => {
    // If Farcaster/wagmi wallet already available, just sync and fetch
    if (walletClient && wagmiAddress) {
      if (!networkCorrect) {
        setError('Please switch to Base Mainnet.');
        return;
      }
      setIsConnecting(true);
      setError('');
      setInfoMessage('');
      try {
        setAccount(wagmiAddress);
        await fetchUserContracts();
      } catch (error) {
        setError('Connection failed: ' + (error?.message || String(error)));
      } finally {
        setIsConnecting(false);
      }
      return;
    }
    if (!web3) return setError('Please install MetaMask!');
    if (!networkCorrect) {
      setError('Please switch to Base Mainnet.');
      await switchToBaseMainnet();
      return;
    }
    setIsConnecting(true);
    setError('');
    setInfoMessage('');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await fetchUserContracts();
    } catch (error) {
      setError('Connection failed: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    try { disconnect(); } catch {}
    setAccount(null);
    setContracts([]);
    setError('');
    setInfoMessage('');
  };

  // **Retry Mechanism**
  const withRetry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // **Fetch User Contracts**
  const fetchUserContracts = async () => {
    if (!account) {
      console.log('No account available.');
      setError('Please connect your wallet.');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');
    console.log('Fetching all contracts');

    try {
      const response = await withRetry(() =>
        axios.get(`/api/ravdesk-server/api/contracts`, { params: { creator: account } })
      );
      const contractDataList = response.data || [];
      console.log('Raw contract list response:', contractDataList);

      if (!Array.isArray(contractDataList)) {
        console.warn('Contract list is not an array:', contractDataList);
        setError('Invalid contract data format from server.');
        setContracts([]);
        setLoading(false);
        return;
      }

      const userContractsData = contractDataList.filter((contractData) => {
        const isParticipant =
          includesCaseInsensitive(contractData.clients, account) ||
          includesCaseInsensitive(contractData.freelancers, account);
        const isCreator =
          typeof contractData.creator === 'string' &&
          contractData.creator.toLowerCase() === account.toLowerCase();
        return isParticipant || isCreator;
      });

      if (userContractsData.length === 0) {
        console.log('No contracts found for this address.');
        setInfoMessage('No contracts exist for your address yet. Create your first contract to get started.');
        setContracts([]);
        setLoading(false);
        return;
      }

      const userContracts = await Promise.all(
        userContractsData.map(async (contractData) => {
          try {
            console.log('Processing contract:', contractData.address);
            if (!isAddress(contractData.address)) {
              console.warn(`Invalid contract address detected: ${contractData.address}`);
              return null;
            }

            const contractResponse = await axios.get(
              `/api/ravdesk-server/api/readSmartContract`,
              { params: { address: contractData.address } }
            );
            const agreement = contractResponse.data;
            console.log(`Contract details for ${contractData.address}:`, agreement);

            if (!agreement || agreement.error) {
              console.error(
                `Failed to fetch agreement for ${contractData.address}:`,
                agreement?.error || 'No data returned'
              );
              return null;
            }

            const clients = Array.isArray(contractData.clients) ? contractData.clients : [];
            const freelancers = Array.isArray(contractData.freelancers) ? contractData.freelancers : [];

            const roles = [];
            if (includesCaseInsensitive(clients, account)) roles.push('Client');
            if (includesCaseInsensitive(freelancers, account)) roles.push('Freelancer');
            if (
              typeof contractData.creator === 'string' &&
              contractData.creator.toLowerCase() === account.toLowerCase()
            ) {
              roles.push('Creator');
            }

            if (roles.length === 0) {
              console.log(`Address ${account} not found as Client or Freelancer in contract ${contractData.address}`);
              return null;
            }

            return {
              id: contractData.id,
              address: contractData.address,
              creator: contractData.creator,
              roles,
              isTimeLock: agreement.isTimeLock,
              releaseTime: Number(agreement.releaseTime),
              totalAmount: (agreement.totalAmount),
              depositedAmount: (agreement.depositedAmount),
              netAmount: (agreement.netAmount),
              milestones: (agreement.milestones || []).map((m) => ({
                ...m,
                amount: (m.amount),
              })),
              isActive: agreement.isActive,
              isCancelled: agreement.isCancelled,
              milestoneCount: Number(agreement.milestoneCount),
              clients,
              freelancers,
              freelancerPercentages: safeJSONParse(contractData.freelancer_percentages, []),
              createdAt: contractData.created_at,
            };
          } catch (contractError) {
            console.error(`Error processing contract ${contractData.address}:`, contractError.message);
            return null;
          }
        })
      );

      const validContracts = userContracts.filter((c) => c !== null);
      console.log('Valid contracts after processing:', validContracts);

      setContracts(validContracts);
      if (!validContracts.length) {
        if (userContractsData.length) {
          setError('No valid contracts found. Check the console for details.');
        } else {
          setInfoMessage('No contracts exist for your address yet. Create your first contract to get started.');
        }
      }
    } catch (err) {
      console.error('Fetch contracts error:', err.message, err.stack);
      setError(err.response?.data?.error || err.message || 'Failed to fetch contracts');
      setContracts([]);
    } finally {
      setLoading(false);
      console.log('Finished fetching contracts.');
    }
  };

  // **Handle Deposit**
  const handleDeposit = async (contractAddress) => {
    const amount = depositAmounts[contractAddress];
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    try {
      // Prefer viem/wagmi wallet if available (Farcaster native)
      if (walletClient && publicClient && wagmiAddress) {
        const data = encodeFunctionData({ abi: CONTRACT_ABI, functionName: 'deposit', args: [] });
        const value = parseEther(String(amount));

        // Estimate gas if possible
        let gas;
        try {
          gas = await publicClient.estimateGas({
            account: wagmiAddress,
            to: contractAddress,
            value,
            data,
          });
        } catch {}

        const hash = await walletClient.sendTransaction({
          to: contractAddress,
          value,
          data,
          ...(gas ? { gas } : {}),
        });

        console.log('Transaction sent:', hash);
        setDepositAmounts((prev) => ({ ...prev, [contractAddress]: '' }));
        fetchUserContracts();
        return;
      }

      // Fallback to Web3.js path for browsers with MetaMask
      if (!web3) throw new Error('No wallet client available');
      const contract = new web3.eth.Contract(CONTRACT_ABI, contractAddress);
      const amountInWei = web3.utils.toWei(amount, 'ether');

      const gasPrice = await web3.eth.getGasPrice();
      const gasEstimate = await contract.methods.deposit().estimateGas({
        from: account,
        value: amountInWei,
      });

      const gasFeeInWei = BigInt(gasEstimate) * BigInt(gasPrice);
      const totalCostInWei = BigInt(amountInWei) + gasFeeInWei;
      const totalCostInEther = web3.utils.fromWei(totalCostInWei.toString(), 'ether');

      const balanceInWei = await web3.eth.getBalance(account);
      const balanceInEther = web3.utils.fromWei(balanceInWei, 'ether');

      if (BigInt(balanceInWei) < totalCostInWei) {
        setError(
          `Insufficient balance: ${balanceInEther} ETH available, need ${totalCostInEther} ETH (including gas)`
        );
        return;
      }

      const tx = await contract.methods.deposit().send({
        from: account,
        value: amountInWei,
        gas: gasEstimate,
        gasPrice,
      });
      console.log('Transaction successful:', tx.transactionHash);

      setDepositAmounts((prev) => ({ ...prev, [contractAddress]: '' }));
      fetchUserContracts();
    } catch (err) {
      console.error('Deposit error:', err);
      let errorMessage = 'Deposit failed: ';
      if (err.code === -32000 || err.message?.includes?.('insufficient funds')) {
        errorMessage += 'Insufficient funds for gas or deposit.';
      } else if (err.code === 4001) {
        errorMessage += 'Transaction rejected by user.';
      } else {
        errorMessage += err.message || 'Unknown error';
      }
      setError(errorMessage);
    }
  };

  // **Handle Approve Action**
  const handleApproveAction = async (contractAddress, isRelease) => {
    if (!account) return setError('Please connect your wallet.');

    try {
      // Prefer viem/wagmi path
      if (walletClient && publicClient && wagmiAddress) {
        const data = encodeFunctionData({
          abi: CONTRACT_ABI,
          functionName: 'approveAction',
          args: [Boolean(isRelease)],
        });
        let gas;
        try {
          gas = await publicClient.estimateGas({ account: wagmiAddress, to: contractAddress, data });
        } catch {}
        const hash = await walletClient.sendTransaction({ to: contractAddress, data, ...(gas ? { gas } : {}) });
        console.log('Approval tx sent:', hash);
        fetchUserContracts();
        return hash;
      }

      // Fallback to Web3.js
      if (!web3) throw new Error('No wallet client available');
      const contract = new web3.eth.Contract(CONTRACT_ABI, contractAddress);
      const gasEstimate = await contract.methods.approveAction(isRelease).estimateGas({ from: account });
      const gasPrice = await web3.eth.getGasPrice();

      const tx = await contract.methods.approveAction(isRelease).send({
        from: account,
        gas: web3.utils.toHex(gasEstimate),
        gasPrice: web3.utils.toHex(gasPrice),
      });

      fetchUserContracts();
      return tx;
    } catch (error) {
      setError(`Approval failed: ${error.message}`);
      throw error;
    }
  };

  // **View Contract Details**
  const handleViewDetails = (contractAddress) => {
    alert(`Viewing details for contract at ${contractAddress}`);
  };

  // **Progress and Countdown**
  const getProgress = (contract) => {
    if (contract.isTimeLock) return null;
    const completedAmount = contract.milestones
      .filter((m) => m.isCompleted)
      .reduce((sum, m) => sum + parseFloat(m.amount || 0), 0);
    const totalAmount = parseFloat(contract.totalAmount || 0);
    return totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0;
  };

  const getCountdown = (releaseTime) => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = releaseTime - now;
    if (timeLeft <= 0) return 'Funds Available';
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // **Auto-Refresh**
  useEffect(() => {
    if (account) {
      fetchUserContracts();
      const interval = setInterval(fetchUserContracts, 30000);
      return () => clearInterval(interval);
    }
  }, [account]);

  // **Render**
  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
      {/* Navbar */}
      {!hideChrome && <Navbar account={account} />}

      <div className="flex flex-1 pt-16">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-16 left-0 z-20 p-2 bg-[#2A2A2A] text-white rounded-r-md"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`${sidebarWidthClass} bg-[#2A2A2A] min-h-screen fixed`}
          >
            <div className="p-4">
              <nav className="space-y-2">
                <Link
                  to="/home"
                  className="flex items-center space-x-3 text-gray-300 hover:text-[#00C4B4] hover:bg-[#1A1A1A] px-4 py-3 rounded-lg transition"
                >
                  <Layout size={20} />
                  <span>Home</span>
                </Link>
                <a
                  href="#milestones"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Milestones feature coming soon!');
                  }}
                  className="flex items-center space-x-3 text-gray-300 hover:text-[#00C4B4] hover:bg-[#1A1A1A] px-4 py-3 rounded-lg transition"
                >
                  <CheckSquare size={20} />
                  <span>Milestones</span>
                </a>
                <a
                  href="#payments"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Payments feature coming soon!');
                  }}
                  className="flex items-center space-x-3 text-gray-300 hover:text-[#00C4B4] hover:bg-[#1A1A1A] px-4 py-3 rounded-lg transition"
                >
                  <DollarSign size={20} />
                  <span>Payments</span>
                </a>
                <a
                  href="#profile"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Profile feature coming soon!');
                  }}
                  className="flex items-center space-x-3 text-gray-300 hover:text-[#00C4B4] hover:bg-[#1A1A1A] px-4 py-3 rounded-lg transition"
                >
                  <User size={20} />
                  <span>Profile</span>
                </a>
              </nav>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className={`flex-1 p-8 ${isSidebarOpen ? (hideChrome ? 'ml-40' : 'ml-64') : 'ml-0'}`}>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 flex items-center space-x-4"
          >
            {account ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="bg-[#4A4A4A] text-white px-4 py-2 rounded-lg hover:bg-[#3A3A3A] transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="inline-flex">
                <OckWallet>
                  <OckConnectWallet />
                </OckWallet>
              </div>
            )}
            {!networkCorrect && <span className="text-red-400">Switch to Base Mainnet</span>}
            {account && (
              <button
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="bg-[#00C4B4] text-white px-4 py-2 rounded-lg hover:bg-[#00A89B] transition"
              >
                {showProjectForm ? 'Hide Project Form' : 'Create New Project'}
              </button>
            )}
          </motion.div>

          {loading && (
            <div className="flex justify-center items-center mb-4">
              <svg className="animate-spin h-5 w-5 text-[#00C4B4]" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="ml-2 text-gray-300">Loading contracts...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg text-red-400 flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
              <button onClick={fetchUserContracts} className="text-[#00C4B4] underline">
                Retry
              </button>
            </div>
          )}

          {!error && infoMessage && (
            <div className="bg-teal-900 bg-opacity-20 p-4 rounded-lg text-teal-300 flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="mr-2">ℹ️</span>
                {infoMessage}
              </div>
              {account && (
                <button onClick={() => setShowProjectForm(true)} className="text-[#00C4B4] underline">
                  Create Contract
                </button>
              )}
            </div>
          )}

          {showProjectForm && (
            <Project
              web3={web3}
              account={account}
              networkCorrect={networkCorrect}
              switchToBaseMainnet={switchToBaseMainnet}
              onDeployed={fetchUserContracts}
            />
          )}

          {!showProjectForm && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Empty State */}
              {!loading && !error && contracts.length === 0 && (
                <div className="bg-[#2A2A2A] p-8 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2 text-[#00C4B4]">
                    <Shield className="mr-2" size={20} />
                    <span className="font-semibold">No contracts yet</span>
                  </div>
                  <p className="text-gray-300 mb-4">Create your first contract to get started.</p>
                  {account ? (
                    <button
                      onClick={() => setShowProjectForm(true)}
                      className="bg-[#00C4B4] text-white px-4 py-2 rounded-lg hover:bg-[#00A89B] transition"
                    >
                      Create New Contract
                    </button>
                  ) : (
                    <div className="inline-flex">
                      <OckWallet>
                        <OckConnectWallet />
                      </OckWallet>
                    </div>
                  )}
                </div>
              )}

              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Total Value
                  </h2>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {dashboardStats.totalValue} ETH
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Active Contracts
                  </h2>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {dashboardStats.activeContracts}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Completed Contracts
                  </h2>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {dashboardStats.completedContracts}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Pending Payments
                  </h2>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {dashboardStats.pendingPayments} ETH
                  </p>
                </div>
              </div>

              {/* Contracts List */}
              {filteredContracts
                .slice((page - 1) * contractsPerPage, page * contractsPerPage)
                .map((contract) => (
                  <motion.div
                    key={contract.address}
                    whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 196, 180, 0.2)' }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white truncate max-w-[70%]">
                        Project at {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                      </h3>
                      <div className="flex space-x-2">
                        {contract.roles.map((role) => (
                          <span
                            key={role}
                            className={`text-sm px-2 py-1 rounded-full ${
                              role === 'Client'
                                ? 'bg-teal-900 text-[#00C4B4]'
                                : 'bg-yellow-900 text-yellow-400'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm mb-3">
                      Total Amount: {contract.totalAmount} ETH | Deposited:{' '}
                      {contract.depositedAmount} ETH | Net: {contract.netAmount} ETH
                    </div>
                    {!contract.isTimeLock && (
                      <div className="w-full bg-gray-600 rounded-full h-2.5 mb-3">
                        <div
                          className="bg-[#00C4B4] h-2.5 rounded-full"
                          style={{ width: `${getProgress(contract)}%` }}
                        ></div>
                      </div>
                    )}
                    {contract.isTimeLock && (
                      <div className="text-gray-400 text-sm mb-3 flex items-center">
                        <Clock size={16} className="mr-1" />
                        Countdown: {getCountdown(contract.releaseTime)}
                      </div>
                    )}
                    {!contract.isTimeLock && contract.milestones.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-300">Milestones</h4>
                        <ul className="list-disc list-inside text-gray-400 text-sm">
                          {contract.milestones.map((m, i) => (
                            <li key={i}>
                              {m.description} - {m.amount} ETH -{' '}
                              {m.isCompleted ? '✅ Completed' : '⏳ Pending'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-gray-400 text-sm mb-3">
                      Created: {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                    {!contract.isActive && !contract.isCancelled && (
                      <div className="mb-3">
                        <input
                          type="number"
                          value={depositAmounts[contract.address] || ''}
                          onChange={(e) =>
                            setDepositAmounts({
                              ...depositAmounts,
                              [contract.address]: e.target.value,
                            })
                          }
                          placeholder="Deposit Amount (ETH)"
                          className="w-full p-2 bg-[#3A3A3A] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00C4B4]"
                        />
                        <button
                          onClick={() => handleDeposit(contract.address)}
                          className="mt-2 w-full bg-[#00C4B4] text-white py-2 rounded-lg hover:bg-[#00A89B] transition"
                        >
                          Deposit
                        </button>
                      </div>
                    )}
                    {contract.isActive && !contract.isCancelled && (
                      <div className="flex space-x-4 mb-3">
                        <button
                          onClick={() => handleApproveAction(contract.address, true)}
                          className="w-full bg-[#00C4B4] text-white py-2 rounded-lg hover:bg-[#00A89B] transition"
                        >
                          Approve Unlock
                        </button>
                      </div>
                    )}
                    {contract.isCancelled && (
                      <div className="text-red-400 text-sm mb-3">Contract Cancelled</div>
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handleViewDetails(contract.address)}
                        className="bg-[#00C4B4] text-white py-2 px-4 rounded-lg hover:bg-[#00A89B] transition flex items-center"
                      >
                        View Details <ArrowRight size={16} className="ml-2" />
                      </button>
                      <a
                        href={`https://basescan.org/address/${contract.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00C4B4] underline text-sm"
                      >
                        View on Basescan
                      </a>
                    </div>
                  </motion.div>
                ))}
              {contracts.length > contractsPerPage && (
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-[#4A4A4A] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300">
                    Page {page} of {Math.ceil(contracts.length / contractsPerPage)}
                  </span>
                  <button
                    onClick={() => setPage((p) => (p * contractsPerPage < contracts.length ? p + 1 : p))}
                    disabled={page * contractsPerPage >= contracts.length}
                    className="bg-[#4A4A4A] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      {!hideChrome && <Footer />}
    </div>
  );
}

  export default Dashboard;