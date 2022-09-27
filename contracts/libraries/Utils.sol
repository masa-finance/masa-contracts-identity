// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

/// @title Utilities library for Masa Contracts Identity repository
/// @author Masa Finance
/// @notice Library of utilities for Masa Contracts Identity repository
library Utils {
    function toLowerCase(string memory _str)
        internal
        pure
        returns (string memory)
    {
        bytes memory bStr = bytes(_str);
        bytes memory bLower = new bytes(bStr.length);

        for (uint256 i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((bStr[i] >= 0x41) && (bStr[i] <= 0x5A)) {
                // So we add 0x20 to make it lowercase
                bLower[i] = bytes1(uint8(bStr[i]) + 0x20);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    function removeStringFromArray(string[] storage array, string memory name)
        internal
    {
        for (uint256 i = 0; i < array.length; i++) {
            if (
                keccak256(abi.encodePacked((array[i]))) ==
                keccak256(abi.encodePacked((name)))
            ) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
}
