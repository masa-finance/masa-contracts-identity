// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../interfaces/dex/IUniswapRouter.sol";

/// @title Decentralized automated market maker (AMM)
/// @author Masa Finance
/// @notice Smart contract to call a Dex AMM smart contract
/// @dev This smart contract will call the Uniswap Router interface, based on
/// https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router01.sol
abstract contract DexAMM {
    /* ========== STATE VARIABLES =========================================== */

    address public swapRouter;
    address public wrappedNativeToken;
    uint256 public constant DEADLINE =
        0xf000000000000000000000000000000000000000000000000000000000000000;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Dex AMM
    /// @dev Creates a new Decentralized automated market maker (AMM) smart contract,
    // that will call the Uniswap Router interface
    /// @param _swapRouter Swap router address
    /// @param _wrappedNativeToken Wrapped native token address
    constructor(address _swapRouter, address _wrappedNativeToken) {
        require(_swapRouter != address(0), "ZERO_ADDRESS");
        require(_wrappedNativeToken != address(0), "ZERO_ADDRESS");

        swapRouter = _swapRouter;
        wrappedNativeToken = _wrappedNativeToken;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    function estimateSwapAmount(
        address _fromToken,
        address _toToken,
        uint256 _amountOut
    ) public view returns (uint256) {
        uint256[] memory amounts;
        address[] memory path;
        path = _getPathFromTokenToToken(_fromToken, _toToken);
        amounts = IUniswapRouter(swapRouter).getAmountsIn(_amountOut, path);
        return amounts[0];
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _getPathFromTokenToToken(address fromToken, address toToken)
        internal
        view
        returns (address[] memory)
    {
        if (fromToken == wrappedNativeToken || toToken == wrappedNativeToken) {
            address[] memory path = new address[](2);
            path[0] = fromToken == wrappedNativeToken
                ? wrappedNativeToken
                : fromToken;
            path[1] = toToken == wrappedNativeToken
                ? wrappedNativeToken
                : toToken;
            return path;
        } else {
            address[] memory path = new address[](3);
            path[0] = fromToken;
            path[1] = wrappedNativeToken;
            path[2] = toToken;
            return path;
        }
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
