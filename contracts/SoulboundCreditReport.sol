// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./tokens/SBT.sol";

/// @title Soulbound Credit Report
/// @author Masa Finance
/// @notice Soulbound token that represents a credit report.
contract SoulboundCreditReport is SBT {

    /// @notice Creates a new soulbound credit report
    /// @dev Creates a new soulbound credit report, inheriting from the SBT contract.
    /// @param owner Owner of the smart contract
    /// @param _soulLinker Address of the SoulLinker contract
    /// @param baseTokenURI Base URI of the token
    constructor(
        address owner,
        SoulLinker _soulLinker,
        string memory baseTokenURI
    ) SBT(owner, _soulLinker, "Masa Credit Report", "MCR", baseTokenURI) {}
}
