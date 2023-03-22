// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./libraries/Errors.sol";
import "./tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound Base SBT Self Sovereign
/// @author Masa Finance
/// @notice Soulbound token that is the base for a SelfSovereing SBT to be
/// deployed from SoulFactory
/// @dev Soulbound Base Self-Sovereing, that inherits from the SBT contract.
contract SoulboundBaseSelfSovereign is MasaSBTSelfSovereign {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Soulbound Base SBT Self Sovereign
    /// @dev Creates a new soulbound Base SBT, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param nameEIP712 Name of the EIP712 domain
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param paymentParams Payment gateway params
    function initialize(
        address admin,
        string memory name,
        string memory symbol,
        string memory nameEIP712,
        string memory baseTokenURI,
        ISoulboundIdentity soulboundIdentity,
        PaymentParams memory paymentParams
    ) public initializer {
        MasaSBTSelfSovereign._initialize(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        );
        __EIP712_init(nameEIP712, "1.0.0");
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
