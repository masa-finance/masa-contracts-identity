// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "../tokens/SBT/ISBT.sol";

import "./ISoulName.sol";

interface ISoulboundIdentity is ISBT {
    function mint(address to) external returns (uint256);

    function mintIdentityWithName(
        address to,
        string memory name,
        uint256 nameLength,
        uint256 yearsPeriod,
        string memory _tokenURI,
        address authorityAddress,
        bytes calldata signature
    ) external returns (uint256);

    function getSoulName() external view returns (ISoulName);

    function tokenOfOwner(address owner) external view returns (uint256);
}
