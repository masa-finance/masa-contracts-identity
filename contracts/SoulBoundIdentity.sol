pragma solidity ^0.8.0;

import "./SoulBoundToken.sol";

contract SoulBoundIdentity is SoulBoundToken {
    constructor(address owner) SoulBoundToken(owner, "Masa Identity", "MID") {}
}
