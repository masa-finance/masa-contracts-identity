// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./tokens/NFT.sol";
import "./interfaces/ISoulBoundNameResolver.sol";
import "./SoulBoundIdentity.sol";

contract SoulBoundName is NFT, ISoulBoundNameResolver {
    using Strings for uint256;

    /* ========== STATE VARIABLES ========== */

    SoulBoundIdentity public soulBoundIdentity;
    string public extension; // suffix of the names (.sol?)

    mapping(uint256 => string) tokenIdToName; // used to sort through all names (name in lowercase)
    mapping(string => SoulBoundNameData) soulBoundNames; // register of all soulbound names (name in lowercase)
    mapping(uint256 => string[]) identityIdToNames; // register of all names associated to an identityId

    struct SoulBoundNameData {
        string name; // Name with lowercase and uppercase
        uint256 identityId;
    }

    /* ========== INITIALIZE ========== */

    constructor(
        address owner,
        SoulBoundIdentity _soulBoundIdentity,
        string memory _extension,
        string memory baseTokenURI
    ) NFT(owner, "Masa Identity Name", "MIN", baseTokenURI) {
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");

        soulBoundIdentity = _soulBoundIdentity;
        extension = _extension;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

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

    function mint(
        address to,
        string memory name,
        uint256 identityId
    ) public returns (uint256) {
        require(!nameExists(name), "NAME_ALREADY_EXISTS");
        require(bytes(name).length > 0, "ZERO_LENGTH_NAME");
        require(
            soulBoundIdentity.ownerOf(identityId) != address(0),
            "IDENTITY_NOT_FOUND"
        );

        uint256 tokenId = _mintWithCounter(to);

        string memory lowercaseName = _toLowerCase(name);
        tokenIdToName[tokenId] = lowercaseName;

        soulBoundNames[lowercaseName].name = name;
        soulBoundNames[lowercaseName].identityId = identityId;

        identityIdToNames[identityId].push(lowercaseName);

        return tokenId;
    }

    function updateIdentityId(uint256 tokenId, uint256 identityId) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not token owner nor approved"
        );
        require(
            soulBoundIdentity.ownerOf(identityId) != address(0),
            "IDENTITY_NOT_FOUND"
        );

        string memory name = tokenIdToName[tokenId];
        uint256 oldIdentityId = soulBoundNames[name].identityId;

        // change value from soulBoundNames
        soulBoundNames[name].identityId = identityId;

        // remove name from identityIdToNames[oldIdentityId]
        _removeFromIdentityIdToNames(oldIdentityId, name);

        // add name to identityIdToNames[identityId]
        identityIdToNames[identityId].push(name);
    }

    function burn(uint256 tokenId) public override {
        require(_exists(tokenId), "TOKEN_NOT_FOUND");

        string memory name = tokenIdToName[tokenId];
        uint256 identityId = soulBoundNames[name].identityId;

        // remove info from tokenIdToName, soulboundnames and identityIdToNames
        delete tokenIdToName[tokenId];
        delete soulBoundNames[name];
        _removeFromIdentityIdToNames(identityId, name);

        super.burn(tokenId);
    }

    /* ========== VIEWS ========== */

    function nameExists(string memory name)
        public
        view
        override
        returns (bool exists)
    {
        string memory lowercaseName = _toLowerCase(name);
        return (bytes(soulBoundNames[lowercaseName].name).length > 0);
    }

    function getData(string memory name)
        external
        view
        override
        returns (string memory sbtName, uint256 identityId)
    {
        string memory lowercaseName = _toLowerCase(name);
        SoulBoundNameData memory soulBoundNameData = soulBoundNames[
            lowercaseName
        ];
        require(bytes(soulBoundNameData.name).length > 0, "NAME_NOT_FOUND");

        return (
            string(
                bytes.concat(bytes(soulBoundNameData.name), bytes(extension))
            ),
            soulBoundNameData.identityId
        );
    }

    function getIdentityNames(uint256 identityId)
        external
        view
        override
        returns (string[] memory sbtNames)
    {
        // return identity names if exists
        return identityIdToNames[identityId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory name = tokenIdToName[tokenId];
        require(bytes(name).length != 0, "TOKEN_NOT_FOUND");

        string memory lowercaseName = _toLowerCase(name);
        SoulBoundNameData memory soulBoundNameData = soulBoundNames[
            lowercaseName
        ];
        require(bytes(soulBoundNameData.name).length > 0, "NAME_NOT_FOUND");

        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "',
            string(
                bytes.concat(bytes(soulBoundNameData.name), bytes(extension))
            ),
            '", ',
            '"description": "This is a SoulBoundName',
            '", ',
            '"external_url": "https://soulboundname.com/',
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

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
