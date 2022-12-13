 - [ ] ID-50
Reentrancy in [SoulName.mint(address,string,uint256,string)](contracts/SoulName.sol#L114-L146):
        External calls:
        - [tokenId = _mintWithCounter(to)](contracts/SoulName.sol#L133)
                - [IERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,data)](node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#L401-L412)
        State variables written after the call(s):
        - [_setTokenURI(tokenId,_tokenURI)](contracts/SoulName.sol#L134)
                - [_URIs[_tokenURI] = true](contracts/SoulName.sol#L415)
        - [_setTokenURI(tokenId,_tokenURI)](contracts/SoulName.sol#L134)
                - [_tokenURIs[tokenId] = _tokenURI](contracts/SoulName.sol#L414)

contracts/SoulName.sol#L114-L146


## reentrancy-events
Impact: Low
Confidence: Medium
 - [ ] ID-51
Reentrancy in [SoulStore.purchaseName(address,string,uint256,string,address)](contracts/SoulStore.sol#L146-L160):
        External calls:
        - [_pay(paymentMethod,getNameRegistrationPricePerYear(name).mul(yearsPeriod))](contracts/SoulStore.sol#L153-L156)
                - [returndata = address(token).functionCall(data,SafeERC20: low-level call failed)](node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L110)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,amountInStableCoin)](contracts/dex/PaymentGateway.sol#L194-L198)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,swapAmout_scope_0)](contracts/dex/PaymentGateway.sol#L205-L209)
        - [_mintSoulName(to,name,yearsPeriod,_tokenURI)](contracts/SoulStore.sol#L159)
                - [tokenId = soulName.mint(to,name,yearsPeriod,_tokenURI)](contracts/SoulStore.sol#L268)
        External calls sending eth:
        - [_pay(paymentMethod,getNameRegistrationPricePerYear(name).mul(yearsPeriod))](contracts/SoulStore.sol#L153-L156)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
        Event emitted after the call(s):
        - [SoulNamePurchased(to,tokenId,name,yearsPeriod)](contracts/SoulStore.sol#L270)
                - [_mintSoulName(to,name,yearsPeriod,_tokenURI)](contracts/SoulStore.sol#L159)

contracts/SoulStore.sol#L146-L160


 - [ ] ID-52
Reentrancy in [SoulLinker.addPermission(address,uint256,uint256,address,uint256,string,uint256,uint256,bytes)](contracts/SoulLinker.sol#L148-L209):
        External calls:
        - [_payWithMASA(addPermissionPriceMASA)](contracts/SoulLinker.sol#L186)
                - [returndata = address(token).functionCall(data,SafeERC20: low-level call failed)](node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L110)
                - [IERC20(masaToken).safeTransferFrom(msg.sender,reserveWallet,amountInMASA)](contracts/dex/PaymentGateway.sol#L223-L227)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
        - [_pay(paymentMethod,addPermissionPrice)](contracts/SoulLinker.sol#L189)
                - [returndata = address(token).functionCall(data,SafeERC20: low-level call failed)](node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L110)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,amountInStableCoin)](contracts/dex/PaymentGateway.sol#L194-L198)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,swapAmout_scope_0)](contracts/dex/PaymentGateway.sol#L205-L209)
        External calls sending eth:
        - [_payWithMASA(addPermissionPriceMASA)](contracts/SoulLinker.sol#L186)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
        - [_pay(paymentMethod,addPermissionPrice)](contracts/SoulLinker.sol#L189)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
        Event emitted after the call(s):
        - [PermissionAdded(readerIdentityId,ownerIdentityId,token,tokenId,data,signatureDate,expirationDate)](contracts/SoulLinker.sol#L200-L208)

contracts/SoulLinker.sol#L148-L209


 - [ ] ID-53
Reentrancy in [SoulStore._mintSoulName(address,string,uint256,string)](contracts/SoulStore.sol#L259-L273):
        External calls:
        - [tokenId = soulName.mint(to,name,yearsPeriod,_tokenURI)](contracts/SoulStore.sol#L268)
        Event emitted after the call(s):
        - [SoulNamePurchased(to,tokenId,name,yearsPeriod)](contracts/SoulStore.sol#L270)

contracts/SoulStore.sol#L259-L273


 - [ ] ID-54
Reentrancy in [SoulStore._mintSoulboundIdentity(address)](contracts/SoulStore.sol#L242-L249):
        External calls:
        - [tokenId = soulboundIdentity.mint(to)](contracts/SoulStore.sol#L244)
        Event emitted after the call(s):
        - [SoulboundIdentityPurchased(to,tokenId)](contracts/SoulStore.sol#L246)

contracts/SoulStore.sol#L242-L249


 - [ ] ID-55
Reentrancy in [Soulbound2FA.mint(address,uint256,address,uint256,bytes)](contracts/Soulbound2FA.sol#L52-L82):
        External calls:
        - [_pay(paymentMethod,mintingPrice)](contracts/Soulbound2FA.sol#L68)
                - [returndata = address(token).functionCall(data,SafeERC20: low-level call failed)](node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L110)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,amountInStableCoin)](contracts/dex/PaymentGateway.sol#L194-L198)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,swapAmout_scope_0)](contracts/dex/PaymentGateway.sol#L205-L209)
        External calls sending eth:
        - [_pay(paymentMethod,mintingPrice)](contracts/Soulbound2FA.sol#L68)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
        Event emitted after the call(s):
        - [Mint(to,tokenId)](contracts/tokens/SBT/SBT.sol#L174)
                - [tokenId = _mintWithCounter(to)](contracts/Soulbound2FA.sol#L70)
        - [Soulbound2FAMinted(tokenId,identityId,authorityAddress,signatureDate,paymentMethod,mintingPrice)](contracts/Soulbound2FA.sol#L72-L79)

contracts/Soulbound2FA.sol#L52-L82


 - [ ] ID-56
Reentrancy in [SoulStore.purchaseIdentityAndName(address,string,uint256,string)](contracts/SoulStore.sol#L103-L122):
        External calls:
        - [_pay(paymentMethod,getNameRegistrationPricePerYear(name).mul(yearsPeriod))](contracts/SoulStore.sol#L109-L112)
                - [returndata = address(token).functionCall(data,SafeERC20: low-level call failed)](node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L110)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,amountInStableCoin)](contracts/dex/PaymentGateway.sol#L194-L198)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,swapAmout_scope_0)](contracts/dex/PaymentGateway.sol#L205-L209)
        - [_mintSoulboundIdentityAndName(_msgSender(),name,yearsPeriod,_tokenURI)](contracts/SoulStore.sol#L115-L121)
                - [tokenId = soulboundIdentity.mintIdentityWithName(to,name,yearsPeriod,_tokenURI)](contracts/SoulStore.sol#L225-L230)
        External calls sending eth:
        - [_pay(paymentMethod,getNameRegistrationPricePerYear(name).mul(yearsPeriod))](contracts/SoulStore.sol#L109-L112)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
        Event emitted after the call(s):
        - [SoulboundIdentityAndNamePurchased(to,tokenId,name,yearsPeriod)](contracts/SoulStore.sol#L232)
                - [_mintSoulboundIdentityAndName(_msgSender(),name,yearsPeriod,_tokenURI)](contracts/SoulStore.sol#L115-L121)

contracts/SoulStore.sol#L103-L122


 - [ ] ID-57
Reentrancy in [SoulboundCreditScore.mint(address,uint256,address,uint256,bytes)](contracts/SoulboundCreditScore.sol#L52-L83):
        External calls:
        - [_pay(paymentMethod,mintingPrice)](contracts/SoulboundCreditScore.sol#L69)
                - [returndata = address(token).functionCall(data,SafeERC20: low-level call failed)](node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L110)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,amountInStableCoin)](contracts/dex/PaymentGateway.sol#L194-L198)
                - [IERC20(paymentMethod).safeTransferFrom(msg.sender,reserveWallet,swapAmout_scope_0)](contracts/dex/PaymentGateway.sol#L205-L209)
        External calls sending eth:
        - [_pay(paymentMethod,mintingPrice)](contracts/SoulboundCreditScore.sol#L69)
                - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)
                - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
                - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)
        Event emitted after the call(s):
        - [Mint(to,tokenId)](contracts/tokens/SBT/SBT.sol#L174)
                - [tokenId = _mintWithCounter(to)](contracts/SoulboundCreditScore.sol#L71)
        - [SoulboundCreditScoreMinted(tokenId,identityId,authorityAddress,signatureDate,paymentMethod,mintingPrice)](contracts/SoulboundCreditScore.sol#L73-L80)

contracts/SoulboundCreditScore.sol#L52-L83


 - [ ] ID-58
Reentrancy in [SoulStore._mintSoulboundIdentityAndName(address,string,uint256,string)](contracts/SoulStore.sol#L218-L235):
        External calls:
        - [tokenId = soulboundIdentity.mintIdentityWithName(to,name,yearsPeriod,_tokenURI)](contracts/SoulStore.sol#L225-L230)
        Event emitted after the call(s):
        - [SoulboundIdentityAndNamePurchased(to,tokenId,name,yearsPeriod)](contracts/SoulStore.sol#L232)

contracts/SoulStore.sol#L218-L235


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-59
[SoulLinker.addPermission(address,uint256,uint256,address,uint256,string,uint256,uint256,bytes)](contracts/SoulLinker.sol#L148-L209) uses timestamp for comparisons
        Dangerous comparisons:
        - [require(bool,string)(expirationDate >= block.timestamp,VALID_PERIOD_EXPIRED)](contracts/SoulLinker.sol#L166)

contracts/SoulLinker.sol#L148-L209


 - [ ] ID-60
[SoulName.getSoulNames(address)](contracts/SoulName.sol#L316-L345) uses timestamp for comparisons
        Dangerous comparisons:
        - [tokenData[tokenId].expirationDate >= block.timestamp](contracts/SoulName.sol#L327)
        - [tokenData[tokenId_scope_1].expirationDate >= block.timestamp](contracts/SoulName.sol#L337)

contracts/SoulName.sol#L316-L345


 - [ ] ID-61
[SoulName.isAvailable(string)](contracts/SoulName.sol#L226-L239) uses timestamp for comparisons
        Dangerous comparisons:
        - [tokenData[tokenId].expirationDate < block.timestamp](contracts/SoulName.sol#L235)

contracts/SoulName.sol#L226-L239


 - [ ] ID-62
[SoulName.renewYearsPeriod(uint256,uint256)](contracts/SoulName.sol#L152-L185) uses timestamp for comparisons
        Dangerous comparisons:
        - [tokenData[tokenId].expirationDate < block.timestamp](contracts/SoulName.sol#L170)

contracts/SoulName.sol#L152-L185


 - [ ] ID-63
[SoulLinker.validatePermission(uint256,uint256,address,uint256,uint256)](contracts/SoulLinker.sol#L342-L369) uses timestamp for comparisons
        Dangerous comparisons:
        - [require(bool,string)(permission.expirationDate >= block.timestamp,VALID_PERIOD_EXPIRED)](contracts/SoulLinker.sol#L362-L365)

contracts/SoulLinker.sol#L342-L369


 - [ ] ID-64
[SoulName.getTokenData(string)](contracts/SoulName.sol#L250-L281) uses timestamp for comparisons
        Dangerous comparisons:
        - [(_getName(_tokenData.name),_linked,_identityId,tokenId,_tokenData.expirationDate,_tokenData.expirationDate >= block.timestamp)](contracts/SoulName.sol#L273-L280)

contracts/SoulName.sol#L250-L281


## assembly
Impact: Informational
Confidence: High
 - [ ] ID-65
[ECDSA.tryRecover(bytes32,bytes)](node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol#L57-L74) uses assembly
        - [INLINE ASM](node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol#L65-L69)

node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol#L57-L74


 - [ ] ID-66
[Utils.startsWith(string,string)](contracts/libraries/Utils.sol#L41-L68) uses assembly
        - [INLINE ASM](contracts/libraries/Utils.sol#L58-L66)

contracts/libraries/Utils.sol#L41-L68


 - [ ] ID-67
[Address.verifyCallResult(bool,bytes,string)](node_modules/@openzeppelin/contracts/utils/Address.sol#L201-L221) uses assembly
        - [INLINE ASM](node_modules/@openzeppelin/contracts/utils/Address.sol#L213-L216)

node_modules/@openzeppelin/contracts/utils/Address.sol#L201-L221


 - [ ] ID-68
[ERC721._checkOnERC721Received(address,address,uint256,bytes)](node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#L394-L416) uses assembly
        - [INLINE ASM](node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#L408-L410)

node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#L394-L416


 - [ ] ID-69
[Utils.toSlice(string)](contracts/libraries/Utils.sol#L33-L39) uses assembly
        - [INLINE ASM](contracts/libraries/Utils.sol#L35-L37)

contracts/libraries/Utils.sol#L33-L39


## boolean-equal
Impact: Informational
Confidence: High
 - [ ] ID-70
[SoulLinker.revokePermission(uint256,uint256,address,uint256,uint256)](contracts/SoulLinker.sol#L218-L247) compares to a boolean constant:
        -[require(bool,string)(_permissions[token][tokenId][readerIdentityId][signatureDate].isRevoked == false,PERMISSION_ALREADY_REVOKED)](contracts/SoulLinker.sol#L230-L234)

contracts/SoulLinker.sol#L218-L247


 - [ ] ID-71
[SoulName._setTokenURI(uint256,string)](contracts/SoulName.sol#L404-L416) compares to a boolean constant:
        -[require(bool,string)(_URIs[_tokenURI] == false,URI_ALREADY_EXISTS)](contracts/SoulName.sol#L412)

contracts/SoulName.sol#L404-L416


 - [ ] ID-72
[SoulLinker.validatePermission(uint256,uint256,address,uint256,uint256)](contracts/SoulLinker.sol#L342-L369) compares to a boolean constant:
        -[require(bool,string)(permission.isRevoked == false,PERMISSION_REVOKED)](contracts/SoulLinker.sol#L366)

contracts/SoulLinker.sol#L342-L369


## pragma
Impact: Informational
Confidence: High
 - [ ] ID-73
Different versions of Solidity are used:
        - Version used: ['^0.8.0', '^0.8.1', '^0.8.7']
        - [^0.8.0](node_modules/@openzeppelin/contracts/access/AccessControl.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/access/IAccessControl.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/access/Ownable.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/security/Pausable.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol#L4)
        - [^0.8.1](node_modules/@openzeppelin/contracts/utils/Address.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/utils/Context.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/utils/Counters.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/utils/Strings.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#L4)
        - [^0.8.0](node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol#L4)
        - [^0.8.7](contracts/SoulLinker.sol#L2)
        - [^0.8.7](contracts/SoulName.sol#L2)
        - [^0.8.7](contracts/SoulStore.sol#L2)
        - [^0.8.7](contracts/Soulbound2FA.sol#L2)
        - [^0.8.7](contracts/SoulboundCreditScore.sol#L2)
        - [^0.8.7](contracts/SoulboundIdentity.sol#L2)
        - [^0.8.7](contracts/dex/PaymentGateway.sol#L2)
        - [^0.8.7](contracts/interfaces/ISoulName.sol#L2)
        - [^0.8.7](contracts/interfaces/ISoulboundIdentity.sol#L2)
        - [^0.8.7](contracts/interfaces/dex/IUniswapRouter.sol#L2)
        - [^0.8.7](contracts/libraries/Utils.sol#L2)
        - [^0.8.7](contracts/tokens/MASA.sol#L2)
        - [^0.8.7](contracts/tokens/MasaNFT.sol#L2)
        - [^0.8.7](contracts/tokens/MasaSBT.sol#L2)
        - [^0.8.7](contracts/tokens/MasaSBTAuthority.sol#L2)
        - [^0.8.7](contracts/tokens/MasaSBTSelfSovereign.sol#L2)
        - [^0.8.7](contracts/tokens/SBT/ISBT.sol#L2)
        - [^0.8.7](contracts/tokens/SBT/SBT.sol#L2)
        - [^0.8.7](contracts/tokens/SBT/extensions/ISBTEnumerable.sol#L2)
        - [^0.8.7](contracts/tokens/SBT/extensions/ISBTMetadata.sol#L2)
        - [^0.8.7](contracts/tokens/SBT/extensions/SBTBurnable.sol#L2)
        - [^0.8.7](contracts/tokens/SBT/extensions/SBTEnumerable.sol#L2)

node_modules/@openzeppelin/contracts/access/AccessControl.sol#L4


## costly-loop
Impact: Informational
Confidence: Medium
 - [ ] ID-74
[PaymentGateway.removeErc20Token(address)](contracts/dex/PaymentGateway.sol#L119-L131) has costly operations inside a loop:
        - [erc20tokens.pop()](contracts/dex/PaymentGateway.sol#L127)

contracts/dex/PaymentGateway.sol#L119-L131


## dead-code
Impact: Informational
Confidence: Medium
 - [ ] ID-75
[SBT._baseURI()](contracts/tokens/SBT/SBT.sol#L120-L122) is never used and should be removed

contracts/tokens/SBT/SBT.sol#L120-L122


## solc-version
Impact: Informational
Confidence: High
 - [ ] ID-76
Pragma version[^0.8.7](contracts/Soulbound2FA.sol#L2) allows old versions

contracts/Soulbound2FA.sol#L2


 - [ ] ID-77
Pragma version[^0.8.7](contracts/tokens/SBT/extensions/ISBTMetadata.sol#L2) allows old versions

contracts/tokens/SBT/extensions/ISBTMetadata.sol#L2


 - [ ] ID-78
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol#L4


 - [ ] ID-79
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#L4


 - [ ] ID-80
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#L4


 - [ ] ID-81
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#L4


 - [ ] ID-82
Pragma version[^0.8.7](contracts/SoulName.sol#L2) allows old versions

contracts/SoulName.sol#L2


 - [ ] ID-83
Pragma version[^0.8.7](contracts/interfaces/ISoulName.sol#L2) allows old versions

contracts/interfaces/ISoulName.sol#L2


 - [ ] ID-84
Pragma version[^0.8.7](contracts/libraries/Utils.sol#L2) allows old versions

contracts/libraries/Utils.sol#L2


 - [ ] ID-85
Pragma version[^0.8.7](contracts/tokens/MasaNFT.sol#L2) allows old versions

contracts/tokens/MasaNFT.sol#L2


 - [ ] ID-86
Pragma version[^0.8.7](contracts/dex/PaymentGateway.sol#L2) allows old versions

contracts/dex/PaymentGateway.sol#L2


 - [ ] ID-87
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/utils/Context.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/Context.sol#L4


 - [ ] ID-88
Pragma version[^0.8.7](contracts/tokens/SBT/extensions/ISBTEnumerable.sol#L2) allows old versions

contracts/tokens/SBT/extensions/ISBTEnumerable.sol#L2


 - [ ] ID-89
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#L4


 - [ ] ID-90
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/utils/Strings.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/Strings.sol#L4


 - [ ] ID-91
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol#L4


 - [ ] ID-92
Pragma version[^0.8.7](contracts/tokens/MasaSBTAuthority.sol#L2) allows old versions

contracts/tokens/MasaSBTAuthority.sol#L2


 - [ ] ID-93
Pragma version[^0.8.7](contracts/tokens/SBT/SBT.sol#L2) allows old versions

contracts/tokens/SBT/SBT.sol#L2


 - [ ] ID-94
Pragma version[^0.8.1](node_modules/@openzeppelin/contracts/utils/Address.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/Address.sol#L4


 - [ ] ID-95
Pragma version[^0.8.7](contracts/SoulboundIdentity.sol#L2) allows old versions

contracts/SoulboundIdentity.sol#L2


 - [ ] ID-96
solc-0.8.7 is not recommended for deployment

 - [ ] ID-97
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol#L4


 - [ ] ID-98
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol#L4


 - [ ] ID-99
Pragma version[^0.8.7](contracts/tokens/MasaSBTSelfSovereign.sol#L2) allows old versions

contracts/tokens/MasaSBTSelfSovereign.sol#L2


 - [ ] ID-100
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/utils/Counters.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/Counters.sol#L4


 - [ ] ID-101
Pragma version[^0.8.7](contracts/tokens/MASA.sol#L2) allows old versions

contracts/tokens/MASA.sol#L2


 - [ ] ID-102
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#L4


 - [ ] ID-103
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/access/IAccessControl.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/access/IAccessControl.sol#L4


 - [ ] ID-104
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/access/AccessControl.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/access/AccessControl.sol#L4


 - [ ] ID-105
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L4


 - [ ] ID-106
Pragma version[^0.8.7](contracts/tokens/SBT/ISBT.sol#L2) allows old versions

contracts/tokens/SBT/ISBT.sol#L2


 - [ ] ID-107
Pragma version[^0.8.7](contracts/interfaces/dex/IUniswapRouter.sol#L2) allows old versions

contracts/interfaces/dex/IUniswapRouter.sol#L2


 - [ ] ID-108
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#L4


 - [ ] ID-109
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L4


 - [ ] ID-110
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol#L4


 - [ ] ID-111
Pragma version[^0.8.7](contracts/interfaces/ISoulboundIdentity.sol#L2) allows old versions

contracts/interfaces/ISoulboundIdentity.sol#L2


 - [ ] ID-112
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/security/Pausable.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/security/Pausable.sol#L4


 - [ ] ID-113
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol#L4


 - [ ] ID-114
Pragma version[^0.8.7](contracts/tokens/MasaSBT.sol#L2) allows old versions

contracts/tokens/MasaSBT.sol#L2


 - [ ] ID-115
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol#L4


 - [ ] ID-116
Pragma version[^0.8.7](contracts/tokens/SBT/extensions/SBTBurnable.sol#L2) allows old versions

contracts/tokens/SBT/extensions/SBTBurnable.sol#L2


 - [ ] ID-117
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol#L4


 - [ ] ID-118
Pragma version[^0.8.7](contracts/tokens/SBT/extensions/SBTEnumerable.sol#L2) allows old versions

contracts/tokens/SBT/extensions/SBTEnumerable.sol#L2


 - [ ] ID-119
Pragma version[^0.8.7](contracts/SoulLinker.sol#L2) allows old versions

contracts/SoulLinker.sol#L2


 - [ ] ID-120
Pragma version[^0.8.7](contracts/SoulboundCreditScore.sol#L2) allows old versions

contracts/SoulboundCreditScore.sol#L2


 - [ ] ID-121
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/access/Ownable.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/access/Ownable.sol#L4


 - [ ] ID-122
Pragma version[^0.8.7](contracts/SoulStore.sol#L2) allows old versions

contracts/SoulStore.sol#L2


 - [ ] ID-123
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#L4


 - [ ] ID-124
Pragma version[^0.8.0](node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#L4) allows old versions

node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#L4


## low-level-calls
Impact: Informational
Confidence: High
 - [ ] ID-125
Low level call in [PaymentGateway._pay(address,uint256)](contracts/dex/PaymentGateway.sol#L173-L213):
        - [(success) = address(reserveWallet).call{value: swapAmout}()](contracts/dex/PaymentGateway.sol#L182-L184)
        - [(success,None) = address(msg.sender).call{value: refund}()](contracts/dex/PaymentGateway.sol#L189)

contracts/dex/PaymentGateway.sol#L173-L213


 - [ ] ID-126
Low level call in [Address.sendValue(address,uint256)](node_modules/@openzeppelin/contracts/utils/Address.sol#L60-L65):
        - [(success) = recipient.call{value: amount}()](node_modules/@openzeppelin/contracts/utils/Address.sol#L63)

node_modules/@openzeppelin/contracts/utils/Address.sol#L60-L65


 - [ ] ID-127
Low level call in [Address.functionCallWithValue(address,bytes,uint256,string)](node_modules/@openzeppelin/contracts/utils/Address.sol#L128-L139):
        - [(success,returndata) = target.call{value: value}(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L137)

node_modules/@openzeppelin/contracts/utils/Address.sol#L128-L139


 - [ ] ID-128
Low level call in [Address.functionStaticCall(address,bytes,string)](node_modules/@openzeppelin/contracts/utils/Address.sol#L157-L166):
        - [(success,returndata) = target.staticcall(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L164)

node_modules/@openzeppelin/contracts/utils/Address.sol#L157-L166


 - [ ] ID-129
Low level call in [Address.functionDelegateCall(address,bytes,string)](node_modules/@openzeppelin/contracts/utils/Address.sol#L184-L193):
        - [(success,returndata) = target.delegatecall(data)](node_modules/@openzeppelin/contracts/utils/Address.sol#L191)

node_modules/@openzeppelin/contracts/utils/Address.sol#L184-L193


## naming-convention
Impact: Informational
Confidence: High
 - [ ] ID-130
Parameter [SoulName.setExtension(string)._extension](contracts/SoulName.sol#L85) is not in mixedCase

contracts/SoulName.sol#L85


 - [ ] ID-131
Parameter [PaymentGateway.setReserveWallet(address)._reserveWallet](contracts/dex/PaymentGateway.sol#L136) is not in mixedCase

contracts/dex/PaymentGateway.sol#L136


 - [ ] ID-132
Parameter [MasaSBTSelfSovereign.setSoulboundIdentity(ISoulboundIdentity)._soulboundIdentity](contracts/tokens/MasaSBTSelfSovereign.sol#L66) is not in mixedCase

contracts/tokens/MasaSBTSelfSovereign.sol#L66


 - [ ] ID-133
Parameter [PaymentGateway.setStableCoin(address)._stableCoin](contracts/dex/PaymentGateway.sol#L90) is not in mixedCase

contracts/dex/PaymentGateway.sol#L90


 - [ ] ID-134
Variable [EIP712._TYPE_HASH](node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L37) is not in mixedCase

node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L37


 - [ ] ID-135
Parameter [SoulStore.setNameRegistrationPricePerYear(uint256,uint256)._nameLength](contracts/SoulStore.sol#L68) is not in mixedCase

contracts/SoulStore.sol#L68


 - [ ] ID-136
Parameter [SoulLinker.setAddPermissionPrice(uint256)._addPermissionPrice](contracts/SoulLinker.sol#L102) is not in mixedCase

contracts/SoulLinker.sol#L102


 - [ ] ID-137
Parameter [PaymentGateway.setMasaToken(address)._masaToken](contracts/dex/PaymentGateway.sol#L100) is not in mixedCase

contracts/dex/PaymentGateway.sol#L100


 - [ ] ID-138
Parameter [SoulboundIdentity.setSoulName(ISoulName)._soulName](contracts/SoulboundIdentity.sol#L34) is not in mixedCase

contracts/SoulboundIdentity.sol#L34


 - [ ] ID-139
Parameter [SoulLinker.setAddPermissionPriceMASA(uint256)._addPermissionPriceMASA](contracts/SoulLinker.sol#L113) is not in mixedCase

contracts/SoulLinker.sol#L113


 - [ ] ID-140
Parameter [SoulboundIdentity.mintIdentityWithName(address,string,uint256,string)._tokenURI](contracts/SoulboundIdentity.sol#L65) is not in mixedCase

contracts/SoulboundIdentity.sol#L65


 - [ ] ID-141
Parameter [SoulName.setContractURI(string)._contractURI](contracts/SoulName.sol#L97) is not in mixedCase

contracts/SoulName.sol#L97


 - [ ] ID-142
Variable [EIP712._CACHED_THIS](node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L33) is not in mixedCase

node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L33


 - [ ] ID-143
Parameter [MasaSBTSelfSovereign.setMintingPrice(uint256)._mintingPrice](contracts/tokens/MasaSBTSelfSovereign.sol#L78) is not in mixedCase

contracts/tokens/MasaSBTSelfSovereign.sol#L78


 - [ ] ID-144
Parameter [SoulStore.setNameRegistrationPricePerYear(uint256,uint256)._nameRegistrationPricePerYear](contracts/SoulStore.sol#L69) is not in mixedCase

contracts/SoulStore.sol#L69


 - [ ] ID-145
Parameter [MasaSBTSelfSovereign.addAuthority(address)._authority](contracts/tokens/MasaSBTSelfSovereign.sol#L89) is not in mixedCase

contracts/tokens/MasaSBTSelfSovereign.sol#L89


 - [ ] ID-146
Function [IERC20Permit.DOMAIN_SEPARATOR()](node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#L59) is not in mixedCase

node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#L59


 - [ ] ID-147
Parameter [SoulName.setSoulboundIdentity(ISoulboundIdentity)._soulboundIdentity](contracts/SoulName.sol#L73) is not in mixedCase

contracts/SoulName.sol#L73


 - [ ] ID-148
Parameter [Utils.toLowerCase(string)._str](contracts/libraries/Utils.sol#L13) is not in mixedCase

contracts/libraries/Utils.sol#L13


 - [ ] ID-149
Variable [EIP712._CACHED_CHAIN_ID](node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L32) is not in mixedCase

node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L32


 - [ ] ID-150
Parameter [PaymentGateway.removeErc20Token(address)._erc20token](contracts/dex/PaymentGateway.sol#L119) is not in mixedCase

contracts/dex/PaymentGateway.sol#L119


 - [ ] ID-151
Parameter [SoulStore.purchaseIdentityAndName(address,string,uint256,string)._tokenURI](contracts/SoulStore.sol#L107) is not in mixedCase

contracts/SoulStore.sol#L107


 - [ ] ID-152
Parameter [SoulStore.purchaseName(address,string,uint256,string,address)._tokenURI](contracts/SoulStore.sol#L150) is not in mixedCase

contracts/SoulStore.sol#L150


 - [ ] ID-153
Parameter [SoulName.mint(address,string,uint256,string)._tokenURI](contracts/SoulName.sol#L118) is not in mixedCase

contracts/SoulName.sol#L118


 - [ ] ID-154
Variable [EIP712._HASHED_NAME](node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L35) is not in mixedCase

node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L35


 - [ ] ID-155
Variable [SoulName._URIs](contracts/SoulName.sol#L32) is not in mixedCase

contracts/SoulName.sol#L32


 - [ ] ID-156
Parameter [PaymentGateway.addErc20Token(address)._erc20token](contracts/dex/PaymentGateway.sol#L108) is not in mixedCase

contracts/dex/PaymentGateway.sol#L108


 - [ ] ID-157
Parameter [SoulStore.setSoulboundIdentity(ISoulboundIdentity)._soulboundIdentity](contracts/SoulStore.sol#L53) is not in mixedCase

contracts/SoulStore.sol#L53


 - [ ] ID-158
Parameter [PaymentGateway.setSwapRouter(address)._swapRouter](contracts/dex/PaymentGateway.sol#L69) is not in mixedCase

contracts/dex/PaymentGateway.sol#L69


 - [ ] ID-159
Parameter [SoulLinker.setSoulboundIdentity(ISoulboundIdentity)._soulboundIdentity](contracts/SoulLinker.sol#L69) is not in mixedCase

contracts/SoulLinker.sol#L69


 - [ ] ID-160
Struct [Utils.slice](contracts/libraries/Utils.sol#L8-L11) is not in CapWords

contracts/libraries/Utils.sol#L8-L11


 - [ ] ID-161
Variable [EIP712._CACHED_DOMAIN_SEPARATOR](node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L31) is not in mixedCase

node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L31


 - [ ] ID-162
Variable [EIP712._HASHED_VERSION](node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L36) is not in mixedCase

node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol#L36


 - [ ] ID-163
Parameter [PaymentGateway.setWrappedNativeToken(address)._wrappedNativeToken](contracts/dex/PaymentGateway.sol#L78) is not in mixedCase

contracts/dex/PaymentGateway.sol#L78


## similar-names
Impact: Informational
Confidence: Medium
 - [ ] ID-164
Variable [PaymentGateway.removeErc20Token(address)._erc20token](contracts/dex/PaymentGateway.sol#L119) is too similar to [PaymentGateway.erc20tokens](contracts/dex/PaymentGateway.sol#L38)

contracts/dex/PaymentGateway.sol#L119


 - [ ] ID-165
Variable [PaymentGateway.addErc20Token(address)._erc20token](contracts/dex/PaymentGateway.sol#L108) is too similar to [PaymentGateway.erc20tokens](contracts/dex/PaymentGateway.sol#L38)

contracts/dex/PaymentGateway.sol#L108


## too-many-digits
Impact: Informational
Confidence: Medium
 - [ ] ID-166
[MASA.constructor()](contracts/tokens/MASA.sol#L7-L9) uses literals with too many digits:
        - [_mint(msg.sender,1000000e18)](contracts/tokens/MASA.sol#L8)

contracts/tokens/MASA.sol#L7-L9


. analyzed (48 contracts with 81 detectors), 167 result(s) found
 