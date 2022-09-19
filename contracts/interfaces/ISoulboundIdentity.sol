// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./ISoulName.sol";

interface ISoulboundIdentity {
    function mint(address to) external returns (uint256);

    function mintIdentityWithName(address to, string memory name)
        external
        payable
        returns (uint256);

    function getSoulName() external view returns (ISoulName);

    function ownerOf(uint256 tokenId) external view returns (address);

    function tokenOfOwner(address owner) external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256);

    // soulName();
}
