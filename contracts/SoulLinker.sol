// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISoulLinker.sol";

contract SoulLinker is Ownable, ISoulLinker {
    mapping(uint256 => Link) private links;

    constructor(address owner) Ownable() {
        Ownable.transferOwnership(owner);
    }

    function hasLinks(address token, uint256 tokenId) external returns (bool) {
        return false;
    }
}
