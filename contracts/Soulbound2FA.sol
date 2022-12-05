// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound Two-factor authentication (2FA)
/// @author Masa Finance
/// @notice Soulbound token that represents a Two-factor authentication (2FA)
/// @dev Soulbound 2FA, that inherits from the SBT contract.
contract Soulbound2FA is MasaSBTSelfSovereign {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound Two-factor authentication (2FA)
    /// @dev Creates a new soulbound 2FA, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param _mintingPrice Price of minting in stable coin
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory baseTokenURI,
        ISoulboundIdentity soulboundIdentity,
        uint256 _mintingPrice,
        PaymentParams memory paymentParams
    )
        MasaSBTSelfSovereign(
            admin,
            "Masa 2FA",
            "M2F",
            baseTokenURI,
            soulboundIdentity,
            _mintingPrice,
            paymentParams
        )
        EIP712("Soulbound2FA", "1.0.0")
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The NFT ID of the newly minted SBT
    function mint(address paymentMethod, uint256 identityId)
        public
        virtual
        returns (uint256)
    {
        address to = soulboundIdentity.ownerOf(identityId);

        _pay(paymentMethod, mintingPrice);

        return _mintWithCounter(to);
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(address paymentMethod, address to)
        public
        virtual
        returns (uint256)
    {
        uint256 identityId = soulboundIdentity.tokenOfOwner(to);

        return mint(paymentMethod, identityId);
    }

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
