// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/MasaSBTLinked.sol";

/// @title Soulbound Credit Score
/// @author Masa Finance
/// @notice Soulbound token that represents a credit score.
/// @dev Soulbound credit score, that inherits from the SBT contract.
contract SoulboundCreditScore is MasaSBTLinked {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound credit score
    /// @dev Creates a new soulbound credit score, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param _mintingPrice Price of minting in stable coin
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory baseTokenURI,
        ISoulboundIdentity soulboundIdentity,
        uint256 _mintingPrice,
        PaymentParams memory paymentParams
    )
        MasaSBTLinked(
            admin,
            "Masa Credit Score",
            "MCS",
            baseTokenURI,
            soulboundIdentity,
            _mintingPrice,
            paymentParams
        )
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
