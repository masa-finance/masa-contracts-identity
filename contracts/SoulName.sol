// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./tokens/NFT.sol";
import "./interfaces/ISoulNameResolver.sol";
import "./SoulboundIdentity.sol";

/// @title SoulName NFT
/// @author Masa Finance
/// @notice SoulName NFT that points to a Soulbound identity token
/// @dev SoulName NFT, that inherits from the NFT contract, and points to a Soulbound identity token.
/// It has an extension, and stores all the information about the identity names.
contract SoulName is NFT, ISoulNameResolver {
    /* ========== STATE VARIABLES ========== */
    using Strings for uint256;

    SoulboundIdentity public soulboundIdentity;
    string public extension; // suffix of the names (.sol?)

    mapping(uint256 => string) tokenIdToName; // used to sort through all names (name in lowercase)
    mapping(string => SoulNameData) soulNames; // register of all soulbound names (name in lowercase)
    mapping(uint256 => string[]) identityIdToNames; // register of all names associated to an identityId

    struct SoulNameData {
        string name; // Name with lowercase and uppercase
        uint256 identityId;
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
        SoulboundIdentity _soulboundIdentity,
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
    /// @param identityId TokenId of the soulbound identity that will be pointed from this soul name
    function mint(
        address to,
        string memory name,
        uint256 identityId
    ) public returns (uint256) {
        require(!nameExists(name), "NAME_ALREADY_EXISTS");
        require(bytes(name).length > 0, "ZERO_LENGTH_NAME");
        require(
            soulboundIdentity.ownerOf(identityId) != address(0),
            "IDENTITY_NOT_FOUND"
        );

        uint256 tokenId = _mintWithCounter(to);

        string memory lowercaseName = _toLowerCase(name);
        tokenIdToName[tokenId] = lowercaseName;

        soulNames[lowercaseName].name = name;
        soulNames[lowercaseName].identityId = identityId;

        identityIdToNames[identityId].push(lowercaseName);

        return tokenId;
    }

    /// @notice Update the identity id pointed from a soul name
    /// @dev The caller must be the owner or an approved address of the soul name.
    /// @param tokenId TokenId of the soul name
    /// @param identityId New TokenId of the soulbound identity that will be pointed from this soul name
    function updateIdentityId(uint256 tokenId, uint256 identityId) public {
        // ERC721: caller is not token owner nor approved
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721_CALLER_NOT_OWNER"
        );
        require(
            soulboundIdentity.ownerOf(identityId) != address(0),
            "IDENTITY_NOT_FOUND"
        );

        string memory name = tokenIdToName[tokenId];
        uint256 oldIdentityId = soulNames[name].identityId;

        // change value from soulNames
        soulNames[name].identityId = identityId;

        // remove name from identityIdToNames[oldIdentityId]
        _removeFromIdentityIdToNames(oldIdentityId, name);

        // add name to identityIdToNames[identityId]
        identityIdToNames[identityId].push(name);
    }

    /// @notice Burn a soul name
    /// @dev The caller must be the owner or an approved address of the soul name.
    /// @param tokenId TokenId of the soul name to burn
    function burn(uint256 tokenId) public override {
        require(_exists(tokenId), "TOKEN_NOT_FOUND");

        string memory name = tokenIdToName[tokenId];
        uint256 identityId = soulNames[name].identityId;

        // remove info from tokenIdToName, soulnames and identityIdToNames
        delete tokenIdToName[tokenId];
        delete soulNames[name];
        _removeFromIdentityIdToNames(identityId, name);

        super.burn(tokenId);
    }

    /* ========== VIEWS ========== */

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

        return (
            _getName(soulNameData.name),
            soulNameData.identityId
        );
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
        // return identity names if exists
        return identityIdToNames[identityId];
    }

    /// @notice Returns the URI of a soul name
    /// @dev This function returns the token URI of the soul name identity specified by the tokenId
    /// @param tokenId TokenId of the soul name
    /// @return URI of the soul name
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory name = tokenIdToName[tokenId];
        require(bytes(name).length != 0, "TOKEN_NOT_FOUND");

        string memory lowercaseName = _toLowerCase(name);
        SoulNameData memory soulNameData = soulNames[lowercaseName];
        require(bytes(soulNameData.name).length > 0, "NAME_NOT_FOUND");

        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "',
            _getName(soulNameData.name),
            '", ',
            '"description": "',
            _getName(soulNameData.name),
            ', a soul name for the Soulbound Identity"',
            '", ',
            '"external_url": "https://soulname.com/',
            tokenId.toString(),
            '"',
            '"url": "https://soulname.com/',
            tokenId.toString(),
            '"',
            "}"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
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

    function _removeFromIdentityIdToNames(
        uint256 identityId,
        string memory name
    ) private {
        for (uint256 i = 0; i < identityIdToNames[identityId].length; i++) {
            if (
                keccak256(
                    abi.encodePacked((identityIdToNames[identityId][i]))
                ) == keccak256(abi.encodePacked((name)))
            ) {
                identityIdToNames[identityId][i] = identityIdToNames[
                    identityId
                ][identityIdToNames[identityId].length - 1];
                identityIdToNames[identityId].pop();
                break;
            }
        }
    }

    function _getName(string memory name) private view returns (string memory) {
        return string(bytes.concat(bytes(name), bytes(extension)));
    }

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
