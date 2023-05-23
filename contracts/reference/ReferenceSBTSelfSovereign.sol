// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound reference Self-Sovereign SBT
/// @author Masa Finance
/// @notice Soulbound token that represents a Self-Sovereign SBT
/// @dev Inherits from the SBT contract.
contract ReferenceSBTSelfSovereign is MasaSBTSelfSovereign, ReentrancyGuard {
    error MaxSBTMinted(address to, uint256 maximum);

    uint256 public maxSBTToMint = 1;

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
        MasaSBTSelfSovereign(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        )
        EIP712("ReferenceSBTSelfSovereign", "1.0.0")
    {
        maxSBTToMint = _maxSBTToMint;
    }

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
        address to = soulboundIdentity.ownerOf(identityId);
        if (maxSBTToMint > 0 && balanceOf(to) >= maxSBTToMint)
            revert MaxSBTMinted(to, maxSBTToMint);
        if (to != _msgSender()) revert CallerNotOwner(_msgSender());

        uint256 tokenId = _mintWithCounter(
            paymentMethod,
            to,
            _hash(identityId, authorityAddress, signatureDate),
            authorityAddress,
            signature
        );

        emit MintedToIdentity(
            tokenId,
            identityId,
            authorityAddress,
            signatureDate,
            paymentMethod,
            mintPrice
        );

        return tokenId;
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
    ) external payable virtual returns (uint256) {
        if (maxSBTToMint > 0 && balanceOf(to) >= maxSBTToMint)
            revert MaxSBTMinted(to, maxSBTToMint);
        if (to != _msgSender()) revert CallerNotOwner(_msgSender());

        uint256 tokenId = _mintWithCounter(
            paymentMethod,
            to,
            _hash(to, authorityAddress, signatureDate),
            authorityAddress,
            signature
        );

        emit MintedToAddress(
            tokenId,
            to,
            authorityAddress,
            signatureDate,
            paymentMethod,
            mintPrice
        );

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

    function _hash(
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Mint(uint256 identityId,address authorityAddress,uint256 signatureDate)"
                        ),
                        identityId,
                        authorityAddress,
                        signatureDate
                    )
                )
            );
    }

    function _hash(
        address to,
        address authorityAddress,
        uint256 signatureDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Mint(address to,address authorityAddress,uint256 signatureDate)"
                        ),
                        to,
                        authorityAddress,
                        signatureDate
                    )
                )
            );
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */

    event MintedToIdentity(
        uint256 tokenId,
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate,
        address paymentMethod,
        uint256 mintPrice
    );

    event MintedToAddress(
        uint256 tokenId,
        address to,
        address authorityAddress,
        uint256 signatureDate,
        address paymentMethod,
        uint256 mintPrice
    );
}
