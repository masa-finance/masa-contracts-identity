# SoulLinker

*Masa Finance*

> Soul linker

Soul linker smart contract that let add links to a Soulbound token.



## Methods

### addLinkedSBT

```solidity
function addLinkedSBT(address token) external nonpayable
```

Adds an SBT to the list of linked SBTs

*The caller must be the owner to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of the SBT contract |

### addPermission

```solidity
function addPermission(uint256 readerIdentityId, uint256 ownerIdentityId, address token, uint256 tokenId, string data, uint256 signatureDate, uint256 expirationDate, bytes signature) external nonpayable
```

Stores the permission, validating the signature of the given read link request

*The token must be linked to this soul linker*

#### Parameters

| Name | Type | Description |
|---|---|---|
| readerIdentityId | uint256 | Id of the identity of the reader |
| ownerIdentityId | uint256 | Id of the identity of the owner of the SBT |
| token | address | Address of the SBT contract |
| tokenId | uint256 | Id of the token |
| data | string | Data that owner wants to share |
| signatureDate | uint256 | Signature date of the signature |
| expirationDate | uint256 | Expiration date of the signature |
| signature | bytes | Signature of the read link request made by the owner |

### addPermissionPrice

```solidity
function addPermissionPrice() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### addPermissionPriceInfo

```solidity
function addPermissionPriceInfo() external view returns (uint256 priceInUtilityToken)
```

Returns the price for storing a permission

*Returns the current pricing for storing a permission*


#### Returns

| Name | Type | Description |
|---|---|---|
| priceInUtilityToken | uint256 | Current price of storing a permission in utility token ($MASA) |

### estimateSwapAmount

```solidity
function estimateSwapAmount(address _fromToken, address _toToken, uint256 _amountOut) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _fromToken | address | undefined |
| _toToken | address | undefined |
| _amountOut | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getIdentityId

```solidity
function getIdentityId(address token, uint256 tokenId) external view returns (uint256)
```

Returns the identityId owned by the given token

*The token must be linked to this soul linker*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of the SBT contract |
| tokenId | uint256 | Id of the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Id of the identity |

### getSBTLinks

```solidity
function getSBTLinks(uint256 identityId, address token) external view returns (uint256[])
```

Returns the list of linked SBTs by a given SBT token

*The token must be linked to this soul linker*

#### Parameters

| Name | Type | Description |
|---|---|---|
| identityId | uint256 | Id of the identity |
| token | address | Address of the SBT contract |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256[] | List of linked SBTs |

### getSBTLinks

```solidity
function getSBTLinks(address owner, address token) external view returns (uint256[])
```

Returns the list of linked SBTs by a given SBT token

*The token must be linked to this soul linker*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | Address of the owner of the identity |
| token | address | Address of the SBT contract |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256[] | List of linked SBTs |

### linkedSBT

```solidity
function linkedSBT(address) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### linkedSBTs

```solidity
function linkedSBTs(uint256) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### removeLinkedSBT

```solidity
function removeLinkedSBT(address token) external nonpayable
```

Removes an SBT from the list of linked SBTs

*The caller must be the owner to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of the SBT contract |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### reserveWallet

```solidity
function reserveWallet() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### revokePermission

```solidity
function revokePermission(uint256 readerIdentityId, uint256 ownerIdentityId, address token, uint256 tokenId, uint256 signatureDate) external nonpayable
```

Revokes the permission

*The token must be linked to this soul linker*

#### Parameters

| Name | Type | Description |
|---|---|---|
| readerIdentityId | uint256 | Id of the identity of the reader |
| ownerIdentityId | uint256 | Id of the identity of the owner of the SBT |
| token | address | Address of the SBT contract |
| tokenId | uint256 | Id of the token |
| signatureDate | uint256 | Signature date of the signature |

### setAddPermissionPrice

```solidity
function setAddPermissionPrice(uint256 _addPermissionPrice) external nonpayable
```

Sets the price of store permission in stable coin

*The caller must have the owner to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _addPermissionPrice | uint256 | New price of the store permission in stable coin |

### setReserveWallet

```solidity
function setReserveWallet(address _reserveWallet) external nonpayable
```

Set the reserve wallet

*Let change the reserve walled. It can be triggered by an authorized account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _reserveWallet | address | New reserve wallet |

### setSoulboundIdentity

```solidity
function setSoulboundIdentity(contract ISoulboundIdentity _soulboundIdentity) external nonpayable
```

Sets the SoulboundIdentity contract address linked to this soul name

*The caller must be the owner to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _soulboundIdentity | contract ISoulboundIdentity | Address of the SoulboundIdentity contract |

### setStableCoin

```solidity
function setStableCoin(address _stableCoin) external nonpayable
```

Sets the stable coin to pay the fee in (USDC)

*The caller must have the owner to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _stableCoin | address | New stable coin to pay the fee in |

### setSwapRouter

```solidity
function setSwapRouter(address _swapRouter) external nonpayable
```

Sets the swap router address

*The caller must have the owner to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _swapRouter | address | New swap router address |

### setUtilityToken

```solidity
function setUtilityToken(address _utilityToken) external nonpayable
```

Sets the utility token to pay the fee in ($MASA)

*The caller must have the owner to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _utilityToken | address | New utility token to pay the fee in |

### setWrappedNativeToken

```solidity
function setWrappedNativeToken(address _wrappedNativeToken) external nonpayable
```

Sets the wrapped native token address

*The caller must have the owner to call this function*

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

### swapRouter

```solidity
function swapRouter() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### utilityToken

```solidity
function utilityToken() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### validatePermission

```solidity
function validatePermission(uint256 readerIdentityId, uint256 ownerIdentityId, address token, uint256 tokenId, uint256 signatureDate) external view returns (string)
```

Validates the permission of the given read link request and returns the data that reader can read if the permission is valid

*The token must be linked to this soul linker*

#### Parameters

| Name | Type | Description |
|---|---|---|
| readerIdentityId | uint256 | Id of the identity of the reader |
| ownerIdentityId | uint256 | Id of the identity of the owner of the SBT |
| token | address | Address of the SBT contract |
| tokenId | uint256 | Id of the token |
| signatureDate | uint256 | Signature date of the signature |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | `true` if the signature is valid, `false` otherwise |

### wrappedNativeToken

```solidity
function wrappedNativeToken() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |



## Events

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



