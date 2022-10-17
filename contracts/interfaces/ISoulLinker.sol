// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

interface ISoulLinker {
    function hasLinks(address token, uint256 tokenId)
        external
        view
        returns (bool);
}
