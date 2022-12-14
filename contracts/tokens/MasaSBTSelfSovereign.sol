// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../libraries/Errors.sol";
import "../interfaces/ISoulboundIdentity.sol";
import "../dex/PaymentGateway.sol";
import "./MasaSBT.sol";

/// @title MasaSBTSelfSovereign
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// Adds a link to a SoulboundIdentity SC to let minting using the identityId
/// Adds a payment gateway to let minting paying a fee
/// Adds a self-sovereign protocol to let minting using an authority signature
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBTSelfSovereign is PaymentGateway, MasaSBT, EIP712 {
    /* ========== STATE VARIABLES =========================================== */

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    ISoulboundIdentity public soulboundIdentity;

    uint256 public mintingPrice; // price in stable coin

    mapping(address => bool) public authorities;

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

        soulboundIdentity = _soulboundIdentity;
        mintingPrice = _mintingPrice;
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

    /// @notice Adds a new authority to the list of authorities
    /// @dev The caller must have the admin to call this function
    /// @param _authority New authority to add
    function addAuthority(address _authority)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_authority != address(0), "ZERO_ADDRESS");
        require(!authorities[_authority], "ALREADY_ADDED");

        authorities[_authority] = true;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /// @notice Returns the identityId owned by the given token
    /// @param tokenId Id of the token
    /// @return Id of the identity
    function getIdentityId(uint256 tokenId) external view returns (uint256) {
        address owner = super.ownerOf(tokenId);
        return soulboundIdentity.tokenOfOwner(owner);
    }

    /// @notice Returns the price for minting
    /// @dev Returns current pricing for minting
    /// @param paymentMethod Address of token that user want to pay
    /// @return Current price for minting in the given payment method
    function getMintingPrice(address paymentMethod)
        public
        view
        returns (uint256)
    {
        if (paymentMethod == address(0)) {
            return _convertFromStableCoin(wrappedNativeToken, mintingPrice);
        } else if (paymentMethod == stableCoin && erc20token[paymentMethod]) {
            return mintingPrice;
        } else if (erc20token[paymentMethod]) {
            return _convertFromStableCoin(paymentMethod, mintingPrice);
        } else {
            revert InvalidPaymentMethod(paymentMethod);
        }
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _verify(
        bytes32 digest,
        bytes memory signature,
        address signer
    ) internal view {
        address _signer = ECDSA.recover(digest, signature);
        require(_signer == signer, "INVALID_SIGNATURE");
        require(authorities[_signer], "NOT_AUTHORIZED");
    }

    function _mintWithCounter(address to) internal virtual returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(to, tokenId);

        return tokenId;
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
