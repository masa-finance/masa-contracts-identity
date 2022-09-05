// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../interfaces/dex/IUniswapRouter.sol";

/// @title Decentralized automated market maker (AMM)
/// @author Masa Finance
/// @notice Smart contract to call a Dex AMM smart contract
/// @dev This smart contract will call the Uniswap Router interface, based on
/// https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router01.sol
abstract contract DexAMM {
    address public swapRouter;
    address public wrappedNativeToken;
    uint256 public constant DEADLINE =
        0xf000000000000000000000000000000000000000000000000000000000000000;

    /* ========== STATE VARIABLES =========================================== */
    /* ========== INITIALIZE ================================================ */
    /* ========== RESTRICTED FUNCTIONS ====================================== */
    /* ========== MUTATIVE FUNCTIONS ======================================== */
    /* ========== VIEWS ===================================================== */
    /* ========== PRIVATE FUNCTIONS ========================================= */
    /* ========== MODIFIERS ================================================= */
    /* ========== EVENTS ==================================================== */
}
