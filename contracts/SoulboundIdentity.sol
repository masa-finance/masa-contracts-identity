// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/SBT.sol";
import "./SoulLinker.sol";
import "./SoulName.sol";

contract SoulboundIdentity is SBT {
    /* ========== STATE VARIABLES =========================================== */

    SoulName public soulNameContract;

    /* ========== INITIALIZE ================================================ */

    constructor(
        address owner,
        SoulLinker _soulLinker,
        string memory baseTokenURI
    ) SBT(owner, _soulLinker, "Masa Identity", "MID", baseTokenURI) {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    function setSoulNameContract(SoulName _soulName)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(address(_soulName) != address(0), "ZERO_ADDRESS");
        require(soulNameContract != _soulName, "SAME_VALUE");
        soulNameContract = _soulName;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    function mint(address to) public override returns (uint256) {
        require(balanceOf(to) < 1, "Soulbound identity already created!");

        return super.mint(to);
    }

    function mintIdentityWithName(address to, string memory name)
        public
        payable
        soulNameAlreadySet
        returns (uint256)
    {
        uint256 identityId = mint(to);
        uint256 nameId = soulNameContract.mint(to, name, identityId);

        return identityId;
    }

    /* ========== VIEWS ===================================================== */

    function ownerOf(uint256 tokenId) public view override returns (address) {
        return super.ownerOf(tokenId);
    }

    function ownerOf(string memory name)
        public
        view
        soulNameAlreadySet
        returns (address)
    {
        (, uint256 tokenId) = soulNameContract.getIdentityData(name);
        return super.ownerOf(tokenId);
    }

    function tokenURI(string memory name)
        public
        view
        soulNameAlreadySet
        returns (string memory)
    {
        (, uint256 tokenId) = soulNameContract.getIdentityData(name);
        return super.tokenURI(tokenId);
    }

    function tokenURI(address owner) public view returns (string memory) {
        uint256 tokenId = tokenOfOwner(owner);
        return super.tokenURI(tokenId);
    }

    function tokenOfOwner(address owner) public view returns (uint256) {
        return super.tokenOfOwnerByIndex(owner, 0);
    }

    function nameExists(string memory name)
        public
        view
        soulNameAlreadySet
        returns (bool exists)
    {
        return soulNameContract.nameExists(name);
    }

    function getIdentityData(string memory name)
        external
        view
        soulNameAlreadySet
        returns (string memory sbtName, uint256 identityId)
    {
        return soulNameContract.getIdentityData(name);
    }

    function getIdentityNames(address owner)
        external
        view
        soulNameAlreadySet
        returns (string[] memory sbtNames)
    {
        uint256 tokenId = tokenOfOwner(owner);
        return soulNameContract.getIdentityNames(tokenId);
    }

    function getIdentityNames(uint256 tokenId)
        external
        view
        soulNameAlreadySet
        returns (string[] memory sbtNames)
    {
        return soulNameContract.getIdentityNames(tokenId);
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    modifier soulNameAlreadySet() {
        require(
            address(soulNameContract) != address(0),
            "SOULNAME_CONTRACT_NOT_SET"
        );
        _;
    }

    /* ========== EVENTS ==================================================== */
}
