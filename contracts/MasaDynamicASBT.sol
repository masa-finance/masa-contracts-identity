// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./tokens/MasaSBTAuthority.sol";
import "./tokens/MasaSBTDynamic.sol";

/// @title Soulbound Authority SBT with states
/// @author Masa Finance
/// @notice Soulbound token that represents a Authority SBT with states
/// @dev Inherits from the SBT contract.
contract MasaDynamicASBT is MasaSBTAuthority, MasaSBTDynamic, ReentrancyGuard {
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

    /// @notice Sets the state of an account
    /// @dev The caller must have the MINTER role
    /// @param account Address of the account to set the state
    /// @param state Name of the state to set
    /// @param value Value of the state to set
    function setState(
        address account,
        string memory state,
        bool value
    ) external onlyRole(MINTER_ROLE) {
        _setState(account, state, value);
    }

    /// @notice Sets the state of a token
    /// @dev The caller must have the MINTER role
    /// @param tokenId TokenId of the token to set the state
    /// @param state Name of the state to set
    /// @param value Value of the state to set
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

    /// @notice Sets some states of an account and mints
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @param states Names of the state to set
    /// @return The SBT ID of the newly minted SBT
    function setStatesAndMint(
        address paymentMethod,
        address to,
        string[] memory states
    ) external payable nonReentrant onlyRole(MINTER_ROLE) returns (uint256) {
        for (uint256 i = 0; i < states.length; i++) {
            _setState(to, states[i], true);
        }

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
