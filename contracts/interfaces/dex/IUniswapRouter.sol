// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

/// @title Uniswap Router interface
/// @author Masa Finance
/// @notice Interface of the Uniswap Router contract
/// @dev This interface is used to interact with the Uniswap Router contract,
/// and gets the most important functions of the contract. It's based on
/// https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router01.sol
interface IUniswapRouter {
    function getAmountsIn(uint256 amountOut, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}
