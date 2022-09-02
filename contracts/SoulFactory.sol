// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./SoulboundIdentity.sol";
import "./SoulName.sol";

/// @title Soul Factory
/// @author Masa Finance
/// @notice Soul Factory, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or CORN
contract SoulFactory is Pausable, AccessControl {
    /* ========== STATE VARIABLES ========== */

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    SoulboundIdentity public soulboundIdentity;

    uint256 public mintingIdentityPrice; // price in stable coin
    uint256 public mintingNamePrice; // price in stable coin

    address public defaultStableCoin; // USDC
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
    /// @param _defaultStableCoin Default stable coin to pay the fee in (USDC)
    /// @param _utilityToken Utility token to pay the fee in ($CORN)
    /// @param _reserveWallet Wallet that will receive the fee
    constructor(
        address owner,
        SoulboundIdentity _soulBoundIdentity,
        uint256 _mintingIdentityPrice,
        uint256 _mintingNamePrice,
        address _defaultStableCoin,
        address _utilityToken,
        address _reserveWallet
    ) {
        require(_reserveWallet != address(0), "ZERO_ADDRESS");
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");

        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);

        soulboundIdentity = _soulBoundIdentity;

        mintingIdentityPrice = _mintingIdentityPrice;
        mintingNamePrice = _mintingNamePrice;
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

    /// @notice Mints a new Soulbound Identity purchasing it
    /// @dev This function allows the purchase of a soulbount identity usign
    /// stable coin (USDC), native token (ETH) or utility token ($CORN)
    /// @param paymentMethod Address of token that user want to pay
    /// @param name Name of the new soul name
    /// @return TokenId of the new soulbound identity
    function purchase(address paymentMethod, string memory name)
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        // TODO: perform the purchase

        // finalize purchase
        return _mintSoulboundIdentity(_msgSender(), name);
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
        // TODO: get swapped price in ETH and $CORN
        priceInETH = 0;
        priceInUtilityToken = 0;
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
        // TODO: get swapped price in ETH and $CORN
        priceInETH = 0;
        priceInUtilityToken = 0;
    }

    /* ========== PRIVATE FUNCTIONS ========== */

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
