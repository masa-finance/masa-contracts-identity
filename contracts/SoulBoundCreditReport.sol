// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/SBT.sol";

contract SoulBoundCreditReport is SBT {
    constructor(
        address owner,
        address soulLinker,
        string memory baseTokenURI
    ) SBT(owner, soulLinker, "Masa Credit Report", "MCR", baseTokenURI) {}
}
