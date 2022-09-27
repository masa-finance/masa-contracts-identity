// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../interfaces/ISoulLinker.sol";
import "./NFT.sol";

/// @title SBT
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract SBT is NFT {
    /* ========== STATE VARIABLES =========================================== */

    ISoulLinker public soulLinker;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound token
    /// @dev Creates a new soulbound token
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
    ) NFT(admin, name, symbol, baseTokenURI) {
        soulLinker = _soulLinker;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
    ///  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
    ///  THEY MAY BE PERMANENTLY LOST
    /// @dev This will raise an exception because the token is not transferable.
    function transferFrom(
        address,
        address,
        uint256
    ) public pure override {
        // Transferring soulbound Tokens is not permitted!
        revert("SBT_TRANSFER_NOT_PERMITTED");
    }

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev This will raise an exception because the token is not transferable.
    function safeTransferFrom(
        address,
        address,
        uint256
    ) public pure override {
        // Transferring soulbound Tokens is not permitted!
        revert("SBT_TRANSFER_NOT_PERMITTED");
    }

    /// @notice Transfer ownership of the token to another address safely
    /// @dev This will raise an exception because the token is not transferable.
    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        // Transferring soulbound Tokens is not permitted!
        revert("SBT_TRANSFER_NOT_PERMITTED");
    }

    /// @notice Burns the token
    /// @dev The caller must own `tokenId` or be an approved operator
    /// @param tokenId The NFT ID to burn
    function burn(uint256 tokenId) public override {
        // A Soulbound Token can't be burned as long as it has active links!
        require(
            !soulLinker.hasLinks(address(this), tokenId),
            "SBT_WITH_LINKS_NOT_BURNABLE"
        );
        super.burn(tokenId);
    }

    /// @notice Mints a new NFT
    /// @dev The caller must have the MINTER role
    /// @param to The address to mint the NFT to
    /// @return The NFT ID of the newly minted NFT
    function mint(address to) public virtual returns (uint256) {
        return _mintWithCounter(to);
    }

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
