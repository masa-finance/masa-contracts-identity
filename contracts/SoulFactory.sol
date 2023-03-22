// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./libraries/Errors.sol";
import "./dex/PaymentGateway.sol";
import "./interfaces/ISoulboundIdentity.sol";
import "./SoulboundBaseSelfSovereign.sol";

/// @title Soul Factory
/// @author Masa Finance
/// @notice Soul Factory, that can deploy new Soulbound Tokens, paying a fee
/// @dev From this smart contract we can create new Soulbound Tokens.
/// This can be done paying a fee in ETH, USDC or MASA
contract SoulFactory is
    PaymentGateway,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    ISoulboundIdentity public soulboundIdentity;
    SoulboundBaseSelfSovereign public templateSBT;

    uint256 public creationPrice; // price in stable coin
    uint256 public creationPriceMASA; // price in MASA

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Factory
    /// @dev Creates a new Soul Factory, that has the role to create new Soulbound Tokens,
    /// paying a fee
    /// @param admin Administrator of the smart contract
    /// @param _soulBoundIdentity Address of the Soulbound identity contract
    /// @param _templateSBT Address of the template SBT
    /// @param paymentParams Payment gateway params
    function initialize(
        address admin,
        ISoulboundIdentity _soulBoundIdentity,
        SoulboundBaseSelfSovereign _templateSBT,
        PaymentParams memory paymentParams
    ) public initializer {
        PaymentGateway._initialize(admin, paymentParams);
        __ReentrancyGuard_init();
        __Pausable_init();
        if (address(_soulBoundIdentity) == address(0)) revert ZeroAddress();
        if (address(_templateSBT) == address(0)) revert ZeroAddress();

        soulboundIdentity = _soulBoundIdentity;
        templateSBT = _templateSBT;
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

    /// @notice Sets the template SBT contract address linked to this factory
    /// @dev The caller must have the admin role to call this function
    /// @param _templateSBT New SBT template contract address
    function setTemplateSBT(
        SoulboundBaseSelfSovereign _templateSBT
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(_templateSBT) == address(0)) revert ZeroAddress();
        if (templateSBT == _templateSBT) revert SameValue();
        templateSBT = _templateSBT;
    }

    /// @notice Sets the price for create an SBT in stable coin
    /// @dev The caller must have the admin role to call this function
    /// @param _creationPrice New price for create an SBT in stable coin
    function setCreationPrice(
        uint256 _creationPrice
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (creationPrice == _creationPrice) revert SameValue();
        creationPrice = _creationPrice;
    }

    /// @notice Sets the price for create an SBT in MASA
    /// @dev The caller must have the admin role to call this function
    /// @param _creationPriceMASA New price for create an SBT in MASA
    function setCreationPriceMASA(
        uint256 _creationPriceMASA
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
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

    /// @notice Creates a new Soulbound SBT and pays the fee
    /// @dev This function allows the creation of a new SBT paying
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
        string memory baseTokenURI,
        PaymentParams memory paymentParams
    ) external payable whenNotPaused nonReentrant returns (address) {
        _pay(paymentMethod, getCreationPrice(paymentMethod));

        // create new SBT
        SoulboundBaseSelfSovereign newSBT = new SoulboundBaseSelfSovereign();
        newSBT.initialize(
            admin,
            name,
            symbol,
            nameEIP712,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        );

        emit SoulboundTokenCreated();

        return address(newSBT);
    }

    /// @notice Clones a new Soulbound SBT and pays the fee
    /// @dev This function allows the creation of a new SBT paying
    /// stable coin (USDC), native token (ETH) or utility token (MASA)
    /// @param paymentMethod Address of token that user want to pay
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param nameEIP712 Name of the EIP712 domain
    /// @param baseTokenURI Base URI of the token
    /// @return TokenId of the new soulbound identity
    function cloneNewSBT(
        address paymentMethod,
        address admin,
        string memory name,
        string memory symbol,
        string memory nameEIP712,
        string memory baseTokenURI,
        PaymentParams memory paymentParams
    ) external payable whenNotPaused nonReentrant returns (address) {
        _pay(paymentMethod, getCreationPrice(paymentMethod));

        // create new SBT
        SoulboundBaseSelfSovereign newSBT = SoulboundBaseSelfSovereign(
            _createClone(address(templateSBT))
        );
        newSBT.initialize(
            admin,
            name,
            symbol,
            nameEIP712,
            baseTokenURI,
            soulboundIdentity,
            paymentParams
        );

        emit SoulboundTokenCreated();

        return address(newSBT);
    }

    /* ========== VIEWS ========== */

    /// @notice Returns the price for creating a new SBT
    /// @dev Returns current pricing for creating a new SBT
    /// @param paymentMethod Address of token that user want to pay
    /// @return Current price for creating a new SBT in the given payment method
    function getCreationPrice(
        address paymentMethod
    ) public view returns (uint256) {
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

    function _createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(
                clone,
                0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
            )
            mstore(add(clone, 0x14), targetBytes)
            mstore(
                add(clone, 0x28),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )
            result := create(0, clone, 0x37)
        }
    }

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */

    event SoulboundTokenCreated();
}
