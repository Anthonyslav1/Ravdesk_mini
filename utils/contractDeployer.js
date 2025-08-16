/**
 * Contract Deployment Helper for RavdeskEscrowSecure
 * Uses Foundry compiled artifacts for deployment
 */

import contractArtifact from '../contract/out/RavdeskEscrowSecure.sol/RavdeskEscrowSecure.json';

function extractRpcError(error) {
  try {
    if (!error) return 'Unknown error';
    const dataMsg = (error.data && (error.data.message || (error.data.originalError && error.data.originalError.message))) || undefined;
    const causeMsg = error.cause && error.cause.message;
    const msg = error.message;
    const code = typeof error.code !== 'undefined' ? ` (code ${error.code})` : '';
    return (dataMsg || causeMsg || msg || 'Unknown error') + code;
  } catch {
    return 'Unknown error';
  }
}

export class RavdeskContractDeployer {
  constructor(web3, account) {
    this.web3 = web3;
    this.account = account;
    this.contractABI = contractArtifact.abi;
    // Support various artifact shapes: bytecode can be a string or an object with .object
    const rawBytecode =
      (contractArtifact && contractArtifact.bytecode && (typeof contractArtifact.bytecode === 'string' ? contractArtifact.bytecode : contractArtifact.bytecode.object))
      || (contractArtifact && contractArtifact.evm && contractArtifact.evm.bytecode && (contractArtifact.evm.bytecode.object || contractArtifact.evm.bytecode))
      || '';

    // Ensure 0x prefix
    this.contractBytecode = rawBytecode && rawBytecode.startsWith('0x') ? rawBytecode : (rawBytecode ? `0x${rawBytecode}` : '');
  }

  /**
   * Deploy a new RavdeskEscrowSecure contract
   * @param {Object} params - Deployment parameters
   * @param {string[]} params.clients - Array of client addresses
   * @param {string[]} params.freelancers - Array of freelancer addresses
   * @param {string[]} params.milestoneAmounts - Array of milestone amounts in wei
   * @param {string[]} params.milestoneDescriptions - Array of milestone descriptions
   * @param {boolean} params.isTimeLock - Whether this is a time lock contract
   * @param {number} params.releaseTime - Unix timestamp for time lock release (0 for milestone mode)
   * @param {number[]} params.freelancerPercentages - Array of freelancer percentage shares (must sum to 100)
   * @param {string[]} params.adminCouncilMembers - Array of admin council member addresses
   * @returns {Promise<Object>} Deployed contract instance and address
   */
  async deployContract({
    clients,
    freelancers,
    milestoneAmounts,
    milestoneDescriptions,
    isTimeLock,
    releaseTime,
    freelancerPercentages,
    adminCouncilMembers = [] // Optional admin council members
  }) {
    try {
      console.log('Starting contract deployment with Foundry artifacts...');
      console.log('Contract ABI functions:', this.contractABI.length);
      console.log('Bytecode length:', this.contractBytecode.length);

      // Validate inputs
      this.validateDeploymentParams({
        clients,
        freelancers,
        milestoneAmounts,
        milestoneDescriptions,
        isTimeLock,
        releaseTime,
        freelancerPercentages,
        adminCouncilMembers
      });

      // Create contract instance
      const contract = new this.web3.eth.Contract(this.contractABI);

      // Prepare constructor arguments
      const constructorArgs = [
        clients,
        freelancers,
        milestoneAmounts,
        milestoneDescriptions,
        isTimeLock,
        releaseTime,
        freelancerPercentages,
        adminCouncilMembers
      ];

      console.log('Constructor arguments:', {
        clients: clients.length,
        freelancers: freelancers.length,
        milestones: milestoneAmounts.length,
        isTimeLock,
        releaseTime,
        freelancerPercentages,
        adminCouncilMembers: adminCouncilMembers.length
      });

      // Estimate gas
      const chainId = await this.web3.eth.getChainId();
      console.log('Estimating deployment gas... on chainId:', chainId);
      if (!this.contractBytecode || this.contractBytecode === '0x') {
        throw new Error('Contract bytecode missing. Ensure Foundry artifacts are built and included.');
      }

      const deployTx = contract.deploy({
        data: this.contractBytecode,
        arguments: constructorArgs
      });

      let gasLimit;
      try {
        const gasEstimate = await deployTx.estimateGas({ from: this.account });
        console.log('Gas estimate:', gasEstimate.toString());
        // Add 20% buffer to gas estimate
        gasLimit = BigInt(gasEstimate) * BigInt(12) / BigInt(10);
      } catch (estErr) {
        console.warn('Gas estimation failed, using fallback limit 6,000,000. Reason:', extractRpcError(estErr));
        gasLimit = BigInt(6_000_000);
      }
      
      // Get current gas price
      const gasPrice = await this.web3.eth.getGasPrice();
      console.log('Gas price:', gasPrice);

      // Deploy contract
      console.log('Deploying contract...');
      const deployedContract = await deployTx.send({
        from: this.account,
        gas: gasLimit.toString(),
        gasPrice: gasPrice
      });

      const contractAddress = deployedContract.options.address;
      console.log('Contract deployed at:', contractAddress);

      return {
        contract: deployedContract,
        address: contractAddress,
        abi: this.contractABI,
        transactionHash: deployedContract.transactionHash
      };

    } catch (error) {
      const detail = extractRpcError(error);
      console.error('Contract deployment failed:', detail, error);
      throw new Error(`Deployment failed: ${detail}`);
    }
  }

  /**
   * Create a contract instance for an existing deployed contract
   * @param {string} contractAddress - Address of deployed contract
   * @returns {Object} Contract instance
   */
  getContractInstance(contractAddress) {
    if (!this.web3.utils.isAddress(contractAddress)) {
      throw new Error('Invalid contract address');
    }

    return new this.web3.eth.Contract(this.contractABI, contractAddress);
  }

  /**
   * Get contract ABI
   * @returns {Array} Contract ABI
   */
  getContractABI() {
    return this.contractABI;
  }

  /**
   * Validate deployment parameters
   */
  validateDeploymentParams({
    clients,
    freelancers,
    milestoneAmounts,
    milestoneDescriptions,
    isTimeLock,
    releaseTime,
    freelancerPercentages,
    adminCouncilMembers
  }) {
    // Validate addresses
    if (!Array.isArray(clients) || clients.length === 0) {
      throw new Error('At least one client address is required');
    }

    if (!Array.isArray(freelancers) || freelancers.length === 0) {
      throw new Error('At least one freelancer address is required');
    }

    clients.forEach((address, index) => {
      if (!this.web3.utils.isAddress(address)) {
        throw new Error(`Invalid client address at index ${index}: ${address}`);
      }
    });

    freelancers.forEach((address, index) => {
      if (!this.web3.utils.isAddress(address)) {
        throw new Error(`Invalid freelancer address at index ${index}: ${address}`);
      }
    });

    if (adminCouncilMembers) {
      adminCouncilMembers.forEach((address, index) => {
        if (!this.web3.utils.isAddress(address)) {
          throw new Error(`Invalid admin council address at index ${index}: ${address}`);
        }
      });
    }

    // Validate freelancer percentages
    if (!Array.isArray(freelancerPercentages) || freelancerPercentages.length !== freelancers.length) {
      throw new Error('Freelancer percentages array must match freelancers array length');
    }

    const totalPercentage = freelancerPercentages.reduce((sum, p) => sum + p, 0);
    if (totalPercentage !== 100) {
      throw new Error(`Freelancer percentages must sum to 100, got ${totalPercentage}`);
    }

    // Validate milestone or timelock parameters
    if (isTimeLock) {
      if (!releaseTime || releaseTime <= Math.floor(Date.now() / 1000)) {
        throw new Error('Release time must be in the future for time lock contracts');
      }
      // For timelock, milestones should be empty
      if (milestoneAmounts.length > 0 || milestoneDescriptions.length > 0) {
        throw new Error('Milestone arrays should be empty for time lock contracts');
      }
    } else {
      // For milestone contracts, validate milestones
      if (!Array.isArray(milestoneAmounts) || milestoneAmounts.length === 0) {
        throw new Error('At least one milestone is required for milestone contracts');
      }

      if (milestoneAmounts.length !== milestoneDescriptions.length) {
        throw new Error('Milestone amounts and descriptions arrays must have the same length');
      }

      milestoneAmounts.forEach((amount, index) => {
        if (!amount || parseFloat(amount) <= 0) {
          throw new Error(`Invalid milestone amount at index ${index}: ${amount}`);
        }
      });

      milestoneDescriptions.forEach((description, index) => {
        if (!description || description.trim().length === 0) {
          throw new Error(`Empty milestone description at index ${index}`);
        }
      });

      if (releaseTime !== 0) {
        throw new Error('Release time should be 0 for milestone contracts');
      }
    }
  }

  /**
   * Get all available contract functions from ABI
   * @returns {Array} Array of function names
   */
  getAvailableFunctions() {
    return this.contractABI
      .filter(item => item.type === 'function')
      .map(item => item.name)
      .sort();
  }

  /**
   * Get contract events from ABI
   * @returns {Array} Array of event names
   */
  getAvailableEvents() {
    return this.contractABI
      .filter(item => item.type === 'event')
      .map(item => item.name)
      .sort();
  }
}

export default RavdeskContractDeployer;
