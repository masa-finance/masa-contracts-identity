// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulName.sol";
import "./tokens/NFT.sol";

/// @title SoulName NFT
/// @author Masa Finance
/// @notice SoulName NFT that points to a Soulbound identity token
/// @dev SoulName NFT, that inherits from the NFT contract, and points to a Soulbound identity token.
/// It has an extension, and stores all the information about the identity names.
contract SoulName is NFT, ISoulName {
    /* ========== STATE VARIABLES ========== */
    using SafeMath for uint256;

    ISoulboundIdentity public soulboundIdentity;
    string public extension; // suffix of the names (.sol?)

    mapping(uint256 => TokenData) public tokenData; // used to store the data of the token id
    mapping(string => NameData) public nameData; // stores the token id of the current active soul name
    mapping(uint256 => string[]) identityNames; // register of all names associated to an identityId

    struct TokenData {
        string name; // Name with lowercase and uppercase
        uint256 identityId;
        uint256 expirationDate;
    }

    struct NameData {
        bool exists;
        uint256 tokenId;
    }

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new SoulName NFT
    /// @dev Creates a new SoulName NFT, that points to a Soulbound identity, inheriting from the NFT contract.
    /// @param owner Owner of the smart contract
    /// @param _soulboundIdentity Address of the Soulbound identity contract
    /// @param _extension Extension of the soul name
    /// @param baseTokenURI Base URI of the token
    constructor(
        address owner,
        ISoulboundIdentity _soulboundIdentity,
        string memory _extension,
        string memory baseTokenURI
    ) NFT(owner, "Masa Identity Name", "MIN", baseTokenURI) {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");

        soulboundIdentity = _soulboundIdentity;
        extension = _extension;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the SoulboundIdentity contract address linked to this soul name
    /// @dev The caller must have the admin role to call this function
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulboundIdentity != _soulboundIdentity, "SAME_VALUE");
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Sets the extension of the soul name
    /// @dev The caller must have the admin role to call this function
    /// @param _extension Extension of the soul name
    function setExtension(string memory _extension)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            keccak256(abi.encodePacked((extension))) !=
                keccak256(abi.encodePacked((_extension))),
            "SAME_VALUE"
        );
        extension = _extension;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Mints a new soul name
    /// @dev The caller can mint more than one name. The soul name must be unique.
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @param identityId TokenId of the soulbound identity that will be pointed from this soul name
    /// @param period Period of validity of the name
    function mint(
        address to,
        string memory name,
        uint256 identityId,
        uint256 period
    ) public override returns (uint256) {
        require(!isAvailable(name), "NAME_ALREADY_EXISTS");
        require(bytes(name).length > 0, "ZERO_LENGTH_NAME");
        require(period > 0, "ZERO_PERIOD");
        require(
            soulboundIdentity.ownerOf(identityId) != address(0),
            "IDENTITY_NOT_FOUND"
        );

        uint256 tokenId = _mintWithCounter(to);

        tokenData[tokenId].name = name;
        tokenData[tokenId].identityId = identityId;
        tokenData[tokenId].expirationDate = block.timestamp.add(period);

        string memory lowercaseName = _toLowerCase(name);
        nameData[lowercaseName].tokenId = tokenId;
        nameData[lowercaseName].exists = true;

        identityNames[identityId].push(lowercaseName);

        return tokenId;
    }

    /// @notice Update the identity id pointed from a soul name
    /// @dev The caller must be the owner or an approved address of the soul name.
    /// @param tokenId TokenId of the soul name
    /// @param identityId New TokenId of the soulbound identity that will be pointed from this soul name
    function updateIdentityId(uint256 tokenId, uint256 identityId) public {
        // ERC721: caller is not token owner nor approved
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721_CALLER_NOT_OWNER"
        );
        require(
            soulboundIdentity.ownerOf(identityId) != address(0),
            "IDENTITY_NOT_FOUND"
        );

        uint256 oldIdentityId = tokenData[tokenId].identityId;
        require(identityId != oldIdentityId, "SAME_VALUE");

        // change value from soulNames
        tokenData[tokenId].identityId = identityId;

        string memory lowercaseName = _toLowerCase(tokenData[tokenId].name);
        // remove name from identityNames[oldIdentityId]
        _removeFromIdentityNames(oldIdentityId, lowercaseName);

        // add name to identityNames[identityId]
        identityNames[identityId].push(lowercaseName);
    }

    /// @notice Update the expiration date of a soul name
    /// @dev The caller must be the owner or an approved address of the soul name.
    /// @param tokenId TokenId of the soul name
    /// @param period Period of validity of the name
    function renewPeriod(uint256 tokenId, uint256 period) public {
        // ERC721: caller is not token owner nor approved
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721_CALLER_NOT_OWNER"
        );
        require(period > 0, "ZERO_PERIOD");

        // TODO: review if we need to check if the name is expired
        // tokenData[tokenId].expirationDate = block.timestamp.add(period);
        tokenData[tokenId].expirationDate = tokenData[tokenId]
            .expirationDate
            .add(period);
    }

    /// @notice Burn a soul name
    /// @dev The caller must be the owner or an approved address of the soul name.
    /// @param tokenId TokenId of the soul name to burn
    function burn(uint256 tokenId) public override {
        require(_exists(tokenId), "TOKEN_NOT_FOUND");

        string memory lowercaseName = _toLowerCase(tokenData[tokenId].name);
        uint256 identityId = tokenData[tokenId].identityId;

        // remove info from tokenIdName and tokenData
        delete tokenData[tokenId];

        // TODO: if it's the current valid soul name
        delete nameData[lowercaseName];
        _removeFromIdentityNames(identityId, lowercaseName);

        super.burn(tokenId);
    }

    /* ========== VIEWS ========== */

    /// @notice Returns the extension of the soul name
    /// @dev This function is used to get the extension of the soul name
    /// @return Extension of the soul name
    function getExtension() external view override returns (string memory) {
        return extension;
    }

    /// @notice Checks if a soul name is available
    /// @dev This function queries if a soul name already exists and is in the available state
    /// @param name Name of the soul name
    /// @return available `true` if the soul name is available, `false` otherwise
    function isAvailable(string memory name)
        public
        view
        override
        returns (bool available)
    {
        string memory lowercaseName = _toLowerCase(name);
        if (nameData[lowercaseName].exists) {
            uint256 tokenId = nameData[lowercaseName].tokenId;
            available = tokenData[tokenId].expirationDate > block.timestamp;
        } else {
            return false;
        }
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
        override
        returns (
            string memory sbtName,
            uint256 identityId,
            uint256 expirationDate
        )
    {
        string memory lowercaseName = _toLowerCase(name);

        require(nameData[lowercaseName].exists, "NAME_NOT_FOUND");

        uint256 tokenId = nameData[lowercaseName].tokenId;

        TokenData memory _tokenData = tokenData[tokenId];
        return (
            _getName(_tokenData.name),
            _tokenData.identityId,
            _tokenData.expirationDate
        );
    }

    /// @notice Returns all the identity names of an account
    /// @dev This function queries all the identity names of the specified account
    /// @param owner Address of the owner of the identities
    /// @return sbtNames Array of soul names associated to the account
    function getSoulNames(address owner)
        external
        view
        override
        returns (string[] memory sbtNames)
    {
        // return identity id if exists
        uint256 identityId = soulboundIdentity.tokenOfOwner(owner);

        return getSoulNames(identityId);
    }

    /// @notice Returns all the identity names of an identity
    /// @dev This function queries all the identity names of the specified identity Id
    /// @param identityId TokenId of the identity
    /// @return sbtNames Array of soul names associated to the identity Id
    function getSoulNames(uint256 identityId)
        public
        view
        override
        returns (string[] memory sbtNames)
    {
        // TODO: review if the identity is active
        // return identity names if exists
        return identityNames[identityId];
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    function _toLowerCase(string memory _str)
        private
        pure
        returns (string memory)
    {
        bytes memory bStr = bytes(_str);
        bytes memory bLower = new bytes(bStr.length);

        for (uint256 i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((bStr[i] >= 0x41) && (bStr[i] <= 0x5A)) {
                // So we add 0x20 to make it lowercase
                bLower[i] = bytes1(uint8(bStr[i]) + 0x20);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    function _removeFromIdentityNames(uint256 identityId, string memory name)
        private
    {
        for (uint256 i = 0; i < identityNames[identityId].length; i++) {
            if (
                keccak256(abi.encodePacked((identityNames[identityId][i]))) ==
                keccak256(abi.encodePacked((name)))
            ) {
                identityNames[identityId][i] = identityNames[identityId][
                    identityNames[identityId].length - 1
                ];
                identityNames[identityId].pop();
                break;
            }
        }
    }

    function _getName(string memory name) private view returns (string memory) {
        return string(bytes.concat(bytes(name), bytes(extension)));
    }

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
