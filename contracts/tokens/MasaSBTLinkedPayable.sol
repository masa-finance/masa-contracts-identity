// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../interfaces/ISoulboundIdentity.sol";
import "../dex/PaymentGateway.sol";
import "./MasaSBTLinked.sol";

/// @title MasaSBTLinkedPayable
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// Adds a link to a SoulboundIdentity SC to let minting using the identityId
/// Adds a payment gateway to let minting paying a fee
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBTLinkedPayable is PaymentGateway, MasaSBTLinked {
    /* ========== STATE VARIABLES =========================================== */

    uint256 public mintingPrice; // price in stable coin

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound token
    /// @dev Creates a new soulbound token
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    /// @param _mintingPrice Price of minting in stable coin
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        ISoulboundIdentity _soulboundIdentity,
        uint256 _mintingPrice,
        PaymentParams memory paymentParams
    )
        PaymentGateway(admin, paymentParams)
        MasaSBTLinked(admin, name, symbol, baseTokenURI, _soulboundIdentity)
    {
        mintingPrice = _mintingPrice;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the price of minting in stable coin
    /// @dev The caller must have the admin to call this function
    /// @param _mintingPrice New price of minting in stable coin
    function setMintingPrice(uint256 _mintingPrice)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(mintingPrice != _mintingPrice, "SAME_VALUE");
        mintingPrice = _mintingPrice;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
