// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./ReferenceSBTAuthority.sol";
import "../tokens/MasaStatefulSBT.sol";

/// @title Soulbound reference Authority SBT with states
/// @author Masa Finance
/// @notice Soulbound token that represents a Authority SBT with states
/// @dev Inherits from the SBT contract.
contract ReferenceStatefulSBTAuthority is
    ReferenceSBTAuthority,
    MasaStatefulSBT
{
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Authority SBT
    /// @dev Creates a new Authority SBT, inheriting from the SBT contract.
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
        ReferenceSBTAuthority(
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

    function setState(
        address account,
        string memory state,
        bool value
    ) external onlyRole(MINTER_ROLE) {
        _setState(account, state, value);
    }

    function setState(
        uint256 tokenId,
        string memory state,
        bool value
    ) external onlyRole(MINTER_ROLE) {
        _setState(tokenId, state, value);
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(MasaSBT, ReferenceSBTAuthority)
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
