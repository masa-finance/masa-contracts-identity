// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./libraries/Errors.sol";
import "./dex/PaymentGateway.sol";
import "./interfaces/ISoulboundIdentity.sol";

/// @title Soul Factory
/// @author Masa Finance
/// @notice Soul Factory, that can deploy new Soulbound Tokens, paying a fee
/// @dev From this smart contract we can create new Soulbound Tokens.
/// This can be done paying a fee in ETH, USDC or MASA
contract SoulFactory is PaymentGateway, Pausable, ReentrancyGuard {
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    ISoulboundIdentity public soulboundIdentity;

    uint256 public creationPrice; // price in stable coin
    uint256 public creationPriceMASA; // price in MASA

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Factory
    /// @dev Creates a new Soul Factory, that has the role to create new Soulbound Tokens,
    /// paying a fee
    /// @param admin Administrator of the smart contract
    /// @param _soulBoundIdentity Address of the Soulbound identity contract
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        ISoulboundIdentity _soulBoundIdentity,
        PaymentParams memory paymentParams
    ) PaymentGateway(admin, paymentParams) {
        if (address(_soulBoundIdentity) == address(0)) revert ZeroAddress();

        soulboundIdentity = _soulBoundIdentity;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /// @notice Sets the SoulboundIdentity contract address linked to this store
    /// @dev The caller must have the admin role to call this function
    /// @param _soulboundIdentity New SoulboundIdentity contract address
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (address(_soulboundIdentity) == address(0)) revert ZeroAddress();
        if (soulboundIdentity == _soulboundIdentity) revert SameValue();
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Sets the price for create an SBT in stable coin
    /// @dev The caller must have the admin role to call this function
    /// @param _creationPrice New price for create an SBT in stable coin
    function setCreationPrice(uint256 _creationPrice)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (creationPrice == _creationPrice) revert SameValue();
        creationPrice = _creationPrice;
    }

    /// @notice Sets the price for create an SBT in MASA
    /// @dev The caller must have the admin role to call this function
    /// @param _creationPriceMASA New price for create an SBT in MASA
    function setCreationPriceMASA(uint256 _creationPriceMASA)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (creationPriceMASA == _creationPriceMASA) revert SameValue();
        creationPriceMASA = _creationPriceMASA;
    }

    /// @notice Pauses the smart contract
    /// @dev The caller must have the admin role to call this function
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses the smart contract
    /// @dev The caller must have the admin role to call this function
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Mints a new Soulbound Identity and Name purchasing it
    /// @dev This function allows the purchase of a soulbound identity and name using
    /// stable coin (USDC), native token (ETH) or utility token (MASA)
    /// @param paymentMethod Address of token that user want to pay
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param nameEIP712 Name of the EIP712 domain
    /// @param baseTokenURI Base URI of the token
    /// @return TokenId of the new soulbound identity
    function createNewSBT(
        address paymentMethod,
        address admin,
        string memory name,
        string memory symbol,
        string memory nameEIP712,
        string memory baseTokenURI
    ) external payable whenNotPaused nonReentrant returns (address) {
        _pay(paymentMethod, getCreationPrice(paymentMethod));

        // create new SBT
        address newSBT = address(0);

        emit SoulboundTokenCreated();

        return newSBT;
    }

    /* ========== VIEWS ========== */

    /// @notice Returns the price for creating a new SBT
    /// @dev Returns current pricing for creating a new SBT
    /// @param paymentMethod Address of token that user want to pay
    /// @return Current price for creating a new SBT in the given payment method
    function getCreationPrice(address paymentMethod)
        public
        view
        returns (uint256)
    {
        if (creationPrice == 0 && creationPriceMASA == 0) {
            return 0;
        } else if (
            paymentMethod == masaToken &&
            enabledPaymentMethod[paymentMethod] &&
            creationPriceMASA > 0
        ) {
            // price in MASA without conversion rate
            return creationPriceMASA;
        } else if (
            paymentMethod == stableCoin && enabledPaymentMethod[paymentMethod]
        ) {
            // stable coin
            return creationPrice;
        } else if (enabledPaymentMethod[paymentMethod]) {
            // ETH and ERC 20 token
            return _convertFromStableCoin(paymentMethod, creationPrice);
        } else {
            revert InvalidPaymentMethod(paymentMethod);
        }
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */

    event SoulboundTokenCreated();
}
