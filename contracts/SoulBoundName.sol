// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISoulBoundNameResolver.sol";
import "./SoulBoundIdentity.sol";

contract SoulBoundName is
    ERC721PresetMinterPauserAutoId,
    Ownable,
    ISoulBoundNameResolver
{
    SoulBoundIdentity public soulBoundIdentity;
    string public extension; // suffix of the names (.sol?)

    mapping(uint256 => string) tokenIdToName; // used to sort through all names (name in lowercase)
    mapping(string => SoulBoundNameData) soulBoundNames; // register of all soulbound names (name in lowercase)

    struct SoulBoundNameData {
        address payable owner;
        string name; // Name with lowercase and uppercase
        uint256 tokenId;
    }

    constructor(
        address owner,
        SoulBoundIdentity _soulBoundIdentity,
        string memory _extension,
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721PresetMinterPauserAutoId(name, symbol, baseTokenURI) Ownable() {
        soulBoundIdentity = _soulBoundIdentity;
        extension = _extension;

        _setupRole(MINTER_ROLE, owner);
        Ownable.transferOwnership(owner);
    }

    function setSoulBoundIdentity(SoulBoundIdentity _soulBoundIdentity)
        external
        onlyOwner
    {
        require(soulBoundIdentity != _soulBoundIdentity, "SAME_VALUE");
        soulBoundIdentity = _soulBoundIdentity;
    }

    function setExtension(string memory _extension) external onlyOwner {
        require(
            keccak256(abi.encodePacked((extension))) !=
                keccak256(abi.encodePacked((_extension))),
            "SAME_VALUE"
        );
        extension = _extension;
    }

    function nameExists(string memory name)
        external
        override
        returns (bool exists)
    {
        return false;
    }

    function resolveName(string memory name)
        external
        override
        returns (
            address owner,
            string memory sbtName,
            uint256 tokenId
        )
    {
        return (address(0), "", 0);
    }
}
