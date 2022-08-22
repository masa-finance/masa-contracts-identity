// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ISoulLinker.sol";

abstract contract SoulBoundToken is ERC721PresetMinterPauserAutoId, Ownable {
    using Strings for uint256;

    ISoulLinker public soulLinker;

    constructor(
        address owner,
        address _soulLinker,
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721PresetMinterPauserAutoId(name, symbol, baseTokenURI) Ownable() {
        _setupRole(MINTER_ROLE, owner);
        Ownable.transferOwnership(owner);

        soulLinker = ISoulLinker(_soulLinker);
    }

    function transferFrom(
        address, /*from*/
        address, /*to*/
        uint256 /*tokenId*/
    ) public pure override {
        revert("Transferring soulbound Tokens is not permitted!");
    }

    function safeTransferFrom(
        address, /*from*/
        address, /*to*/
        uint256 /*tokenId*/
    ) public pure override {
        revert("Transferring soulbound Tokens is not permitted!");
    }

    function safeTransferFrom(
        address, /*from*/
        address, /*to*/
        uint256, /*tokenId*/
        bytes memory /*data*/
    ) public pure override {
        revert("Transferring soulbound Tokens is not permitted!");
    }

    function burn(uint256 tokenId) public override {
        require(
            !soulLinker.hasLinks(address(this), tokenId),
            "A Soulbound Token can't be burned as long as it has active links!"
        );
        super.burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
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
}
