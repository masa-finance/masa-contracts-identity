// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SoulBoundIdentity.sol";
import "./SoulBoundName.sol";

contract SoulBoundIdentityRouter is Ownable {
    /* ========== STATE VARIABLES ========== */

    SoulBoundIdentity public soulBoundIdentity;
    SoulBoundName public soulBoundName;

    /* ========== INITIALIZE ========== */

    constructor(
        address owner,
        SoulBoundIdentity _soulBoundIdentity,
        SoulBoundName _soulBoundName
    ) Ownable() {
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");
        require(address(_soulBoundName) != address(0), "ZERO_ADDRESS");

        Ownable.transferOwnership(owner);

        soulBoundIdentity = _soulBoundIdentity;
        soulBoundName = _soulBoundName;
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

    function setSoulBoundName(SoulBoundName _soulBoundName) external onlyOwner {
        require(address(_soulBoundName) != address(0), "ZERO_ADDRESS");
        require(soulBoundName != _soulBoundName, "SAME_VALUE");
        soulBoundName = _soulBoundName;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function mintIdentityWithName(address to, string memory name)
        public
        payable
        returns (uint256)
    {
        uint256 identityId = soulBoundIdentity.mint(to);
        uint256 nameId = soulBoundName.mint(to, name, identityId);

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
        (, uint256 tokenId) = soulBoundName.getIdentityData(name);
        return soulBoundIdentity.ownerOf(tokenId);
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return soulBoundIdentity.tokenURI(tokenId);
    }

    function tokenURI(string memory name) public view returns (string memory) {
        (, uint256 tokenId) = soulBoundName.getIdentityData(name);
        return soulBoundIdentity.tokenURI(tokenId);
    }

    function tokenURI(address owner) public view returns (string memory) {
        uint256 tokenId = soulBoundIdentity.tokenOfOwnerByIndex(owner, 0);
        return soulBoundIdentity.tokenURI(tokenId);
    }

    function tokenOfOwner(address owner) public view returns (uint256) {
        return soulBoundIdentity.tokenOfOwnerByIndex(owner, 0);
    }

    function totalSupply() public view returns (uint256) {
        return soulBoundIdentity.totalSupply();
    }

    function nameExists(string memory name) public view returns (bool exists) {
        return soulBoundName.nameExists(name);
    }

    function getIdentityData(string memory name)
        external
        view
        returns (string memory sbtName, uint256 identityId)
    {
        return soulBoundName.getIdentityData(name);
    }

    function getIdentityNames(uint256 tokenId)
        external
        view
        returns (string[] memory sbtNames)
    {
        return soulBoundName.getIdentityNames(tokenId);
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
