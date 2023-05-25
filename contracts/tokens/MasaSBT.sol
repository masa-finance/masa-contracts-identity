// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../dex/PaymentGateway.sol";
import "../libraries/Errors.sol";
import "../interfaces/ISoulboundIdentity.sol";
import "../interfaces/ILinkableSBT.sol";
import "./SBT/SBT.sol";
import "./SBT/extensions/SBTEnumerable.sol";
import "./SBT/extensions/SBTBurnable.sol";

/// @title MasaSBT
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
/// Adds a link to a SoulboundIdentity SC to let minting using the identityId
/// Adds a payment gateway to let minting paying a fee
abstract contract MasaSBT is
    PaymentGateway,
    SBT,
    SBTEnumerable,
    SBTBurnable,
    ILinkableSBT
{
    /* ========== STATE VARIABLES =========================================== */

    using Strings for uint256;

    string private _baseTokenURI;

    ISoulboundIdentity public soulboundIdentity;

    uint256 public mintPrice; // price in stable coin
    uint256 public mintPriceMASA; // price in MASA

    uint256 public override addLinkPrice; // price in stable coin
    uint256 public override addLinkPriceMASA; // price in MASA
    uint256 public override queryLinkPrice; // price in stable coin
    uint256 public override queryLinkPriceMASA; // price in MASA

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound token
    /// @dev Creates a new soulbound token
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address _soulboundIdentity,
        PaymentParams memory paymentParams
    ) SBT(name, symbol) PaymentGateway(admin, paymentParams) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);

        _baseTokenURI = baseTokenURI;
        soulboundIdentity = ISoulboundIdentity(_soulboundIdentity);
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the price of minting in stable coin
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _mintPrice New price of minting in stable coin
    function setMintPrice(uint256 _mintPrice) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (mintPrice == _mintPrice) revert SameValue();
        mintPrice = _mintPrice;
    }

    /// @notice Sets the price of minting in MASA
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _mintPriceMASA New price of minting in MASA
    function setMintPriceMASA(uint256 _mintPriceMASA) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (mintPriceMASA == _mintPriceMASA) revert SameValue();
        mintPriceMASA = _mintPriceMASA;
    }

    /// @notice Sets the SoulboundIdentity contract address linked to this SBT
    /// @dev The caller must be the admin to call this function
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    function setSoulboundIdentity(
        address _soulboundIdentity
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(soulboundIdentity) == _soulboundIdentity)
            revert SameValue();
        soulboundIdentity = ISoulboundIdentity(_soulboundIdentity);
    }

    /// @notice Sets the price for adding the link in SoulLinker in stable coin
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _addLinkPrice New price for adding the link in SoulLinker in stable coin
    function setAddLinkPrice(uint256 _addLinkPrice) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (addLinkPrice == _addLinkPrice) revert SameValue();
        addLinkPrice = _addLinkPrice;
    }

    /// @notice Sets the price for adding the link in SoulLinker in MASA
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _addLinkPriceMASA New price for adding the link in SoulLinker in MASA
    function setAddLinkPriceMASA(uint256 _addLinkPriceMASA) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (addLinkPriceMASA == _addLinkPriceMASA) revert SameValue();
        addLinkPriceMASA = _addLinkPriceMASA;
    }

    /// @notice Sets the price for reading data in SoulLinker in stable coin
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _queryLinkPrice New price for reading data in SoulLinker in stable coin
    function setQueryLinkPrice(uint256 _queryLinkPrice) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (queryLinkPrice == _queryLinkPrice) revert SameValue();
        queryLinkPrice = _queryLinkPrice;
    }

    /// @notice Sets the price for reading data in SoulLinker in MASA
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _queryLinkPriceMASA New price for reading data in SoulLinker in MASA
    function setQueryLinkPriceMASA(uint256 _queryLinkPriceMASA) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (queryLinkPriceMASA == _queryLinkPriceMASA) revert SameValue();
        queryLinkPriceMASA = _queryLinkPriceMASA;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /// @notice Returns the identityId owned by the given token
    /// @param tokenId Id of the token
    /// @return Id of the identity
    function getIdentityId(uint256 tokenId) external view returns (uint256) {
        if (soulboundIdentity == ISoulboundIdentity(address(0)))
            revert NotLinkedToAnIdentitySBT();

        address owner = super.ownerOf(tokenId);
        return soulboundIdentity.tokenOfOwner(owner);
    }

    /// @notice Returns true if the token exists
    /// @dev Returns true if the token has been minted
    /// @param tokenId Token to check
    /// @return True if the token exists
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid SBT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    /// @param tokenId SBT to get the URI of
    /// @return URI of the SBT
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }

    /// @notice Query if a contract implements an interface
    /// @dev Interface identification is specified in ERC-165.
    /// @param interfaceId The interface identifier, as specified in ERC-165
    /// @return `true` if the contract implements `interfaceId` and
    ///  `interfaceId` is not 0xffffffff, `false` otherwise
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(SBT, SBTEnumerable, AccessControl, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Returns the price for minting
    /// @dev Returns current pricing for minting
    /// @param paymentMethod Address of token that user want to pay
    /// @return price Current price for minting in the given payment method
    function getMintPrice(
        address paymentMethod
    ) public view returns (uint256 price) {
        if (mintPrice == 0 && mintPriceMASA == 0) {
            price = 0;
        } else if (
            paymentMethod == masaToken &&
            enabledPaymentMethod[paymentMethod] &&
            mintPriceMASA > 0
        ) {
            // price in MASA without conversion rate
            price = mintPriceMASA;
        } else if (
            paymentMethod == stableCoin && enabledPaymentMethod[paymentMethod]
        ) {
            // stable coin
            price = mintPrice;
        } else if (enabledPaymentMethod[paymentMethod]) {
            // ETH and ERC 20 token
            price = _convertFromStableCoin(paymentMethod, mintPrice);
        } else {
            revert InvalidPaymentMethod(paymentMethod);
        }
        return price;
    }

    /// @notice Returns the price for minting with protocol fee
    /// @dev Returns current pricing for minting with protocol fee
    /// @param paymentMethod Address of token that user want to pay
    /// @return price Current price for minting in the given payment method
    /// @return protocolFee Current protocol fee for minting in the given payment method
    function getMintPriceWithProtocolFee(
        address paymentMethod
    ) public view returns (uint256 price, uint256 protocolFee) {
        price = getMintPrice(paymentMethod);
        return (price, _getProtocolFee(paymentMethod, price));
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(SBT, SBTEnumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
