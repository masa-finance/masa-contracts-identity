// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./tokens/NFT.sol";
import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulName.sol";

/// @title SoulName NFT
/// @author Masa Finance
/// @notice SoulName NFT that points to a Soulbound identity token
/// @dev SoulName NFT, that inherits from the NFT contract, and points to a Soulbound identity token.
/// It has an extension, and stores all the information about the identity names.
contract SoulName is NFT, ISoulName {
    /* ========== STATE VARIABLES ========== */
    using Strings for uint256;

    ISoulboundIdentity public soulboundIdentity;
    string public extension; // suffix of the names (.sol?)

    mapping(uint256 => string) tokenIdToName; // used to sort through all names (name in lowercase)
    mapping(string => SoulNameData) soulNames; // register of all soulbound names (name in lowercase)

    struct SoulNameData {
        string name; // Name with lowercase and uppercase
        uint256 tokenId; // Token ID of the NFT
    }

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new SoulName NFT
    /// @dev Creates a new SoulName NFT, that points to a Soulbound identity, inheriting from the NFT contract.
    /// @param owner Owner of the smart contract
    /// @param _soulboundIdentity Address of the Soulbound identity contract
    /// @param _extension Extension of the soul name
    /// @param baseTokenURI Base URI of the token
    constructor(
        address owner,
        ISoulboundIdentity _soulboundIdentity,
        string memory _extension,
        string memory baseTokenURI
    ) NFT(owner, "Masa Identity Name", "MIN", baseTokenURI) {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");

        soulboundIdentity = _soulboundIdentity;
        extension = _extension;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /// @notice Sets the extension of the soul name
    /// @dev The caller must have the admin role to call this function
    /// @param _extension Extension of the soul name
    function setExtension(string memory _extension)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            keccak256(abi.encodePacked((extension))) !=
                keccak256(abi.encodePacked((_extension))),
            "SAME_VALUE"
        );
        extension = _extension;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Mints a new soul name
    /// @dev The caller can mint more than one name. The soul name must be unique.
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    function mint(
        address to,
        string memory name
    ) public override returns (uint256) {
        require(!nameExists(name), "NAME_ALREADY_EXISTS");
        require(bytes(name).length > 0, "ZERO_LENGTH_NAME");
        require(
            soulboundIdentity.balanceOf(to) > 0,
            "USER_MUST_HAVE_AN_IDENTITY"
        );

        uint256 tokenId = _mintWithCounter(to);

        string memory lowercaseName = _toLowerCase(name);
        tokenIdToName[tokenId] = lowercaseName;

        soulNames[lowercaseName].name = name;
        soulNames[lowercaseName].tokenId = tokenId;

        return tokenId;
    }

    /// @notice Burn a soul name
    /// @dev The caller must be the owner or an approved address of the soul name.
    /// @param tokenId TokenId of the soul name to burn
    function burn(uint256 tokenId) public override {
        require(_exists(tokenId), "TOKEN_NOT_FOUND");

        string memory name = tokenIdToName[tokenId];

        // remove info from tokenIdToName, soulnames and identityIdToNames
        delete tokenIdToName[tokenId];
        delete soulNames[name];

        super.burn(tokenId);
    }

    /* ========== VIEWS ========== */

    /// @notice Returns the extension of the soul name
    /// @dev This function is used to get the extension of the soul name
    /// @return Extension of the soul name
    function getExtension() external view override returns (string memory) {
        return extension;
    }

    /// @notice Checks if a soul name already exists
    /// @dev This function queries if a soul name already exists
    /// @param name Name of the soul name
    /// @return exists `true` if the soul name exists, `false` otherwise
    function nameExists(string memory name)
        public
        view
        override
        returns (bool exists)
    {
        string memory lowercaseName = _toLowerCase(name);
        return (bytes(soulNames[lowercaseName].name).length > 0);
    }

    /// @notice Returns the information of a soul name
    /// @dev This function queries the information of a soul name
    /// @param name Name of the soul name
    /// @return sbtName Soul name, in upper/lower case and extension
    /// @return identityId Identity id of the soul name
    function getIdentityData(string memory name)
        external
        view
        override
        returns (string memory sbtName, uint256 identityId)
    {
        string memory lowercaseName = _toLowerCase(name);
        SoulNameData memory soulNameData = soulNames[lowercaseName];
        require(bytes(soulNameData.name).length > 0, "NAME_NOT_FOUND");

        address owner = ownerOf(soulNameData.tokenId);
        identityId = soulboundIdentity.tokenOfOwner(owner);

        return (_getName(soulNameData.name), identityId);
    }

    /// @notice Returns all the identity names of an account
    /// @dev This function queries all the identity names of the specified account
    /// @param owner Address of the owner of the identities
    /// @return sbtNames Array of soul names associated to the account
    function getIdentityNames(address owner)
        public
        view
        override
        returns (string[] memory sbtNames)
    {
        uint256 balance = balanceOf(owner);
        sbtNames = new string[](balance);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            string memory name = tokenIdToName[tokenId];
            sbtNames[i] = name;
        }

        return sbtNames;
    }

    /// @notice Returns all the identity names of an identity
    /// @dev This function queries all the identity names of the specified identity Id
    /// @param identityId TokenId of the identity
    /// @return sbtNames Array of soul names associated to the identity Id
    function getIdentityNames(uint256 identityId)
        external
        view
        override
        returns (string[] memory sbtNames)
    {
        // return identity id if exists
        address owner = soulboundIdentity.ownerOf(identityId);
        
        return getIdentityNames(owner);
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    function _toLowerCase(string memory _str)
        private
        pure
        returns (string memory)
    {
        bytes memory bStr = bytes(_str);
        bytes memory bLower = new bytes(bStr.length);

        for (uint256 i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((bStr[i] >= 0x41) && (bStr[i] <= 0x5A)) {
                // So we add 0x20 to make it lowercase
                bLower[i] = bytes1(uint8(bStr[i]) + 0x20);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    function _getName(string memory name) private view returns (string memory) {
        return string(bytes.concat(bytes(name), bytes(extension)));
    }

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
