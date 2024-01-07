// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ISoulName {
    function mint(
        address to,
        string memory name,
        uint256 yearsPeriod,
        string memory _tokenURI
    ) external returns (uint256);

    function mint(
        address to,
        string memory name,
        uint256 yearsPeriod,
        uint256 fromDate,
        string memory _tokenURI
    ) external returns (uint256);

    function renewYearsPeriod(uint256 tokenId, uint256 yearsPeriod) external;

    function getExtension() external view returns (string memory);

    function isAvailable(
        string memory name
    ) external view returns (bool available);

    function tokenData(
        uint256 tokenId
    ) external view returns (string memory name, uint256 expirationDate);

    function getTokenData(
        string memory name
    )
        external
        view
        returns (
            string memory sbtName,
            bool linked,
            uint256 identityId,
            uint256 tokenId,
            uint256 expirationDate,
            bool active
        );

    function getTokenId(string memory name) external view returns (uint256);

    function getSoulNames(
        address owner
    ) external view returns (string[] memory sbtNames);

    function getSoulNames(
        uint256 identityId
    ) external view returns (string[] memory sbtNames);

    function ownerOf(uint256 tokenId) external view returns (address);

    function tokenURI(uint256 tokenId) external view returns (string memory);
}
