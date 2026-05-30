// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MegiculaToken
 * @notice ERC20 governance and staking token for the Megicula Stake protocol.
 * @dev  Name: Megicula Token | Symbol: MEGA | Decimals: 18
 *       Initial supply: 100,000,000 MEGA minted to the deployer.
 *       The token is burnable by any holder (ERC20Burnable).
 */
contract MegiculaToken is ERC20, ERC20Burnable, Ownable {
    // ─── Constants ────────────────────────────────────────────────────
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 1e18; // 100 M MEGA

    // ─── Constructor ──────────────────────────────────────────────────
    constructor()
        ERC20("Megicula Token", "MEGA")
        Ownable(msg.sender)
    {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
