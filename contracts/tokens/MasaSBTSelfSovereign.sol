// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../libraries/Errors.sol";
import "./MasaSBT.sol";

/// @title MasaSBTSelfSovereign
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// Adds a self-sovereign protocol to let minting using an authority signature
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBTSelfSovereign is MasaSBT, EIP712 {
    /* ========== STATE VARIABLES =========================================== */

    mapping(address => bool) public authorities;

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
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Adds a new authority to the list of authorities
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _authority New authority to add
    function addAuthority(address _authority) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_authority == address(0)) revert ZeroAddress();
        if (authorities[_authority]) revert AlreadyAdded();

        authorities[_authority] = true;
    }

    /// @notice Removes an authority from the list of authorities
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _authority Authority to remove
    function removeAuthority(address _authority) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_authority == address(0)) revert ZeroAddress();
        if (!authorities[_authority]) revert AuthorityNotExists(_authority);

        authorities[_authority] = false;
    }

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
    ) external payable virtual returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);

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

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _verify(
        bytes32 digest,
        bytes memory signature,
        address signer
    ) internal view {
        address _signer = ECDSA.recover(digest, signature);
        if (_signer != signer) revert InvalidSignature();
        if (!authorities[_signer]) revert NotAuthorized(_signer);
    }

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

    function _mintWithCounter(
        address paymentMethod,
        address to,
        bytes32 digest,
        address authorityAddress,
        bytes calldata signature
    ) internal virtual returns (uint256) {
        if (to != _msgSender()) revert CallerNotOwner(_msgSender());

        _verify(digest, signature, authorityAddress);

        uint256 tokenId = MasaSBT._mintWithCounter(paymentMethod, to);

        return tokenId;
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
