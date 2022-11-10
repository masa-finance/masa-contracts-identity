// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./dex/PayDexAMM.sol";
import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulName.sol";

/// @title Soul Store
/// @author Masa Finance
/// @notice Soul Store, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or $MASA
contract SoulStore is PayDexAMM {
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    ISoulboundIdentity public soulboundIdentity;

    mapping(uint256 => uint256) public nameRegistrationPricePerYear; // (length --> price in stable coin per year)

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Store
    /// @dev Creates a new Soul Store, that has the role to minting new Soulbound Identities
    /// and Soul Name NFTs, paying a fee
    /// @param owner Owner of the smart contract
    /// @param _soulBoundIdentity Address of the Soulbound identity contract
    /// @param _nameRegistrationPricePerYear Price of the default name registering in stable coin per year
    /// @param _utilityToken Utility token to pay the fee in ($MASA)
    /// @param _stableCoin Stable coin to pay the fee in (USDC)
    /// @param _wrappedNativeToken Wrapped native token address
    /// @param _swapRouter Swap router address
    /// @param _reserveWallet Wallet that will receive the fee
    constructor(
        address owner,
        ISoulboundIdentity _soulBoundIdentity,
        uint256 _nameRegistrationPricePerYear,
        address _utilityToken,
        address _stableCoin,
        address _wrappedNativeToken,
        address _swapRouter,
        address _reserveWallet
    )
        PayDexAMM(
            owner,
            _swapRouter,
            _wrappedNativeToken,
            _stableCoin,
            _utilityToken,
            _reserveWallet
        )
    {
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");

        soulboundIdentity = _soulBoundIdentity;

        nameRegistrationPricePerYear[0] = _nameRegistrationPricePerYear; // name price for default length per year
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /// @notice Sets the SoulboundIdentity contract address linked to this store
    /// @dev The caller must have the owner to call this function
    /// @param _soulboundIdentity New SoulboundIdentity contract address
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyOwner
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulboundIdentity != _soulboundIdentity, "SAME_VALUE");
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Sets the price of the name registering per one year in stable coin
    /// @dev The caller must have the owner to call this function
    /// @param _nameLength Length of the name
    /// @param _nameRegistrationPricePerYear New price of the name registering per one
    /// year in stable coin for that name length per year
    function setNameRegistrationPricePerYear(
        uint256 _nameLength,
        uint256 _nameRegistrationPricePerYear
    ) external onlyOwner {
        require(
            nameRegistrationPricePerYear[_nameLength] !=
                _nameRegistrationPricePerYear,
            "SAME_VALUE"
        );
        nameRegistrationPricePerYear[
            _nameLength
        ] = _nameRegistrationPricePerYear;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Mints a new Soulbound Identity and Name purchasing it
    /// @dev This function allows the purchase of a soulbound identity and name using
    /// stable coin (USDC), native token (ETH) or utility token ($MASA)
    /// @param paymentMethod Address of token that user want to pay
    /// @param name Name of the new soul name
    /// @param yearsPeriod Years of validity of the name
    /// @param _tokenURI URI of the NFT
    /// @return TokenId of the new soulbound identity
    function purchaseIdentityAndName(
        address paymentMethod,
        string memory name,
        uint256 yearsPeriod,
        string memory _tokenURI
    ) external payable returns (uint256) {
        _pay(
            paymentMethod,
            getNameRegistrationPricePerYear(name).mul(yearsPeriod)
        );

        // finalize purchase
        return
            _mintSoulboundIdentityAndName(
                _msgSender(),
                name,
                yearsPeriod,
                _tokenURI
            );
    }

    /// @notice Mints a new Soulbound Identity purchasing it
    /// @dev This function allows the purchase of a soulbound identity for free
    /// @return TokenId of the new soulbound identity
    function purchaseIdentity() external payable returns (uint256) {
        // finalize purchase
        return _mintSoulboundIdentity(_msgSender());
    }

    /// @notice Mints a new Soul Name purchasing it
    /// @dev This function allows the purchase of a soul name using
    /// stable coin (USDC), native token (ETH) or utility token ($MASA)
    /// @param paymentMethod Address of token that user want to pay
    /// @param name Name of the new soul name
    /// @param yearsPeriod Years of validity of the name
    /// @param _tokenURI URI of the NFT
    /// @return TokenId of the new sou name
    function purchaseName(
        address paymentMethod,
        string memory name,
        uint256 yearsPeriod,
        string memory _tokenURI
    ) external payable returns (uint256) {
        _pay(
            paymentMethod,
            getNameRegistrationPricePerYear(name).mul(yearsPeriod)
        );

        // finalize purchase
        return _mintSoulName(_msgSender(), name, yearsPeriod, _tokenURI);
    }

    /* ========== VIEWS ========== */

    /// @notice Returns the price of register a name per year in stable coin for an specific length
    /// @dev Returns the price for registering per year in USD for an specific name length
    /// @param nameLength Length of the name
    /// @return Price in stable coin for that name length
    function getNameRegistrationPricePerYear(string memory nameLength)
        public
        view
        returns (uint256)
    {
        uint256 bytelength = bytes(nameLength).length;
        uint256 price = nameRegistrationPricePerYear[bytelength];
        if (price == 0) {
            // if not found, return the default price
            price = nameRegistrationPricePerYear[0];
        }
        return price;
    }

    /// @notice Returns the price of the name minting
    /// @dev Returns all current pricing and amount informations for a purchase
    /// @param name Name of the new soul name
    /// @param yearsPeriod Years of validity of the name
    /// @return priceInStableCoin Current price of the name minting in stable coin
    /// @return priceInETH Current price of the name minting in native token (ETH)
    /// @return priceInUtilityToken Current price of the name minting in utility token ($MASA)
    function purchaseNameInfo(string memory name, uint256 yearsPeriod)
        public
        view
        returns (
            uint256 priceInStableCoin,
            uint256 priceInETH,
            uint256 priceInUtilityToken
        )
    {
        (priceInStableCoin, priceInETH, priceInUtilityToken) = _getSwapAmounts(
            getNameRegistrationPricePerYear(name).mul(yearsPeriod)
        );
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    /// @notice Returns the price of minting
    /// @dev Returns all current pricing and amount informations for a purchase
    /// @return priceInStableCoin Current price in stable coin
    /// @return priceInETH Current pric in native token (ETH)
    /// @return priceInUtilityToken Current price in utility token ($MASA)
    function _getSwapAmounts(uint256 mintingPrice)
        public
        view
        returns (
            uint256 priceInStableCoin,
            uint256 priceInETH,
            uint256 priceInUtilityToken
        )
    {
        priceInStableCoin = mintingPrice;
        // get swapped price in ETH and $MASA
        priceInETH = _convertFromStableCoin(wrappedNativeToken, mintingPrice);
        priceInUtilityToken = _convertFromStableCoin(
            utilityToken,
            mintingPrice
        );
    }

    /// @notice Mints a new Soulbound Identity and Name
    /// @dev The final step of all purchase options. Will mint a
    /// new Soulbound Identity and a Soul Name NFT and emit the purchase event
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @param yearsPeriod Years of validity of the name
    /// @param _tokenURI URI of the NFT
    /// @return TokenId of the new soulbound identity
    function _mintSoulboundIdentityAndName(
        address to,
        string memory name,
        uint256 yearsPeriod,
        string memory _tokenURI
    ) internal returns (uint256) {
        // mint Soulbound identity token
        uint256 tokenId = soulboundIdentity.mintIdentityWithName(
            to,
            name,
            yearsPeriod,
            _tokenURI
        );

        emit SoulboundIdentityAndNamePurchased(to, tokenId, name, yearsPeriod);

        return tokenId;
    }

    /// @notice Mints a new Soulbound Identity
    /// @dev The final step of all purchase options. Will mint a
    /// new Soulbound Identity and emit the purchase event
    /// @param to Address of the owner of the new identity
    /// @return TokenId of the new soulbound identity
    function _mintSoulboundIdentity(address to) internal returns (uint256) {
        // mint Soulbound identity token
        uint256 tokenId = soulboundIdentity.mint(to);

        emit SoulboundIdentityPurchased(to, tokenId);

        return tokenId;
    }

    /// @notice Mints a new Soul Name
    /// @dev The final step of all purchase options. Will mint a
    /// new Soul Name NFT and emit the purchase event
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @param yearsPeriod Years of validity of the name
    /// @param _tokenURI URI of the NFT
    /// @return TokenId of the new soul name
    function _mintSoulName(
        address to,
        string memory name,
        uint256 yearsPeriod,
        string memory _tokenURI
    ) internal returns (uint256) {
        // mint Soul Name token
        ISoulName soulName = soulboundIdentity.getSoulName();
        uint256 identityId = soulboundIdentity.tokenOfOwner(to);

        uint256 tokenId = soulName.mint(
            to,
            name,
            identityId,
            yearsPeriod,
            _tokenURI
        );

        emit SoulNamePurchased(to, tokenId, name, yearsPeriod);

        return tokenId;
    }

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */

    event SoulboundIdentityAndNamePurchased(
        address indexed account,
        uint256 tokenId,
        string indexed name,
        uint256 yearsPeriod
    );

    event SoulboundIdentityPurchased(address indexed account, uint256 tokenId);

    event SoulNamePurchased(
        address indexed account,
        uint256 tokenId,
        string indexed name,
        uint256 yearsPeriod
    );
}
