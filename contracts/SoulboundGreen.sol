// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound Two-factor authentication (Green - 2FA)
/// @author Masa Finance
/// @notice Soulbound token that represents a Two-factor authentication (2FA)
/// @dev Soulbound Green, that inherits from the SBT contract.
contract SoulboundGreen is MasaSBTSelfSovereign, ReentrancyGuard {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound Two-factor authentication (Green - 2FA)
    /// @dev Creates a new soulbound Green, inheriting from the SBT contract.
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
        MasaSBTSelfSovereign(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams,
            0 //maxSBTToMint
        )
        EIP712("SoulboundGreen", "1.0.0")
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @param authorityAddress Address of the authority that signed the message
    /// @param signatureDate Date of the signature
    /// @param signature Signature of the message
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) external payable virtual nonReentrant returns (uint256) {
        return
            _mintWithCounter(
                paymentMethod,
                identityId,
                _hash(identityId, authorityAddress, signatureDate),
                authorityAddress,
                signatureDate,
                signature
            );
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @param authorityAddress Address of the authority that signed the message
    /// @param signatureDate Date of the signature
    /// @param signature Signature of the message
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        address to,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) external payable virtual nonReentrant returns (uint256) {
        return
            _mintWithCounter(
                paymentMethod,
                to,
                _hash(to, authorityAddress, signatureDate),
                authorityAddress,
                signatureDate,
                signature
            );
    }

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
