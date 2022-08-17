// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SoulBoundIdentity.sol";
import "./SoulBoundName.sol";

contract SoulBoundFactory is Ownable {
    SoulBoundIdentity public soulBoundIdentity;
    SoulBoundName public soulBoundName;

    constructor(
        address owner,
        SoulBoundIdentity _soulBoundIdentity,
        SoulBoundName _soulBoundName
    ) Ownable() {
        require(address(_soulBoundIdentity) != address(0), "ZERO_ADDRESS");
        require(address(_soulBoundName) != address(0), "ZERO_ADDRESS");

        Ownable.transferOwnership(owner);

        soulBoundIdentity = _soulBoundIdentity;
        soulBoundName = _soulBoundName;
    }

    function setSoulBoundIdentity(SoulBoundIdentity _soulBoundIdentity)
        external
        onlyOwner
    {
        require(soulBoundIdentity != _soulBoundIdentity, "SAME_VALUE");
        soulBoundIdentity = _soulBoundIdentity;
    }

    function setSoulBoundName(SoulBoundName _soulBoundName) external onlyOwner {
        require(soulBoundName != _soulBoundName, "SAME_VALUE");
        soulBoundName = _soulBoundName;
    }
}
