// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

error AlreadyAdded();
error CallerNotOwner(address caller);
error CreditScoreAlreadyCreated(address to);
error IdentityAlreadyCreated(address to);
error InvalidPaymentMethod(address paymentMethod);
error InvalidSignature();
error NotAuthorized(address signer);
error SameValue();
error SoulNameContractNotSet();
error ZeroAddress();
