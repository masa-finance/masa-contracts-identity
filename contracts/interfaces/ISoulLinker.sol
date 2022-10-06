// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

interface ISoulLinker {
    struct Link {
        // address sourceContract;
        // uint256 sourceId;
        // address targetContract;
        uint256 targetId;
        uint256 expirationDate; // if 0, no expiration date
    }

    function hasLinks(address token, uint256 tokenId)
        external
        view
        returns (bool);
}
