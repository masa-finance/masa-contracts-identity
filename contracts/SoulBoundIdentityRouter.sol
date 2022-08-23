// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SoulBoundIdentity.sol";
import "./SoulName.sol";

contract SoulBoundIdentityRouter is Ownable {
    /* ========== STATE VARIABLES ========== */

    SoulBoundIdentity public soulBoundIdentity;
    SoulName public soulName;

    /* ========== INITIALIZE ========== */

    constructor(
        address owner,
        SoulBoundIdentity _soulBoundIdentity,
        SoulName _soulName
    ) Ownable() {
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");
        require(address(_soulName) != address(0), "ZERO_ADDRESS");

        Ownable.transferOwnership(owner);

        soulBoundIdentity = _soulBoundIdentity;
        soulName = _soulName;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setSoulBoundIdentity(SoulBoundIdentity _soulBoundIdentity)
        external
        onlyOwner
    {
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulBoundIdentity != _soulBoundIdentity, "SAME_VALUE");
        soulBoundIdentity = _soulBoundIdentity;
    }

    function setSoulName(SoulName _soulName) external onlyOwner {
        require(address(_soulName) != address(0), "ZERO_ADDRESS");
        require(soulName != _soulName, "SAME_VALUE");
        soulName = _soulName;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function mintIdentityWithName(address to, string memory name)
        public
        payable
        returns (uint256)
    {
        uint256 identityId = soulBoundIdentity.mint(to);
        uint256 nameId = soulName.mint(to, name, identityId);

        return identityId;
    }

    /* ========== VIEWS ========== */

    function balanceOf(address owner) public view returns (uint256) {
        return soulBoundIdentity.balanceOf(owner);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return soulBoundIdentity.ownerOf(tokenId);
    }

    function ownerOf(string memory name) public view returns (address) {
        (, uint256 tokenId) = soulName.getIdentityData(name);
        return soulBoundIdentity.ownerOf(tokenId);
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return soulBoundIdentity.tokenURI(tokenId);
    }

    function tokenURI(string memory name) public view returns (string memory) {
        (, uint256 tokenId) = soulName.getIdentityData(name);
        return soulBoundIdentity.tokenURI(tokenId);
    }

    function tokenURI(address owner) public view returns (string memory) {
        uint256 tokenId = tokenOfOwner(owner);
        return soulBoundIdentity.tokenURI(tokenId);
    }

    function tokenOfOwner(address owner) public view returns (uint256) {
        return soulBoundIdentity.tokenOfOwnerByIndex(owner, 0);
    }

    function totalSupply() public view returns (uint256) {
        return soulBoundIdentity.totalSupply();
    }

    function nameExists(string memory name) public view returns (bool exists) {
        return soulName.nameExists(name);
    }

    function getIdentityData(string memory name)
        external
        view
        returns (string memory sbtName, uint256 identityId)
    {
        return soulName.getIdentityData(name);
    }

    function getIdentityNames(address owner)
        external
        view
        returns (string[] memory sbtNames)
    {
        uint256 tokenId = tokenOfOwner(owner);
        return soulName.getIdentityNames(tokenId);
    }

    function getIdentityNames(uint256 tokenId)
        external
        view
        returns (string[] memory sbtNames)
    {
        return soulName.getIdentityNames(tokenId);
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
