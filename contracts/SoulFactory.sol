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
