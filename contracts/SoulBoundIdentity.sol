// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./SoulBoundToken.sol";

contract SoulBoundIdentity is SoulBoundToken {
    constructor(address owner, address soulLinker)
        SoulBoundToken(
            owner,
            soulLinker,
            "Masa Identity",
            "MID",
            "https://api.masa.finance/v1.0/identity/{id}.json"
        )
    {}

    function mint(address to) public override {
        require(balanceOf(to) < 1, "Soulbound identity already created!");

        super.mint(to);
    }
}
