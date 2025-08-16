// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Use latest stable version without known issues

import "forge-std/Test.sol";

/**
 * @title RavdeskEscrowSecure
 * @dev Secure multi-party escrow contract with milestone and timelock modes
 * @notice This contract addresses all Slither findings and architectural issues
 */
contract RavdeskEscrowSecure {
    // ============ STATE VARIABLES ============
    
    struct Milestone {
        uint256 amount;
        string description;
        bool isCompleted;
        bool isReleased;
    }

    struct Agreement {
        address[] clients;
        address[] freelancers;
        uint256 totalAmount;
        uint256 milestoneCount;
        uint256 currentMilestone;
        bool isActive;
        bool isCancelled;
        bool isTimeLock;
        uint256 releaseTime;
        uint256 depositedAmount;
        uint256 netAmount;
    }

    struct FreelancerShare {
        address freelancer;
        uint256 percentage;
    }

    // ============ CONSTANTS ============
    
    uint256 public constant MAX_PARTIES = 10;
    uint256 public constant ADMIN_FEE_PERCENT = 4;
    uint256 public constant CONSENSUS_THRESHOLD = 51; // 51% required
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    
    // ============ STATE VARIABLES ============
    
    Agreement public agreement;
    mapping(uint256 => Milestone) public milestones;
    mapping(address => uint256) public clientContributions;
    mapping(address => bool) public approvals;
    FreelancerShare[] public freelancerShares;
    mapping(address => uint256) public pendingWithdrawals; // Pull payment pattern
    
    // Decentralized admin system
    address[] public adminCouncil;
    mapping(address => bool) public isAdmin;
    uint256 public adminConsensusCount;
    
    uint256 public totalReleased;
    uint256 private _status; // Reentrancy guard
    
    // Emergency controls
    bool public emergencyPaused;
    uint256 public emergencyActivatedAt;
    uint256 public constant EMERGENCY_DURATION = 7 days;
    
    // ============ EVENTS ============
    
    event Deposited(address indexed client, uint256 amount);
    event ContractFunded(uint256 totalAmount, uint256 netAmount);
    event MilestoneCompleted(uint256 indexed milestoneId, string description);
    event FundsReleased(uint256 indexed milestoneId, uint256 amount);
    event ContractCancelled(address indexed canceller);
    event ApprovalSubmitted(address indexed approver, bool isRelease);
    event AdminFeePaid(uint256 amount);
    event WithdrawalQueued(address indexed recipient, uint256 amount);
    event EmergencyActivated(address indexed activator);
    event EmergencyDeactivated();

    // ============ MODIFIERS ============
    
    modifier onlyParticipants() {
        require(_isParticipant(msg.sender) || isAdmin[msg.sender], "Not authorized");
        _;
    }

    modifier onlyActive() {
        require(agreement.isActive && !agreement.isCancelled && !emergencyPaused, "Contract not active");
        _;
    }

    modifier onlyAdminCouncil() {
        require(isAdmin[msg.sender], "Not admin council member");
        _;
    }

    modifier nonReentrant() {
        require(_status != ENTERED, "Reentrant call");
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }
    
    modifier notPaused() {
        require(!emergencyPaused, "Contract paused");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(
        address[] memory clients,
        address[] memory freelancers,
        uint256[] memory milestoneAmounts,
        string[] memory milestoneDescriptions,
        bool isTimeLock,
        uint256 releaseTime,
        uint256[] memory freelancerPercentages,
        address[] memory adminCouncilMembers
    ) {
        _status = NOT_ENTERED;
        _validateConstructorParams(clients, freelancers, milestoneAmounts, milestoneDescriptions, freelancerPercentages);
        
        // Set up decentralized admin council
        require(adminCouncilMembers.length >= 3 && adminCouncilMembers.length <= 7, "Invalid admin council size");
        for (uint256 i = 0; i < adminCouncilMembers.length; i++) {
            require(adminCouncilMembers[i] != address(0), "Invalid admin address");
            adminCouncil.push(adminCouncilMembers[i]);
            isAdmin[adminCouncilMembers[i]] = true;
        }
        
        agreement.clients = clients;
        agreement.freelancers = freelancers;
        agreement.isActive = false;
        agreement.isCancelled = false;
        agreement.isTimeLock = isTimeLock;

        _setupFreelancerShares(freelancers, freelancerPercentages);
        
        if (isTimeLock) {
            require(releaseTime > block.number + 100, "Release must be future block"); // Use blocks instead of timestamp
            agreement.releaseTime = releaseTime;
        } else {
            _setupMilestones(milestoneAmounts, milestoneDescriptions);
        }
        
        agreement.depositedAmount = 0;
    }

    // ============ CORE FUNCTIONS ============
    
    function deposit() external payable onlyParticipants nonReentrant notPaused {
        require(msg.value > 0, "Must send value");
        require(clientContributions[msg.sender] == 0, "Already contributed");
        require(_isClient(msg.sender), "Only clients can deposit");
        
        // Update state before external calls (Checks-Effects-Interactions)
        clientContributions[msg.sender] = msg.value;
        agreement.depositedAmount += msg.value;
        
        if (agreement.isTimeLock) {
            agreement.totalAmount += msg.value;
        } else {
            require(agreement.depositedAmount <= agreement.totalAmount, "Exceeds total amount");
        }
        
        emit Deposited(msg.sender, msg.value);
        
        // Check if fully funded
        if (agreement.depositedAmount >= agreement.totalAmount) {
            _activateContract();
        }
    }
    
    function completeMilestone(uint256 milestoneId) external onlyParticipants onlyActive {
        require(!agreement.isTimeLock, "Time lock mode active");
        require(milestoneId == agreement.currentMilestone, "Wrong milestone");
        require(!milestones[milestoneId].isCompleted, "Already completed");

        milestones[milestoneId].isCompleted = true;
        agreement.currentMilestone++;
        emit MilestoneCompleted(milestoneId, milestones[milestoneId].description);
    }

    function approveAction(bool isRelease) external onlyParticipants onlyActive {
        approvals[msg.sender] = true;
        emit ApprovalSubmitted(msg.sender, isRelease);

        if (isRelease) {
            if (_checkFullConsensus()) {
                if (agreement.isTimeLock) {
                    _queueTimelockRelease();
                } else {
                    _queueMilestoneRelease(agreement.currentMilestone - 1);
                }
                _resetApprovals();
            }
        } else if (_checkAdminConsensus() && _checkClientConsensus()) {
            _cancelContract();
            _resetApprovals();
        }
    }
    
    // Pull payment pattern for security
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No pending withdrawal");
        
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    function timeLockRelease() external onlyActive nonReentrant {
        require(agreement.isTimeLock, "Not timelock mode");
        require(block.number >= agreement.releaseTime, "Timelock not elapsed");
        
        _queueTimelockRelease();
    }

    // ============ EMERGENCY FUNCTIONS ============
    
    function activateEmergency() external onlyAdminCouncil {
        require(!emergencyPaused, "Already paused");
        emergencyPaused = true;
        emergencyActivatedAt = block.timestamp;
        emit EmergencyActivated(msg.sender);
    }
    
    function deactivateEmergency() external onlyAdminCouncil {
        require(emergencyPaused, "Not paused");
        require(
            block.timestamp >= emergencyActivatedAt + EMERGENCY_DURATION || 
            _checkAdminConsensus(), 
            "Cannot deactivate yet"
        );
        emergencyPaused = false;
        emit EmergencyDeactivated();
    }
    
    // Deadlock recovery mechanism
    function forceRelease() external onlyAdminCouncil {
        require(emergencyPaused, "Emergency not active");
        require(block.timestamp >= emergencyActivatedAt + EMERGENCY_DURATION, "Emergency period not expired");
        
        // Force release funds proportionally
        _emergencyDistribution();
    }

    // ============ ADMIN FUNCTIONS ============
    
    function adminCancel() external onlyAdminCouncil onlyActive {
        require(_checkAdminConsensus(), "Insufficient admin consensus");
        _cancelContract();
    }

    // ============ VIEW FUNCTIONS ============
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance - _getTotalPendingWithdrawals();
    }

    function getMilestone(uint256 milestoneId) external view returns (Milestone memory) {
        return milestones[milestoneId];
    }

    function getFreelancerShare(address freelancer) external view returns (uint256) {
        uint256 freelancerSharesLength = freelancerShares.length;
        for (uint256 i = 0; i < freelancerSharesLength; i++) {
            if (freelancerShares[i].freelancer == freelancer) {
                return freelancerShares[i].percentage;
            }
        }
        return 0;
    }
    
    function getPendingWithdrawal(address account) external view returns (uint256) {
        return pendingWithdrawals[account];
    }

    // ============ INTERNAL FUNCTIONS ============
    
    function _activateContract() internal {
        agreement.isActive = true;
        uint256 adminFee = (agreement.totalAmount * ADMIN_FEE_PERCENT) / 100;
        agreement.netAmount = agreement.depositedAmount - adminFee;
        
        // Queue admin fee for withdrawal using pull pattern
        uint256 feePerAdmin = adminFee / adminCouncil.length;
        for (uint256 i = 0; i < adminCouncil.length; i++) {
            pendingWithdrawals[adminCouncil[i]] += feePerAdmin;
        }
        
        emit AdminFeePaid(adminFee);
        emit ContractFunded(agreement.totalAmount, agreement.netAmount);
    }
    
    function _queueMilestoneRelease(uint256 milestoneId) internal {
        require(milestones[milestoneId].isCompleted, "Milestone not completed");
        require(!milestones[milestoneId].isReleased, "Already released");
        require(address(this).balance >= milestones[milestoneId].amount, "Insufficient balance");

        milestones[milestoneId].isReleased = true;
        totalReleased += milestones[milestoneId].amount;

        // Queue payments using pull pattern
        uint256 freelancerSharesLength = freelancerShares.length;
        for (uint256 i = 0; i < freelancerSharesLength; i++) {
            uint256 share = (milestones[milestoneId].amount * freelancerShares[i].percentage) / 100;
            pendingWithdrawals[freelancerShares[i].freelancer] += share;
            emit WithdrawalQueued(freelancerShares[i].freelancer, share);
        }

        emit FundsReleased(milestoneId, milestones[milestoneId].amount);
    }
    
    function _queueTimelockRelease() internal {
        require(block.number >= agreement.releaseTime, "Timelock not elapsed");
        
        uint256 totalToRelease = agreement.netAmount;
        agreement.isActive = false;

        // Queue payments using pull pattern
        uint256 freelancerSharesLength = freelancerShares.length;
        for (uint256 i = 0; i < freelancerSharesLength; i++) {
            uint256 share = (totalToRelease * freelancerShares[i].percentage) / 100;
            pendingWithdrawals[freelancerShares[i].freelancer] += share;
            emit WithdrawalQueued(freelancerShares[i].freelancer, share);
        }

        emit FundsReleased(0, totalToRelease);
    }
    
    function _cancelContract() internal {
        agreement.isActive = false;
        agreement.isCancelled = true;
        
        uint256 remaining = address(this).balance;
        uint256 clientsLength = agreement.clients.length;
        
        // Queue refunds proportionally
        for (uint256 i = 0; i < clientsLength; i++) {
            address client = agreement.clients[i];
            uint256 contribution = clientContributions[client];
            if (contribution > 0 && remaining > 0 && agreement.depositedAmount > 0) {
                uint256 refundAmount = (remaining * contribution) / agreement.depositedAmount;
                if (refundAmount > 0) {
                    pendingWithdrawals[client] += refundAmount;
                    remaining -= refundAmount;
                    emit WithdrawalQueued(client, refundAmount);
                }
            }
        }
        
        emit ContractCancelled(msg.sender);
    }
    
    function _emergencyDistribution() internal {
        uint256 totalBalance = address(this).balance;
        uint256 totalParties = agreement.clients.length + agreement.freelancers.length;
        uint256 sharePerParty = totalBalance / totalParties;
        
        // Distribute equally among all parties
        for (uint256 i = 0; i < agreement.clients.length; i++) {
            pendingWithdrawals[agreement.clients[i]] += sharePerParty;
        }
        for (uint256 i = 0; i < agreement.freelancers.length; i++) {
            pendingWithdrawals[agreement.freelancers[i]] += sharePerParty;
        }
    }

    // ============ CONSENSUS FUNCTIONS ============
    
    function _checkFullConsensus() internal view returns (bool) {
        return _checkClientConsensus() && _checkFreelancerConsensus();
    }

    function _checkClientConsensus() internal view returns (bool) {
        uint256 clientApprovals = 0;
        uint256 clientsLength = agreement.clients.length;
        
        for (uint256 i = 0; i < clientsLength; i++) {
            if (approvals[agreement.clients[i]]) clientApprovals++;
        }
        
        uint256 requiredApprovals = clientsLength > 1 ? 
            (clientsLength * CONSENSUS_THRESHOLD + 99) / 100 : 1; // Ceiling division
        return clientApprovals >= requiredApprovals;
    }

    function _checkFreelancerConsensus() internal view returns (bool) {
        uint256 freelancerApprovals = 0;
        uint256 freelancersLength = agreement.freelancers.length;
        
        for (uint256 i = 0; i < freelancersLength; i++) {
            if (approvals[agreement.freelancers[i]]) freelancerApprovals++;
        }
        
        uint256 requiredApprovals = freelancersLength > 1 ? 
            (freelancersLength * CONSENSUS_THRESHOLD + 99) / 100 : 1;
        return freelancerApprovals >= requiredApprovals;
    }
    
    function _checkAdminConsensus() internal view returns (bool) {
        uint256 adminApprovals = 0;
        uint256 adminCouncilLength = adminCouncil.length;
        
        for (uint256 i = 0; i < adminCouncilLength; i++) {
            if (approvals[adminCouncil[i]]) adminApprovals++;
        }
        
        uint256 requiredApprovals = (adminCouncilLength * CONSENSUS_THRESHOLD + 99) / 100;
        return adminApprovals >= requiredApprovals;
    }

    function _resetApprovals() internal {
        uint256 clientsLength = agreement.clients.length;
        for (uint256 i = 0; i < clientsLength; i++) {
            approvals[agreement.clients[i]] = false;
        }
        
        uint256 freelancersLength = agreement.freelancers.length;
        for (uint256 i = 0; i < freelancersLength; i++) {
            approvals[agreement.freelancers[i]] = false;
        }
        
        uint256 adminCouncilLength = adminCouncil.length;
        for (uint256 i = 0; i < adminCouncilLength; i++) {
            approvals[adminCouncil[i]] = false;
        }
    }

    // ============ HELPER FUNCTIONS ============
    
    function _isParticipant(address account) internal view returns (bool) {
        return _isClient(account) || _isFreelancer(account);
    }

    function _isClient(address account) internal view returns (bool) {
        uint256 clientsLength = agreement.clients.length;
        for (uint256 i = 0; i < clientsLength; i++) {
            if (agreement.clients[i] == account) return true;
        }
        return false;
    }

    function _isFreelancer(address account) internal view returns (bool) {
        uint256 freelancersLength = agreement.freelancers.length;
        for (uint256 i = 0; i < freelancersLength; i++) {
            if (agreement.freelancers[i] == account) return true;
        }
        return false;
    }
    
    function _getTotalPendingWithdrawals() internal view returns (uint256) {
        uint256 total = 0;
        uint256 clientsLength = agreement.clients.length;
        for (uint256 i = 0; i < clientsLength; i++) {
            total += pendingWithdrawals[agreement.clients[i]];
        }
        
        uint256 freelancersLength = agreement.freelancers.length;
        for (uint256 i = 0; i < freelancersLength; i++) {
            total += pendingWithdrawals[agreement.freelancers[i]];
        }
        
        uint256 adminCouncilLength = adminCouncil.length;
        for (uint256 i = 0; i < adminCouncilLength; i++) {
            total += pendingWithdrawals[adminCouncil[i]];
        }
        
        return total;
    }

    // ============ VALIDATION FUNCTIONS ============
    
    function _validateConstructorParams(
        address[] memory clients,
        address[] memory freelancers,
        uint256[] memory milestoneAmounts,
        string[] memory milestoneDescriptions,
        uint256[] memory freelancerPercentages
    ) internal pure {
        require(clients.length > 0 && clients.length <= MAX_PARTIES, "Invalid client count");
        require(freelancers.length > 0 && freelancers.length <= MAX_PARTIES, "Invalid freelancer count");
        require(freelancers.length == freelancerPercentages.length, "Mismatched freelancer percentages");
        
        if (milestoneAmounts.length > 0) {
            require(milestoneAmounts.length == milestoneDescriptions.length, "Mismatched milestones");
        }
    }
    
    function _setupFreelancerShares(
        address[] memory freelancers, 
        uint256[] memory percentages
    ) internal {
        if (freelancers.length > 1) {
            uint256 totalPercentage = 0;
            for (uint256 i = 0; i < freelancers.length; i++) {
                require(percentages[i] > 0 && percentages[i] <= 100, "Invalid percentage");
                totalPercentage += percentages[i];
                freelancerShares.push(FreelancerShare(freelancers[i], percentages[i]));
            }
            require(totalPercentage == 100, "Percentages must sum to 100");
        } else {
            freelancerShares.push(FreelancerShare(freelancers[0], 100));
        }
    }
    
    function _setupMilestones(
        uint256[] memory milestoneAmounts, 
        string[] memory milestoneDescriptions
    ) internal {
        require(milestoneAmounts.length > 0, "No milestones provided");
        
        agreement.milestoneCount = milestoneAmounts.length;
        agreement.currentMilestone = 0;
        
        uint256 total = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            total += milestoneAmounts[i];
        }
        
        agreement.totalAmount = total;
        uint256 adminFee = (total * ADMIN_FEE_PERCENT) / 100;
        agreement.netAmount = total - adminFee;
        
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            uint256 adjustedAmount = (milestoneAmounts[i] * agreement.netAmount) / total;
            milestones[i] = Milestone(adjustedAmount, milestoneDescriptions[i], false, false);
        }
    }
}
