// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./dex/DexAMM.sol";
import "./interfaces/ISoulboundIdentity.sol";

/// @title Soul linker
/// @author Masa Finance
/// @notice Soul linker smart contract that let add links to a Soulbound token.
contract SoulLinker is DexAMM, Ownable, EIP712 {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES =========================================== */

    ISoulboundIdentity public soulboundIdentity;

    // linked SBTs
    mapping(address => bool) public linkedSBT;
    address[] public linkedSBTs;

    uint256 public storePermissionPrice; // store permission price in stable coin

    address public stableCoin; // USDC
    address public utilityToken; // $MASA

    address public reserveWallet;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soul linker
    /// @param owner Owner of the smart contract
    /// @param _soulboundIdentity Soulbound identity smart contract
    /// @param _storePermissionPrice Store permission price in stable coin
    /// @param _utilityToken Utility token to pay the fee in ($MASA)
    /// @param _stableCoin Stable coin to pay the fee in (USDC)
    /// @param _wrappedNativeToken Wrapped native token address
    /// @param _swapRouter Swap router address
    /// @param _reserveWallet Wallet that will receive the fee
    constructor(
        address owner,
        ISoulboundIdentity _soulboundIdentity,
        uint256 _storePermissionPrice,
        address _utilityToken,
        address _stableCoin,
        address _wrappedNativeToken,
        address _swapRouter,
        address _reserveWallet
    ) EIP712("SoulLinker", "1.0.0") DexAMM(_swapRouter, _wrappedNativeToken) {
        require(_stableCoin != address(0), "ZERO_ADDRESS");
        require(_utilityToken != address(0), "ZERO_ADDRESS");
        require(_reserveWallet != address(0), "ZERO_ADDRESS");
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");

        Ownable.transferOwnership(owner);

        soulboundIdentity = _soulboundIdentity;

        storePermissionPrice = _storePermissionPrice;
        stableCoin = _stableCoin;
        utilityToken = _utilityToken;
        reserveWallet = _reserveWallet;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the SoulboundIdentity contract address linked to this soul name
    /// @dev The caller must be the owner to call this function
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyOwner
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulboundIdentity != _soulboundIdentity, "SAME_VALUE");
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Adds an SBT to the list of linked SBTs
    /// @dev The caller must be the owner to call this function
    /// @param token Address of the SBT contract
    function addLinkedSBT(address token) external onlyOwner {
        require(address(token) != address(0), "ZERO_ADDRESS");
        require(!linkedSBT[token], "SBT_ALREADY_LINKED");

        linkedSBT[token] = true;
        linkedSBTs.push(token);
    }

    /// @notice Removes an SBT from the list of linked SBTs
    /// @dev The caller must be the owner to call this function
    /// @param token Address of the SBT contract
    function removeLinkedSBT(address token) external onlyOwner {
        require(linkedSBT[token], "SBT_NOT_LINKED");

        linkedSBT[token] = false;
        _removeLinkedSBT(token);
    }

    /// @notice Sets the price of store permission in stable coin
    /// @dev The caller must have the owner to call this function
    /// @param _storePermissionPrice New price of the store permission in stable coin
    function setStorePermissionPrice(uint256 _storePermissionPrice)
        external
        onlyOwner
    {
        require(storePermissionPrice != _storePermissionPrice, "SAME_VALUE");
        storePermissionPrice = _storePermissionPrice;
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

    /// @notice Set the reserve wallet
    /// @dev Let change the reserve walled. It can be triggered by an authorized account.
    /// @param _reserveWallet New reserve wallet
    function setReserveWallet(address _reserveWallet) external onlyOwner {
        require(_reserveWallet != address(0), "ZERO_ADDRESS");
        require(_reserveWallet != reserveWallet, "SAME_VALUE");
        reserveWallet = _reserveWallet;
    }

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

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Stores the permission, validating the signature of the given read link request
    /// @dev The token must be linked to this soul linker
    /// @param readerIdentityId Id of the identity of the reader
    /// @param ownerIdentityId Id of the identity of the owner of the SBT
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param data Data that owner wants to share
    /// @param signatureDate Signature date of the signature
    /// @param expirationDate Expiration date of the signature
    /// @param signature Signature of the read link request made by the owner
    /// @return `true` if the signature is valid and the permission is stored, `false` otherwise
    function storePermission(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        string memory data,
        uint256 signatureDate,
        uint256 expirationDate,
        bytes calldata signature
    ) external returns (bool) {
        require(linkedSBT[token], "SBT_NOT_LINKED");

        address identityReader = soulboundIdentity.ownerOf(readerIdentityId);
        address identityOwner = soulboundIdentity.ownerOf(ownerIdentityId);
        address tokenOwner = IERC721Enumerable(token).ownerOf(tokenId);

        require(identityOwner == tokenOwner, "IDENTITY_OWNER_NOT_TOKEN_OWNER");
        require(identityReader == _msgSender(), "CALLER_NOT_READER");
        require(expirationDate >= block.timestamp, "VALID_PERIOD_EXPIRED");
        require(
            _verify(
                _hash(
                    readerIdentityId,
                    ownerIdentityId,
                    token,
                    tokenId,
                    data,
                    signatureDate,
                    expirationDate
                ),
                signature,
                identityOwner
            ),
            "INVALID_SIGNATURE"
        );

        _payForStoringPermission();

        return true;
    }

    /* ========== VIEWS ===================================================== */

    /// @notice Returns the identityId owned by the given token
    /// @dev The token must be linked to this soul linker
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @return Id of the identity
    function getIdentityId(address token, uint256 tokenId)
        external
        view
        returns (uint256)
    {
        address owner = IERC721Enumerable(token).ownerOf(tokenId);
        return soulboundIdentity.tokenOfOwner(owner);
    }

    /// @notice Returns the list of linked SBTs by a given SBT token
    /// @dev The token must be linked to this soul linker
    /// @param identityId Id of the identity
    /// @param token Address of the SBT contract
    /// @return List of linked SBTs
    function getSBTLinks(uint256 identityId, address token)
        external
        view
        returns (uint256[] memory)
    {
        require(linkedSBT[token], "SBT_NOT_LINKED");
        address owner = soulboundIdentity.ownerOf(identityId);

        return getSBTLinks(owner, token);
    }

    /// @notice Returns the list of linked SBTs by a given SBT token
    /// @dev The token must be linked to this soul linker
    /// @param owner Address of the owner of the identity
    /// @param token Address of the SBT contract
    /// @return List of linked SBTs
    function getSBTLinks(address owner, address token)
        public
        view
        returns (uint256[] memory)
    {
        require(linkedSBT[token], "SBT_NOT_LINKED");

        uint256 links = IERC721Enumerable(token).balanceOf(owner);
        uint256[] memory sbtLinks = new uint256[](links);
        for (uint256 i = 0; i < links; i++) {
            sbtLinks[i] = IERC721Enumerable(token).tokenOfOwnerByIndex(
                owner,
                i
            );
        }

        return sbtLinks;
    }

    /// @notice Validates the permission of the given read link request
    /// @dev The token must be linked to this soul linker
    /// @param readerIdentityId Id of the identity of the reader
    /// @param ownerIdentityId Id of the identity of the owner of the SBT
    /// @param token Address of the SBT contract
    /// @param tokenId Id of the token
    /// @param data Data that owner wants to share
    /// @param signatureDate Signature date of the signature
    /// @param expirationDate Expiration date of the signature
    /// @return `true` if the signature is valid, `false` otherwise
    function validatePermission(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        string memory data,
        uint256 signatureDate,
        uint256 expirationDate
    ) external view returns (bool) {
        require(linkedSBT[token], "SBT_NOT_LINKED");

        address identityReader = soulboundIdentity.ownerOf(readerIdentityId);
        address identityOwner = soulboundIdentity.ownerOf(ownerIdentityId);
        address tokenOwner = IERC721Enumerable(token).ownerOf(tokenId);

        require(identityOwner == tokenOwner, "IDENTITY_OWNER_NOT_TOKEN_OWNER");
        require(identityReader == _msgSender(), "CALLER_NOT_READER");
        require(expirationDate >= block.timestamp, "VALID_PERIOD_EXPIRED");

        return true;
    }

    /// @notice Returns the price for storing a permission
    /// @dev Returns the current pricing for storing a permission
    /// @return priceInUtilityToken Current price of storing a permission in utility token ($MASA)
    function storePermissionPriceInfo()
        public
        view
        returns (uint256 priceInUtilityToken)
    {
        priceInUtilityToken = estimateSwapAmount(
            utilityToken,
            stableCoin,
            storePermissionPrice
        );
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /// @notice Performs the payment for storing a permission
    /// @dev This method will transfer the funds to the reserve wallet, performing the swap
    function _payForStoringPermission() internal {
        // pay with $MASA
        uint256 swapAmout = estimateSwapAmount(
            utilityToken,
            stableCoin,
            storePermissionPrice
        );
        IERC20(utilityToken).safeTransferFrom(
            msg.sender,
            reserveWallet,
            swapAmout
        );
    }

    function _removeLinkedSBT(address token) internal {
        for (uint256 i = 0; i < linkedSBTs.length; i++) {
            if (linkedSBTs[i] == token) {
                linkedSBTs[i] = linkedSBTs[linkedSBTs.length - 1];
                linkedSBTs.pop();
                break;
            }
        }
    }

    function _hash(
        uint256 readerIdentityId,
        uint256 ownerIdentityId,
        address token,
        uint256 tokenId,
        string memory data,
        uint256 signatureDate,
        uint256 expirationDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Link(uint256 readerIdentityId,uint256 ownerIdentityId,address token,uint256 tokenId,string data,uint256 signatureDate,uint256 expirationDate)"
                        ),
                        readerIdentityId,
                        ownerIdentityId,
                        token,
                        tokenId,
                        data,
                        signatureDate,
                        expirationDate
                    )
                )
            );
    }

    function _verify(
        bytes32 digest,
        bytes memory signature,
        address owner
    ) internal pure returns (bool) {
        return ECDSA.recover(digest, signature) == owner;
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
