// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

interface ISoulName {
    function mint(
        address to,
        string memory name,
        uint256 identityId,
        uint256 period
    ) external returns (uint256);

    function getExtension() external view returns (string memory);

    function soulNameExists(string memory name)
        external
        view
        returns (bool exists);

    function getTokenData(string memory name)
        external
        view
        returns (
            string memory sbtName,
            uint256 identityId,
            uint256 expirationDate
        );

    function getSoulNames(address owner)
        external
        view
        returns (string[] memory sbtNames);

    function getSoulNames(uint256 identityId)
        external
        view
        returns (string[] memory sbtNames);
}
