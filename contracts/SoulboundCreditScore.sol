// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/MasaSBT.sol";

/// @title Soulbound Credit Score
/// @author Masa Finance
/// @notice Soulbound token that represents a credit score.
/// @dev Soulbound credit score, that inherits from the SBT contract.
contract SoulboundCreditScore is MasaSBT {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound credit score
    /// @dev Creates a new soulbound credit score, inheriting from the SBT contract.
    /// @param owner Owner of the smart contract
    /// @param baseTokenURI Base URI of the token
    constructor(address owner, string memory baseTokenURI)
        MasaSBT(owner, "Masa Credit Score", "MCS", baseTokenURI)
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
