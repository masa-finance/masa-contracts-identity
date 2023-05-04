// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../libraries/Errors.sol";
import "./MasaSBT.sol";

/// @title MasaSBTSelfSovereign
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// Adds a self-sovereign protocol to let minting using an authority signature
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBTSelfSovereign is MasaSBT, EIP712 {
    /* ========== STATE VARIABLES =========================================== */

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

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
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address soulboundIdentity,
        PaymentParams memory paymentParams
    )
        MasaSBT(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        )
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Adds a new authority to the list of authorities
    /// @dev The caller must have the admin role to call this function
    /// @param _authority New authority to add
    function addAuthority(
        address _authority
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_authority == address(0)) revert ZeroAddress();
        if (authorities[_authority]) revert AlreadyAdded();

        authorities[_authority] = true;
    }

    /// @notice Removes an authority from the list of authorities
    /// @dev The caller must have the admin role to call this function
    /// @param _authority Authority to remove
    function removeAuthority(
        address _authority
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_authority == address(0)) revert ZeroAddress();
        if (!authorities[_authority]) revert AuthorityNotExists(_authority);

        authorities[_authority] = false;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _verify(
        bytes32 digest,
        bytes memory signature,
        address signer
    ) private view {
        address _signer = ECDSA.recover(digest, signature);
        if (_signer != signer) revert InvalidSignature();
        if (!authorities[_signer]) revert NotAuthorized(_signer);
    }

    function _mintWithCounter(
        address paymentMethod,
        address to,
        bytes32 digest,
        address authorityAddress,
        bytes calldata signature
    ) internal virtual returns (uint256) {
        _verify(digest, signature, authorityAddress);

        (uint256 price, ) = getMintPrice(paymentMethod);
        _pay(paymentMethod, price);

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(to, tokenId);

        return tokenId;
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
