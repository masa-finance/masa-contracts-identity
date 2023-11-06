// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./libraries/Errors.sol";
import "./dex/PaymentGateway.sol";
import "./interfaces/ILinkableSBT.sol";
import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulName.sol";
import "./tokens/SBT/extensions/ISBTEnumerable.sol";

/// @title Soul linker
/// @author Masa Finance
/// @notice Soul linker smart contract that let add links to a Soulbound token.
contract SoulLinker is PaymentGateway, EIP712, Pausable, ReentrancyGuard {
    /* ========== STATE VARIABLES =========================================== */

    ISoulboundIdentity public soulboundIdentity;
    ISoulName[] public soulNames;
    mapping(address => bool) public isSoulName;

    // token => tokenId => readerIdentityId => signatureDate => LinkData
    mapping(address => mapping(uint256 => mapping(uint256 => mapping(uint256 => LinkData))))
        private _links;
    // token => tokenId => readerIdentityId
    mapping(address => mapping(uint256 => uint256[]))
        private _linkReaderIdentityIds;
    // token => tokenId => readerIdentityId => signatureDate
    mapping(address => mapping(uint256 => mapping(uint256 => uint256[])))
        private _linkSignatureDates;
    // readerIdentityId => ReaderLink
    mapping(uint256 => ReaderLink[]) private _readerLinks;

    struct LinkData {
        bool exists;
        uint256 ownerIdentityId;
        uint256 expirationDate;
        bool isRevoked;
    }

    struct ReaderLink {
        address token;
        uint256 tokenId;
        uint256 signatureDate;
    }

    struct LinkKey {
        uint256 readerIdentityId;
        uint256 signatureDate;
    }

    struct DefaultSoulName {
        bool exists;
        address token;
        uint256 tokenId;
    }

    mapping(address => DefaultSoulName) public defaultSoulName; // stores the token id of the default soul name

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soul linker
    /// @param admin Administrator of the smart contract
    /// @param _soulboundIdentity Soulbound identity smart contract
    /// @param _soulNames Soul name smart contracts
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        ISoulboundIdentity _soulboundIdentity,
        ISoulName[] memory _soulNames,
        PaymentParams memory paymentParams
    ) EIP712("SoulLinker", "1.0.0") PaymentGateway(admin, paymentParams) {
        if (address(_soulboundIdentity) == address(0)) revert ZeroAddress();

        soulboundIdentity = _soulboundIdentity;
        soulNames = _soulNames;
        for (uint256 i = 0; i < _soulNames.length; i++) {
            isSoulName[address(_soulNames[i])] = true;
        }
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the SoulboundIdentity contract address linked to this soul store
    /// @dev The caller must have the admin role to call this function
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    function setSoulboundIdentity(
        ISoulboundIdentity _soulboundIdentity
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(_soulboundIdentity) == address(0)) revert ZeroAddress();
        if (soulboundIdentity == _soulboundIdentity) revert SameValue();
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Add a SoulName contract address linked to this soul store
    /// @dev The caller must have the admin role to call this function
    /// @param soulName Address of the SoulName contract
    function addSoulName(
        ISoulName soulName
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(soulName) == address(0)) revert ZeroAddress();
        for (uint256 i = 0; i < soulNames.length; i++) {
            if (soulNames[i] == soulName) revert SameValue();
        }
        soulNames.push(soulName);
        isSoulName[address(soulName)] = true;
    }

    /// @notice Remove a SoulName contract address linked to this soul store
    /// @dev The caller must have the admin role to call this function
    /// @param soulName Address of the SoulName contract
    function removeSoulName(
        ISoulName soulName
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(soulName) == address(0)) revert ZeroAddress();
        for (uint256 i = 0; i < soulNames.length; i++) {
            if (soulNames[i] == soulName) {
                soulNames[i] = soulNames[soulNames.length - 1];
                soulNames.pop();
                isSoulName[address(soulName)] = false;
                return;
            }
        }
        revert SoulNameNotExist();
    }

    /// @notice Pauses the smart contract
    /// @dev The caller must have the admin role to call this function
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses the smart contract
    /// @dev The caller must have the admin role to call this function
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Stores the link, validating the signature of the given read link request
    /// @dev The token must be linked to this soul linker
    /// @param readerIdentityId Id of the identity of the reader
    /// @param ownerIdentityId Id of the identity of the owner of the SBT
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param signatureDate Signature date of the signature
    /// @param expirationDate Expiration date of the signature
    /// @param signature Signature of the read link request made by the owner
    function addLink(
        address paymentMethod,
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate,
        uint256 expirationDate,
        bytes calldata signature
    ) external payable whenNotPaused nonReentrant {
        address ownerAddress = soulboundIdentity.ownerOf(ownerIdentityId);
        address readerAddress = soulboundIdentity.ownerOf(readerIdentityId);
        address tokenOwner = ISBTEnumerable(token).ownerOf(tokenId);

        if (ownerAddress != tokenOwner)
            revert IdentityOwnerNotTokenOwner(tokenId, ownerIdentityId);
        if (readerAddress != _msgSender()) revert CallerNotReader(_msgSender());
        if (ownerIdentityId == readerIdentityId)
            revert IdentityOwnerIsReader(readerIdentityId);
        if (signatureDate == 0) revert InvalidSignatureDate(signatureDate);
        if (expirationDate < block.timestamp)
            revert ValidPeriodExpired(expirationDate);
        if (_links[token][tokenId][readerIdentityId][signatureDate].exists)
            revert LinkAlreadyExists(
                token,
                tokenId,
                readerIdentityId,
                signatureDate
            );
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

        (
            uint256 price,
            uint256 protocolFee
        ) = getPriceForAddLinkWithProtocolFee(paymentMethod, token);
        _pay(paymentMethod, price, protocolFee);

        // token => tokenId => readerIdentityId => signatureDate => LinkData
        _links[token][tokenId][readerIdentityId][signatureDate] = LinkData(
            true,
            ownerIdentityId,
            expirationDate,
            false
        );
        if (_linkSignatureDates[token][tokenId][readerIdentityId].length == 0) {
            _linkReaderIdentityIds[token][tokenId].push(readerIdentityId);
        }
        _linkSignatureDates[token][tokenId][readerIdentityId].push(
            signatureDate
        );
        _readerLinks[readerIdentityId].push(
            ReaderLink(token, tokenId, signatureDate)
        );

        emit LinkAdded(
            readerIdentityId,
            ownerIdentityId,
            token,
            tokenId,
            signatureDate,
            expirationDate
        );
    }

    /// @notice Revokes the link
    /// @dev The links can be revoked, wether the token is linked or not.
    /// The caller must be the owner of the token.
    /// The owner of the token can revoke a link even if the reader has not added it yet.
    /// @param readerIdentityId Id of the identity of the reader
    /// @param ownerIdentityId Id of the identity of the owner of the SBT
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param signatureDate Signature date of the signature
    function revokeLink(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate
    ) external whenNotPaused {
        address ownerAddress = soulboundIdentity.ownerOf(ownerIdentityId);
        address tokenOwner = ISBTEnumerable(token).ownerOf(tokenId);

        if (ownerAddress != tokenOwner)
            revert IdentityOwnerNotTokenOwner(tokenId, ownerIdentityId);
        if (ownerAddress != _msgSender()) revert CallerNotOwner(_msgSender());
        if (ownerIdentityId == readerIdentityId)
            revert IdentityOwnerIsReader(readerIdentityId);
        if (_links[token][tokenId][readerIdentityId][signatureDate].isRevoked)
            revert LinkAlreadyRevoked();

        if (_links[token][tokenId][readerIdentityId][signatureDate].exists) {
            // token => tokenId => readerIdentityId => signatureDate => LinkData
            _links[token][tokenId][readerIdentityId][signatureDate]
                .isRevoked = true;
        } else {
            // if the link doesn't exist, store it
            // token => tokenId => readerIdentityId => signatureDate => LinkData
            _links[token][tokenId][readerIdentityId][signatureDate] = LinkData(
                true,
                ownerIdentityId,
                0,
                true
            );
            if (
                _linkSignatureDates[token][tokenId][readerIdentityId].length ==
                0
            ) {
                _linkReaderIdentityIds[token][tokenId].push(readerIdentityId);
            }
            _linkSignatureDates[token][tokenId][readerIdentityId].push(
                signatureDate
            );
            _readerLinks[readerIdentityId].push(
                ReaderLink(token, tokenId, signatureDate)
            );
        }

        emit LinkRevoked(
            readerIdentityId,
            ownerIdentityId,
            token,
            tokenId,
            signatureDate
        );
    }

    /// @notice Sets the default soul name for the owner
    /// @dev The caller must be the owner of the soul name.
    /// @param token Address of the SoulName contract
    /// @param tokenId TokenId of the soul name
    function setDefaultSoulName(address token, uint256 tokenId) external {
        if (!isSoulName[token]) revert SoulNameNotRegistered(token);
        address soulNameOwner = ISBTEnumerable(token).ownerOf(tokenId);
        if (_msgSender() != soulNameOwner) revert CallerNotOwner(_msgSender());

        defaultSoulName[_msgSender()].token = token;
        defaultSoulName[_msgSender()].tokenId = tokenId;
        defaultSoulName[_msgSender()].exists = true;
    }

    /* ========== VIEWS ===================================================== */

    /// @notice Returns the identityId owned by the given token
    /// @dev The token must be linked to this soul linker
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @return Id of the identity
    function getIdentityId(
        address token,
        uint256 tokenId
    ) external view returns (uint256) {
        address owner = ISBTEnumerable(token).ownerOf(tokenId);
        return soulboundIdentity.tokenOfOwner(owner);
    }

    /// @notice Returns the list of connected SBTs by a given SBT token
    /// @param identityId Id of the identity
    /// @param token Address of the SBT contract
    /// @return List of connected SBTs
    function getSBTConnections(
        uint256 identityId,
        address token
    ) external view returns (uint256[] memory) {
        address owner = soulboundIdentity.ownerOf(identityId);

        return getSBTConnections(owner, token);
    }

    /// @notice Returns the list of connected SBTs by a given SBT token
    /// @param owner Address of the owner of the identity
    /// @param token Address of the SBT contract
    /// @return List of connectec SBTs
    function getSBTConnections(
        address owner,
        address token
    ) public view returns (uint256[] memory) {
        uint256 connections = ISBTEnumerable(token).balanceOf(owner);
        uint256[] memory sbtConnections = new uint256[](connections);
        for (uint256 i = 0; i < connections; i++) {
            sbtConnections[i] = ISBTEnumerable(token).tokenOfOwnerByIndex(
                owner,
                i
            );
        }

        return sbtConnections;
    }

    /// @notice Returns the list of link signature dates for a given SBT token and reader
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @return List of linked SBTs
    function getLinks(
        address token,
        uint256 tokenId
    ) external view returns (LinkKey[] memory) {
        uint256 nLinkKeys = 0;
        for (
            uint256 i = 0;
            i < _linkReaderIdentityIds[token][tokenId].length;
            i++
        ) {
            uint256 readerIdentityId = _linkReaderIdentityIds[token][tokenId][
                i
            ];
            for (
                uint256 j = 0;
                j <
                _linkSignatureDates[token][tokenId][readerIdentityId].length;
                j++
            ) {
                nLinkKeys++;
            }
        }

        LinkKey[] memory linkKeys = new LinkKey[](nLinkKeys);
        uint256 n = 0;
        for (
            uint256 i = 0;
            i < _linkReaderIdentityIds[token][tokenId].length;
            i++
        ) {
            uint256 readerIdentityId = _linkReaderIdentityIds[token][tokenId][
                i
            ];
            for (
                uint256 j = 0;
                j <
                _linkSignatureDates[token][tokenId][readerIdentityId].length;
                j++
            ) {
                uint256 signatureDate = _linkSignatureDates[token][tokenId][
                    readerIdentityId
                ][j];
                linkKeys[n].readerIdentityId = readerIdentityId;
                linkKeys[n].signatureDate = signatureDate;
                n++;
            }
        }
        return linkKeys;
    }

    /// @notice Returns the list of link signature dates for a given SBT token and reader
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param readerIdentityId Id of the identity of the reader of the SBT
    /// @return List of linked SBTs
    function getLinkSignatureDates(
        address token,
        uint256 tokenId,
        uint256 readerIdentityId
    ) external view returns (uint256[] memory) {
        return _linkSignatureDates[token][tokenId][readerIdentityId];
    }

    /// @notice Returns the information of link dates for a given SBT token and reader
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param readerIdentityId Id of the identity of the reader of the SBT
    /// @param signatureDate Signature date of the signature
    /// @return linkData List of linked SBTs
    function getLinkInfo(
        address token,
        uint256 tokenId,
        uint256 readerIdentityId,
        uint256 signatureDate
    ) external view returns (LinkData memory) {
        return _links[token][tokenId][readerIdentityId][signatureDate];
    }

    /// @notice Returns the list of links for a given reader identity id
    /// @param readerIdentityId Id of the identity of the reader of the SBT
    /// @return List of links for the reader
    function getReaderLinks(
        uint256 readerIdentityId
    ) external view returns (ReaderLink[] memory) {
        return _readerLinks[readerIdentityId];
    }

    /// @notice Validates the link of the given read link request and returns the
    /// data that reader can read if the link is valid
    /// @dev The token must be linked to this soul linker
    /// @param readerIdentityId Id of the identity of the reader
    /// @param ownerIdentityId Id of the identity of the owner of the SBT
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param signatureDate Signature date of the signature
    /// @return True if the link is valid
    function validateLink(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate
    ) external view returns (bool) {
        address ownerAddress = soulboundIdentity.ownerOf(ownerIdentityId);
        address tokenOwner = ISBTEnumerable(token).ownerOf(tokenId);

        LinkData memory link = _links[token][tokenId][readerIdentityId][
            signatureDate
        ];

        if (ownerAddress != tokenOwner)
            revert IdentityOwnerNotTokenOwner(tokenId, ownerIdentityId);
        if (!link.exists) revert LinkDoesNotExist();
        if (link.expirationDate < block.timestamp)
            revert ValidPeriodExpired(link.expirationDate);
        if (link.isRevoked) revert LinkAlreadyRevoked();

        return true;
    }

    /// @notice Returns the price for storing a link
    /// @dev Returns the current pricing for storing a link
    /// @param paymentMethod Address of token that user want to pay
    /// @param token Token that user want to store link
    /// @return price Current price for storing a link
    function getPriceForAddLink(
        address paymentMethod,
        address token
    ) public view returns (uint256 price) {
        uint256 addLinkPrice = ILinkableSBT(token).addLinkPrice();
        uint256 addLinkPriceMASA = ILinkableSBT(token).addLinkPriceMASA();
        if (addLinkPrice == 0 && addLinkPriceMASA == 0) {
            price = 0;
        } else if (
            paymentMethod == masaToken &&
            enabledPaymentMethod[paymentMethod] &&
            addLinkPriceMASA > 0
        ) {
            // price in MASA without conversion rate
            price = addLinkPriceMASA;
        } else if (
            paymentMethod == stableCoin && enabledPaymentMethod[paymentMethod]
        ) {
            // stable coin
            price = addLinkPrice;
        } else if (enabledPaymentMethod[paymentMethod]) {
            // ETH and ERC 20 token
            price = _convertFromStableCoin(paymentMethod, addLinkPrice);
        } else {
            revert InvalidPaymentMethod(paymentMethod);
        }
        return price;
    }

    /// @notice Returns the price for storing a link with protocol fee
    /// @dev Returns the current pricing for storing a link with protocol fee
    /// @param paymentMethod Address of token that user want to pay
    /// @param token Token that user want to store link
    /// @return price Current price for storing a link
    /// @return protocolFee Current protocol fee for storing a link
    function getPriceForAddLinkWithProtocolFee(
        address paymentMethod,
        address token
    ) public view returns (uint256 price, uint256 protocolFee) {
        price = getPriceForAddLink(paymentMethod, token);
        return (price, _getProtocolFee(paymentMethod, price));
    }

    /// @notice Returns all the active soul names of an account
    /// @dev This function queries all the identity names of the specified account
    /// @param owner Address of the owner of the identities
    /// @return defaultName Default soul name of the account
    /// @return names Array of soul names associated to the account
    function getSoulNames(
        address owner
    ) public view returns (string memory defaultName, string[] memory names) {
        uint256 nameCount = 0;
        for (uint256 i = 0; i < soulNames.length; i++) {
            string[] memory _soulNamesFromIdentity = soulNames[i].getSoulNames(
                owner
            );
            for (uint256 j = 0; j < _soulNamesFromIdentity.length; j++) {
                nameCount++;
            }
        }

        string[] memory _soulNames = new string[](nameCount);
        uint256 n = 0;
        for (uint256 i = 0; i < soulNames.length; i++) {
            string[] memory _soulNamesFromIdentity = soulNames[i].getSoulNames(
                owner
            );
            for (uint256 j = 0; j < _soulNamesFromIdentity.length; j++) {
                _soulNames[n] = _soulNamesFromIdentity[j];
                n++;
            }
        }

        return (getDefaultSoulName(owner), _soulNames);
    }

    /// @notice Returns all the active soul names of an account
    /// @dev This function queries all the identity names of the specified identity Id
    /// @param tokenId TokenId of the identity
    /// @return defaultName Default soul name of the account
    /// @return names Array of soul names associated to the account
    function getSoulNames(
        uint256 tokenId
    ) external view returns (string memory defaultName, string[] memory names) {
        address owner = soulboundIdentity.ownerOf(tokenId);
        return getSoulNames(owner);
    }

    /// @notice Returns the default soul name of an account
    /// @dev This function queries the default soul name of the specified account
    /// @param owner Address of the owner of the identities
    /// @return Default soul name associated to the account
    function getDefaultSoulName(
        address owner
    ) public view returns (string memory) {
        // we have set a default soul name
        if (defaultSoulName[owner].exists) {
            address token = defaultSoulName[owner].token;
            uint256 tokenId = defaultSoulName[owner].tokenId;
            address soulNameOwner = ISBTEnumerable(token).ownerOf(tokenId);
            // the soul name has not changed owner
            if (soulNameOwner == owner) {
                // the soul name is not expired
                (string memory name, uint256 expirationDate) = ISoulName(token)
                    .tokenData(tokenId);
                if (expirationDate >= block.timestamp) {
                    return name;
                }
            }
        }
        return "";
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

    event LinkAdded(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate,
        uint256 expirationDate
    );

    event LinkRevoked(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        uint256 signatureDate
    );
}
