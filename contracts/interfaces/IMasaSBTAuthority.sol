// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "../tokens/SBT/ISBT.sol";

interface IMasaSBTAuthority is ISBT {
    function mint(address to) external payable returns (uint256);

    function mint(
        address paymentMethod,
        address to
    ) external payable returns (uint256);
}
