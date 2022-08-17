// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ISoulBoundNameResolver.sol";
import "./SoulBoundIdentity.sol";

contract SoulBoundName is
    ERC721,
    ERC721Enumerable,
    Pausable,
    AccessControl,
    ERC721Burnable,
    ISoulBoundNameResolver
{
    using Strings for uint256;
    using Counters for Counters.Counter;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    SoulBoundIdentity public soulBoundIdentity;
    string public extension; // suffix of the names (.sol?)

    mapping(uint256 => string) tokenIdToName; // used to sort through all names (name in lowercase)
    mapping(string => SoulBoundNameData) soulBoundNames; // register of all soulbound names (name in lowercase)
    mapping(uint256 => string[]) identityIdToNames; // register of all names associated to an identityId

    struct SoulBoundNameData {
        address owner;
        string name; // Name with lowercase and uppercase
        uint256 identityId;
    }

    constructor(
        address owner,
        SoulBoundIdentity _soulBoundIdentity,
        string memory _extension
    ) ERC721("Masa Identity Name", "MIN") {
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");

        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _grantRole(MINTER_ROLE, owner);

        soulBoundIdentity = _soulBoundIdentity;
        extension = _extension;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

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

    function nameExists(string memory name)
        public
        view
        override
        returns (bool exists)
    {
        string memory lowercaseName = _toLowerCase(name);
        return (soulBoundNames[lowercaseName].owner != address(0));
    }

    function getData(string memory name)
        external
        view
        override
        returns (
            address owner,
            string memory sbtName,
            uint256 identityId
        )
    {
        string memory lowercaseName = _toLowerCase(name);
        SoulBoundNameData memory soulBoundNameData = soulBoundNames[
            lowercaseName
        ];
        require(soulBoundNameData.owner != address(0), "NAME_NOT_FOUND");

        return (
            soulBoundNameData.owner,
            string.concat(soulBoundNameData.name, extension),
            soulBoundNameData.identityId
        );
    }

    function getIdentityName(uint256 identityId)
        external
        view
        override
        returns (string memory sbtName)
    {
        // TODO: return identity name if exists
        return "";
    }

    function getIdentityNames(uint256 identityId)
        external
        view
        override
        returns (string[] memory sbtNames)
    {
        // TODO: return identity names if exists
        sbtNames = new string[](0);
        return sbtNames;
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
        require(soulBoundNameData.owner != address(0), "NAME_NOT_FOUND");

        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "',
            string.concat(soulBoundNameData.name, extension),
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

    function mint(
        address to,
        string memory name,
        uint256 identityId
    ) public onlyRole(MINTER_ROLE) {
        require(to != address(0), "ZERO_ADDRESS");
        require(!nameExists(name), "NAME_ALREADY_EXISTS");
        require(
            soulBoundIdentity.ownerOf(identityId) != address(0),
            "IDENTITY_NOT_FOUND"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        string memory lowercaseName = _toLowerCase(name);
        tokenIdToName[tokenId] = lowercaseName;

        soulBoundNames[lowercaseName].owner = to;
        soulBoundNames[lowercaseName].name = name;
        soulBoundNames[lowercaseName].identityId = identityId;

        identityIdToNames[identityId].push(lowercaseName);
    }

    function updateIdentityId(uint256 tokenId, uint256 indentityId)
        public
        onlyRole(MINTER_ROLE)
    {
        // TODO: only owner of the token
    }

    function burn(uint256 tokenId) public override {
        // TODO: update info in soulboundnames and tokenIdToName

        super.burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        // TODO: update owner in soulBoundNames mapping
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

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
}
