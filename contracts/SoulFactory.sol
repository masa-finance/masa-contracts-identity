// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./SoulboundIdentity.sol";

/// @title Soul Factory
/// @author Masa Finance
/// @notice Soul Factory, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or CORN
contract SoulFactory {
    /* ========== STATE VARIABLES ========== */

    SoulboundIdentity public soulboundIdentity;
 
    uint256 public mintingPrice; // price in stable coin

    address public defaultStableCoin; // USDC
    address public utilityToken; // $CORN
    mapping(address => bool) public paymentMethod;

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Factory
    /// @dev Creates a new Soul Factory, that has the role to minting new Soulbound Identities
    /// and Soul Name NFTs, paying a fee
    /// @param owner Owner of the smart contract
    constructor(
        address owner,
        SoulboundIdentity _soulBoundIdentity,
        uint256 _mintingPrice,
        address _defaultStableCoin,
        address _utilityToken
    ) {
      soulboundIdentity = _soulBoundIdentity;

      mintingPrice = _mintingPrice;
      defaultStableCoin = _defaultStableCoin;
      utilityToken = _utilityToken;

      paymentMethod[address(0)] = true; // address(0) will represent the native token (ETH)
      paymentMethod[_defaultStableCoin] = true;
      paymentMethod[_utilityToken] = true;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /* ========== MUTATIVE FUNCTIONS ========== */

    /* ========== VIEWS ========== */

    /* ========== PRIVATE FUNCTIONS ========== */

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
