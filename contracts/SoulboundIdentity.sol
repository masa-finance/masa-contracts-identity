// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulLinker.sol";
import "./interfaces/ISoulName.sol";
import "./tokens/SBT.sol";

/// @title Soulbound Identity
/// @author Masa Finance
/// @notice Soulbound token that represents an identity.
/// @dev Soulbound identity, that inherits from the SBT contract.
contract SoulboundIdentity is SBT, ISoulboundIdentity {
    /* ========== STATE VARIABLES =========================================== */

    ISoulName public soulName;

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound identity
    /// @dev Creates a new soulbound identity, inheriting from the SBT contract.
    /// @param owner Owner of the smart contract
    /// @param _soulLinker Address of the SoulLinker contract
    /// @param baseTokenURI Base URI of the token
    constructor(
        address owner,
        ISoulLinker _soulLinker,
        string memory baseTokenURI
    ) SBT(owner, _soulLinker, "Masa Identity", "MID", baseTokenURI) {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the SoulName contract address linked to this identity
    /// @dev The caller must have the admin role to call this function
    /// @param _soulName Address of the SoulName contract
    function setSoulName(ISoulName _soulName)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(address(_soulName) != address(0), "ZERO_ADDRESS");
        require(soulName != _soulName, "SAME_VALUE");
        soulName = _soulName;
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Mints a new soulbound identity
    /// @dev The caller can only mint one identity per address
    /// @param to Address of the owner of the new identity
    function mint(address to)
        public
        override(SBT, ISoulboundIdentity)
        returns (uint256)
    {
        // Soulbound identity already created!
        require(balanceOf(to) < 1, "SB_IDENTITY_ALREADY_CREATED");

        return super.mint(to);
    }

    /// @notice Mints a new soulbound identity with a SoulName associated to it
    /// @dev The caller can only mint one identity per address, and the name must be unique
    /// @param to Address of the owner of the new identity
    /// @param name Name of the new identity
    /// @param period Period of validity of the name
    function mintIdentityWithName(
        address to,
        string memory name,
        uint256 period
    ) public payable override soulNameAlreadySet returns (uint256) {
        uint256 identityId = mint(to);
        soulName.mint(to, name, identityId, period);

        return identityId;
    }

    /* ========== VIEWS ===================================================== */

    /// @notice Returns the address of the SoulName contract linked to this identity
    /// @dev This function returns the address of the SoulName contract linked to this identity
    /// @return Address of the SoulName contract
    function getSoulName() public view override returns (ISoulName) {
        return soulName;
    }

    /// @notice Returns the extension of the soul name
    /// @dev This function returns the extension of the soul name
    /// @return Extension of the soul name
    function getExtension() public view returns (string memory) {
        return soulName.getExtension();
    }

    /// @notice Returns the owner address of an identity
    /// @dev This function returns the owner address of the identity specified by the tokenId
    /// @param tokenId TokenId of the identity
    /// @return Address of the owner of the identity
    function ownerOf(uint256 tokenId)
        public
        view
        override(ERC721, IERC721)
        returns (address)
    {
        return super.ownerOf(tokenId);
    }

    /// @notice Returns the owner address of a soul name
    /// @dev This function returns the owner address of the soul name identity specified by the name
    /// @param name Name of the soul name
    /// @return Address of the owner of the identity
    function ownerOf(string memory name)
        public
        view
        soulNameAlreadySet
        returns (address)
    {
        (, uint256 tokenId, ) = soulName.getTokenData(name);
        return super.ownerOf(tokenId);
    }

    /// @notice Returns the URI of a soul name
    /// @dev This function returns the token URI of the soul name identity specified by the name
    /// @param name Name of the soul name
    /// @return URI of the identity associated to a soul name
    function tokenURI(string memory name)
        public
        view
        soulNameAlreadySet
        returns (string memory)
    {
        (, uint256 tokenId, ) = soulName.getTokenData(name);
        return super.tokenURI(tokenId);
    }

    /// @notice Returns the URI of the owner of an identity
    /// @dev This function returns the token URI of the identity owned by an account
    /// @param owner Address of the owner of the identity
    /// @return URI of the identity owned by the account
    function tokenURI(address owner) public view returns (string memory) {
        uint256 tokenId = tokenOfOwner(owner);
        return super.tokenURI(tokenId);
    }

    /// @notice Returns the identity id of an account
    /// @dev This function returns the tokenId of the identity owned by an account
    /// @param owner Address of the owner of the identity
    /// @return TokenId of the identity owned by the account
    function tokenOfOwner(address owner)
        public
        view
        override
        returns (uint256)
    {
        return super.tokenOfOwnerByIndex(owner, 0);
    }

    /// @notice Checks if a soul name is available
    /// @dev This function queries if a soul name already exists and is in the available state
    /// @param name Name of the soul name
    /// @return available `true` if the soul name is available, `false` otherwise
    function isAvailable(string memory name)
        public
        view
        soulNameAlreadySet
        returns (bool available)
    {
        return soulName.isAvailable(name);
    }

    /// @notice Returns the information of a soul name
    /// @dev This function queries the information of a soul name
    /// @param name Name of the soul name
    /// @return sbtName Soul name, in upper/lower case and extension
    /// @return identityId Identity id of the soul name
    /// @return expirationDate Expiration date of the soul name
    function getTokenData(string memory name)
        external
        view
        soulNameAlreadySet
        returns (
            string memory sbtName,
            uint256 identityId,
            uint256 expirationDate
        )
    {
        return soulName.getTokenData(name);
    }

    /// @notice Returns all the identity names of an account
    /// @dev This function queries all the identity names of the specified account
    /// @param owner Address of the owner of the identities
    /// @return sbtNames Array of soul names associated to the account
    function getSoulNames(address owner)
        external
        view
        soulNameAlreadySet
        returns (string[] memory sbtNames)
    {
        uint256 tokenId = tokenOfOwner(owner);
        return soulName.getSoulNames(tokenId);
    }

    // SoulName -> SoulboundIdentity.tokenId
    // SoulName -> account -> SoulboundIdentity.tokenId

    /// @notice Returns all the identity names of an identity
    /// @dev This function queries all the identity names of the specified identity Id
    /// @param tokenId TokenId of the identity
    /// @return sbtNames Array of soul names associated to the identity Id
    function getSoulNames(uint256 tokenId)
        external
        view
        soulNameAlreadySet
        returns (string[] memory sbtNames)
    {
        return soulName.getSoulNames(tokenId);
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    modifier soulNameAlreadySet() {
        require(address(soulName) != address(0), "SOULNAME_CONTRACT_NOT_SET");
        _;
    }

    /* ========== EVENTS ==================================================== */
}
