'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ABI from '../ABI.json';
import { RavdeskContractDeployer } from '../utils/contractDeployer.js';
import axios from 'axios';
import type Web3 from 'web3';

// ABI and Bytecode (replace with actual values after compilation)

type ProjectProps = {
  web3: Web3 | null;
  account: string | null;
  networkCorrect: boolean;
  switchToBaseMainnet: () => Promise<void>;
  role?: string;
  onDeployed?: (address: string) => void;
};

function Project({ web3, account, networkCorrect, switchToBaseMainnet, role, onDeployed }: ProjectProps) {
  const [clientCount, setClientCount] = useState(1);
  const [freelancerCount, setFreelancerCount] = useState(1);
  const [milestoneCount, setMilestoneCount] = useState(1);
  const [clients, setClients] = useState(['']);
  const [freelancers, setFreelancers] = useState(['']);
  const [freelancerPercentages, setFreelancerPercentages] = useState(['']);
  const [milestones, setMilestones] = useState([{ amount: '', description: '' }]);
  const [isTimeLock, setIsTimeLock] = useState(false);
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState('');

  const updateArray = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    count: number,
    currentArray: T[],
    defaultValue: T
  ) => {
    const newArray = [...currentArray];
    if (count > newArray.length) {
      for (let i = newArray.length; i < count; i++) newArray.push(defaultValue);
    } else {
      newArray.length = count;
    }
    setter(newArray);
  };

  const handleClientCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, clientCount + delta));
    setClientCount(newCount);
    updateArray(setClients, newCount, clients, '');
  };

  const handleFreelancerCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, freelancerCount + delta));
    setFreelancerCount(newCount);
    updateArray(setFreelancers, newCount, freelancers, '');
    updateArray(setFreelancerPercentages, newCount, freelancerPercentages, '');
  };

  const handleMilestoneCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, milestoneCount + delta));
    setMilestoneCount(newCount);
    updateArray(setMilestones, newCount, milestones, { amount: '', description: '' });
  };

  const handleDeploy = async () => {
    if (!web3 || !account) {
      alert('Please connect your wallet in the Dashboard first!');
      return;
    }
    if (!networkCorrect) {
      alert('Please switch to Base Mainnet.');
      await switchToBaseMainnet();
      return;
    }
    if (clients.some(c => !web3.utils.isAddress(c)) || freelancers.some(f => !web3.utils.isAddress(f))) {
      alert('Please enter valid Ethereum addresses!');
      return;
    }

    const freelancerPercentagesArray = freelancerCount === 1
      ? [100]
      : freelancerPercentages.map(p => parseInt(p) || 0);

    if (freelancerCount > 1) {
      if (freelancerPercentages.some(p => !p || isNaN(parseInt(p)) || parseInt(p) <= 0)) {
        alert('Please enter valid positive percentages for all freelancers!');
        return;
      }
      const totalPercentage = freelancerPercentagesArray.reduce((sum, p) => sum + p, 0);
      if (totalPercentage !== 100) {
        alert('Freelancer percentages must sum to 100!');
        return;
      }
    }

    if (isTimeLock) {
      if (!releaseDate || releaseDate.getTime() / 1000 <= Math.floor(Date.now() / 1000)) {
        alert('Please select a future release date!');
        return;
      }
      if (!totalAmount || parseFloat(totalAmount) <= 0) {
        alert('Please enter a valid total amount in ETH for timelock!');
        return;
      }
    } else {
      if (milestones.some(m => !m.amount || !m.description || parseFloat(m.amount) <= 0)) {
        alert('Please fill all milestone details with valid amounts!');
        return;
      }
    }

    try {
      console.log('Starting deployment with:', {
        account,
        clients,
        freelancers,
        freelancerPercentagesArray,
        isTimeLock,
        releaseDate: releaseDate ? releaseDate.toISOString() : null,
        milestones,
        totalAmount,
      });

      // Create contract deployer instance
      const deployer = new RavdeskContractDeployer(web3, account);

      // Prepare deployment parameters
      const milestoneAmounts = isTimeLock ? [] : milestones.map(m => web3.utils.toWei(m.amount.toString(), 'ether'));
      const milestoneDescriptions = isTimeLock ? [] : milestones.map(m => m.description);
      const releaseTime = isTimeLock && releaseDate ? Math.floor(releaseDate.getTime() / 1000) : 0;

      // Deploy contract using Foundry artifacts
      const deploymentResult = await deployer.deployContract({
        clients,
        freelancers,
        milestoneAmounts,
        milestoneDescriptions,
        isTimeLock,
        releaseTime,
        freelancerPercentages: freelancerPercentagesArray,
        adminCouncilMembers: [] // Optional admin council members
      }) as {
        contract: any;
        address: string;
        abi: any[];
        transactionHash: string;
      };

      const contractAddress = deploymentResult.address;
      const deployedContract = deploymentResult.contract;

      console.log('Contract deployed successfully!');
      console.log('Contract Address:', contractAddress);
      console.log('Transaction Hash:', deploymentResult.transactionHash);
      console.log('View on Basescan:', `https://basescan.org/address/${contractAddress}`);

      setDeployedAddress(contractAddress);

      // Show available contract functions
      console.log('Available contract functions:', deployer.getAvailableFunctions());
      console.log('Available contract events:', deployer.getAvailableEvents());

      // Persist contract to Ravdesk DB with creator association (per-user)
      try {
        const totalWei = isTimeLock
          ? web3.utils.toWei(totalAmount || '0', 'ether')
          : milestoneAmounts.reduce((sum: bigint, w: string) => sum + BigInt(w), BigInt(0)).toString();

        const payload = {
          address: contractAddress,
          creator: account,
          role: role || null,
          total_amount: totalWei,
          net_amount: null,
          milestone_amounts: milestoneAmounts, // array of wei strings or []
          clients,
          freelancers,
          freelancer_percentages: freelancerPercentagesArray,
          is_timelock: isTimeLock,
          release_time: isTimeLock ? String(releaseTime) : null,
        };

        const res = await axios.post('/api/ravdesk-server/api/contracts', payload);
        console.log('Saved contract record:', res.data);
      } catch (persistErr: any) {
        console.error('Failed to persist contract record:', persistErr?.message || persistErr);
      }

      // Notify parent to refetch
      if (onDeployed) {
        try { onDeployed(contractAddress); } catch {}
      }

      alert(`Contract deployed successfully!\nAddress: ${contractAddress}\nTransaction: ${deploymentResult.transactionHash}\nView on Basescan: https://basescan.org/address/${contractAddress}`);
    } catch (error: any) {
      console.error('Deployment error:', error);
      alert(`Deployment failed: ${error?.message || 'Unknown error occurred'}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Create New Project Contract</h2>

      <div className="flex items-center space-x-4">
        <label className="text-white">Release Mechanism:</label>
        <button
          onClick={() => setIsTimeLock(false)}
          className={`px-4 py-2 rounded-lg ${!isTimeLock ? 'bg-[#00C4B4] text-white' : 'bg-[#4A4A4A] text-gray-300'}`}
        >
          Milestone Lock
        </button>
        <button
          onClick={() => setIsTimeLock(true)}
          className={`px-4 py-2 rounded-lg ${isTimeLock ? 'bg-[#00C4B4] text-white' : 'bg-[#4A4A4A] text-gray-300'}`}
        >
          Time Lock
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <label className="text-white">Number of Clients:</label>
        <button onClick={() => handleClientCount(-1)} className="p-2 bg-[#4A4A4A] rounded">
          <Minus size={16} />
        </button>
        <span className="text-white">{clientCount}</span>
        <button onClick={() => handleClientCount(1)} className="p-2 bg-[#4A4A4A] rounded">
          <Plus size={16} />
        </button>
      </div>
      {clients.map((client, index) => (
        <input
          key={index}
          type="text"
          value={client}
          onChange={(e) => {
            const newClients = [...clients];
            newClients[index] = e.target.value;
            setClients(newClients);
          }}
          placeholder={`Client ${index + 1} Address`}
          className="w-full p-2 bg-[#2A2A2A] text-white rounded border border-[#4A4A4A]"
        />
      ))}

      <div className="flex items-center space-x-4">
        <label className="text-white">Number of Freelancers:</label>
        <button onClick={() => handleFreelancerCount(-1)} className="p-2 bg-[#4A4A4A] rounded">
          <Minus size={16} />
        </button>
        <span className="text-white">{freelancerCount}</span>
        <button onClick={() => handleFreelancerCount(1)} className="p-2 bg-[#4A4A4A] rounded">
          <Plus size={16} />
        </button>
      </div>
      {freelancers.map((freelancer, index) => (
        <div key={index} className="space-y-2">
          <input
            type="text"
            value={freelancer}
            onChange={(e) => {
              const newFreelancers = [...freelancers];
              newFreelancers[index] = e.target.value;
              setFreelancers(newFreelancers);
            }}
            placeholder={`Freelancer ${index + 1} Address`}
            className="w-full p-2 bg-[#2A2A2A] text-white rounded border border-[#4A4A4A]"
          />
          {freelancerCount > 1 && (
            <input
              type="number"
              value={freelancerPercentages[index] || ''}
              onChange={(e) => {
                const newPercentages = [...freelancerPercentages];
                newPercentages[index] = e.target.value;
                setFreelancerPercentages(newPercentages);
              }}
              placeholder={`Percentage for Freelancer ${index + 1} (%)`}
              className="w-full p-2 bg-[#2A2A2A] text-white rounded border border-[#4A4A4A]"
            />
          )}
        </div>
      ))}

      {isTimeLock ? (
        <div className="space-y-2">
          <label className="text-white">Total Amount (ETH):</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="Total Amount for Timelock (ETH)"
            className="w-full p-2 bg-[#2A2A2A] text-white rounded border border-[#4A4A4A]"
          />
          <label className="text-white">Release Date:</label>
          <DatePicker
            selected={releaseDate}
            onChange={(date: Date | null) => setReleaseDate(date)}
            dateFormat="MMMM d, yyyy"
            minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={15}
            scrollableYearDropdown
            className="w-full p-2 bg-[#2A2A2A] text-white rounded border border-[#4A4A4A]"
            placeholderText="Select a date"
            popperClassName="react-datepicker-popper"
          />
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-4">
            <label className="text-white">Number of Milestones:</label>
            <button onClick={() => handleMilestoneCount(-1)} className="p-2 bg-[#4A4A4A] rounded">
              <Minus size={16} />
            </button>
            <span className="text-white">{milestoneCount}</span>
            <button onClick={() => handleMilestoneCount(1)} className="p-2 bg-[#4A4A4A] rounded">
              <Plus size={16} />
            </button>
          </div>
          {milestones.map((milestone, index) => (
            <div key={index} className="space-y-2">
              <input
                type="number"
                value={milestone.amount}
                onChange={(e) => {
                  const newMilestones = [...milestones];
                  newMilestones[index].amount = e.target.value;
                  setMilestones(newMilestones);
                }}
                placeholder={`Milestone ${index + 1} Amount (ETH)`}
                className="w-full p-2 bg-[#2A2A2A] text-white rounded border border-[#4A4A4A]"
              />
              <input
                type="text"
                value={milestone.description}
                onChange={(e) => {
                  const newMilestones = [...milestones];
                  newMilestones[index].description = e.target.value;
                  setMilestones(newMilestones);
                }}
                placeholder={`Milestone ${index + 1} Description`}
                className="w-full p-2 bg-[#2A2A2A] text-white rounded border border-[#4A4A4A]"
              />
            </div>
          ))}
        </>
      )}

      <button
        onClick={handleDeploy}
        className="w-full bg-[#00C4B4] text-white py-3 rounded-lg hover:bg-[#00A89B] transition"
      >
        Deploy Contract
      </button>

      {deployedAddress && (
        <p className="text-gray-300 mt-4">
          Deployed at{' '}
          <a
            href={`https://basescan.org/address/${deployedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00C4B4]"
          >
            {deployedAddress}
          </a>
          
        </p>
      )}
    </motion.div>
  );
}

export default Project;