// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../tokens/MasaSBTAuthority.sol";

/// @title Soulbound reference Authority SBT
/// @author Masa Finance
/// @notice Soulbound token that represents a Authority SBT
/// @dev Inherits from the SBT contract.
contract ReferenceSBTAuthority is MasaSBTAuthority {
    error SBTAlreadyCreated(address to);

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
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address soulboundIdentity,
        PaymentParams memory paymentParams
    )
        MasaSBTAuthority(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        )
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The SBT ID of the newly minted SBT
    function mint(uint256 identityId) external virtual returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);
        if (balanceOf(to) > 0) revert SBTAlreadyCreated(to);

        uint256 tokenId = _mintWithCounter(to);

        emit MintedToIdentity(tokenId, identityId);

        return tokenId;
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(address to) external virtual returns (uint256) {
        if (balanceOf(to) > 0) revert SBTAlreadyCreated(to);

        uint256 tokenId = _mintWithCounter(to);

        emit MintedToAddress(tokenId, to);

        return tokenId;
    }

    /* ========== VIEWS ===================================================== */

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        return _baseURI();
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */

    event MintedToIdentity(uint256 tokenId, uint256 identityId);

    event MintedToAddress(uint256 tokenId, address to);
}
