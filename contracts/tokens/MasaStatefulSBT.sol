// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./MasaSBT.sol";
import "../libraries/Errors.sol";

/// @title MasaStatefulSBT
/// @author Masa Finance
/// @notice MasaStatefulSBT. SBT with states
/// @dev Adds states to SBTs
abstract contract MasaStatefulSBT is MasaSBT {
    /* ========== STATE VARIABLES =========================================== */

    // states needed to be set before minting
    string[] internal _preMintStates;
    // states needed to be set after minting
    string[] internal _postMintStates;

    // valid preMintStates
    mapping(string => bool) internal _validPreMintStates;
    // valid postMintStates
    mapping(string => bool) internal _validPostMintStates;

    // states for each address (preMintStates)
    mapping(address => mapping(string => bool)) public addressStates;
    // states for each token (postMintStates)
    mapping(uint256 => mapping(string => bool)) public tokenStates;

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

    /// @notice Removes a preMintState
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _state preMintState to remove
    function removePreMintState(string memory _state) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (!_validPreMintStates[_state]) revert InvalidState(_state);
        _validPreMintStates[_state] = false;

        for (uint256 i = 0; i < _preMintStates.length; i++) {
            if (
                keccak256(bytes(_preMintStates[i])) == keccak256(bytes(_state))
            ) {
                _preMintStates[i] = _preMintStates[_preMintStates.length - 1];
                _preMintStates.pop();
                return;
            }
        }
    }

    /// @notice Removes a postMintState
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param _state postMintState to remove
    function removePostMintState(string memory _state) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (!_validPostMintStates[_state]) revert InvalidState(_state);
        _validPostMintStates[_state] = false;

        for (uint256 i = 0; i < _postMintStates.length; i++) {
            if (
                keccak256(bytes(_postMintStates[i])) == keccak256(bytes(_state))
            ) {
                _postMintStates[i] = _postMintStates[
                    _postMintStates.length - 1
                ];
                _postMintStates.pop();
                return;
            }
        }
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    function getPreMintStates() external view returns (string[] memory) {
        return _preMintStates;
    }

    function getPostMintStates() external view returns (string[] memory) {
        return _postMintStates;
    }

    function allPreMintStatesSet(address account) public view returns (bool) {
        for (uint256 i = 0; i < _preMintStates.length; i++) {
            if (!addressStates[account][_preMintStates[i]]) return false;
        }
        return true;
    }

    function allPostMintStatesSet(
        uint256 tokenId
    ) external view returns (bool) {
        for (uint256 i = 0; i < _postMintStates.length; i++) {
            if (!tokenStates[tokenId][_postMintStates[i]]) return false;
        }
        return true;
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /// @notice Sets a state for an account
    /// @dev
    /// @param account Account to set the state for
    /// @param state State to set
    /// @param value Value of the state
    function _setState(
        address account,
        string memory state,
        bool value
    ) internal {
        if (!_validPreMintStates[state]) revert InvalidState(state);
        addressStates[account][state] = value;
    }

    /// @notice Sets a state for a token
    /// @dev
    /// @param tokenId Token to set the state for
    /// @param state State to set
    /// @param value Value of the state
    function _setState(
        uint256 tokenId,
        string memory state,
        bool value
    ) internal {
        if (!_validPostMintStates[state]) revert InvalidState(state);
        _requireMinted(tokenId);
        tokenStates[tokenId][state] = value;
    }

    /// @notice Checks if a token can be minted
    /// @dev Checks if all preMintStates are set for the account
    function _beforeTokenTransfer(
        address,
        address to,
        uint256
    ) internal virtual override {
        if (to != address(0)) {
            if (!allPreMintStatesSet(to)) revert NotAllPreMintStatesSet();
        }
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
