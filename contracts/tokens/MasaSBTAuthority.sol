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

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The SBT ID of the newly minted SBT
    function mint(uint256 identityId) external payable returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);

        return mint(address(0), to);
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(address to) external payable override returns (uint256) {
        return mint(address(0), to);
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        uint256 identityId
    ) external payable returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);
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
    ) public payable override returns (uint256) {
        uint256 tokenId = _mintWithCounter(paymentMethod, to);

        emit MintedToAddress(tokenId, to);

        return tokenId;
    }

    /// @notice Bulk mint of new SBTs
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenIds array of the identity to mint the NFT to
    /// @return tokenIds The SBT IDs of the newly minted SBTs
    function mint(
        address paymentMethod,
        uint256[] memory identityId
    ) external payable returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](identityId.length);
        uint256 t = 0;

        for (uint256 i = 0; i < identityId.length; i++) {
            address to = soulboundIdentity.ownerOf(identityId[i]);

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
    /// @return tokenIds The SBT IDs of the newly minted SBTs
    function mint(
        address paymentMethod,
        address[] memory to
    ) external payable returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](to.length);
        uint256 t = 0;

        for (uint256 i = 0; i < to.length; i++) {
            uint256 tokenId = _mintWithCounter(paymentMethod, to[i]);

            emit MintedToAddress(tokenId, to[i]);
            tokenIds[t] = tokenId;
            t++;
        }

        return tokenIds;
    }

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _mintWithCounter(
        address paymentMethod,
        address to
    ) internal virtual override onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = MasaSBT._mintWithCounter(paymentMethod, to);

        return tokenId;
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */

    event MintedToIdentity(uint256 tokenId, uint256 identityId);

    event MintedToAddress(uint256 tokenId, address to);
}
