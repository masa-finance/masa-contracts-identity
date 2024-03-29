// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

error AddressDoesNotHaveIdentity(address to);
error AlreadyAdded();
error AuthorityNotExists(address authority);
error CallerNotOwner(address caller);
error CallerNotReader(address caller);
error IdentityOwnerIsReader(uint256 readerIdentityId);
error InsufficientEthAmount(uint256 amount);
error IdentityOwnerNotTokenOwner(uint256 tokenId, uint256 ownerIdentityId);
error InvalidPaymentMethod(address paymentMethod);
error InvalidSignature();
error InvalidSignatureDate(uint256 signatureDate);
error InvalidState(string state);
error InvalidToken(address token);
error InvalidTokenURI(string tokenURI);
error LinkAlreadyExists(
    address token,
    uint256 tokenId,
    uint256 readerIdentityId,
    uint256 signatureDate
);
error LinkAlreadyRevoked();
error LinkDoesNotExist();
error MaxSBTMinted(address to, uint256 maximum);
error NameAlreadyExists(string name);
error NameNotFound(string name);
error NameRegisteredByOtherAccount(string name, uint256 tokenId);
error NotAllBeforeMintStatesSet();
error NotAuthorized(address signer);
error NonExistingErc20Token(address erc20token);
error NotLinkedToAnIdentitySBT();
error PaymentParamsNotSet();
error ProtocolFeeReceiverNotSet();
error RefundFailed();
error SameValue();
error SBTAlreadyLinked(address token);
error SoulNameContractNotSet();
error SoulNameNotExist();
error SoulNameNotRegistered(address token);
error StateNotSet(string state);
error TokenNotFound(uint256 tokenId);
error TransferFailed();
error URIAlreadyExists(string tokenURI);
error UserMustHaveProtocolOrProjectAdminRole();
error ValidPeriodExpired(uint256 expirationDate);
error WithoutBeforeMintStates();
error ZeroAddress();
error ZeroLengthName(string name);
error ZeroYearsPeriod(uint256 yearsPeriod);
