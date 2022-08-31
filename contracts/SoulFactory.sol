// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./SoulboundIdentity.sol";

/// @title Soul Factory
/// @author Masa Finance
/// @notice Soul Factory, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or CORN
contract SoulFactory is Pausable, AccessControl {
    /* ========== STATE VARIABLES ========== */

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    SoulboundIdentity public soulboundIdentity;

    uint256 public mintingPrice; // price in stable coin

    address public defaultStableCoin; // USDC
    address public utilityToken; // $CORN

    address public reserveWallet;

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Factory
    /// @dev Creates a new Soul Factory, that has the role to minting new Soulbound Identities
    /// and Soul Name NFTs, paying a fee
    /// @param owner Owner of the smart contract
    /// @param _soulBoundIdentity Address of the Soulbound identity contract
    /// @param _mintingPrice Price of the minting in stable coin
    /// @param _defaultStableCoin Default stable coin to pay the fee in (USDC)
    /// @param _utilityToken Utility token to pay the fee in ($CORN)
    /// @param _reserveWallet Wallet that will receive the fee
    constructor(
        address owner,
        SoulboundIdentity _soulBoundIdentity,
        uint256 _mintingPrice,
        address _defaultStableCoin,
        address _utilityToken,
        address _reserveWallet
    ) {
        require(_reserveWallet != address(0), "ZERO_ADDRESS");
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");

        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);

        soulboundIdentity = _soulBoundIdentity;

        mintingPrice = _mintingPrice;
        defaultStableCoin = _defaultStableCoin;
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

    /// @notice Sets the price of the minting in stable coin
    /// @dev The caller must have the admin role to call this function
    /// @param _mintingPrice New price of the minting in stable coin
    function setMintingPrice(uint256 _mintingPrice)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(mintingPrice != _mintingPrice, "SAME_VALUE");
        mintingPrice = _mintingPrice;
    }

    /// @notice Sets the default stable coin to pay the fee in (USDC)
    /// @dev The caller must have the admin role to call this function
    /// @param _defaultStableCoin New default stable coin to pay the fee in
    function setDefaultStableCoin(address _defaultStableCoin)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_defaultStableCoin != address(0), "ZERO_ADDRESS");
        require(defaultStableCoin != _defaultStableCoin, "SAME_VALUE");
        defaultStableCoin = _defaultStableCoin;
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

    /* ========== MUTATIVE FUNCTIONS ========== */

    /* ========== VIEWS ========== */

    /* ========== PRIVATE FUNCTIONS ========== */

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
