// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./SoulBoundToken.sol";

contract SoulBoundCreditReport is SoulBoundToken {
    constructor(address owner)
        SoulBoundToken(
            owner,
            "Masa Credit Report",
            "MCR",
            "https://api.masa.finance/v1.0/credit-report/{id}.json"
        )
    {}
}
