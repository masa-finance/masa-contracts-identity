// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./MasaSBT.sol";
import "../libraries/Errors.sol";

/// @title MasaSBTDynamic
/// @author Masa Finance
/// @notice MasaSBTDynamic. SBT with states
/// @dev Adds states to SBTs
abstract contract MasaSBTDynamic is MasaSBT {
    /* ========== STATE VARIABLES =========================================== */

    // states needed to be set before minting
    string[] internal _beforeMintStates;
    // states needed to be set after minting
    string[] internal _afterMintStates;

    // valid beforeMintStates
    mapping(string => bool) internal _validBeforeMintStates;
    // valid afterMintStates
    mapping(string => bool) internal _validAfterMintStates;

    // states for each address (beforeMintStates)
    mapping(address => mapping(string => bool)) public beforeMintState;
    // states for each token (afterMintStates)
    mapping(uint256 => mapping(string => bool)) public afterMintState;

    /* ========== INITIALIZE ================================================ */

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /// @notice Adds a beforeMintState
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param state New beforeMintState to add
    function addBeforeMintState(string memory state) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_validBeforeMintStates[state]) revert AlreadyAdded();
        _validBeforeMintStates[state] = true;

        _beforeMintStates.push(state);
    }

    /// @notice Adds a afterMintState
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param state New afterMintState to add
    function addAfterMintState(string memory state) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (_validAfterMintStates[state]) revert AlreadyAdded();
        _validAfterMintStates[state] = true;

        _afterMintStates.push(state);
    }

    /// @notice Removes a beforeMintState
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param state beforeMintState to remove
    function removeBeforeMintState(string memory state) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (!_validBeforeMintStates[state]) revert InvalidState(state);
        _validBeforeMintStates[state] = false;

        for (uint256 i = 0; i < _beforeMintStates.length; i++) {
            if (
                keccak256(bytes(_beforeMintStates[i])) ==
                keccak256(bytes(state))
            ) {
                _beforeMintStates[i] = _beforeMintStates[
                    _beforeMintStates.length - 1
                ];
                _beforeMintStates.pop();
                return;
            }
        }
    }

    /// @notice Removes a afterMintState
    /// @dev The caller must have the admin or project admin role to call this function
    /// @param state afterMintState to remove
    function removeAfterMintState(string memory state) external {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(PROJECT_ADMIN_ROLE, _msgSender())
        ) revert UserMustHaveProtocolOrProjectAdminRole();
        if (!_validAfterMintStates[state]) revert InvalidState(state);
        _validAfterMintStates[state] = false;

        for (uint256 i = 0; i < _afterMintStates.length; i++) {
            if (
                keccak256(bytes(_afterMintStates[i])) == keccak256(bytes(state))
            ) {
                _afterMintStates[i] = _afterMintStates[
                    _afterMintStates.length - 1
                ];
                _afterMintStates.pop();
                return;
            }
        }
    }

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    function getBeforeMintStates() external view returns (string[] memory) {
        return _beforeMintStates;
    }

    function getAfterMintStates() external view returns (string[] memory) {
        return _afterMintStates;
    }

    function allBeforeMintStatesSet(
        address account
    ) public view returns (bool) {
        uint _beforeMintStatesLength = _beforeMintStates.length;
        for (uint256 i = 0; i < _beforeMintStatesLength; i++) {
            if (!beforeMintState[account][_beforeMintStates[i]]) return false;
        }
        return true;
    }

    function allAfterMintStatesSet(
        uint256 tokenId
    ) external view returns (bool) {
        uint _afterMintStatesLength = _afterMintStates.length;
        for (uint256 i = 0; i < _afterMintStatesLength; i++) {
            if (!afterMintState[tokenId][_afterMintStates[i]]) return false;
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
        if (!_validBeforeMintStates[state]) revert InvalidState(state);
        beforeMintState[account][state] = value;

        emit BeforeMintStateSet(account, state, value);
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
        if (!_validAfterMintStates[state]) revert InvalidState(state);
        _requireMinted(tokenId);
        afterMintState[tokenId][state] = value;

        emit AfterMintStateSet(tokenId, state, value);
    }

    /// @notice Checks if a token can be minted
    /// @dev Checks if all beforeMintStates are set for the account
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (to != address(0)) {
            if (_beforeMintStates.length == 0) revert WithoutBeforeMintStates();
            if (!allBeforeMintStatesSet(to)) revert NotAllBeforeMintStatesSet();
        }
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */

    event BeforeMintStateSet(address account, string state, bool value);

    event AfterMintStateSet(uint256 tokenId, string state, bool value);
}
