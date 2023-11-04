// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "../interfaces/IMasaSBTAuthority.sol";
import "./MasaSBT.sol";

/// @title MasaSBT
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBTAuthority is MasaSBT, IMasaSBTAuthority {
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
        MasaSBT(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams,
            maxSBTToMint
        )
    {
        _grantRole(MINTER_ROLE, admin);
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _mintWithCounter(
        address paymentMethod,
        uint256 identityId
    ) internal virtual onlyRole(MINTER_ROLE) returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);
        uint256 tokenId = MasaSBT._mintWithCounter(paymentMethod, to);
        emit MintedToIdentity(tokenId, identityId);

        return tokenId;
    }

    function _mintWithCounter(
        address paymentMethod,
        address to
    ) internal virtual override onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = MasaSBT._mintWithCounter(paymentMethod, to);
        emit MintedToAddress(tokenId, to);

        return tokenId;
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */

    event MintedToIdentity(uint256 tokenId, uint256 identityId);

    event MintedToAddress(uint256 tokenId, address to);
}
