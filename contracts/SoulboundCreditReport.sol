// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/SBT.sol";

/// @title Soulbound Credit Report
/// @author Masa Finance
/// @notice Soulbound token that represents a credit report.
/// @dev Soulbound credit report, that inherits from the SBT contract.
contract SoulboundCreditReport is SBT {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound credit report
    /// @dev Creates a new soulbound credit report, inheriting from the SBT contract.
    /// @param owner Owner of the smart contract
    /// @param baseTokenURI Base URI of the token
    constructor(
        address owner,
        string memory baseTokenURI
    ) SBT(owner, "Masa Credit Report", "MCR", baseTokenURI) {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
