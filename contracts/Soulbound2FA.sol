// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/MasaSBTLinked.sol";

/// @title Soulbound Two-factor authentication (2FA)
/// @author Masa Finance
/// @notice Soulbound token that represents a Two-factor authentication (2FA)
/// @dev Soulbound 2FA, that inherits from the SBT contract.
contract Soulbound2FA is MasaSBTLinked {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound Two-factor authentication (2FA)
    /// @dev Creates a new soulbound 2FA, inheriting from the SBT contract.
    /// @param owner Owner of the smart contract
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    constructor(
        address owner,
        string memory baseTokenURI,
        ISoulboundIdentity soulboundIdentity
    )
        MasaSBTLinked(owner, "Masa 2FA", "M2F", baseTokenURI, soulboundIdentity)
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The NFT ID of the newly minted SBT
    function mint(uint256 identityId) public virtual returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);

        return _mintWithCounter(to);
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(address to) public virtual returns (uint256) {
        uint256 identityId = soulboundIdentity.tokenOfOwner(to);

        return mint(identityId);
    }

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
