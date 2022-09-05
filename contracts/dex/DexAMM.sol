// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../interfaces/dex/IUniswapRouter.sol";

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
