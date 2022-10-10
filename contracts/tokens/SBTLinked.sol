// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./SBT.sol";

/// @title SBT linked child
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable. Child of a soulbound token Identity.
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract SBTLinked is SBT {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound token child
    /// @dev Creates a new soulbound token child
    /// @param admin Administrator of the smart contract
    /// @param _soulLinker Address of the SoulLinker contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    constructor(
        address admin,
        ISoulLinker _soulLinker,
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) SBT(admin, _soulLinker, name, symbol, baseTokenURI) {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _beforeTokenTransfer(
        address from,
        address,
        uint256 tokenId
    ) internal virtual override {
        if (from != address(0)) {
            // if its not newly minted, remove the soul links
            soulLinker.removeLink(address(this), tokenId);
        }
    }

    function _afterTokenTransfer(
        address,
        address,
        uint256 tokenId
    ) internal virtual override {
        soulLinker.createLink(address(this), tokenId, 0);
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
