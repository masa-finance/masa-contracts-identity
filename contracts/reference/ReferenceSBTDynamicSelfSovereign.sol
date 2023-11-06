// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../tokens/MasaSBTSelfSovereign.sol";
import "../tokens/MasaSBTDynamic.sol";

/// @title Soulbound reference Self-Sovereign SBT with states
/// @author Masa Finance
/// @notice Soulbound token that represents a Self-Sovereign SBT with states
/// @dev Inherits from the SBT contract.
contract ReferenceSBTDynamicSelfSovereign is
    MasaSBTSelfSovereign,
    MasaSBTDynamic,
    ReentrancyGuard
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
        MasaSBTSelfSovereign(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams,
            maxSBTToMint
        )
        EIP712("ReferenceSBTDynamicSelfSovereign", "1.0.0")
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Sets the state of an account
    /// @dev The signer of the signature must be a valid authority
    /// @param account Address of the account to set the state
    /// @param state Name of the state to set
    /// @param value Value of the state to set
    /// @param authorityAddress Address of the authority that signed the message
    /// @param signatureDate Date of the signature
    /// @param signature Signature of the message
    function setState(
        address account,
        string memory state,
        bool value,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) external {
        if (account != _msgSender()) revert CallerNotOwner(_msgSender());

        bytes32 digest = _hash(
            account,
            state,
            value,
            authorityAddress,
            signatureDate
        );
        _verify(digest, signature, authorityAddress);

        _setState(account, state, value);
    }

    /// @notice Sets the state of an account
    /// @dev The signer of the signature must be a valid authority
    /// @param tokenId TokenId of the token to set the state
    /// @param state Name of the state to set
    /// @param value Value of the state to set
    /// @param authorityAddress Address of the authority that signed the message
    /// @param signatureDate Date of the signature
    /// @param signature Signature of the message
    function setState(
        uint256 tokenId,
        string memory state,
        bool value,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) external {
        address to = ownerOf(tokenId);
        if (to != _msgSender()) revert CallerNotOwner(_msgSender());

        bytes32 digest = _hash(
            tokenId,
            state,
            value,
            authorityAddress,
            signatureDate
        );
        _verify(digest, signature, authorityAddress);

        _setState(tokenId, state, value);
    }

    /// @notice Mints a new SBT
    /// @dev The signer of the signature must be a valid authority
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
    /// @dev The signer of the signature must be a valid authority
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

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(MasaSBT, MasaSBTDynamic) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _hash(
        address account,
        string memory state,
        bool value,
        address authorityAddress,
        uint256 signatureDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "SetState(address account,string state,bool value,address authorityAddress,uint256 signatureDate)"
                        ),
                        account,
                        keccak256(bytes(state)),
                        value,
                        authorityAddress,
                        signatureDate
                    )
                )
            );
    }

    function _hash(
        uint256 tokenId,
        string memory state,
        bool value,
        address authorityAddress,
        uint256 signatureDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "SetState(uint256 tokenId,string state,bool value,address authorityAddress,uint256 signatureDate)"
                        ),
                        tokenId,
                        keccak256(bytes(state)),
                        value,
                        authorityAddress,
                        signatureDate
                    )
                )
            );
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
