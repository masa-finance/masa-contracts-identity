// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

interface ISoulName {
    function nameExists(string memory name) external returns (bool exists);

    function getIdentityData(string memory name)
        external
        returns (string memory sbtName, uint256 identityId);

    function getIdentityNames(uint256 identityId)
        external
        view
        returns (string[] memory sbtNames);
}
