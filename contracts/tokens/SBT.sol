// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./NFT.sol";
import "../interfaces/ISoulLinker.sol";
import "../SoulLinker.sol";

abstract contract SBT is NFT {
    SoulLinker public soulLinker;

    constructor(
        address owner,
        SoulLinker _soulLinker,
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) NFT(owner, name, symbol, baseTokenURI) {
        soulLinker = _soulLinker;
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

    function mint(address to) public virtual returns (uint256) {
        return _mintWithCounter(to);
    }
}
