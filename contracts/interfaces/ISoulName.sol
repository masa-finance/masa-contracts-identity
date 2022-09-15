// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

interface ISoulName {
    function mint(
        address to,
        string memory name,
        uint256 identityId
    ) external returns (uint256);

    function getExtension() external view returns (string memory);

    function nameExists(string memory name) external returns (bool exists);

    function getIdentityData(string memory name)
        external
        returns (string memory sbtName, uint256 identityId);

    function getIdentityNames(uint256 identityId)
        external
        view
        returns (string[] memory sbtNames);

    // extension
}
