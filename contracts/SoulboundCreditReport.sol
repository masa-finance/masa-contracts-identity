// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/MasaSBTChild.sol";

/// @title Soulbound Credit Report
/// @author Masa Finance
/// @notice Soulbound token that represents a credit report.
/// @dev Soulbound credit report, that inherits from the SBT contract.
contract SoulboundCreditReport is MasaSBTChild {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound credit report
    /// @dev Creates a new soulbound credit report, inheriting from the SBT contract.
    /// @param owner Owner of the smart contract
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    constructor(
        address owner,
        string memory baseTokenURI,
        ISoulboundIdentity soulboundIdentity
    )
        MasaSBTChild(
            owner,
            "Masa Credit Report",
            "MCR",
            baseTokenURI,
            soulboundIdentity
        )
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
