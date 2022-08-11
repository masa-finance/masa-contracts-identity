// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./SoulBoundToken.sol";

contract SoulBoundCreditReport is SoulBoundToken {
    constructor(
        address owner,
        address soulLinker,
        string memory baseTokenURI
    )
        SoulBoundToken(
            owner,
            soulLinker,
            "Masa Credit Report",
            "MCR",
            baseTokenURI
        )
    {}
}
