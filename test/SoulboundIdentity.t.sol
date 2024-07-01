// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import "../contracts/SoulboundIdentity.sol";
import "../contracts/dex/PaymentGateway.sol";

contract SoulboundIdentityTest is Test {
    SoulboundIdentity public soulboundIdentity;

    address public owner = address(0x1);
    address public protocolWallet = address(0x2);
    address public someone = address(0x3);
    address public address1 = address(0x4);
    address public address2 = address(0x5);

    function setUp() public {
        PaymentGateway.PaymentParams memory paymentParams = PaymentGateway
            .PaymentParams({
                swapRouter: 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008,
                wrappedNativeToken: 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9,
                stableCoin: 0xf8187B6F83790e533DFAB746cAE3B2507c1196Ae,
                masaToken: 0x300fa0B0a9d373988394EEBFe66E03f90bb419E3,
                projectFeeReceiver: owner,
                protocolFeeReceiver: address(0),
                protocolFeeAmount: 0,
                protocolFeePercent: 0,
                protocolFeePercentSub: 0
            });

        soulboundIdentity = new SoulboundIdentity(
            owner,
            "Masa Identity",
            "MID",
            "https://beta.metadata.masa.finance/v1.0/identity/anvil/",
            paymentParams
        );
    }

    function testDeployment() public view {
        // Check name and symbol
        assertEq(soulboundIdentity.name(), "Masa Identity");
        assertEq(soulboundIdentity.symbol(), "MID");

        // Check total supply
        assertEq(soulboundIdentity.totalSupply(), 0);
    }

    function testSupportsInterface() public view {
        // Check ERC165
        assert(soulboundIdentity.supportsInterface(0x01ffc9a7));
    }
}
