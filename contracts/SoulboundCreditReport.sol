// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/SBT.sol";

contract SoulboundCreditReport is SBT {
    constructor(
        address owner,
        SoulLinker _soulLinker,
        string memory baseTokenURI
    ) SBT(owner, _soulLinker, "Masa Credit Report", "MCR", baseTokenURI) {}
}
