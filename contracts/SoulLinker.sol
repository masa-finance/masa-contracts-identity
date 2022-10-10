// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulLinker.sol";

/// @title Soul linker
/// @author Masa Finance
/// @notice Soul linker smart contract that let add links to a Soulbound token.
contract SoulLinker is AccessControl, EIP712, ISoulLinker {
    /* ========== STATE VARIABLES =========================================== */

    ISoulboundIdentity public soulboundIdentity;

    // NFT/SBT address => tokenId = Identity.tokenId
    mapping(address => mapping(uint256 => LinkToSoul)) private linksToSoul;

    // Identity.tokenId => NFT/SBT address => tokenId
    mapping(uint256 => mapping(address => uint256[])) private soulLinks;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soul linker
    /// @param admin Administrator of the smart contract
    constructor(address admin) EIP712("SoulLinker", "1.0.0") {
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

    function createLink(
        address token,
        uint256 tokenId,
        uint256 expirationDate
    ) external override {
        uint256 identityId = _getIdentityId(token, tokenId);

        require(
            _isIdentityApprovedOrOwner(_msgSender(), identityId),
            "CALLER_NOT_IDENTITY_OWNER"
        );

        require(!linksToSoul[token][tokenId].exists, "LINK_EXISTS");
        linksToSoul[token][tokenId] = LinkToSoul(
            true,
            identityId,
            expirationDate
        );
        soulLinks[identityId][token].push(tokenId);
    }

    function removeLink(address token, uint256 tokenId) external override {
        uint256 identityId = _getIdentityId(token, tokenId);

        require(
            _isIdentityApprovedOrOwner(_msgSender(), identityId),
            "CALLER_NOT_IDENTITY_OWNER"
        );

        require(linksToSoul[token][tokenId].exists, "LINK_NOT_EXISTS");
        linksToSoul[token][tokenId].exists = false;
        _removeSoulLink(identityId, token, tokenId);
    }

    /* ========== VIEWS ===================================================== */

    /// @notice Query if the contract has links for the given token id
    /// @param token Address of the token linked to the soul
    /// @param tokenId Id of the token linked to the soul
    /// @return `true` if the contract has links, `false` otherwise
    function hasLinks(address token, uint256 tokenId)
        external
        view
        override
        returns (bool)
    {
        return linksToSoul[token][tokenId].exists;
    }

    function getLinkData(
        address reader,
        uint256 identityId,
        address token,
        uint256 tokenId,
        uint256 expirationDate,
        bytes calldata signature
    ) external view returns (string memory) {
        require(linksToSoul[token][tokenId].exists, "LINK_NOT_EXISTS");
        address owner = IERC721(soulboundIdentity).ownerOf(identityId);

        require(reader == _msgSender(), "CALLER_NOT_READER");
        require(expirationDate <= block.timestamp, "VALID_PERIOD_EXPIRED");
        require(
            _verify(
                _hash(reader, identityId, token, tokenId, expirationDate),
                signature,
                owner
            ),
            "INVALID_SIGNATURE"
        );

        return "data";
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _getIdentityId(address token, uint256 tokenId)
        internal
        view
        returns (uint256)
    {
        address owner = IERC721(token).ownerOf(tokenId);
        return soulboundIdentity.tokenOfOwner(owner);
    }

    function _isIdentityApprovedOrOwner(address caller, uint256 identityId)
        internal
        view
        virtual
        returns (bool)
    {
        // TODO: check if the caller is the owner or approved
        /* address owner = IERC721(soulboundIdentity).ownerOf(identityId);
        return (caller == owner ||
            IERC721(soulboundIdentity).isApprovedForAll(owner, caller) ||
            IERC721(soulboundIdentity).getApproved(identityId) == caller); */
        return true;
    }

    function _removeSoulLink(
        uint256 identityId,
        address token,
        uint256 tokenId
    ) internal {
        for (uint256 i = 0; i < soulLinks[identityId][token].length; i++) {
            if (soulLinks[identityId][token][i] == tokenId) {
                soulLinks[identityId][token][i] = soulLinks[identityId][token][
                    soulLinks[identityId][token].length - 1
                ];
                soulLinks[identityId][token].pop();
                break;
            }
        }
    }

    function _hash(
        address reader,
        uint256 identityId,
        address token,
        uint256 tokenId,
        uint256 expirationDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Link(address reader,uint256 identityId,address token,uint256 tokenId,uint256 expirationDate)"
                        ),
                        reader,
                        identityId,
                        token,
                        tokenId,
                        expirationDate
                    )
                )
            );
    }

    function _verify(
        bytes32 digest,
        bytes memory signature,
        address owner
    ) internal pure returns (bool) {
        return ECDSA.recover(digest, signature) == owner;
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
