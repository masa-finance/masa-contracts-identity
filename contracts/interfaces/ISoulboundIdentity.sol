// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "../tokens/SBT/ISBT.sol";

import "./ISoulName.sol";

interface ISoulboundIdentity is ISBT {
    function mint(address to) external payable returns (uint256);

    function mint(
        address paymentMethod,
        address to
    ) external payable returns (uint256);

    function mintIdentityWithName(
        address to,
        string memory name,
        uint256 yearsPeriod,
        string memory _tokenURI
    ) external payable returns (uint256);

    function mintIdentityWithName(
        address paymentMethod,
        address to,
        string memory name,
        uint256 yearsPeriod,
        string memory _tokenURI
    ) external payable returns (uint256);

    function getSoulName() external view returns (ISoulName);

    function tokenOfOwner(address owner) external view returns (uint256);
}
