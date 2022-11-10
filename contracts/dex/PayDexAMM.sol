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
abstract contract PayDexAMM is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES =========================================== */

    address public swapRouter;
    address public wrappedNativeToken;

    address public stableCoin; // USDC
    address public utilityToken; // $MASA

    // other ERC20 tokens
    mapping(address => bool) public erc20token;
    address[] public erc20tokens;

    address public reserveWallet;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Dex AMM
    /// @dev Creates a new Decentralized automated market maker (AMM) smart contract,
    // that will call the Uniswap Router interface
    /// @param owner Owner of the smart contract
    /// @param _swapRouter Swap router address
    /// @param _wrappedNativeToken Wrapped native token address
    /// @param _stableCoin Stable coin to pay the fee in (USDC)
    /// @param _utilityToken Utility token to pay the fee in ($MASA)
    /// @param _reserveWallet Wallet that will receive the fee
    constructor(
        address owner,
        address _swapRouter,
        address _wrappedNativeToken,
        address _stableCoin,
        address _utilityToken,
        address _reserveWallet
    ) {
        require(_swapRouter != address(0), "ZERO_ADDRESS");
        require(_wrappedNativeToken != address(0), "ZERO_ADDRESS");
        require(_stableCoin != address(0), "ZERO_ADDRESS");
        require(_utilityToken != address(0), "ZERO_ADDRESS");
        require(_reserveWallet != address(0), "ZERO_ADDRESS");

        Ownable.transferOwnership(owner);

        swapRouter = _swapRouter;
        wrappedNativeToken = _wrappedNativeToken;
        stableCoin = _stableCoin;
        utilityToken = _utilityToken;
        reserveWallet = _reserveWallet;
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
    /// @param _utilityToken New utility token to pay the fee in
    function setUtilityToken(address _utilityToken) external onlyOwner {
        require(_utilityToken != address(0), "ZERO_ADDRESS");
        require(utilityToken != _utilityToken, "SAME_VALUE");
        utilityToken = _utilityToken;
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

    /// @notice Returns all available payment methods
    /// @dev Returns the address of all available payment methods
    /// @return _nativeToken Address of the native token (ETH)
    /// @return _stableCoin Address of the stable coin (USDC)
    /// @return _utilityToken Address of the utility token ($MASA)
    /// @return _erc20tokens Array of all ERC20 tokens
    function getPaymentMethods()
        external
        view
        returns (
            address _nativeToken,
            address _stableCoin,
            address _utilityToken,
            address[] memory _erc20tokens
        )
    {
        return (address(0), stableCoin, utilityToken, erc20tokens);
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _convertFromStableCoin(address token, uint256 amount)
        internal
        view
        returns (uint256)
    {
        require(
            token == wrappedNativeToken ||
                token == utilityToken ||
                erc20token[token],
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
        if (paymentMethod == stableCoin) {
            // USDC
            IERC20(paymentMethod).safeTransferFrom(
                msg.sender,
                reserveWallet,
                amountInStableCoin
            );
        } else if (paymentMethod == address(0)) {
            // ETH
            uint256 swapAmout = _convertFromStableCoin(
                wrappedNativeToken,
                amountInStableCoin
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
        } else if (paymentMethod == utilityToken || erc20token[paymentMethod]) {
            // $MASA
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
        IERC20(utilityToken).safeTransferFrom(
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
