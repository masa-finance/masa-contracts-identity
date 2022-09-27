// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./interfaces/ISoulLinker.sol";

/// @title Soul linker
/// @author Masa Finance
/// @notice Soul linker smart contract that let add links to a Soulbound token.
contract SoulLinker is AccessControl, ISoulLinker {
    /* ========== STATE VARIABLES =========================================== */

    mapping(uint256 => Link) private links;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soul linker
    /// @param admin Administrator of the smart contract
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /// @notice Query if the contract has links for the given token id
    /// @return `true` if the contract has links, `false` otherwise
    function hasLinks(address, uint256) external pure override returns (bool) {
        return false;
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
