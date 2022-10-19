// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./interfaces/ISoulboundIdentity.sol";

/// @title Soul linker
/// @author Masa Finance
/// @notice Soul linker smart contract that let add links to a Soulbound token.
contract SoulLinker is AccessControl, EIP712 {
    /* ========== STATE VARIABLES =========================================== */

    ISoulboundIdentity public soulboundIdentity;

    // linked SBTs
    mapping(address => bool) public linkedSBT;
    address[] public linkedSBTs;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soul linker
    /// @param admin Administrator of the smart contract
    constructor(address admin, ISoulboundIdentity _soulboundIdentity)
        EIP712("SoulLinker", "1.0.0")
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);

        soulboundIdentity = _soulboundIdentity;
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

    /// @notice Adds an SBT to the list of linked SBTs
    /// @dev The caller must have the admin role to call this function
    /// @param token Address of the SBT contract
    function addLinkedSBT(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(token) != address(0), "ZERO_ADDRESS");
        require(!linkedSBT[token], "SBT_ALREADY_LINKED");

        linkedSBT[token] = true;
        linkedSBTs.push(token);
    }

    /// @notice Removes an SBT from the list of linked SBTs
    /// @dev The caller must have the admin role to call this function
    /// @param token Address of the SBT contract
    function removeLinkedSBT(address token)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(linkedSBT[token], "SBT_NOT_LINKED");

        linkedSBT[token] = false;
        _removeLinkedSBT(token);
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /// @notice Returns the identityId owned by the given token
    /// @dev The token must be linked to this soul linker
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @return Id of the identity
    function getIdentityId(address token, uint256 tokenId)
        external
        view
        returns (uint256)
    {
        address owner = IERC721Enumerable(token).ownerOf(tokenId);
        return soulboundIdentity.tokenOfOwner(owner);
    }

    /// @notice Returns the list of linked SBTs by a given SBT token
    /// @dev The token must be linked to this soul linker
    /// @param identityId Id of the identity
    /// @param token Address of the SBT contract
    /// @return List of linked SBTs
    function getSBTLinks(uint256 identityId, address token)
        external
        view
        returns (uint256[] memory)
    {
        require(linkedSBT[token], "SBT_NOT_LINKED");
        address owner = soulboundIdentity.ownerOf(identityId);

        return getSBTLinks(owner, token);
    }

    /// @notice Returns the list of linked SBTs by a given SBT token
    /// @dev The token must be linked to this soul linker
    /// @param owner Address of the owner of the identity
    /// @param token Address of the SBT contract
    /// @return List of linked SBTs
    function getSBTLinks(address owner, address token)
        public
        view
        returns (uint256[] memory)
    {
        require(linkedSBT[token], "SBT_NOT_LINKED");

        uint256 links = IERC721Enumerable(token).balanceOf(owner);
        uint256[] memory sbtLinks = new uint256[](links);
        for (uint256 i = 0; i < links; i++) {
            sbtLinks[i] = IERC721Enumerable(token).tokenOfOwnerByIndex(
                owner,
                i
            );
        }

        return sbtLinks;
    }

    /// @notice Validates the signature of the given read link request
    /// @dev The token must be linked to this soul linker
    /// @param reader Address of the reader
    /// @param identityId Id of the identity
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param expirationDate Expiration date of the signature
    /// @param signature Signature of the read link request made by the owner
    /// @return `true` if the signature is valid, `false` otherwise
    function validateLinkData(
        address reader,
        uint256 identityId,
        address token,
        uint256 tokenId,
        uint256 expirationDate,
        bytes calldata signature
    ) external view returns (bool) {
        require(linkedSBT[token], "SBT_NOT_LINKED");

        address identityOwner = soulboundIdentity.ownerOf(identityId);
        address tokenOwner = IERC721Enumerable(token).ownerOf(tokenId);

        require(identityOwner == tokenOwner, "IDENTITY_OWNER_NOT_TOKEN_OWNER");
        require(reader == _msgSender(), "CALLER_NOT_READER");
        require(expirationDate >= block.timestamp, "VALID_PERIOD_EXPIRED");
        require(
            _verify(
                _hash(reader, identityId, token, tokenId, expirationDate),
                signature,
                identityOwner
            ),
            "INVALID_SIGNATURE"
        );

        return true;
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _removeLinkedSBT(address token) internal {
        for (uint256 i = 0; i < linkedSBTs.length; i++) {
            if (linkedSBTs[i] == token) {
                linkedSBTs[i] = linkedSBTs[linkedSBTs.length - 1];
                linkedSBTs.pop();
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
