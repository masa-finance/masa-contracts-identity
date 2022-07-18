pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

abstract contract SoulBoundToken is ERC721PresetMinterPauserAutoId, Ownable {
    constructor(
        address owner,
        string memory name,
        string memory ticker
    )
        ERC721PresetMinterPauserAutoId(
            name,
            ticker,
            "https://masa.finance/v1.0/{id}"
        )
        Ownable()
    {
        _setupRole(MINTER_ROLE, owner);
        Ownable.transferOwnership(owner);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {}

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {}

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {}
}
