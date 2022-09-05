// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./dex/DexAMM.sol";
import "./SoulboundIdentity.sol";
import "./SoulName.sol";

/// @title Soul Factory
/// @author Masa Finance
/// @notice Soul Factory, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or CORN
contract SoulFactory is DexAMM, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    SoulboundIdentity public soulboundIdentity;

    uint256 public mintingIdentityPrice; // price in stable coin
    uint256 public mintingNamePrice; // price in stable coin

    address public stableCoin; // USDC
    address public utilityToken; // $CORN

    address public reserveWallet;

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Factory
    /// @dev Creates a new Soul Factory, that has the role to minting new Soulbound Identities
    /// and Soul Name NFTs, paying a fee
    /// @param owner Owner of the smart contract
    /// @param _soulBoundIdentity Address of the Soulbound identity contract
    /// @param _mintingIdentityPrice Price of the identity minting in stable coin
    /// @param _mintingNamePrice Price of the name minting in stable coin
    /// @param _utilityToken Utility token to pay the fee in ($CORN)
    /// @param _stableCoin Stable coin to pay the fee in (USDC)
    /// @param _wrappedNativeToken Wrapped native token address
    /// @param _swapRouter Swap router address
    /// @param _reserveWallet Wallet that will receive the fee
    constructor(
        address owner,
        SoulboundIdentity _soulBoundIdentity,
        uint256 _mintingIdentityPrice,
        uint256 _mintingNamePrice,
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

        mintingIdentityPrice = _mintingIdentityPrice;
        mintingNamePrice = _mintingNamePrice;
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

    /// @notice Sets the SoulboundIdentity contract address linked to this factory
    /// @dev The caller must have the admin role to call this function
    /// @param _soulboundIdentity New SoulboundIdentity contract address
    function setSoulboundIdentity(SoulboundIdentity _soulboundIdentity)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulboundIdentity != _soulboundIdentity, "SAME_VALUE");
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Sets the price of the identity minting in stable coin
    /// @dev The caller must have the admin role to call this function
    /// @param _mintingIdentityPrice New price of the identity minting in stable coin
    function setMintingIdentityPrice(uint256 _mintingIdentityPrice)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(mintingIdentityPrice != _mintingIdentityPrice, "SAME_VALUE");
        mintingIdentityPrice = _mintingIdentityPrice;
    }

    /// @notice Sets the price of the name minting in stable coin
    /// @dev The caller must have the admin role to call this function
    /// @param _mintingNamePrice New price of the name minting in stable coin
    function setMintingNamePrice(uint256 _mintingNamePrice)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(mintingNamePrice != _mintingNamePrice, "SAME_VALUE");
        mintingNamePrice = _mintingNamePrice;
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

    /// @notice Mints a new Soulbound Identity purchasing it
    /// @dev This function allows the purchase of a soulbound identity using
    /// stable coin (USDC), native token (ETH) or utility token ($CORN)
    /// @param paymentMethod Address of token that user want to pay
    /// @param name Name of the new soul name
    /// @return TokenId of the new soulbound identity
    function purchaseIdentity(address paymentMethod, string memory name)
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        _payForMinting(paymentMethod, mintingIdentityPrice);

        // finalize purchase
        return _mintSoulboundIdentity(_msgSender(), name);
    }

    /// @notice Mints a new Soul Name purchasing it
    /// @dev This function allows the purchase of a soul name using
    /// stable coin (USDC), native token (ETH) or utility token ($CORN)
    /// @param paymentMethod Address of token that user want to pay
    /// @param name Name of the new soul name
    /// @return TokenId of the new sou name
    function purchaseName(address paymentMethod, string memory name)
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        _payForMinting(paymentMethod, mintingNamePrice);

        // finalize purchase
        return _mintSoulName(_msgSender(), name);
    }

    /* ========== VIEWS ========== */

    /// @notice Returns the price of the identity minting
    /// @dev Returns all current pricing and amount informations for a purchase
    /// @return priceInStableCoin Current price of the identity minting in stable coin
    /// @return priceInETH Current price of the identity minting in native token (ETH)
    /// @return priceInUtilityToken Current price of the identity minting in utility token ($CORN)
    function purchaseIdentityInfo()
        public
        view
        returns (
            uint256 priceInStableCoin,
            uint256 priceInETH,
            uint256 priceInUtilityToken
        )
    {
        priceInStableCoin = mintingIdentityPrice;
        // get swapped price in ETH and $CORN
        priceInETH = estimateSwapAmount(
            wrappedNativeToken,
            stableCoin,
            mintingIdentityPrice
        );
        priceInUtilityToken = estimateSwapAmount(
            utilityToken,
            stableCoin,
            mintingIdentityPrice
        );
    }

    /// @notice Returns the price of the name minting
    /// @dev Returns all current pricing and amount informations for a purchase
    /// @return priceInStableCoin Current price of the name minting in stable coin
    /// @return priceInETH Current price of the name minting in native token (ETH)
    /// @return priceInUtilityToken Current price of the name minting in utility token ($CORN)
    function purchaseNameInfo()
        public
        view
        returns (
            uint256 priceInStableCoin,
            uint256 priceInETH,
            uint256 priceInUtilityToken
        )
    {
        priceInStableCoin = mintingNamePrice;
        // get swapped price in ETH and $CORN
        priceInETH = estimateSwapAmount(
            wrappedNativeToken,
            stableCoin,
            mintingNamePrice
        );
        priceInUtilityToken = estimateSwapAmount(
            utilityToken,
            stableCoin,
            mintingNamePrice
        );
    }

    /* ========== PRIVATE FUNCTIONS ========== */

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

    /// @notice Mints a new Soulbound Identity
    /// @dev The final step of all purchase options. Will mint a
    /// new Soulbound Identity and a Soul Name NFT and emit the purchase event
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @return TokenId of the new soulbound identity
    function _mintSoulboundIdentity(address to, string memory name)
        internal
        returns (uint256)
    {
        // mint Soulbound identity token
        uint256 tokenId = soulboundIdentity.mintIdentityWithName(to, name);

        emit SoulboundIdentityPurchased(
            to,
            tokenId,
            name,
            mintingIdentityPrice
        );

        return tokenId;
    }

    /// @notice Mints a new Soul Name
    /// @dev The final step of all purchase options. Will mint a
    /// new Soul Name NFT and emit the purchase event
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @return TokenId of the new soul name
    function _mintSoulName(address to, string memory name)
        internal
        returns (uint256)
    {
        // mint Soul Name token
        SoulName soulName = soulboundIdentity.soulName();
        uint256 identityId = soulboundIdentity.tokenOfOwner(to);

        uint256 tokenId = soulName.mint(to, name, identityId);

        emit SoulNamePurchased(to, tokenId, name, mintingNamePrice);

        return tokenId;
    }

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */

    event SoulboundIdentityPurchased(
        address indexed account,
        uint256 tokenId,
        string indexed name,
        uint256 price
    );

    event SoulNamePurchased(
        address indexed account,
        uint256 tokenId,
        string indexed name,
        uint256 price
    );
}
