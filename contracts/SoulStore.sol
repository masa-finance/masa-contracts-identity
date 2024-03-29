// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./libraries/Errors.sol";
import "./dex/PaymentGateway.sol";
import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulName.sol";

/// @title Soul Store
/// @author Masa Finance
/// @notice Soul Store, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or MASA
contract SoulStore is PaymentGateway, Pausable, ReentrancyGuard, EIP712 {
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    ISoulboundIdentity public soulboundIdentity;
    ISoulName public soulName;

    mapping(uint256 => uint256) public nameRegistrationPricePerYear; // (length --> price in stable coin per year)

    mapping(address => bool) public authorities;

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Store
    /// @dev Creates a new Soul Store, that has the role to minting new Soulbound Identities
    /// and Soul Name NFTs, paying a fee
    /// @param admin Administrator of the smart contract
    /// @param _soulBoundIdentity Address of the Soulbound identity contract
    /// @param _soulName Address of the SoulName contract
    /// @param _nameRegistrationPricePerYear Price of the default name registering in stable coin per year
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        ISoulboundIdentity _soulBoundIdentity,
        ISoulName _soulName,
        uint256 _nameRegistrationPricePerYear,
        PaymentParams memory paymentParams
    ) PaymentGateway(admin, paymentParams) EIP712("SoulStore", "1.0.0") {
        if (address(_soulBoundIdentity) == address(0)) revert ZeroAddress();
        if (address(_soulName) == address(0)) revert ZeroAddress();

        soulboundIdentity = _soulBoundIdentity;
        soulName = _soulName;

        nameRegistrationPricePerYear[0] = _nameRegistrationPricePerYear; // name price for default length per year
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /// @notice Sets the SoulboundIdentity contract address linked to this store
    /// @dev The caller must have the admin role to call this function
    /// @param _soulboundIdentity New SoulboundIdentity contract address
    function setSoulboundIdentity(
        ISoulboundIdentity _soulboundIdentity
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(_soulboundIdentity) == address(0)) revert ZeroAddress();
        if (soulboundIdentity == _soulboundIdentity) revert SameValue();
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Sets the SoulName contract address linked to this store
    /// @dev The caller must have the admin role to call this function
    /// @param _soulName New SoulName contract address
    function setSoulName(
        ISoulName _soulName
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(_soulName) == address(0)) revert ZeroAddress();
        if (soulName == _soulName) revert SameValue();
        soulName = _soulName;
    }

    /// @notice Sets the price of the name registering per one year in stable coin
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _nameLength Length of the name
    /// @param _nameRegistrationPricePerYear New price of the name registering per one
    /// year in stable coin for that name length per year
    function setNameRegistrationPricePerYear(
        uint256 _nameLength,
        uint256 _nameRegistrationPricePerYear
    ) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (
            nameRegistrationPricePerYear[_nameLength] ==
            _nameRegistrationPricePerYear
        ) revert SameValue();
        nameRegistrationPricePerYear[
            _nameLength
        ] = _nameRegistrationPricePerYear;
    }

    /// @notice Adds a new authority to the list of authorities
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _authority New authority to add
    function addAuthority(address _authority) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_authority == address(0)) revert ZeroAddress();
        if (authorities[_authority]) revert AlreadyAdded();

        authorities[_authority] = true;
    }

    /// @notice Removes an authority from the list of authorities
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _authority Authority to remove
    function removeAuthority(address _authority) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_authority == address(0)) revert ZeroAddress();
        if (!authorities[_authority]) revert AuthorityNotExists(_authority);

        authorities[_authority] = false;
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

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Mints a new Soulbound Identity and Name purchasing it
    /// @dev This function allows the purchase of a soulbound identity and name using
    /// stable coin (USDC), native token (ETH) or utility token (MASA)
    /// @param paymentMethod Address of token that user want to pay
    /// @param name Name of the new soul name
    /// @param nameLength Length of the name
    /// @param yearsPeriod Years of validity of the name
    /// @param tokenURI URI of the NFT
    /// @param authorityAddress Address of the authority
    /// @param signature Signature of the authority
    /// @return TokenId of the new soulbound identity
    function purchaseIdentityAndName(
        address paymentMethod,
        string memory name,
        uint256 nameLength,
        uint256 yearsPeriod,
        string memory tokenURI,
        address authorityAddress,
        bytes calldata signature
    ) external payable virtual whenNotPaused nonReentrant returns (uint256) {
        (
            uint256 price,
            uint256 protocolFee
        ) = getPriceForMintingNameWithProtocolFee(
                paymentMethod,
                nameLength,
                yearsPeriod
            );
        _pay(paymentMethod, price, protocolFee);

        // finalize purchase
        uint256 tokenId = _mintSoulboundIdentityAndName(
            _msgSender(),
            name,
            nameLength,
            yearsPeriod,
            tokenURI,
            authorityAddress,
            signature
        );

        emit SoulboundIdentityAndNamePurchased(
            _msgSender(),
            tokenId,
            name,
            yearsPeriod,
            paymentMethod,
            price,
            protocolFee
        );

        return tokenId;
    }

    /// @notice Mints a new Soulbound Identity purchasing it
    /// @dev This function allows the purchase of a soulbound identity for free
    /// @return TokenId of the new soulbound identity
    function purchaseIdentity()
        external
        virtual
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        uint256 tokenId = _mintSoulboundIdentity(_msgSender());

        emit SoulboundIdentityPurchased(_msgSender(), tokenId);

        return tokenId;
    }

    /// @notice Mints a new Soul Name purchasing it
    /// @dev This function allows the purchase of a soul name using
    /// stable coin (USDC), native token (ETH) or utility token (MASA)
    /// @param paymentMethod Address of token that user want to pay
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @param nameLength Length of the name
    /// @param yearsPeriod Years of validity of the name
    /// @param tokenURI URI of the NFT
    /// @param authorityAddress Address of the authority
    /// @param signature Signature of the authority
    /// @return TokenId of the new sou name
    function purchaseName(
        address paymentMethod,
        address to,
        string memory name,
        uint256 nameLength,
        uint256 yearsPeriod,
        string memory tokenURI,
        address authorityAddress,
        bytes calldata signature
    ) external payable virtual whenNotPaused nonReentrant returns (uint256) {
        (
            uint256 price,
            uint256 protocolFee
        ) = getPriceForMintingNameWithProtocolFee(
                paymentMethod,
                nameLength,
                yearsPeriod
            );
        _pay(paymentMethod, price, protocolFee);

        // finalize purchase
        uint256 tokenId = _mintSoulName(
            to,
            name,
            nameLength,
            yearsPeriod,
            tokenURI,
            authorityAddress,
            signature
        );

        emit SoulNamePurchased(
            to,
            tokenId,
            name,
            yearsPeriod,
            paymentMethod,
            price,
            protocolFee
        );

        return tokenId;
    }

    /* ========== VIEWS ========== */

    /// @notice Returns the price of register a name per year in stable coin for an specific length
    /// @dev Returns the price for registering per year in USD for an specific name length
    /// @param nameLength Length of the name
    /// @return Price in stable coin for that name length
    function getNameRegistrationPricePerYear(
        uint256 nameLength
    ) public view returns (uint256) {
        uint256 price = nameRegistrationPricePerYear[nameLength];
        if (price == 0) {
            // if not found, return the default price
            price = nameRegistrationPricePerYear[0];
        }
        return price;
    }

    /// @notice Returns the price of the name minting
    /// @dev Returns current pricing for name minting for a given name length and years period
    /// @param paymentMethod Address of token that user want to pay
    /// @param nameLength Length of the name
    /// @param yearsPeriod Years of validity of the name
    /// @return price Current price of the name minting in the given payment method
    function getPriceForMintingName(
        address paymentMethod,
        uint256 nameLength,
        uint256 yearsPeriod
    ) public view virtual returns (uint256 price) {
        uint256 mintPrice = getNameRegistrationPricePerYear(nameLength).mul(
            yearsPeriod
        );

        if (mintPrice == 0) {
            price = 0;
        } else if (
            paymentMethod == stableCoin && enabledPaymentMethod[paymentMethod]
        ) {
            // stable coin
            price = mintPrice;
        } else if (enabledPaymentMethod[paymentMethod]) {
            // ETH and ERC 20 token
            price = _convertFromStableCoin(paymentMethod, mintPrice);
        } else {
            revert InvalidPaymentMethod(paymentMethod);
        }
        return price;
    }

    /// @notice Returns the price of the name minting with protocol fee
    /// @dev Returns current pricing for name minting for a given name length and years period with protocol fee
    /// @param paymentMethod Address of token that user want to pay
    /// @param nameLength Length of the name
    /// @param yearsPeriod Years of validity of the name
    /// @return price Current price of the name minting in the given payment method
    /// @return protocolFee Current protocol fee of the name minting in the given payment method
    function getPriceForMintingNameWithProtocolFee(
        address paymentMethod,
        uint256 nameLength,
        uint256 yearsPeriod
    ) public view virtual returns (uint256 price, uint256 protocolFee) {
        price = getPriceForMintingName(paymentMethod, nameLength, yearsPeriod);
        return (price, _getProtocolFee(paymentMethod, price));
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    /// @notice Mints a new Soulbound Identity and Name
    /// @dev The final step of all purchase options. Will mint a
    /// new Soulbound Identity and a Soul Name NFT
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @param nameLength Length of the name
    /// @param yearsPeriod Years of validity of the name
    /// @param tokenURI URI of the NFT
    /// @param authorityAddress Address of the authority
    /// @param signature Signature of the authority
    /// @return TokenId of the new soulbound identity
    function _mintSoulboundIdentityAndName(
        address to,
        string memory name,
        uint256 nameLength,
        uint256 yearsPeriod,
        string memory tokenURI,
        address authorityAddress,
        bytes calldata signature
    ) internal virtual returns (uint256) {
        _verify(
            _hash(to, name, nameLength, yearsPeriod, tokenURI),
            signature,
            authorityAddress
        );

        // mint Soulbound identity token
        uint256 tokenId = soulboundIdentity.mint(to);

        // mint Soul Name token
        soulName.mint(to, name, yearsPeriod, tokenURI);

        return tokenId;
    }

    /// @notice Mints a new Soulbound Identity
    /// @dev The final step of all purchase options. Will mint a
    /// new Soulbound Identity
    /// @param to Address of the owner of the new identity
    /// @return TokenId of the new soulbound identity
    function _mintSoulboundIdentity(
        address to
    ) internal virtual returns (uint256) {
        // mint Soulbound identity token
        uint256 tokenId = soulboundIdentity.mint(to);

        return tokenId;
    }

    /// @notice Mints a new Soul Name
    /// @dev The final step of all purchase options. Will mint a
    /// new Soul Name NFT
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @param nameLength Length of the name
    /// @param yearsPeriod Years of validity of the name
    /// @param tokenURI URI of the NFT
    /// @param authorityAddress Address of the authority
    /// @param signature Signature of the authority
    /// @return TokenId of the new soul name
    function _mintSoulName(
        address to,
        string memory name,
        uint256 nameLength,
        uint256 yearsPeriod,
        string memory tokenURI,
        address authorityAddress,
        bytes calldata signature
    ) internal virtual returns (uint256) {
        _verify(
            _hash(to, name, nameLength, yearsPeriod, tokenURI),
            signature,
            authorityAddress
        );

        // mint Soul Name token
        uint256 tokenId = soulName.mint(to, name, yearsPeriod, tokenURI);

        return tokenId;
    }

    function _verify(
        bytes32 digest,
        bytes memory signature,
        address signer
    ) internal view {
        address _signer = ECDSA.recover(digest, signature);
        if (_signer != signer) revert InvalidSignature();
        if (!authorities[_signer]) revert NotAuthorized(_signer);
    }

    function _hash(
        address to,
        string memory name,
        uint256 nameLength,
        uint256 yearsPeriod,
        string memory tokenURI
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "MintSoulName(address to,string name,uint256 nameLength,uint256 yearsPeriod,string tokenURI)"
                        ),
                        to,
                        keccak256(bytes(name)),
                        nameLength,
                        yearsPeriod,
                        keccak256(bytes(tokenURI))
                    )
                )
            );
    }

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */

    event SoulboundIdentityAndNamePurchased(
        address indexed account,
        uint256 tokenId,
        string indexed name,
        uint256 yearsPeriod,
        address indexed paymentMethod,
        uint256 price,
        uint256 protocolFee
    );

    event SoulboundIdentityPurchased(address indexed account, uint256 tokenId);

    event SoulNamePurchased(
        address indexed account,
        uint256 tokenId,
        string indexed name,
        uint256 yearsPeriod,
        address indexed paymentMethod,
        uint256 price,
        uint256 protocolFee
    );
}
