// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound Two-factor authentication (Green - 2FA)
/// @author Masa Finance
/// @notice Soulbound token that represents a Two-factor authentication (2FA)
/// @dev Soulbound Green, that inherits from the SBT contract.
contract SoulboundGreen is MasaSBTSelfSovereign {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound Two-factor authentication (Green - 2FA)
    /// @dev Creates a new soulbound Green, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param paymentParams Payment gateway params
    /// @param maxSBTToMint Maximum number of SBT that can be minted
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address soulboundIdentity,
        PaymentParams memory paymentParams,
        uint256 maxSBTToMint
    )
        MasaSBTSelfSovereign(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams,
            maxSBTToMint
        )
        EIP712("SoulboundGreen", "1.0.0")
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
