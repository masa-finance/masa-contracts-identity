// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

interface ISoulName {
    function mint(address to, string memory name) external returns (uint256);

    function getExtension() external view returns (string memory);

    function soulNameExists(string memory name) external view returns (bool exists);

    function getIdentityData(string memory name)
        external
        view
        returns (string memory sbtName, uint256 identityId);

    function getIdentityNames(address owner)
        external
        view
        returns (string[] memory sbtNames);

    function getIdentityNames(uint256 identityId)
        external
        view
        returns (string[] memory sbtNames);
}
