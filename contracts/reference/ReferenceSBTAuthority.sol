// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../tokens/MasaSBTAuthority.sol";

/// @title Soulbound reference Authority SBT
/// @author Masa Finance
/// @notice Soulbound token that represents a Authority SBT
/// @dev Inherits from the SBT contract.
contract ReferenceSBTAuthority is MasaSBTAuthority {
    /// @notice Creates a new Authority SBT
    /// @dev Creates a new Authority SBT, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) MasaSBTAuthority(admin, name, symbol, baseTokenURI) {}

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param to Address of the owner of the new identity
    /// @return The NFT ID of the newly minted SBT
    function mint(address to) public returns (uint256) {
        uint256 tokenId = _mintWithCounter(to);

        emit Minted(tokenId, to);

        return tokenId;
    }

    event Minted(uint256 tokenId, address to);
}
