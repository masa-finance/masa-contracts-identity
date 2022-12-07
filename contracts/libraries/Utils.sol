// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

/// @title Utilities library for Masa Contracts Identity repository
/// @author Masa Finance
/// @notice Library of utilities for Masa Contracts Identity repository
library Utils {
    struct slice {
        uint256 _len;
        uint256 _ptr;
    }

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

    function toSlice(string memory self) internal pure returns (slice memory) {
        uint256 ptr;
        assembly {
            ptr := add(self, 0x20)
        }
        return slice(bytes(self).length, ptr);
    }

    function startsWith(string memory str, string memory needle)
        internal
        pure
        returns (bool)
    {
        slice memory s_str = toSlice(str);
        slice memory s_needle = toSlice(needle);

        if (s_str._len < s_needle._len) {
            return false;
        }

        if (s_str._ptr == s_needle._ptr) {
            return true;
        }

        bool equal;
        assembly {
            let length := mload(s_needle)
            let selfptr := mload(add(s_str, 0x20))
            let needleptr := mload(add(s_needle, 0x20))
            equal := eq(
                keccak256(selfptr, length),
                keccak256(needleptr, length)
            )
        }
        return equal;
    }

    function utfStringLength(string memory s) internal pure returns (uint256) {
        uint256 len;
        uint256 i = 0;
        uint256 bytelength = bytes(s).length;

        for (len = 0; i < bytelength; len++) {
            bytes1 b = bytes(s)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
        return len;
    }
}
