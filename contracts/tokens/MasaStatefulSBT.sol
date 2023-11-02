// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./MasaSBT.sol";
import "../libraries/Errors.sol";

/// @title MasaStatefulSBT
/// @author Masa Finance
/// @notice MasaStatefulSBT. SBT with states
/// @dev Adds states to SBTs
abstract contract MasaStatefulSBT is MasaSBT
{
    /* ========== STATE VARIABLES =========================================== */

    // states needed to be set before minting
    string[] internal _preMintStates;
    // states needed to be set after minting
    string[] internal _postMintStates;

    // valid preMintStates
    mapping (string => bool) internal _validPreMintStates;
    // valid postMintStates
    mapping (string => bool) internal _validPostMintStates;

    // states for each address (preMintStates)
    mapping (address => mapping (string => bool)) public addressStates;
    // states for each token (postMintStates)
    mapping (uint256 => mapping (string => bool)) public tokenIdStates;

    /* ========== INITIALIZE ================================================ */

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Adds a preMintState
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _state New preMintState to add
    function addPreMintState(string memory _state) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_validPreMintStates[_state]) revert AlreadyAdded();
        _validPreMintStates[_state] = true;

        _preMintStates.push(_state);
    }

    /// @notice Adds a postMintState
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _state New postMintState to add
    function addPostMintState(string memory _state) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_validPostMintStates[_state]) revert AlreadyAdded();
        _validPostMintStates[_state] = true;

        _postMintStates.push(_state);
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
