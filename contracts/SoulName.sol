// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./libraries/Utils.sol";
import "./interfaces/ISoulboundIdentity.sol";
import "./interfaces/ISoulName.sol";
import "./tokens/MasaNFT.sol";

/// @title SoulName NFT
/// @author Masa Finance
/// @notice SoulName NFT that points to a Soulbound identity token
/// @dev SoulName NFT, that inherits from the NFT contract, and points to a Soulbound identity token.
/// It has an extension, and stores all the information about the identity names.
contract SoulName is MasaNFT, ISoulName {
    /* ========== STATE VARIABLES ========== */
    using SafeMath for uint256;

    uint256 constant YEAR = 31536000; // 60 seconds * 60 minutes * 24 hours * 365 days

    ISoulboundIdentity public soulboundIdentity;
    string public extension; // suffix of the names (.sol?)

    // contractURI() points to the smart contract metadata
    // see https://docs.opensea.io/docs/contract-level-metadata
    string public contractURI;

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;
    mapping(string => bool) private _URIs; // used to check if a uri is already used

    mapping(uint256 => TokenData) public tokenData; // used to store the data of the token id
    mapping(string => NameData) public nameData; // stores the token id of the current active soul name

    struct TokenData {
        string name; // Name with lowercase and uppercase
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
    /// @param _contractURI URI of the smart contract metadata
    constructor(
        address owner,
        ISoulboundIdentity _soulboundIdentity,
        string memory _extension,
        string memory _contractURI
    ) MasaNFT(owner, "Masa Soul Name", "MSN", "") {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");

        soulboundIdentity = _soulboundIdentity;
        extension = _extension;
        contractURI = _contractURI;
    }

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Sets the SoulboundIdentity contract address linked to this soul name
    /// @dev The caller must have the owner to call this function
    /// @param _soulboundIdentity Address of the SoulboundIdentity contract
    function setSoulboundIdentity(ISoulboundIdentity _soulboundIdentity)
        external
        onlyOwner
    {
        require(address(_soulboundIdentity) != address(0), "ZERO_ADDRESS");
        require(soulboundIdentity != _soulboundIdentity, "SAME_VALUE");
        soulboundIdentity = _soulboundIdentity;
    }

    /// @notice Sets the extension of the soul name
    /// @dev The caller must have the owner to call this function
    /// @param _extension Extension of the soul name
    function setExtension(string memory _extension) external onlyOwner {
        require(
            keccak256(abi.encodePacked((extension))) !=
                keccak256(abi.encodePacked((_extension))),
            "SAME_VALUE"
        );
        extension = _extension;
    }

    /// @notice Sets the URI of the smart contract metadata
    /// @dev The caller must have the owner to call this function
    /// @param _contractURI URI of the smart contract metadata
    function setContractURI(string memory _contractURI) external onlyOwner {
        require(
            keccak256(abi.encodePacked((contractURI))) !=
                keccak256(abi.encodePacked((_contractURI))),
            "SAME_VALUE"
        );
        contractURI = _contractURI;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Mints a new soul name
    /// @dev The caller can mint more than one name. The soul name must be unique.
    /// @param to Address of the owner of the new soul name
    /// @param name Name of the new soul name
    /// @param identityId TokenId of the soulbound identity that will be pointed from this soul name
    /// @param yearsPeriod Years of validity of the name
    /// @param _tokenURI URI of the NFT
    function mint(
        address to,
        string memory name,
        uint256 identityId,
        uint256 yearsPeriod,
        string memory _tokenURI
    ) public override returns (uint256) {
        require(isAvailable(name), "NAME_ALREADY_EXISTS");
        require(bytes(name).length > 0, "ZERO_LENGTH_NAME");
        require(yearsPeriod > 0, "ZERO_YEARS_PERIOD");
        require(
            soulboundIdentity.ownerOf(identityId) != address(0),
            "IDENTITY_NOT_FOUND"
        );
        require(
            Utils.startsWith(_tokenURI, "ar://") ||
                Utils.startsWith(_tokenURI, "ipfs://"),
            "INVALID_TOKEN_URI"
        );

        uint256 tokenId = _mintWithCounter(to);
        _setTokenURI(tokenId, _tokenURI);

        tokenData[tokenId].name = name;
        tokenData[tokenId].identityId = identityId;
        tokenData[tokenId].expirationDate = block.timestamp.add(
            YEAR.mul(yearsPeriod)
        );

        string memory lowercaseName = Utils.toLowerCase(name);
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

        string memory lowercaseName = Utils.toLowerCase(
            tokenData[tokenId].name
        );
        // remove name from identityNames[oldIdentityId]
        Utils.removeStringFromArray(
            identityNames[oldIdentityId],
            lowercaseName
        );

        // add name to identityNames[identityId]
        identityNames[identityId].push(lowercaseName);

        emit IdentityIdUpdated(tokenId, oldIdentityId, identityId);
    }

    /// @notice Update the expiration date of a soul name
    /// @dev The caller must be the owner or an approved address of the soul name.
    /// @param tokenId TokenId of the soul name
    /// @param yearsPeriod Years of validity of the name
    function renewYearsPeriod(uint256 tokenId, uint256 yearsPeriod) public {
        // ERC721: caller is not token owner nor approved
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721_CALLER_NOT_OWNER"
        );
        require(yearsPeriod > 0, "ZERO_YEARS_PERIOD");

        // check that the last registered tokenId for that name is the current token
        string memory lowercaseName = Utils.toLowerCase(
            tokenData[tokenId].name
        );
        require(nameData[lowercaseName].exists, "NAME_NOT_FOUND");
        require(nameData[lowercaseName].tokenId == tokenId, "CAN_NOT_RENEW");

        // check if the name is expired
        if (tokenData[tokenId].expirationDate < block.timestamp) {
            tokenData[tokenId].expirationDate = block.timestamp.add(
                YEAR.mul(yearsPeriod)
            );
        } else {
            tokenData[tokenId].expirationDate = tokenData[tokenId]
                .expirationDate
                .add(YEAR.mul(yearsPeriod));
        }

        emit YearsPeriodRenewed(
            tokenId,
            yearsPeriod,
            tokenData[tokenId].expirationDate
        );
    }

    /// @notice Burn a soul name
    /// @dev The caller must be the owner or an approved address of the soul name.
    /// @param tokenId TokenId of the soul name to burn
    function burn(uint256 tokenId) public override {
        require(_exists(tokenId), "TOKEN_NOT_FOUND");

        string memory lowercaseName = Utils.toLowerCase(
            tokenData[tokenId].name
        );
        uint256 identityId = tokenData[tokenId].identityId;

        // remove info from tokenIdName and tokenData
        delete tokenData[tokenId];

        // if the last owner of the name is burning it, remove the name from nameData
        if (nameData[lowercaseName].tokenId == tokenId) {
            delete nameData[lowercaseName];
        }
        Utils.removeStringFromArray(identityNames[identityId], lowercaseName);

        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
            _URIs[_tokenURIs[tokenId]] = false;
        }

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
        string memory lowercaseName = Utils.toLowerCase(name);
        if (nameData[lowercaseName].exists) {
            uint256 tokenId = nameData[lowercaseName].tokenId;
            return tokenData[tokenId].expirationDate < block.timestamp;
        } else {
            return true;
        }
    }

    /// @notice Returns the information of a soul name
    /// @dev This function queries the information of a soul name
    /// @param name Name of the soul name
    /// @return sbtName Soul name, in upper/lower case and extension
    /// @return identityId Identity id of the soul name
    /// @return tokenId SoulName id of the soul name
    /// @return expirationDate Expiration date of the soul name
    /// @return active `true` if the soul name is active, `false` otherwise
    function getTokenData(string memory name)
        external
        view
        override
        returns (
            string memory sbtName,
            uint256 identityId,
            uint256 tokenId,
            uint256 expirationDate,
            bool active
        )
    {
        tokenId = _getTokenId(name);

        TokenData memory _tokenData = tokenData[tokenId];
        return (
            _getName(_tokenData.name),
            _tokenData.identityId,
            tokenId,
            _tokenData.expirationDate,
            _tokenData.expirationDate >= block.timestamp
        );
    }

    /// @notice Returns the token id of a soul name
    /// @dev This function queries the token id of a soul name
    /// @param name Name of the soul name
    /// @return SoulName id of the soul name
    function getTokenId(string memory name)
        external
        view
        override
        returns (uint256)
    {
        return _getTokenId(name);
    }

    /// @notice Returns all the active soul names of an account
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

    /// @notice Returns all the active soul names of an account
    /// @dev This function queries all the identity names of the specified identity Id
    /// @param identityId TokenId of the identity
    /// @return sbtNames Array of soul names associated to the identity Id
    function getSoulNames(uint256 identityId)
        public
        view
        override
        returns (string[] memory sbtNames)
    {
        uint256 results;
        for (uint256 i = 0; i < identityNames[identityId].length; i++) {
            string memory lowercaseName = identityNames[identityId][i];

            if (nameData[lowercaseName].exists) {
                uint256 tokenId = nameData[lowercaseName].tokenId;
                if (tokenData[tokenId].expirationDate >= block.timestamp) {
                    results = results.add(1);
                }
            }
        }

        string[] memory _sbtNames = new string[](results);
        uint256 index;

        for (uint256 i = 0; i < identityNames[identityId].length; i++) {
            string memory lowercaseName = identityNames[identityId][i];

            if (nameData[lowercaseName].exists) {
                uint256 tokenId = nameData[lowercaseName].tokenId;
                if (tokenData[tokenId].expirationDate >= block.timestamp) {
                    _sbtNames[index] = lowercaseName;
                    index = index.add(1);
                }
            }
        }

        // return identity names if exists and are active
        return _sbtNames;
    }

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev This function returns the token URI of the soul name specified by the name
    /// @param name Name of the soul name
    /// @return URI of the soulname associated to a name
    function tokenURI(string memory name)
        public
        view
        virtual
        returns (string memory)
    {
        uint256 tokenId = _getTokenId(name);
        return tokenURI(tokenId);
    }

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    /// @param tokenId NFT to get the URI of
    /// @return URI of the NFT
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    function _getName(string memory name) private view returns (string memory) {
        return string(bytes.concat(bytes(name), bytes(extension)));
    }

    function _getTokenId(string memory name) private view returns (uint256) {
        string memory lowercaseName = Utils.toLowerCase(name);
        require(nameData[lowercaseName].exists, "NAME_NOT_FOUND");

        return nameData[lowercaseName].tokenId;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI)
        internal
        virtual
    {
        require(
            _exists(tokenId),
            "ERC721URIStorage: URI set of nonexistent token"
        );
        require(_URIs[_tokenURI] == false, "URI_ALREADY_EXISTS");

        _tokenURIs[tokenId] = _tokenURI;
        _URIs[_tokenURI] = true;
    }

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */

    event IdentityIdUpdated(
        uint256 tokenId,
        uint256 oldIdentityId,
        uint256 identityId
    );

    event YearsPeriodRenewed(
        uint256 tokenId,
        uint256 yearsPeriod,
        uint256 newExpirationDate
    );
}
