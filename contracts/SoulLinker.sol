// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulLinker.sol";

/// @title Soul linker
/// @author Masa Finance
/// @notice Soul linker smart contract that let add links to a Soulbound token.
contract SoulLinker is AccessControl, ISoulLinker {
    /* ========== STATE VARIABLES =========================================== */

    ISoulboundIdentity public soulboundIdentity;

    // Identity.tokenId => NFT/SBT address => tokenId
    mapping(uint256 => mapping(address => uint256)) public soulLinks;

    // NFT/SBT address => Identity.tokenId => tokenId
    mapping(address => mapping(uint256 => uint256)) public linksToSoul;

    mapping(uint256 => Link) private links;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soul linker
    /// @param admin Administrator of the smart contract
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the SoulboundIdentity contract address linked to this soul name
    /// @dev The caller must have the admin role to call this function
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulboundIdentity != _soulboundIdentity, "SAME_VALUE");
        soulboundIdentity = _soulboundIdentity;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /// @notice Query if the contract has links for the given token id
    /// @return `true` if the contract has links, `false` otherwise
    function hasLinks(address, uint256) external pure override returns (bool) {
        return false;
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
