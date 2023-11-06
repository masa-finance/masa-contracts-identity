// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../tokens/MasaSBTAuthority.sol";
import "../tokens/MasaSBTDynamic.sol";

/// @title Soulbound reference Authority SBT with states
/// @author Masa Finance
/// @notice Soulbound token that represents a Authority SBT with states
/// @dev Inherits from the SBT contract.
contract ReferenceSBTDynamicAuthority is
    MasaSBTAuthority,
    MasaSBTDynamic,
    ReentrancyGuard
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
        MasaSBTAuthority(
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

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The SBT ID of the newly minted SBT
    function mint(uint256 identityId) external payable returns (uint256) {
        return mint(address(0), identityId);
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(address to) external payable returns (uint256) {
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
    ) public payable nonReentrant returns (uint256) {
        return _mintWithCounter(paymentMethod, identityId);
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        address to
    ) public payable nonReentrant returns (uint256) {
        return _mintWithCounter(paymentMethod, to);
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(MasaSBT, MasaSBTDynamic) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _mintWithCounter(
        address paymentMethod,
        address to
    ) internal virtual override(MasaSBT, MasaSBTAuthority) returns (uint256) {
        return MasaSBTAuthority._mintWithCounter(paymentMethod, to);
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
