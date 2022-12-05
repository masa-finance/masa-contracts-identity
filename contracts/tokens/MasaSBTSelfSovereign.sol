// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../interfaces/ISoulboundIdentity.sol";
import "./MasaSBTLinkedPayable.sol";

/// @title MasaSBTSelfSovereign
/// @author Masa Finance
/// @notice Soulbound token. Non-fungible token that is not transferable.
/// Adds a link to a SoulboundIdentity SC to let minting using the identityId
/// Adds a payment gateway to let minting paying a fee
/// Adds a self-sovereign protocol to let minting using an authority signature
/// @dev Implementation of https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763 Soulbound token.
abstract contract MasaSBTSelfSovereign is MasaSBTLinkedPayable {
    /* ========== STATE VARIABLES =========================================== */

    mapping(address => bool) public authorities;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound token
    /// @dev Creates a new soulbound token
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    /// @param _mintingPrice Price of minting in stable coin
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        ISoulboundIdentity _soulboundIdentity,
        uint256 _mintingPrice,
        PaymentParams memory paymentParams
    )
        MasaSBTLinkedPayable(
            admin,
            name,
            symbol,
            baseTokenURI,
            _soulboundIdentity,
            _mintingPrice,
            paymentParams
        )
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Adds a new authority to the list of authorities
    /// @dev The caller must have the admin to call this function
    /// @param _authority New authority to add
    function addAuthority(address _authority)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_authority != address(0), "ZERO_ADDRESS");
        require(!authorities[_authority], "ALREADY_ADDED");

        authorities[_authority] = true;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
