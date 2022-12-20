// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./libraries/Errors.sol";
import "./dex/PaymentGateway.sol";
import "./interfaces/ILinkableSBT.sol";
import "./interfaces/ISoulboundIdentity.sol";

/// @title Soul linker
/// @author Masa Finance
/// @notice Soul linker smart contract that let add links to a Soulbound token.
contract SoulLinker is PaymentGateway, EIP712, Pausable {
    /* ========== STATE VARIABLES =========================================== */

    ISoulboundIdentity public soulboundIdentity;

    uint256 public addPermissionPrice; // store permission price in stable coin
    uint256 public addPermissionPriceMASA; // store permission price in MASA

    // token => tokenId => readerIdentityId => signatureDate => PermissionData
    mapping(address => mapping(uint256 => mapping(uint256 => mapping(uint256 => PermissionData))))
        private _permissions;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256[])))
        private _permissionSignatureDates;

    struct PermissionData {
        uint256 ownerIdentityId;
        uint256 expirationDate;
        bool isRevoked;
    }

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soul linker
    /// @param owner Owner of the smart contract
    /// @param _soulboundIdentity Soulbound identity smart contract
    /// @param paymentParams Payment gateway params
    constructor(
        address owner,
        ISoulboundIdentity _soulboundIdentity,
        PaymentParams memory paymentParams
    ) EIP712("SoulLinker", "1.0.0") PaymentGateway(owner, paymentParams) {
        if (address(_soulboundIdentity) == address(0)) revert ZeroAddress();

        soulboundIdentity = _soulboundIdentity;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the SoulboundIdentity contract address linked to this soul name
    /// @dev The caller must be the owner to call this function
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyOwner
    {
        if (address(_soulboundIdentity) == address(0)) revert ZeroAddress();
        if (soulboundIdentity == _soulboundIdentity) revert SameValue();
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Sets the price of store permission in stable coin
    /// @dev The caller must have the owner to call this function
    /// @param _addPermissionPrice New price of the store permission in stable coin
    function setAddPermissionPrice(uint256 _addPermissionPrice)
        external
        onlyOwner
    {
        if (addPermissionPrice == _addPermissionPrice) revert SameValue();
        addPermissionPrice = _addPermissionPrice;
    }

    /// @notice Sets the price of store permission in MASA
    /// @dev The caller must have the owner to call this function
    /// @param _addPermissionPriceMASA New price of the store permission in MASA
    function setAddPermissionPriceMASA(uint256 _addPermissionPriceMASA)
        external
        onlyOwner
    {
        if (addPermissionPriceMASA == _addPermissionPriceMASA)
            revert SameValue();
        addPermissionPriceMASA = _addPermissionPriceMASA;
    }

    /// @notice Pauses the smart contract
    /// @dev The caller must have the owner to call this function
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpauses the smart contract
    /// @dev The caller must have the owner to call this function
    function unpause() public onlyOwner {
        _unpause();
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Stores the permission, validating the signature of the given read link request
    /// @dev The token must be linked to this soul linker
    /// @param readerIdentityId Id of the identity of the reader
    /// @param ownerIdentityId Id of the identity of the owner of the SBT
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param signatureDate Signature date of the signature
    /// @param expirationDate Expiration date of the signature
    /// @param signature Signature of the read link request made by the owner
    function addPermission(
        address paymentMethod,
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate,
        uint256 expirationDate,
        bytes calldata signature
    ) external payable whenNotPaused {
        address ownerAddress = soulboundIdentity.ownerOf(ownerIdentityId);
        address readerAddress = soulboundIdentity.ownerOf(readerIdentityId);
        address tokenOwner = IERC721Enumerable(token).ownerOf(tokenId);

        if (ownerAddress != tokenOwner)
            revert IdentityOwnerNotTokenOwner(tokenId, ownerIdentityId);
        if (readerAddress != _msgSender()) revert CallerNotOwner(_msgSender());
        if (expirationDate < block.timestamp)
            revert ValidPeriodExpired(expirationDate);
        if (
            !_verify(
                _hash(
                    readerIdentityId,
                    ownerIdentityId,
                    token,
                    tokenId,
                    signatureDate,
                    expirationDate
                ),
                signature,
                ownerAddress
            )
        ) revert InvalidSignature();

        _pay(paymentMethod, getPriceForAddPermission(paymentMethod));

        // token => tokenId => readerIdentityId => signatureDate => PermissionData
        _permissions[token][tokenId][readerIdentityId][
            signatureDate
        ] = PermissionData(ownerIdentityId, expirationDate, false);
        _permissionSignatureDates[token][tokenId][readerIdentityId].push(
            signatureDate
        );

        emit PermissionAdded(
            readerIdentityId,
            ownerIdentityId,
            token,
            tokenId,
            signatureDate,
            expirationDate
        );
    }

    /// @notice Revokes the permission
    /// @dev The token must be linked to this soul linker
    /// @param readerIdentityId Id of the identity of the reader
    /// @param ownerIdentityId Id of the identity of the owner of the SBT
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param signatureDate Signature date of the signature
    function revokePermission(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate
    ) external whenNotPaused {
        address ownerAddress = soulboundIdentity.ownerOf(ownerIdentityId);
        address tokenOwner = IERC721Enumerable(token).ownerOf(tokenId);

        if (ownerAddress != tokenOwner)
            revert IdentityOwnerNotTokenOwner(tokenId, ownerIdentityId);
        if (ownerAddress != _msgSender()) revert CallerNotOwner(_msgSender());
        if (
            _permissions[token][tokenId][readerIdentityId][signatureDate]
                .isRevoked
        ) revert PermissionAlreadyRevoked();

        // token => tokenId => readerIdentityId => signatureDate => PermissionData
        _permissions[token][tokenId][readerIdentityId][signatureDate]
            .isRevoked = true;

        emit PermissionRevoked(
            readerIdentityId,
            ownerIdentityId,
            token,
            tokenId,
            signatureDate
        );
    }

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

    /// @notice Returns the list of permission signature dates for a given SBT token and reader
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param readerIdentityId Id of the identity of the reader of the SBT
    /// @return List of linked SBTs
    function getPermissionSignatureDates(
        address token,
        uint256 tokenId,
        uint256 readerIdentityId
    ) public view returns (uint256[] memory) {
        return _permissionSignatureDates[token][tokenId][readerIdentityId];
    }

    /// @notice Returns the information of permission dates for a given SBT token and reader
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param readerIdentityId Id of the identity of the reader of the SBT
    /// @param signatureDate Signature date of the signature
    /// @return permissionData List of linked SBTs
    function getPermissionInfo(
        address token,
        uint256 tokenId,
        uint256 readerIdentityId,
        uint256 signatureDate
    ) public view returns (PermissionData memory) {
        return _permissions[token][tokenId][readerIdentityId][signatureDate];
    }

    /// @notice Validates the permission of the given read link request and returns the
    /// data that reader can read if the permission is valid
    /// @dev The token must be linked to this soul linker
    /// @param readerIdentityId Id of the identity of the reader
    /// @param ownerIdentityId Id of the identity of the owner of the SBT
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param signatureDate Signature date of the signature
    /// @return True if the permission is valid
    function validatePermission(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate
    ) external view returns (bool) {
        address identityReader = soulboundIdentity.ownerOf(readerIdentityId);
        address ownerAddress = soulboundIdentity.ownerOf(ownerIdentityId);
        address tokenOwner = IERC721Enumerable(token).ownerOf(tokenId);

        PermissionData memory permission = _permissions[token][tokenId][
            readerIdentityId
        ][signatureDate];

        if (ownerAddress != tokenOwner)
            revert IdentityOwnerNotTokenOwner(tokenId, ownerIdentityId);
        if (identityReader != _msgSender())
            revert CallerNotReader(_msgSender());
        if (permission.expirationDate == 0) revert PermissionDoesNotExist();
        if (permission.expirationDate < block.timestamp)
            revert ValidPeriodExpired(permission.expirationDate);
        if (permission.isRevoked) revert PermissionAlreadyRevoked();

        return true;
    }

    /// @notice Returns the price for storing a permission
    /// @dev Returns the current pricing for storing a permission
    /// @param paymentMethod Address of token that user want to pay
    /// @return Current price for storing a permission
    function getPriceForAddPermission(address paymentMethod)
        public
        view
        returns (uint256)
    {
        if (addPermissionPrice == 0 && addPermissionPriceMASA == 0) {
            return 0;
        } else if (
            paymentMethod == masaToken &&
            enabledPaymentMethod[paymentMethod] &&
            addPermissionPriceMASA > 0
        ) {
            // price in MASA without conversion rate
            return addPermissionPriceMASA;
        } else if (
            paymentMethod == stableCoin && enabledPaymentMethod[paymentMethod]
        ) {
            // stable coin
            return addPermissionPrice;
        } else if (enabledPaymentMethod[paymentMethod]) {
            // ETH and ERC 20 token
            return _convertFromStableCoin(paymentMethod, addPermissionPrice);
        } else {
            revert InvalidPaymentMethod(paymentMethod);
        }
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _hash(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate,
        uint256 expirationDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Link(uint256 readerIdentityId,uint256 ownerIdentityId,address token,uint256 tokenId,uint256 signatureDate,uint256 expirationDate)"
                        ),
                        readerIdentityId,
                        ownerIdentityId,
                        token,
                        tokenId,
                        signatureDate,
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

    event PermissionAdded(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate,
        uint256 expirationDate
    );

    event PermissionRevoked(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate
    );
}
