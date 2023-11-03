// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./ReferenceSBTSelfSovereign.sol";
import "../tokens/MasaStatefulSBT.sol";

/// @title Soulbound reference Self-Sovereign SBT with states
/// @author Masa Finance
/// @notice Soulbound token that represents a Self-Sovereign SBT with states
/// @dev Inherits from the SBT contract.
contract ReferenceStatefulSBTSelfSovereign is
    ReferenceSBTSelfSovereign,
    MasaStatefulSBT
{
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Self-Sovereign SBT
    /// @dev Creates a new Self-Sovereign SBT, inheriting from the SBT contract.
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
        ReferenceSBTSelfSovereign(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams,
            maxSBTToMint
        )
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(MasaSBT, ReferenceSBTSelfSovereign)
        returns (string memory)
    {
        _requireMinted(tokenId);

        return _baseURI();
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(MasaSBT, MasaStatefulSBT) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
