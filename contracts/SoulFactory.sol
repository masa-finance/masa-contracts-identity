// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

/// @title Soul Factory
/// @author Masa Finance
/// @notice Soul Factory, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or CORN
contract SoulFactory {
    /* ========== STATE VARIABLES ========== */

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Factory
    /// @dev Creates a new Soul Factory, that has the role to minting new Soulbound Identities
    /// and Soul Name NFTs, paying a fee
    /// @param owner Owner of the smart contract
    constructor(
        address owner
    ) {
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /* ========== MUTATIVE FUNCTIONS ========== */

    /* ========== VIEWS ========== */

    /* ========== PRIVATE FUNCTIONS ========== */

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
