// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MegiculaStaking
 * @notice Non-custodial staking contract for MEGA tokens on OPN Testnet.
 *
 * Reward model (continuous, linear):
 *   pending = stakedAmount × APY_bps × duration / (365 days × 10_000)
 *
 * Where APY_bps is the APY in basis points (1 bp = 0.01 %).
 * Default: 1000 bps = 10 % APY.
 *
 * Security:
 *   - ReentrancyGuard on every external state-changing function
 *   - Pausable (owner can pause deposits / claims in emergencies)
 *   - SafeERC20 for all token transfers
 *   - Ownable for admin-only setters
 */
contract MegiculaStaking is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════════════════════════════
    //  STATE
    // ═══════════════════════════════════════════════════════════════════

    IERC20 public immutable stakingToken;

    /// @notice APY in basis points (1000 = 10 %)
    uint256 public apyBps;

    /// @notice Total tokens currently staked across all users
    uint256 public totalStaked;

    /// @notice Total rewards distributed to date
    uint256 public totalRewardsDistributed;

    /// @notice Total number of unique stakers
    uint256 public totalStakers;

    /// @notice Reward pool balance available for claims
    uint256 public rewardPoolBalance;

    struct UserInfo {
        uint256 amountStaked;
        uint256 rewardDebt;
        uint256 lastStakeTime;
        uint256 totalRewardsClaimed;
    }

    mapping(address => UserInfo) public userInfo;

    // ═══════════════════════════════════════════════════════════════════
    //  CONSTANTS
    // ═══════════════════════════════════════════════════════════════════

    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant DAYS_PER_YEAR   = 365 days;
    uint256 public constant MAX_APY_BPS     = 10_000; // 100 % cap

    // ═══════════════════════════════════════════════════════════════════
    //  EVENTS
    // ═══════════════════════════════════════════════════════════════════

    event Stake(address indexed user, uint256 amount, uint256 timestamp);
    event Unstake(address indexed user, uint256 amount, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 reward, uint256 timestamp);
    event EmergencyWithdraw(address indexed user, uint256 amount, uint256 timestamp);
    event RewardPoolFunded(address indexed funder, uint256 amount, uint256 newPoolBalance);
    event APYUpdated(uint256 oldApyBps, uint256 newApyBps);

    // ═══════════════════════════════════════════════════════════════════
    //  ERRORS
    // ═══════════════════════════════════════════════════════════════════

    error ZeroAmount();
    error InsufficientStake();
    error InsufficientRewardPool();
    error InvalidAPY();
    error TransferFailed();

    // ═══════════════════════════════════════════════════════════════════
    //  MODIFIERS
    // ═══════════════════════════════════════════════════════════════════

    modifier nonZeroAmount(uint256 amount) {
        if (amount == 0) revert ZeroAmount();
        _;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @param _stakingToken  Address of the ERC20 token to stake (MEGA)
     * @param _apyBps        Initial APY in basis points (1000 = 10 %)
     */
    constructor(address _stakingToken, uint256 _apyBps) Ownable(msg.sender) {
        require(_stakingToken != address(0), "zero address");
        if (_apyBps == 0 || _apyBps > MAX_APY_BPS) revert InvalidAPY();

        stakingToken = IERC20(_stakingToken);
        apyBps       = _apyBps;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  USER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Stake MEGA tokens.
     * @dev Automatically claims any pending rewards before restaking.
     * @param amount  Amount of MEGA to stake (in wei, 18 decimals).
     */
    function stake(uint256 amount) external nonZeroAmount(amount) whenNotPaused nonReentrant {
        UserInfo storage user = userInfo[msg.sender];

        // Auto-claim pending rewards before modifying state
        uint256 pending = _calculatePending(msg.sender);
        if (pending > 0) {
            _claimReward(msg.sender, pending);
        }

        // Transfer tokens in
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        // Track unique stakers
        if (user.amountStaked == 0) {
            totalStakers++;
        }

        // Update state
        user.amountStaked += amount;
        user.lastStakeTime = block.timestamp;
        user.rewardDebt = 0; // reset debt after auto-claim
        totalStaked += amount;

        emit Stake(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Unstake MEGA tokens.
     * @dev Automatically claims pending rewards before unstaking.
     * @param amount  Amount of MEGA to unstake (in wei).
     */
    function unstake(uint256 amount) external nonZeroAmount(amount) nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        if (amount > user.amountStaked) revert InsufficientStake();

        // Auto-claim pending rewards
        uint256 pending = _calculatePending(msg.sender);
        if (pending > 0) {
            _claimReward(msg.sender, pending);
        }

        // Update state
        user.amountStaked -= amount;
        totalStaked -= amount;

        // Remove from unique stakers if fully unstaked
        if (user.amountStaked == 0) {
            totalStakers--;
        }

        // Reset debt proportionally
        user.rewardDebt = 0;
        user.lastStakeTime = block.timestamp;

        // Transfer tokens out
        stakingToken.safeTransfer(msg.sender, amount);

        emit Unstake(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Claim all pending staking rewards.
     */
    function claimRewards() external whenNotPaused nonReentrant {
        uint256 pending = _calculatePending(msg.sender);
        if (pending == 0) revert ZeroAmount();

        _claimReward(msg.sender, pending);
    }

    /**
     * @notice Emergency withdraw all staked tokens, forfeiting pending rewards.
     */
    function emergencyWithdraw() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        uint256 amount = user.amountStaked;
        if (amount == 0) revert InsufficientStake();

        // Zero out all user state
        totalStaked -= amount;
        totalStakers--;

        user.amountStaked         = 0;
        user.rewardDebt           = 0;
        user.lastStakeTime        = 0;
        // Note: totalRewardsClaimed is preserved for historical record

        // Transfer tokens out (no reward claimed)
        stakingToken.safeTransfer(msg.sender, amount);

        emit EmergencyWithdraw(msg.sender, amount, block.timestamp);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Update the APY (in basis points). Max 100 % (10 000 bps).
     * @param newApyBps  New APY value in basis points.
     */
    function setAPY(uint256 newApyBps) external onlyOwner {
        if (newApyBps == 0 || newApyBps > MAX_APY_BPS) revert InvalidAPY();

        uint256 oldApyBps = apyBps;
        apyBps = newApyBps;

        emit APYUpdated(oldApyBps, newApyBps);
    }

    /**
     * @notice Fund the reward pool so claims can be fulfilled.
     * @dev    Caller must have approved this contract for the amount.
     * @param amount  Amount of MEGA to deposit into the reward pool.
     */
    function fundRewards(uint256 amount) external onlyOwner nonReentrant nonZeroAmount(amount) {
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPoolBalance += amount;

        emit RewardPoolFunded(msg.sender, amount, rewardPoolBalance);
    }

    /**
     * @notice Pause staking and claiming (emergency stop).
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause staking and claiming.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Get pending (unclaimed) rewards for a user.
     * @param account  Address to query.
     * @return Pending reward amount in wei.
     */
    function getPendingRewards(address account) external view returns (uint256) {
        return _calculatePending(account);
    }

    /**
     * @notice Get full staking info for a user.
     * @param account  Address to query.
     * @return amountStaked         Current staked balance
     * @return pendingRewards       Unclaimed rewards right now
     * @return lastStakeTime        Timestamp of last stake / unstake
     * @return totalRewardsClaimed  Lifetime rewards claimed
     */
    function getUserInfo(address account)
        external
        view
        returns (
            uint256 amountStaked,
            uint256 pendingRewards,
            uint256 lastStakeTime,
            uint256 totalRewardsClaimed
        )
    {
        UserInfo storage user = userInfo[account];
        return (
            user.amountStaked,
            _calculatePending(account),
            user.lastStakeTime,
            user.totalRewardsClaimed
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    //  INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @dev Calculate pending rewards for an account.
     *      Formula: reward = staked × apyBps × duration / (365 days × 10 000)
     */
    function _calculatePending(address account) internal view returns (uint256) {
        UserInfo storage user = userInfo[account];

        if (user.amountStaked == 0) return 0;
        if (user.lastStakeTime == 0) return 0;

        uint256 duration = block.timestamp - user.lastStakeTime;
        if (duration == 0) return 0;

        uint256 reward = (user.amountStaked * apyBps * duration) / (DAYS_PER_YEAR * BPS_DENOMINATOR);

        // Subtract already-debted amount (already claimed portion for this cycle)
        if (reward <= user.rewardDebt) return 0;
        return reward - user.rewardDebt;
    }

    /**
     * @dev Transfer reward tokens to user and update bookkeeping.
     */
    function _claimReward(address account, uint256 reward) internal {
        if (reward > rewardPoolBalance) revert InsufficientRewardPool();

        rewardPoolBalance            -= reward;
        totalRewardsDistributed      += reward;

        UserInfo storage user = userInfo[account];
        user.totalRewardsClaimed += reward;
        user.rewardDebt            = 0;
        user.lastStakeTime         = block.timestamp;

        stakingToken.safeTransfer(account, reward);

        emit RewardClaimed(account, reward, block.timestamp);
    }
}
