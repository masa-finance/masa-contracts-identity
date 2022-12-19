// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../tokens/SBT/ISBT.sol";

interface ISoulboundIdentity is ISBT {
    function mintPrice() external returns (uint256);

    function mintPriceMASA() external returns (uint256);

    function addPermissionPrice() external returns (uint256);

    function addPermissionPriceMASA() external returns (uint256);

    function readDataPrice() external returns (uint256);

    function readDataPriceMASA() external returns (uint256);
}
