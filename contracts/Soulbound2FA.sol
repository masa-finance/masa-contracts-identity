// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/MasaSBTLinked.sol";

/// @title Soulbound Two-factor authentication (2FA)
/// @author Masa Finance
/// @notice Soulbound token that represents a Two-factor authentication (2FA)
/// @dev Soulbound 2FA, that inherits from the SBT contract.
contract Soulbound2FA is MasaSBTLinked {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound Two-factor authentication (2FA)
    /// @dev Creates a new soulbound 2FA, inheriting from the SBT contract.
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
            "Masa 2FA",
            "M2F",
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
