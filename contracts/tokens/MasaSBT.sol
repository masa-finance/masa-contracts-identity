// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "../libraries/Errors.sol";
import "../interfaces/ILinkableSBT.sol";
import "./SBT/SBT.sol";
import "./SBT/extensions/SBTEnumerable.sol";
import "./SBT/extensions/SBTBurnable.sol";

/// @title MasaSBT
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBT is
    SBT,
    SBTEnumerable,
    AccessControl,
    SBTBurnable,
    ILinkableSBT
{
    /* ========== STATE VARIABLES =========================================== */

    using Strings for uint256;

    string private _baseTokenURI;

    uint256 public override addPermissionPrice; // price in stable coin
    uint256 public override addPermissionPriceMASA; // price in MASA
    uint256 public override readDataPrice; // price in stable coin
    uint256 public override readDataPriceMASA; // price in MASA

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound token
    /// @dev Creates a new soulbound token
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) SBT(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);

        _baseTokenURI = baseTokenURI;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the price for adding the permission in SoulLinker in stable coin
    /// @dev The caller must have the admin to call this function
    /// @param _addPermissionPrice New price for adding the permission in SoulLinker in stable coin
    function setAddPermissionPrice(uint256 _addPermissionPrice)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (addPermissionPrice == _addPermissionPrice) revert SameValue();
        addPermissionPrice = _addPermissionPrice;
    }

    /// @notice Sets the price for adding the permission in SoulLinker in MASA
    /// @dev The caller must have the admin to call this function
    /// @param _addPermissionPriceMASA New price for adding the permission in SoulLinker in MASA
    function setAddPermissionPriceMASA(uint256 _addPermissionPriceMASA)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (addPermissionPriceMASA == _addPermissionPriceMASA)
            revert SameValue();
        addPermissionPriceMASA = _addPermissionPriceMASA;
    }

    /// @notice Sets the price for reading data in SoulLinker in stable coin
    /// @dev The caller must have the admin to call this function
    /// @param _readDataPrice New price for reading data in SoulLinker in stable coin
    function setReadDataPrice(uint256 _readDataPrice)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (readDataPrice == _readDataPrice) revert SameValue();
        readDataPrice = _readDataPrice;
    }

    /// @notice Sets the price for reading data in SoulLinker in MASA
    /// @dev The caller must have the admin to call this function
    /// @param _readDataPriceMASA New price for reading data in SoulLinker in MASA
    function setReadDataPriceMASA(uint256 _readDataPriceMASA)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (readDataPriceMASA == _readDataPriceMASA) revert SameValue();
        readDataPriceMASA = _readDataPriceMASA;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

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
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
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
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(SBT, SBTEnumerable, AccessControl, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
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
