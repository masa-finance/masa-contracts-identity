// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../libraries/Errors.sol";
import "../interfaces/dex/IUniswapRouter.sol";

/// @title Pay using a Decentralized automated market maker (AMM) when needed
/// @author Masa Finance
/// @notice Smart contract to call a Dex AMM smart contract to pay to a project fee receiver
/// wallet recipient
/// @dev This smart contract will call the Uniswap Router interface, based on
/// https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router01.sol
abstract contract PaymentGateway is AccessControl {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    bytes32 public constant PROJECT_ADMIN_ROLE =
        keccak256("PROJECT_ADMIN_ROLE");

    struct PaymentParams {
        address swapRouter; // Swap router address
        address wrappedNativeToken; // Wrapped native token address
        address stableCoin; // Stable coin to pay the fee in (USDC)
        address masaToken; // Utility token to pay the fee in (MASA)
        address projectFeeReceiver; // Wallet that will receive the project fee
        address protocolFeeReceiver; // Wallet that will receive the protocol fee
        uint256 protocolFeeAmount; // Protocol fee amount in USD
        uint256 protocolFeePercent; // Protocol fee amount
    }

    /* ========== STATE VARIABLES =========================================== */

    address public swapRouter;
    address public wrappedNativeToken;

    address public stableCoin; // USDC. It also needs to be enabled as payment method, if we want to pay in USDC
    address public masaToken; // MASA. It also needs to be enabled as payment method, if we want to pay in MASA

    // enabled payment methods: ETH and ERC20 tokens
    mapping(address => bool) public enabledPaymentMethod;
    address[] public enabledPaymentMethods;

    address public projectFeeReceiver;
    address public protocolFeeReceiver;
    uint256 public protocolFeeAmount;
    uint256 public protocolFeePercent;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Dex AMM
    /// @dev Creates a new Decentralized automated market maker (AMM) smart contract,
    // that will call the Uniswap Router interface
    /// @param admin Administrator of the smart contract
    /// @param paymentParams Payment params
    constructor(address admin, PaymentParams memory paymentParams) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);

        swapRouter = paymentParams.swapRouter;
        wrappedNativeToken = paymentParams.wrappedNativeToken;
        stableCoin = paymentParams.stableCoin;
        masaToken = paymentParams.masaToken;
        projectFeeReceiver = paymentParams.projectFeeReceiver;
        protocolFeeReceiver = paymentParams.protocolFeeReceiver;
        protocolFeeAmount = paymentParams.protocolFeeAmount;
        protocolFeePercent = paymentParams.protocolFeePercent;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the swap router address
    /// @dev The caller must have the admin role to call this function
    /// @param _swapRouter New swap router address
    function setSwapRouter(
        address _swapRouter
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (swapRouter == _swapRouter) revert SameValue();
        swapRouter = _swapRouter;
    }

    /// @notice Sets the wrapped native token address
    /// @dev The caller must have the admin role to call this function
    /// @param _wrappedNativeToken New wrapped native token address
    function setWrappedNativeToken(
        address _wrappedNativeToken
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (wrappedNativeToken == _wrappedNativeToken) revert SameValue();
        wrappedNativeToken = _wrappedNativeToken;
    }

    /// @notice Sets the stable coin to pay the fee in (USDC)
    /// @dev The caller must have the admin role to call this function
    /// @param _stableCoin New stable coin to pay the fee in
    function setStableCoin(
        address _stableCoin
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (stableCoin == _stableCoin) revert SameValue();
        stableCoin = _stableCoin;
    }

    /// @notice Sets the utility token to pay the fee in (MASA)
    /// @dev The caller must have the admin role to call this function
    /// It can be set to address(0) to disable paying in MASA
    /// @param _masaToken New utility token to pay the fee in
    function setMasaToken(
        address _masaToken
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (masaToken == _masaToken) revert SameValue();
        masaToken = _masaToken;
    }

    /// @notice Adds a new token as a valid payment method
    /// @dev The caller must have the admin role to call this function
    /// @param _paymentMethod New token to add
    function enablePaymentMethod(
        address _paymentMethod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (enabledPaymentMethod[_paymentMethod]) revert AlreadyAdded();

        enabledPaymentMethod[_paymentMethod] = true;
        enabledPaymentMethods.push(_paymentMethod);
    }

    /// @notice Removes a token as a valid payment method
    /// @dev The caller must have the admin role to call this function
    /// @param _paymentMethod Token to remove
    function disablePaymentMethod(
        address _paymentMethod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!enabledPaymentMethod[_paymentMethod])
            revert NonExistingErc20Token(_paymentMethod);

        enabledPaymentMethod[_paymentMethod] = false;
        for (uint256 i = 0; i < enabledPaymentMethods.length; i++) {
            if (enabledPaymentMethods[i] == _paymentMethod) {
                enabledPaymentMethods[i] = enabledPaymentMethods[
                    enabledPaymentMethods.length - 1
                ];
                enabledPaymentMethods.pop();
                break;
            }
        }
    }

    /// @notice Set the project fee receiver wallet
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _projectFeeReceiver New project fee receiver wallet
    function setProjectFeeReceiver(address _projectFeeReceiver) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_projectFeeReceiver == projectFeeReceiver) revert SameValue();
        projectFeeReceiver = _projectFeeReceiver;
    }

    /// @notice Set the protocol fee wallet
    /// @dev The caller must have the admin role to call this function
    /// @param _protocolFeeReceiver New protocol fee wallet
    function setProtocolFeeReceiver(
        address _protocolFeeReceiver
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_protocolFeeReceiver == protocolFeeReceiver) revert SameValue();
        protocolFeeReceiver = _protocolFeeReceiver;
    }

    /// @notice Set the protocol fee amount
    /// @dev The caller must have the admin role to call this function
    /// @param _protocolFeeAmount New protocol fee amount
    function setProtocolFeeAmount(
        uint256 _protocolFeeAmount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_protocolFeeAmount == protocolFeeAmount) revert SameValue();
        protocolFeeAmount = _protocolFeeAmount;
    }

    /// @notice Set the protocol fee percent
    /// @dev The caller must have the admin role to call this function
    /// @param _protocolFeePercent New protocol fee percent
    function setProtocolFeePercent(
        uint256 _protocolFeePercent
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_protocolFeePercent == protocolFeePercent) revert SameValue();
        protocolFeePercent = _protocolFeePercent;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /// @notice Returns all available payment methods
    /// @dev Returns the address of all available payment methods
    /// @return Array of all enabled payment methods
    function getEnabledPaymentMethods()
        external
        view
        returns (address[] memory)
    {
        return enabledPaymentMethods;
    }

    /// @notice Calculates the protocol fee
    /// @dev This method will calculate the protocol fee based on the payment method
    /// @param paymentMethod Address of token that user want to pay
    /// @param amount Price to be paid in the specified payment method
    function getProtocolFee(
        address paymentMethod,
        uint256 amount
    ) external view returns (uint256) {
        return _getProtocolFee(paymentMethod, amount);
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /// @notice Converts an amount from a stable coin to a payment method amount
    /// @dev This method will perform the swap between the stable coin and the
    /// payment method, and return the amount of the payment method,
    /// performing the swap if necessary
    /// @param paymentMethod Address of token that user want to pay
    /// @param amount Price to be converted in the specified payment method
    function _convertFromStableCoin(
        address paymentMethod,
        uint256 amount
    ) internal view paymentParamsAlreadySet(amount) returns (uint256) {
        if (!enabledPaymentMethod[paymentMethod] || paymentMethod == stableCoin)
            revert InvalidToken(paymentMethod);

        if (amount == 0) return 0;

        if (paymentMethod == address(0)) {
            return _estimateSwapAmount(wrappedNativeToken, stableCoin, amount);
        } else {
            return _estimateSwapAmount(paymentMethod, stableCoin, amount);
        }
    }

    /// @notice Calculates the protocol fee
    /// @dev This method will calculate the protocol fee based on the payment method
    /// @param paymentMethod Address of token that user want to pay
    /// @param amount Price to be paid in the specified payment method
    function _getProtocolFee(
        address paymentMethod,
        uint256 amount
    ) internal view returns (uint256) {
        uint256 protocolFee = 0;
        if (protocolFeeAmount > 0) {
            if (paymentMethod == stableCoin) {
                protocolFee = protocolFeeAmount;
            } else {
                protocolFee = _convertFromStableCoin(
                    paymentMethod,
                    protocolFeeAmount
                );
            }
        }
        if (protocolFeePercent > 0) {
            protocolFee = protocolFee.add(
                amount.mul(protocolFeePercent).div(100)
            );
        }
        return protocolFee;
    }

    /// @notice Performs the payment in any payment method
    /// @dev This method will transfer the funds to the project fee receiver wallet, performing
    /// the swap if necessary, and transfer the protocol fee to the protocol fee wallet
    /// @param paymentMethod Address of token that user want to pay
    /// @param amount Price to be paid in the specified payment method
    /// @param protocolFee Protocol fee to be paid in the specified payment method
    function _pay(
        address paymentMethod,
        uint256 amount,
        uint256 protocolFee
    ) internal paymentParamsAlreadySet(amount.add(protocolFee)) {
        if (amount == 0 && protocolFee == 0) return;
        if (protocolFee > 0 && protocolFeeReceiver == address(0))
            revert ProtocolFeeReceiverNotSet();

        if (!enabledPaymentMethod[paymentMethod])
            revert InvalidPaymentMethod(paymentMethod);
        if (paymentMethod == address(0)) {
            // ETH
            if (msg.value < amount.add(protocolFee))
                revert InsufficientEthAmount(amount.add(protocolFee));
            if (amount > 0) {
                (bool success, ) = payable(projectFeeReceiver).call{
                    value: amount
                }("");
                if (!success) revert TransferFailed();
            }
            if (protocolFee > 0) {
                (bool success, ) = payable(protocolFeeReceiver).call{
                    value: protocolFee
                }("");
                if (!success) revert TransferFailed();
            }
            if (msg.value > amount.add(protocolFee)) {
                // return diff
                uint256 refund = msg.value.sub(amount.add(protocolFee));
                (bool success, ) = payable(msg.sender).call{value: refund}("");
                if (!success) revert RefundFailed();
            }
        } else {
            // ERC20 token, including MASA and USDC
            if (amount > 0) {
                IERC20(paymentMethod).safeTransferFrom(
                    msg.sender,
                    projectFeeReceiver,
                    amount
                );
            }
            if (protocolFee > 0) {
                IERC20(paymentMethod).safeTransferFrom(
                    msg.sender,
                    protocolFeeReceiver,
                    protocolFee
                );
            }
        }
    }

    function _estimateSwapAmount(
        address _fromToken,
        address _toToken,
        uint256 _amountOut
    ) private view returns (uint256) {
        uint256[] memory amounts;
        address[] memory path;
        path = _getPathFromTokenToToken(_fromToken, _toToken);
        amounts = IUniswapRouter(swapRouter).getAmountsIn(_amountOut, path);
        return amounts[0];
    }

    function _getPathFromTokenToToken(
        address fromToken,
        address toToken
    ) private view returns (address[] memory) {
        if (fromToken == wrappedNativeToken || toToken == wrappedNativeToken) {
            address[] memory path = new address[](2);
            path[0] = fromToken == wrappedNativeToken
                ? wrappedNativeToken
                : fromToken;
            path[1] = toToken == wrappedNativeToken
                ? wrappedNativeToken
                : toToken;
            return path;
        } else {
            address[] memory path = new address[](3);
            path[0] = fromToken;
            path[1] = wrappedNativeToken;
            path[2] = toToken;
            return path;
        }
    }

    /* ========== MODIFIERS ================================================= */

    modifier paymentParamsAlreadySet(uint256 amount) {
        if (amount > 0 && swapRouter == address(0))
            revert PaymentParamsNotSet();
        if (amount > 0 && wrappedNativeToken == address(0))
            revert PaymentParamsNotSet();
        if (amount > 0 && stableCoin == address(0))
            revert PaymentParamsNotSet();
        if (amount > 0 && projectFeeReceiver == address(0))
            revert PaymentParamsNotSet();
        _;
    }

    /* ========== EVENTS ==================================================== */
}
