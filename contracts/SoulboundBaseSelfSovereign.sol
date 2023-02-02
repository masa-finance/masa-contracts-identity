// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./libraries/Errors.sol";
import "./tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound Base SBT Self Sovereign
/// @author Masa Finance
/// @notice Soulbound token that is the base for a SelfSovereing SBT to be
/// deployed from SoulFactory
/// @dev Soulbound Base Self-Sovereing, that inherits from the SBT contract.
contract SoulboundBaseSelfSovereign is MasaSBTSelfSovereign, ReentrancyGuard {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Soulbound Base SBT Self Sovereign
    /// @dev Creates a new soulbound Base SBT, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory nameEIP712,
        string memory baseTokenURI,
        ISoulboundIdentity soulboundIdentity,
        PaymentParams memory paymentParams
    )
        MasaSBTSelfSovereign(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        )
        EIP712(nameEIP712, "1.0.0")
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
