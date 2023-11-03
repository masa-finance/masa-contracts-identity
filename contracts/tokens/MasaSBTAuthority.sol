// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./MasaSBT.sol";

/// @title MasaSBT
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBTAuthority is MasaSBT {
    /* ========== STATE VARIABLES =========================================== */

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound token
    /// @dev Creates a new soulbound token
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address soulboundIdentity,
        PaymentParams memory paymentParams
    )
        MasaSBT(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        )
    {
        _grantRole(MINTER_ROLE, admin);
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    function _mintWithCounter(
        address paymentMethod,
        address to
    ) internal virtual onlyRole(MINTER_ROLE) returns (uint256) {
        (uint256 price, uint256 protocolFee) = getMintPriceWithProtocolFee(
            paymentMethod
        );
        _pay(paymentMethod, price, protocolFee);

        uint256 tokenId = _mintWithCounter(to);

        return tokenId;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
