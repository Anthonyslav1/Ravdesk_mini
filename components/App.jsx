import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Web3 from 'web3';
import FarcasterFrame from './components/FarcasterFrame';
import Dashboard from './pages/Dashboard';
import FAQs from './pages/FAQs';
import { ToastProvider } from './components/ui/Toast';
import { generateFrameMetaTags } from './config/farcaster';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkCorrect, setNetworkCorrect] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [frameState, setFrameState] = useState('home');
  const [contracts, setContracts] = useState([]);
  const BASE_MAINNET_CHAIN_ID = '8453';

  // Initialize Web3 and check for wallet
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      checkNetwork(web3Instance);

      // Auto-connect if previously connected
      web3Instance.eth.getAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      });

      // Listen for account and network changes
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      });
      window.ethereum.on('chainChanged', () => checkNetwork(web3Instance));
    }
  }, []);

  // Update page meta tags for Farcaster frame
  useEffect(() => {
    const metaTags = generateFrameMetaTags(frameState);
    
    // Remove existing frame meta tags
    document.querySelectorAll('meta[name^="fc:"], meta[property^="og:"]').forEach(tag => {
      tag.remove();
    });
    
    // Add new meta tags
    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.setAttribute('name', name);
      if (property) meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });
  }, [frameState]);

  const checkNetwork = async (web3Instance) => {
    try {
      const chainId = await web3Instance.eth.getChainId();
      const isCorrect = chainId.toString() === BASE_MAINNET_CHAIN_ID;
      setNetworkCorrect(isCorrect);
    } catch (error) {
      setNetworkCorrect(false);
    }
  };

  const handleWalletConnect = async () => {
    if (!web3) return;
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletDisconnect = () => {
    setAccount(null);
  };

  const handleNetworkSwitch = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(BASE_MAINNET_CHAIN_ID).toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${parseInt(BASE_MAINNET_CHAIN_ID).toString(16)}`,
            chainName: 'Base Mainnet',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org/'],
          }],
        });
      }
    }
  };

  const handleFrameAction = (action, data = {}) => {
    switch (action) {
      case 'create_contract':
        setFrameState('create');
        break;
      case 'view_contracts':
        setFrameState('contracts');
        break;
      case 'go_home':
        setFrameState('home');
        break;
      case 'open_dashboard':
        window.location.href = '/dashboard';
        break;
      default:
        console.log('Frame action:', action, data);
    }
  };

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <FarcasterFrame
                frameState={frameState}
                contracts={contracts}
                onAction={handleFrameAction}
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                web3={web3}
                account={account}
                networkCorrect={networkCorrect}
                isConnecting={isConnecting}
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                onNetworkSwitch={handleNetworkSwitch}
              />
            } 
          />
          <Route path="/faqs" element={<FAQs />} />
          <Route 
            path="*" 
            element={
              <FarcasterFrame
                frameState={frameState}
                contracts={contracts}
                onAction={handleFrameAction}
              />
            } 
          />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;