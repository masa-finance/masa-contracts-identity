// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

interface ISoulLinker {
    struct SoulLink {
        // address sourceContract;
        // uint256 sourceId;
        // address targetContract;
        bool exists;
        uint256 tokenId; // targetId
        uint256 expirationDate; // if 0, no expiration date
    }

    struct LinkToSoul {
        bool exists;
        uint256 identityId;
    }

    function hasLinks(address token, uint256 tokenId)
        external
        view
        returns (bool);

    function createLink(
        uint256 identityId,
        address token,
        uint256 tokenId,
        uint256 expirationDate
    ) external;

    function breakLink(
        uint256 identityId,
        address token,
        uint256 tokenId
    ) external;
}
