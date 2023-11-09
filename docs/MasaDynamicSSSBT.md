# MasaDynamicSSSBT

*Masa Finance*

> Soulbound Self-Sovereign SBT with states

Soulbound token that represents a Self-Sovereign SBT with states

*Inherits from the SBT contract.*

## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### PROJECT_ADMIN_ROLE

```solidity
function PROJECT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### addAfterMintState

```solidity
function addAfterMintState(string state) external nonpayable
```

Adds a afterMintState

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| state | string | New afterMintState to add |

### addAuthority

```solidity
function addAuthority(address _authority) external nonpayable
```

Adds a new authority to the list of authorities

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _authority | address | New authority to add |

### addBeforeMintState

```solidity
function addBeforeMintState(string state) external nonpayable
```

Adds a beforeMintState

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| state | string | New beforeMintState to add |

### addLinkPrice

```solidity
function addLinkPrice() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### addLinkPriceMASA

```solidity
function addLinkPriceMASA() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### afterMintState

```solidity
function afterMintState(uint256, string) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |
| _1 | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### allAfterMintStatesSet

```solidity
function allAfterMintStatesSet(uint256 tokenId) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### allBeforeMintStatesSet

```solidity
function allBeforeMintStatesSet(address account) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### authorities

```solidity
function authorities(address) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*See {ISBT-balanceOf}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### beforeMintState

```solidity
function beforeMintState(address, string) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### burn

```solidity
function burn(uint256 tokenId) external nonpayable
```



*Burns `tokenId`. See {SBT-_burn}. Requirements: - The caller must own `tokenId` or be an approved operator.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

### disablePaymentMethod

```solidity
function disablePaymentMethod(address _paymentMethod) external nonpayable
```

Removes a token as a valid payment method

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _paymentMethod | address | Token to remove |

### eip712Domain

```solidity
function eip712Domain() external view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)
```



*See {EIP-5267}. _Available since v4.9._*


#### Returns

| Name | Type | Description |
|---|---|---|
| fields | bytes1 | undefined |
| name | string | undefined |
| version | string | undefined |
| chainId | uint256 | undefined |
| verifyingContract | address | undefined |
| salt | bytes32 | undefined |
| extensions | uint256[] | undefined |

### enablePaymentMethod

```solidity
function enablePaymentMethod(address _paymentMethod) external nonpayable
```

Adds a new token as a valid payment method

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _paymentMethod | address | New token to add |

### enabledPaymentMethod

```solidity
function enabledPaymentMethod(address) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### enabledPaymentMethods

```solidity
function enabledPaymentMethods(uint256) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### exists

```solidity
function exists(uint256 tokenId) external view returns (bool)
```

Returns true if the token exists

*Returns true if the token has been minted*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | Token to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | True if the token exists |

### getAfterMintStates

```solidity
function getAfterMintStates() external view returns (string[])
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string[] | undefined |

### getBeforeMintStates

```solidity
function getBeforeMintStates() external view returns (string[])
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string[] | undefined |

### getEnabledPaymentMethods

```solidity
function getEnabledPaymentMethods() external view returns (address[])
```

Returns all available payment methods

*Returns the address of all available payment methods*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | Array of all enabled payment methods |

### getIdentityId

```solidity
function getIdentityId(uint256 tokenId) external view returns (uint256)
```

Returns the identityId owned by the given token



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | Id of the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Id of the identity |

### getMintPrice

```solidity
function getMintPrice(address paymentMethod) external view returns (uint256 price)
```

Returns the price for minting

*Returns current pricing for minting*

#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod | address | Address of token that user want to pay |

#### Returns

| Name | Type | Description |
|---|---|---|
| price | uint256 | Current price for minting in the given payment method |

### getMintPriceWithProtocolFee

```solidity
function getMintPriceWithProtocolFee(address paymentMethod) external view returns (uint256 price, uint256 protocolFee)
```

Returns the price for minting with protocol fee

*Returns current pricing for minting with protocol fee*

#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod | address | Address of token that user want to pay |

#### Returns

| Name | Type | Description |
|---|---|---|
| price | uint256 | Current price for minting in the given payment method |
| protocolFee | uint256 | Current protocol fee for minting in the given payment method |

### getProtocolFee

```solidity
function getProtocolFee(address paymentMethod, uint256 amount) external view returns (uint256)
```

Calculates the protocol fee added to the project fee

*This method will calculate the protocol fee based on the payment method*

#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod | address | Address of token that user want to pay |
| amount | uint256 | Price to be paid in the specified payment method |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getProtocolFeeSub

```solidity
function getProtocolFeeSub(uint256 amount) external view returns (uint256)
```

Calculates the protocol fee substracted from the amount

*This method will calculate the protocol fee based on the payment method*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | Price to be paid in the specified payment method |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```



*Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role&#39;s admin, use {_setRoleAdmin}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```



*Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``&#39;s admin role. May emit a {RoleGranted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```



*Returns `true` if `account` has been granted `role`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### masaToken

```solidity
function masaToken() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### maxSBTToMint

```solidity
function maxSBTToMint() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### mint

```solidity
function mint(address paymentMethod, uint256 identityId) external payable returns (uint256)
```

Mints a new SBT

*The caller must have the MINTER role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod | address | Address of token that user want to pay |
| identityId | uint256 | TokenId of the identity to mint the NFT to |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The SBT ID of the newly minted SBT |

### mint

```solidity
function mint(address to) external payable returns (uint256)
```

Mints a new SBT

*The caller must have the MINTER role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | The address to mint the SBT to |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The SBT ID of the newly minted SBT |

### mint

```solidity
function mint(uint256 identityId) external payable returns (uint256)
```

Mints a new SBT

*The caller must have the MINTER role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| identityId | uint256 | TokenId of the identity to mint the NFT to |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The SBT ID of the newly minted SBT |

### mint

```solidity
function mint(address paymentMethod, address to) external payable returns (uint256)
```

Mints a new SBT

*The caller must have the MINTER role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod | address | Address of token that user want to pay |
| to | address | The address to mint the SBT to |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The SBT ID of the newly minted SBT |

### mintPrice

```solidity
function mintPrice() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### mintPriceMASA

```solidity
function mintPriceMASA() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### name

```solidity
function name() external view returns (string)
```



*See {ISBTMetadata-name}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*See {ISBT-ownerOf}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### projectFeeReceiver

```solidity
function projectFeeReceiver() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### protocolFeeAmount

```solidity
function protocolFeeAmount() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### protocolFeePercent

```solidity
function protocolFeePercent() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### protocolFeePercentSub

```solidity
function protocolFeePercentSub() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### protocolFeeReceiver

```solidity
function protocolFeeReceiver() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### queryLinkPrice

```solidity
function queryLinkPrice() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### queryLinkPriceMASA

```solidity
function queryLinkPriceMASA() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### removeAfterMintState

```solidity
function removeAfterMintState(string state) external nonpayable
```

Removes a afterMintState

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| state | string | afterMintState to remove |

### removeAuthority

```solidity
function removeAuthority(address _authority) external nonpayable
```

Removes an authority from the list of authorities

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _authority | address | Authority to remove |

### removeBeforeMintState

```solidity
function removeBeforeMintState(string state) external nonpayable
```

Removes a beforeMintState

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| state | string | beforeMintState to remove |

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function&#39;s purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`. May emit a {RoleRevoked} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``&#39;s admin role. May emit a {RoleRevoked} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### setAddLinkPrice

```solidity
function setAddLinkPrice(uint256 _addLinkPrice) external nonpayable
```

Sets the price for adding the link in SoulLinker in stable coin

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _addLinkPrice | uint256 | New price for adding the link in SoulLinker in stable coin |

### setAddLinkPriceMASA

```solidity
function setAddLinkPriceMASA(uint256 _addLinkPriceMASA) external nonpayable
```

Sets the price for adding the link in SoulLinker in MASA

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _addLinkPriceMASA | uint256 | New price for adding the link in SoulLinker in MASA |

### setMasaToken

```solidity
function setMasaToken(address _masaToken) external nonpayable
```

Sets the utility token to pay the fee in (MASA)

*The caller must have the admin role to call this function It can be set to address(0) to disable paying in MASA*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _masaToken | address | New utility token to pay the fee in |

### setMintPrice

```solidity
function setMintPrice(uint256 _mintPrice) external nonpayable
```

Sets the price of minting in stable coin

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _mintPrice | uint256 | New price of minting in stable coin |

### setMintPriceMASA

```solidity
function setMintPriceMASA(uint256 _mintPriceMASA) external nonpayable
```

Sets the price of minting in MASA

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _mintPriceMASA | uint256 | New price of minting in MASA |

### setProjectFeeReceiver

```solidity
function setProjectFeeReceiver(address _projectFeeReceiver) external nonpayable
```

Set the project fee receiver wallet

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _projectFeeReceiver | address | New project fee receiver wallet |

### setProtocolFeeAmount

```solidity
function setProtocolFeeAmount(uint256 _protocolFeeAmount) external nonpayable
```

Set the protocol fee amount

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _protocolFeeAmount | uint256 | New protocol fee amount |

### setProtocolFeePercent

```solidity
function setProtocolFeePercent(uint256 _protocolFeePercent) external nonpayable
```

Set the protocol fee percent added to the project fee

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _protocolFeePercent | uint256 | New protocol fee percent added to the project fee |

### setProtocolFeePercentSub

```solidity
function setProtocolFeePercentSub(uint256 _protocolFeePercentSub) external nonpayable
```

Set the protocol fee percent substracted from the amount

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _protocolFeePercentSub | uint256 | New protocol fee percent substracted from the amount |

### setProtocolFeeReceiver

```solidity
function setProtocolFeeReceiver(address _protocolFeeReceiver) external nonpayable
```

Set the protocol fee wallet

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _protocolFeeReceiver | address | New protocol fee wallet |

### setQueryLinkPrice

```solidity
function setQueryLinkPrice(uint256 _queryLinkPrice) external nonpayable
```

Sets the price for reading data in SoulLinker in stable coin

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _queryLinkPrice | uint256 | New price for reading data in SoulLinker in stable coin |

### setQueryLinkPriceMASA

```solidity
function setQueryLinkPriceMASA(uint256 _queryLinkPriceMASA) external nonpayable
```

Sets the price for reading data in SoulLinker in MASA

*The caller must have the admin or project admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _queryLinkPriceMASA | uint256 | New price for reading data in SoulLinker in MASA |

### setSoulboundIdentity

```solidity
function setSoulboundIdentity(address _soulboundIdentity) external nonpayable
```

Sets the SoulboundIdentity contract address linked to this SBT

*The caller must be the admin to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _soulboundIdentity | address | Address of the SoulboundIdentity contract |

### setStableCoin

```solidity
function setStableCoin(address _stableCoin) external nonpayable
```

Sets the stable coin to pay the fee in (USDC)

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _stableCoin | address | New stable coin to pay the fee in |

### setState

```solidity
function setState(uint256 tokenId, string state, bool value, address authorityAddress, uint256 signatureDate, bytes signature) external nonpayable
```

Sets the state of a token

*The signer of the signature must be a valid authority*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | TokenId of the token to set the state |
| state | string | Name of the state to set |
| value | bool | Value of the state to set |
| authorityAddress | address | Address of the authority that signed the message |
| signatureDate | uint256 | Date of the signature |
| signature | bytes | Signature of the message |

### setState

```solidity
function setState(address account, string state, bool value, address authorityAddress, uint256 signatureDate, bytes signature) external nonpayable
```

Sets the state of an account

*The signer of the signature must be a valid authority*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | Address of the account to set the state |
| state | string | Name of the state to set |
| value | bool | Value of the state to set |
| authorityAddress | address | Address of the authority that signed the message |
| signatureDate | uint256 | Date of the signature |
| signature | bytes | Signature of the message |

### setStatesAndMint

```solidity
function setStatesAndMint(address paymentMethod, address to, string[] states, address authorityAddress, uint256 signatureDate, bytes signature) external payable returns (uint256)
```

Sets some states of an account and mints

*The signer of the signature must be a valid authority*

#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod | address | Address of token that user want to pay |
| to | address | The address to mint the SBT to |
| states | string[] | Names of the state to set |
| authorityAddress | address | Address of the authority that signed the message |
| signatureDate | uint256 | Date of the signature |
| signature | bytes | Signature of the message |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The SBT ID of the newly minted SBT |

### setSwapRouter

```solidity
function setSwapRouter(address _swapRouter) external nonpayable
```

Sets the swap router address

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _swapRouter | address | New swap router address |

### setWrappedNativeToken

```solidity
function setWrappedNativeToken(address _wrappedNativeToken) external nonpayable
```

Sets the wrapped native token address

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wrappedNativeToken | address | New wrapped native token address |

### soulboundIdentity

```solidity
function soulboundIdentity() external view returns (contract ISoulboundIdentity)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ISoulboundIdentity | undefined |

### stableCoin

```solidity
function stableCoin() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

Query if a contract implements an interface

*Interface identification is specified in ERC-165.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | The interface identifier, as specified in ERC-165 |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | `true` if the contract implements `interfaceId` and  `interfaceId` is not 0xffffffff, `false` otherwise |

### swapRouter

```solidity
function swapRouter() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### symbol

```solidity
function symbol() external view returns (string)
```



*See {ISBTMetadata-symbol}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenByIndex

```solidity
function tokenByIndex(uint256 index) external view returns (uint256)
```



*See {ISBTEnumerable-tokenByIndex}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tokenOfOwnerByIndex

```solidity
function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)
```



*See {ISBTEnumerable-tokenOfOwnerByIndex}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```

A distinct Uniform Resource Identifier (URI) for a given asset.

*Throws if `_tokenId` is not a valid SBT. URIs are defined in RFC  3986. The URI may point to a JSON file that conforms to the &quot;ERC721  Metadata JSON Schema&quot;.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | SBT to get the URI of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | URI of the SBT |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*See {ISBTEnumerable-totalSupply}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### wrappedNativeToken

```solidity
function wrappedNativeToken() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |



## Events

### AfterMintStateSet

```solidity
event AfterMintStateSet(uint256 tokenId, string state, bool value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId  | uint256 | undefined |
| state  | string | undefined |
| value  | bool | undefined |

### BeforeMintStateSet

```solidity
event BeforeMintStateSet(address account, string state, bool value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |
| state  | string | undefined |
| value  | bool | undefined |

### Burn

```solidity
event Burn(address indexed _owner, uint256 indexed _tokenId)
```



*This emits when an SBT is burned  This event emits when SBTs are destroyed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner `indexed` | address | undefined |
| _tokenId `indexed` | uint256 | undefined |

### EIP712DomainChanged

```solidity
event EIP712DomainChanged()
```



*MAY be emitted to signal that the domain could have changed.*


### Mint

```solidity
event Mint(address indexed _owner, uint256 indexed _tokenId)
```



*This emits when an SBT is newly minted.  This event emits when SBTs are created*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner `indexed` | address | undefined |
| _tokenId `indexed` | uint256 | undefined |

### MintedToAddress

```solidity
event MintedToAddress(uint256 tokenId, address to, address authorityAddress, uint256 signatureDate, address paymentMethod, uint256 mintPrice)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId  | uint256 | undefined |
| to  | address | undefined |
| authorityAddress  | address | undefined |
| signatureDate  | uint256 | undefined |
| paymentMethod  | address | undefined |
| mintPrice  | uint256 | undefined |

### MintedToIdentity

```solidity
event MintedToIdentity(uint256 tokenId, uint256 identityId, address authorityAddress, uint256 signatureDate, address paymentMethod, uint256 mintPrice)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId  | uint256 | undefined |
| identityId  | uint256 | undefined |
| authorityAddress  | address | undefined |
| signatureDate  | uint256 | undefined |
| paymentMethod  | address | undefined |
| mintPrice  | uint256 | undefined |

### Pay

```solidity
event Pay(address indexed paymentMethod, uint256 amount, uint256 protocolFee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod `indexed` | address | undefined |
| amount  | uint256 | undefined |
| protocolFee  | uint256 | undefined |

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
```



*Emitted when `newAdminRole` is set as ``role``&#39;s admin role, replacing `previousAdminRole` `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite {RoleAdminChanged} not being emitted signaling this. _Available since v3.1._*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| previousAdminRole `indexed` | bytes32 | undefined |
| newAdminRole `indexed` | bytes32 | undefined |

### RoleGranted

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
```



*Emitted when `account` is granted `role`. `sender` is the account that originated the contract call, an admin role bearer except when using {AccessControl-_setupRole}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### RoleRevoked

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```



*Emitted when `account` is revoked `role`. `sender` is the account that originated the contract call:   - if using `revokeRole`, it is the admin role bearer   - if using `renounceRole`, it is the role bearer (i.e. `account`)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |



## Errors

### AlreadyAdded

```solidity
error AlreadyAdded()
```






### AuthorityNotExists

```solidity
error AuthorityNotExists(address authority)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| authority | address | undefined |

### CallerNotOwner

```solidity
error CallerNotOwner(address caller)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| caller | address | undefined |

### InsufficientEthAmount

```solidity
error InsufficientEthAmount(uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | undefined |

### InvalidPaymentMethod

```solidity
error InvalidPaymentMethod(address paymentMethod)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod | address | undefined |

### InvalidShortString

```solidity
error InvalidShortString()
```






### InvalidSignature

```solidity
error InvalidSignature()
```






### InvalidState

```solidity
error InvalidState(string state)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| state | string | undefined |

### InvalidToken

```solidity
error InvalidToken(address token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |

### MaxSBTMinted

```solidity
error MaxSBTMinted(address to, uint256 maximum)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| maximum | uint256 | undefined |

### NonExistingErc20Token

```solidity
error NonExistingErc20Token(address erc20token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| erc20token | address | undefined |

### NotAllBeforeMintStatesSet

```solidity
error NotAllBeforeMintStatesSet()
```






### NotAuthorized

```solidity
error NotAuthorized(address signer)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| signer | address | undefined |

### NotLinkedToAnIdentitySBT

```solidity
error NotLinkedToAnIdentitySBT()
```






### PaymentParamsNotSet

```solidity
error PaymentParamsNotSet()
```






### ProtocolFeeReceiverNotSet

```solidity
error ProtocolFeeReceiverNotSet()
```






### RefundFailed

```solidity
error RefundFailed()
```






### SameValue

```solidity
error SameValue()
```






### StringTooLong

```solidity
error StringTooLong(string str)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| str | string | undefined |

### TransferFailed

```solidity
error TransferFailed()
```






### UserMustHaveProtocolOrProjectAdminRole

```solidity
error UserMustHaveProtocolOrProjectAdminRole()
```






### WithoutBeforeMintStates

```solidity
error WithoutBeforeMintStates()
```






### ZeroAddress

```solidity
error ZeroAddress()
```







