// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

interface ISoulLinker {
    struct Link {
        address sourceContract;
        uint256 sourceId;
        address targetContract;
        uint256 targetId;
    }

    function hasLinks(address token, uint256 tokenId) external returns (bool);
}
