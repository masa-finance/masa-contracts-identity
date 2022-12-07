// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MASA is ERC20 {
    constructor() ERC20("$MASA", "$MASA") {
        _mint(msg.sender, 1000000e18);
    }

    function mint() external {
        _mint(msg.sender, 1000000e18);
    }
}
