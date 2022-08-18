// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/SBT.sol";

contract SoulBoundIdentity is SBT {
    constructor(
        address owner,
        address soulLinker,
        string memory baseTokenURI
    ) SBT(owner, soulLinker, "Masa Identity", "MID", baseTokenURI) {}

    function mint(address to) public override returns (uint256) {
        require(balanceOf(to) < 1, "Soulbound identity already created!");

        return super.mint(to);
    }
}
