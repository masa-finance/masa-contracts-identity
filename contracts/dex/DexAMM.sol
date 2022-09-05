// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../interfaces/dex/IUniswapRouter.sol";

/// @title Decentralized automated market maker (AMM)
/// @author Masa Finance
/// @notice Smart contract to call a Dex AMM smart contract
/// @dev This smart contract will call the Uniswap Router interface, based on
/// https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router01.sol
abstract contract DexAMM is AccessControl {
    /* ========== STATE VARIABLES =========================================== */

    address public swapRouter;
    address public wrappedNativeToken;
    uint256 public constant DEADLINE =
        0xf000000000000000000000000000000000000000000000000000000000000000;

    /* ========== INITIALIZE ================================================ */

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the swap router address
    /// @dev The caller must have the admin role to call this function
    /// @param _swapRouter New swap router address
    function setSwapRouter(address _swapRouter)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_swapRouter != address(0), "ZERO_ADDRESS");
        require(swapRouter != _swapRouter, "SAME_VALUE");
        swapRouter = _swapRouter;
    }

    /// @notice Sets the wrapped native token address
    /// @dev The caller must have the admin role to call this function
    /// @param _wrappedNativeToken New wrapped native token address
    function setWrappedNativeToken(address _wrappedNativeToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_wrappedNativeToken != address(0), "ZERO_ADDRESS");
        require(wrappedNativeToken != _wrappedNativeToken, "SAME_VALUE");
        wrappedNativeToken = _wrappedNativeToken;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
