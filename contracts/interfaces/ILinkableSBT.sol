// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../tokens/SBT/ISBT.sol";

interface ILinkableSBT is ISBT {
    function addLinkPrice() external view returns (uint256);

    function addLinkPriceMASA() external view returns (uint256);

    function readDataPrice() external view returns (uint256);

    function readDataPriceMASA() external view returns (uint256);
}
