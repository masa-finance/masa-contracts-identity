# SoulLinker

*Masa Finance*

> Soul linker

Soul linker smart contract that let add links to a Soulbound token.



## Methods

### hasLinks

```solidity
function hasLinks(address, uint256) external pure returns (bool)
```

Query if the contract has links for the given token id



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | `true` if the contract has links, `false` otherwise |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### validateLinkData

```solidity
function validateLinkData(address reader, uint256 identityId, address token, uint256 tokenId, uint256 expirationDate, bytes signature) external view returns (bool)
```

Validates the signature of the given read link request

*The token must be linked to this soul linker*

#### Parameters

| Name | Type | Description |
|---|---|---|
| reader | address | Address of the reader |
| identityId | uint256 | Id of the identity |
| token | address | Address of the SBT contract |
| tokenId | uint256 | Id of the token |
| expirationDate | uint256 | Expiration date of the signature |
| signature | bytes | Signature of the read link request made by the owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | `true` if the signature is valid, `false` otherwise |



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



