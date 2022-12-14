// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

error AlreadyAdded();
error CallerNotOwner(address caller);
error CreditScoreAlreadyCreated(address to);
error IdentityAlreadyCreated(address to);
error InsufficientEthAmount(uint256 amount);
error InvalidPaymentMethod(address paymentMethod);
error InvalidSignature();
error InvalidToken(address token);
error InvalidTokenURI(string tokenURI);
error NotAuthorized(address signer);
error NonExistingErc20Token(address erc20token);
error RefundFailed();
error SameValue();
error SoulNameContractNotSet();
error TransferFailed();
error ZeroAddress();
