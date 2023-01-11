// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./libraries/Errors.sol";
import "./tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound Two-factor authentication (2FA)
/// @author Masa Finance
/// @notice Soulbound token that represents a Two-factor authentication (2FA)
/// @dev Soulbound 2FA, that inherits from the SBT contract.
contract Soulbound2FA is MasaSBTSelfSovereign, ReentrancyGuard {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound Two-factor authentication (2FA)
    /// @dev Creates a new soulbound 2FA, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory baseTokenURI,
        ISoulboundIdentity soulboundIdentity,
        PaymentParams memory paymentParams
    )
        MasaSBTSelfSovereign(
            admin,
            "Masa 2FA",
            "M2F",
            baseTokenURI,
            soulboundIdentity,
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
    function mint(
        address paymentMethod,
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) public payable virtual nonReentrant returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);
        if (to != _msgSender()) revert CallerNotOwner(_msgSender());

        _verify(
            _hash(identityId, authorityAddress, signatureDate),
            signature,
            authorityAddress
        );

        _pay(paymentMethod, getMintPrice(paymentMethod));

        uint256 tokenId = _mintWithCounter(to);

        emit Soulbound2FAMinted(
            tokenId,
            identityId,
            authorityAddress,
            signatureDate,
            paymentMethod,
            mintPrice
        );

        return tokenId;
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        address to,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) external payable virtual returns (uint256) {
        uint256 identityId = soulboundIdentity.tokenOfOwner(to);

        return
            mint(
                paymentMethod,
                identityId,
                authorityAddress,
                signatureDate,
                signature
            );
    }

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _hash(
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Mint2FA(uint256 identityId,address authorityAddress,uint256 signatureDate)"
                        ),
                        identityId,
                        authorityAddress,
                        signatureDate
                    )
                )
            );
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */

    event Soulbound2FAMinted(
        uint256 tokenId,
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate,
        address paymentMethod,
        uint256 mintPrice
    );
}
