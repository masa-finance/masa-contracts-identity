// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../tokens/MasaSBTAuthority.sol";

/// @title Soulbound reference Authority SBT
/// @author Masa Finance
/// @notice Soulbound token that represents a Authority SBT
/// @dev Inherits from the SBT contract.
contract ReferenceSBTAuthority is MasaSBTAuthority, ReentrancyGuard {
    error MaxSBTMinted(address to, uint256 maximum);

    uint256 public maxSBTToMint = 1;

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
    /// @param _maxSBTToMint Maximum number of SBT that can be minted
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address soulboundIdentity,
        PaymentParams memory paymentParams,
        uint256 _maxSBTToMint
    )
        MasaSBTAuthority(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        )
    {
        maxSBTToMint = _maxSBTToMint;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        uint256 identityId
    ) external nonReentrant returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);
        if (maxSBTToMint > 0 && balanceOf(to) >= maxSBTToMint)
            revert MaxSBTMinted(to, maxSBTToMint);

        uint256 tokenId = _mintWithCounter(paymentMethod, to);

        emit MintedToIdentity(tokenId, identityId);

        return tokenId;
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        address to
    ) external nonReentrant returns (uint256) {
        if (maxSBTToMint > 0 && balanceOf(to) >= maxSBTToMint)
            revert MaxSBTMinted(to, maxSBTToMint);

        uint256 tokenId = _mintWithCounter(paymentMethod, to);

        emit MintedToAddress(tokenId, to);

        return tokenId;
    }

    /// @notice Bulk mint of new SBTs
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenIds array of the identity to mint the NFT to
    /// @return The SBT IDs of the newly minted SBTs
    function mint(
        address paymentMethod,
        uint256[] identityId
    ) external nonReentrant returns (uint256[]) {
        tokenIds = new uint256[](identityId.length);
        uint256 t = 0;

        for (uint256 i = 0; i < identityId.length; i++) {
            address to = soulboundIdentity.ownerOf(identityId[i]);
            if (maxSBTToMint > 0 && balanceOf(to) >= maxSBTToMint)
                revert MaxSBTMinted(to, maxSBTToMint);

            uint256 tokenId = _mintWithCounter(paymentMethod, to);

            emit MintedToIdentity(tokenId, identityId[i]);
            tokenIds[t] = tokenId;
            t++;
        }

        return tokenIds;
    }

    /// @notice Bulk mint of new SBTs
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to Addresses array to mint the SBT to
    /// @return The SBT IDs of the newly minted SBTs
    function mint(
        address paymentMethod,
        address[] to
    ) external nonReentrant returns (uint256) {
        tokenIds = new uint256[](identityId.length);
        uint256 t = 0;

        for (uint256 i = 0; i < identityId.length; i++) {
            if (maxSBTToMint > 0 && balanceOf(to[i]) >= maxSBTToMint)
                revert MaxSBTMinted(to[i], maxSBTToMint);

            uint256 tokenId = _mintWithCounter(paymentMethod, to[i]);

            emit MintedToAddress(tokenId, to[i]);
            tokenIds[t] = tokenId;
            t++;
        }

        return tokenIds;
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
