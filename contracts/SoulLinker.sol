// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/ISoulLinker.sol";

/// @title Soul linker
/// @author Masa Finance
/// @notice Soul linker smart contract that let add links to a Soulbound token.
contract SoulLinker is Ownable, ISoulLinker {
    /* ========== STATE VARIABLES =========================================== */

    mapping(uint256 => Link) private links;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soul linker
    /// @param owner Owner of the smart contract
    constructor(address owner) Ownable() {
        Ownable.transferOwnership(owner);
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /// @notice Query if the contract has links for the given token id
    /// @param token Address of the token
    /// @param tokenId Id of the token
    /// @return `true` if the contract has links, `false` otherwise
    function hasLinks(address token, uint256 tokenId)
        external
        view
        override
        returns (bool)
    {
        return false;
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
