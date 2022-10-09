// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

interface ISoulLinker {
    struct LinkToSoul {
        bool exists;
        uint256 identityId;
        uint256 expirationDate; // if 0, no expiration date
    }

    function hasLinks(address token, uint256 tokenId)
        external
        view
        returns (bool);

    function createLink(
        address token,
        uint256 tokenId,
        uint256 expirationDate
    ) external;

    function removeLink(address token, uint256 tokenId) external;
}
