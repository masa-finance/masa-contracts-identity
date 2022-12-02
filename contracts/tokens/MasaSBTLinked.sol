// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

import "../interfaces/ISoulboundIdentity.sol";
import "../dex/PaymentGateway.sol";
import "./MasaSBT.sol";

/// @title MasaSBTLinked
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// Adds a link to a SoulboundIdentity SC to let minting using the identityId
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBTLinked is PaymentGateway, MasaSBT {
    /* ========== STATE VARIABLES =========================================== */

    ISoulboundIdentity public soulboundIdentity;

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
        MasaSBT(admin, name, symbol, baseTokenURI)
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");

        mintingPrice = _mintingPrice;

        soulboundIdentity = _soulboundIdentity;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the SoulboundIdentity contract address linked to this SBT
    /// @dev The caller must be the admin to call this function
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulboundIdentity != _soulboundIdentity, "SAME_VALUE");
        soulboundIdentity = _soulboundIdentity;
    }

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

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The NFT ID of the newly minted SBT
    function mint(address paymentMethod, uint256 identityId)
        public
        virtual
        returns (uint256)
    {
        address to = soulboundIdentity.ownerOf(identityId);

        _pay(paymentMethod, mintingPrice);

        return _mintWithCounter(to);
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(address paymentMethod, address to)
        public
        virtual
        returns (uint256)
    {
        uint256 identityId = soulboundIdentity.tokenOfOwner(to);

        return mint(paymentMethod, identityId);
    }

    /* ========== VIEWS ===================================================== */

    /// @notice Returns the identityId owned by the given token
    /// @param tokenId Id of the token
    /// @return Id of the identity
    function getIdentityId(uint256 tokenId) external view returns (uint256) {
        address owner = super.ownerOf(tokenId);
        return soulboundIdentity.tokenOfOwner(owner);
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
