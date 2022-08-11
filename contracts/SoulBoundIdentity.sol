// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./SoulBoundToken.sol";

contract SoulBoundIdentity is SoulBoundToken {
    constructor(
        address owner,
        address soulLinker,
        string memory baseTokenURI
    ) SoulBoundToken(owner, soulLinker, "Masa Identity", "MID", baseTokenURI) {}

    function mint(address to) public override {
        require(balanceOf(to) < 1, "Soulbound identity already created!");

        super.mint(to);
    }
}
