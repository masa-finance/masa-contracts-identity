// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./dex/DexAMM.sol";
import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulName.sol";

/// @title Soul Store
/// @author Masa Finance
/// @notice Soul Store, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or CORN
contract SoulStore is DexAMM, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    ISoulboundIdentity public soulboundIdentity;

    mapping(uint256 => uint256) public nameRegistrationPricePerYear; // (length --> price in stable coin per year)

    address public stableCoin; // USDC
    address public utilityToken; // $CORN

    address public reserveWallet;

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Store
    /// @dev Creates a new Soul Store, that has the role to minting new Soulbound Identities
    /// and Soul Name NFTs, paying a fee
    /// @param owner Owner of the smart contract
    /// @param _soulBoundIdentity Address of the Soulbound identity contract
    /// @param _nameRegistrationPricePerYear Price of the default name registering in stable coin per year
    /// @param _utilityToken Utility token to pay the fee in ($CORN)
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
    ) DexAMM(_swapRouter, _wrappedNativeToken) {
        require(_reserveWallet != address(0), "ZERO_ADDRESS");
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");

        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);

        soulboundIdentity = _soulBoundIdentity;

        nameRegistrationPricePerYear[0] = _nameRegistrationPricePerYear; // name price for default length per year
        stableCoin = _stableCoin;
        utilityToken = _utilityToken;

        reserveWallet = _reserveWallet;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /// @notice Pauses the operations in the smart contract
    /// @dev Sets an emergency stop mechanism that can be triggered by an authorized account.
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpauses the operations in the smart contract
    /// @dev Unsets an emergency stop mechanism. It can be triggered by an authorized account.
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Sets the SoulboundIdentity contract address linked to this store
    /// @dev The caller must have the admin role to call this function
    /// @param _soulboundIdentity New SoulboundIdentity contract address
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulboundIdentity != _soulboundIdentity, "SAME_VALUE");
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Sets the price of the name registering per one year in stable coin
    /// @dev The caller must have the admin role to call this function
    /// @param _nameLength Length of the name
    /// @param _nameRegistrationPricePerYear New price of the name registering per one
    /// year in stable coin for that name length per year
    function setNameRegistrationPricePerYear(
        uint256 _nameLength,
        uint256 _nameRegistrationPricePerYear
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            nameRegistrationPricePerYear[_nameLength] !=
                _nameRegistrationPricePerYear,
            "SAME_VALUE"
        );
        nameRegistrationPricePerYear[
            _nameLength
        ] = _nameRegistrationPricePerYear;
    }

    /// @notice Sets the stable coin to pay the fee in (USDC)
    /// @dev The caller must have the admin role to call this function
    /// @param _stableCoin New stable coin to pay the fee in
    function setStableCoin(address _stableCoin)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_stableCoin != address(0), "ZERO_ADDRESS");
        require(stableCoin != _stableCoin, "SAME_VALUE");
        stableCoin = _stableCoin;
    }

    /// @notice Sets the utility token to pay the fee in ($CORN)
    /// @dev The caller must have the admin role to call this function
    /// @param _utilityToken New utility token to pay the fee in
    function setUtilityToken(address _utilityToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_utilityToken != address(0), "ZERO_ADDRESS");
        require(utilityToken != _utilityToken, "SAME_VALUE");
        utilityToken = _utilityToken;
    }

    /// @notice Set the reserve wallet
    /// @dev Let change the reserve walled. It can be triggered by an authorized account.
    /// @param _reserveWallet New reserve wallet
    function setReserveWallet(address _reserveWallet)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_reserveWallet != address(0), "ZERO_ADDRESS");
        require(_reserveWallet != reserveWallet, "SAME_VALUE");
        reserveWallet = _reserveWallet;
    }

    /// @notice Sets the swap router address
    /// @dev The caller must have the admin role to call this function
    /// @param _swapRouter New swap router address
    function setSwapRouter(address _swapRouter)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_swapRouter != address(0), "ZERO_ADDRESS");
        require(swapRouter != _swapRouter, "SAME_VALUE");
        swapRouter = _swapRouter;
    }

    /// @notice Sets the wrapped native token address
    /// @dev The caller must have the admin role to call this function
    /// @param _wrappedNativeToken New wrapped native token address
    function setWrappedNativeToken(address _wrappedNativeToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_wrappedNativeToken != address(0), "ZERO_ADDRESS");
        require(wrappedNativeToken != _wrappedNativeToken, "SAME_VALUE");
        wrappedNativeToken = _wrappedNativeToken;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Mints a new Soulbound Identity and Name purchasing it
    /// @dev This function allows the purchase of a soulbound identity and name using
    /// stable coin (USDC), native token (ETH) or utility token ($CORN)
    /// @param paymentMethod Address of token that user want to pay
    /// @param name Name of the new soul name
    /// @param yearsPeriod Years of validity of the name
    /// @return TokenId of the new soulbound identity
    function purchaseIdentityAndName(
        address paymentMethod,
        string memory name,
        uint256 yearsPeriod
    ) external payable whenNotPaused returns (uint256) {
        _payForMinting(
            paymentMethod,
            getNameRegistrationPricePerYear(name).mul(yearsPeriod)
        );

        // finalize purchase
        return _mintSoulboundIdentityAndName(_msgSender(), name, yearsPeriod);
    }

    /// @notice Mints a new Soulbound Identity purchasing it
    /// @dev This function allows the purchase of a soulbound identity for free
    /// @return TokenId of the new soulbound identity
    function purchaseIdentity()
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        // finalize purchase
        return _mintSoulboundIdentity(_msgSender());
    }

    /// @notice Mints a new Soul Name purchasing it
    /// @dev This function allows the purchase of a soul name using
    /// stable coin (USDC), native token (ETH) or utility token ($CORN)
    /// @param paymentMethod Address of token that user want to pay
    /// @param name Name of the new soul name
    /// @param yearsPeriod Years of validity of the name
    /// @return TokenId of the new sou name
    function purchaseName(
        address paymentMethod,
        string memory name,
        uint256 yearsPeriod
    ) external payable whenNotPaused returns (uint256) {
        _payForMinting(
            paymentMethod,
            getNameRegistrationPricePerYear(name).mul(yearsPeriod)
        );

        // finalize purchase
        return _mintSoulName(_msgSender(), name, yearsPeriod);
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
    /// @return priceInUtilityToken Current price of the name minting in utility token ($CORN)
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
    /// @return priceInUtilityToken Current price in utility token ($CORN)
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
        // get swapped price in ETH and $CORN
        priceInETH = estimateSwapAmount(
            wrappedNativeToken,
            stableCoin,
            mintingPrice
        );
        priceInUtilityToken = estimateSwapAmount(
            utilityToken,
            stableCoin,
            mintingPrice
        );
    }

    /// @notice Performs the payment for the minting
    /// @dev This method will transfer the funds to the reserve wallet, performing
    /// the swap if necessary
    /// @param paymentMethod Address of token that user want to pay
    /// @param mintingPrice Price of the minting
    function _payForMinting(address paymentMethod, uint256 mintingPrice)
        internal
    {
        if (paymentMethod == stableCoin) {
            // USDC
            IERC20(paymentMethod).safeTransferFrom(
                msg.sender,
                reserveWallet,
                mintingPrice
            );
        } else if (paymentMethod == address(0)) {
            // ETH
            uint256 swapAmout = estimateSwapAmount(
                wrappedNativeToken,
                stableCoin,
                mintingPrice
            );
            require(msg.value >= swapAmout, "INVALID_PAYMENT_AMOUNT");
            (bool success, ) = payable(reserveWallet).call{value: swapAmout}(
                ""
            );
            require(success, "TRANSFER_FAILED");
            if (msg.value > swapAmout) {
                // return diff
                uint256 refund = msg.value.sub(swapAmout);
                (success, ) = payable(msg.sender).call{value: refund}("");
                require(success);
            }
        } else if (paymentMethod == utilityToken) {
            // $CORN
            uint256 swapAmout = estimateSwapAmount(
                paymentMethod,
                stableCoin,
                mintingPrice
            );
            IERC20(paymentMethod).safeTransferFrom(
                msg.sender,
                reserveWallet,
                swapAmout
            );
        } else {
            revert("INVALID_PAYMENT_METHOD");
        }
    }

    /// @notice Mints a new Soulbound Identity and Name
    /// @dev The final step of all purchase options. Will mint a
    /// new Soulbound Identity and a Soul Name NFT and emit the purchase event
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @param yearsPeriod Years of validity of the name
    /// @return TokenId of the new soulbound identity
    function _mintSoulboundIdentityAndName(
        address to,
        string memory name,
        uint256 yearsPeriod
    ) internal returns (uint256) {
        // mint Soulbound identity token
        uint256 tokenId = soulboundIdentity.mintIdentityWithName(
            to,
            name,
            yearsPeriod
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
    /// @return TokenId of the new soul name
    function _mintSoulName(
        address to,
        string memory name,
        uint256 yearsPeriod
    ) internal returns (uint256) {
        // mint Soul Name token
        ISoulName soulName = soulboundIdentity.getSoulName();
        uint256 identityId = soulboundIdentity.tokenOfOwner(to);

        uint256 tokenId = soulName.mint(to, name, identityId, yearsPeriod);

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
