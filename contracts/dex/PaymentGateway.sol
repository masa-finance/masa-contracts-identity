// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../interfaces/dex/IUniswapRouter.sol";

/// @title Pay using a Decentralized automated market maker (AMM) when needed
/// @author Masa Finance
/// @notice Smart contract to call a Dex AMM smart contract to pay to a reserve wallet recipient
/// @dev This smart contract will call the Uniswap Router interface, based on
/// https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router01.sol
abstract contract PaymentGateway is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct PaymentParams {
        address swapRouter; // Swap router address
        address wrappedNativeToken; // Wrapped native token address
        address stableCoin; // Stable coin to pay the fee in (USDC)
        address masaToken; // Utility token to pay the fee in ($MASA)
        address reserveWallet; // Wallet that will receive the fee
    }

    /* ========== STATE VARIABLES =========================================== */

    address public swapRouter;
    address public wrappedNativeToken;

    address public stableCoin; // USDC. It also needs to be enabled as erc20token, if we want to pay in USDC
    address public masaToken; // $MASA. It also needs to be enabled as erc20token, if we want to pay in $MASA

    // enabled ERC20 tokens
    mapping(address => bool) public erc20token;
    address[] public erc20tokens;

    address public reserveWallet;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Dex AMM
    /// @dev Creates a new Decentralized automated market maker (AMM) smart contract,
    // that will call the Uniswap Router interface
    /// @param owner Owner of the smart contract
    /// @param paymentParams Payment params
    constructor(address owner, PaymentParams memory paymentParams) {
        require(paymentParams.swapRouter != address(0), "ZERO_ADDRESS");
        require(paymentParams.wrappedNativeToken != address(0), "ZERO_ADDRESS");
        require(paymentParams.stableCoin != address(0), "ZERO_ADDRESS");
        require(paymentParams.reserveWallet != address(0), "ZERO_ADDRESS");

        Ownable.transferOwnership(owner);

        swapRouter = paymentParams.swapRouter;
        wrappedNativeToken = paymentParams.wrappedNativeToken;
        stableCoin = paymentParams.stableCoin;
        masaToken = paymentParams.masaToken;
        reserveWallet = paymentParams.reserveWallet;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the swap router address
    /// @dev The caller must have the owner to call this function
    /// @param _swapRouter New swap router address
    function setSwapRouter(address _swapRouter) external onlyOwner {
        require(_swapRouter != address(0), "ZERO_ADDRESS");
        require(swapRouter != _swapRouter, "SAME_VALUE");
        swapRouter = _swapRouter;
    }

    /// @notice Sets the wrapped native token address
    /// @dev The caller must have the owner to call this function
    /// @param _wrappedNativeToken New wrapped native token address
    function setWrappedNativeToken(address _wrappedNativeToken)
        external
        onlyOwner
    {
        require(_wrappedNativeToken != address(0), "ZERO_ADDRESS");
        require(wrappedNativeToken != _wrappedNativeToken, "SAME_VALUE");
        wrappedNativeToken = _wrappedNativeToken;
    }

    /// @notice Sets the stable coin to pay the fee in (USDC)
    /// @dev The caller must have the owner to call this function
    /// @param _stableCoin New stable coin to pay the fee in
    function setStableCoin(address _stableCoin) external onlyOwner {
        require(_stableCoin != address(0), "ZERO_ADDRESS");
        require(stableCoin != _stableCoin, "SAME_VALUE");
        stableCoin = _stableCoin;
    }

    /// @notice Sets the utility token to pay the fee in ($MASA)
    /// @dev The caller must have the owner to call this function
    /// It can be set to address(0) to disable paying in $MASA
    /// @param _masaToken New utility token to pay the fee in
    function setMasaToken(address _masaToken) external onlyOwner {
        require(masaToken != _masaToken, "SAME_VALUE");
        masaToken = _masaToken;
    }

    /// @notice Adds a new ERC20 token as a valid payment method
    /// @dev The caller must have the owner to call this function
    /// @param _erc20token New ERC20 token to add
    function addErc20Token(address _erc20token) external onlyOwner {
        require(_erc20token != address(0), "ZERO_ADDRESS");
        require(!erc20token[_erc20token], "ALREADY_ADDED");

        erc20token[_erc20token] = true;
        erc20tokens.push(_erc20token);
    }

    /// @notice Removes an ERC20 token as a valid payment method
    /// @dev The caller must have the owner to call this function
    /// @param _erc20token ERC20 token to remove
    function removeErc20Token(address _erc20token) external onlyOwner {
        require(_erc20token != address(0), "ZERO_ADDRESS");
        require(erc20token[_erc20token], "NOT_EXISITING_ERC20TOKEN");

        erc20token[_erc20token] = false;
        for (uint256 i = 0; i < erc20tokens.length; i++) {
            if (erc20tokens[i] == _erc20token) {
                erc20tokens[i] = erc20tokens[erc20tokens.length - 1];
                erc20tokens.pop();
                break;
            }
        }
    }

    /// @notice Set the reserve wallet
    /// @dev Let change the reserve walled. It can be triggered by an authorized account.
    /// @param _reserveWallet New reserve wallet
    function setReserveWallet(address _reserveWallet) external onlyOwner {
        require(_reserveWallet != address(0), "ZERO_ADDRESS");
        require(_reserveWallet != reserveWallet, "SAME_VALUE");
        reserveWallet = _reserveWallet;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /// @notice Returns all available ERC 20 tokens
    /// @dev Returns the address of all available ERC 20 tokens
    /// @return Array of all enabled ERC20 tokens
    function getErc20Tokens() external view returns (address[] memory) {
        return erc20tokens;
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _convertFromStableCoin(address token, uint256 amount)
        internal
        view
        returns (uint256)
    {
        require(
            (token == wrappedNativeToken || erc20token[token]) &&
                token != stableCoin,
            "INVALID_TOKEN"
        );
        return _estimateSwapAmount(token, stableCoin, amount);
    }

    /// @notice Performs the payment in any payment method
    /// @dev This method will transfer the funds to the reserve wallet, performing
    /// the swap if necessary
    /// @param paymentMethod Address of token that user want to pay
    /// @param amountInStableCoin Price to be paid in stable coin
    function _pay(address paymentMethod, uint256 amountInStableCoin) internal {
        if (amountInStableCoin == 0) return;
        if (paymentMethod == address(0)) {
            // ETH
            uint256 swapAmout = _convertFromStableCoin(
                wrappedNativeToken,
                amountInStableCoin
            );
            require(msg.value >= swapAmout, "INSUFFICIENT_ETH_AMOUNT");
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
        } else if (paymentMethod == stableCoin && erc20token[paymentMethod]) {
            // USDC
            IERC20(paymentMethod).safeTransferFrom(
                msg.sender,
                reserveWallet,
                amountInStableCoin
            );
        } else if (erc20token[paymentMethod]) {
            // ERC20 token, including $MASA
            uint256 swapAmout = _convertFromStableCoin(
                paymentMethod,
                amountInStableCoin
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

    /// @notice Performs the payment in MASA
    /// @dev This method will transfer the funds to the reserve wallet, without
    /// performing any swap
    /// @param amountInMASA Price to be paid in MASA
    function _payWithMASA(uint256 amountInMASA) internal {
        // $MASA
        require(erc20token[masaToken], "INVALID_PAYMENT_METHOD");

        IERC20(masaToken).safeTransferFrom(
            msg.sender,
            reserveWallet,
            amountInMASA
        );
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

    function _getPathFromTokenToToken(address fromToken, address toToken)
        private
        view
        returns (address[] memory)
    {
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

    /* ========== EVENTS ==================================================== */
}
