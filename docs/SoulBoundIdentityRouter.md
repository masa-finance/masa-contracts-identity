# SoulBoundIdentityRouter









## Methods

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getIdentityData

```solidity
function getIdentityData(string name) external view returns (string sbtName, uint256 identityId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| sbtName | string | undefined |
| identityId | uint256 | undefined |

### getIdentityNames

```solidity
function getIdentityNames(uint256 tokenId) external view returns (string[] sbtNames)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| sbtNames | string[] | undefined |

### getIdentityNames

```solidity
function getIdentityNames(address owner) external view returns (string[] sbtNames)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| sbtNames | string[] | undefined |

### mintIdentityWithName

```solidity
function mintIdentityWithName(address to, string name) external payable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### nameExists

```solidity
function nameExists(string name) external view returns (bool exists)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| exists | bool | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### ownerOf

```solidity
function ownerOf(string name) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### setSoulBoundIdentity

```solidity
function setSoulBoundIdentity(contract SoulBoundIdentity _soulBoundIdentity) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _soulBoundIdentity | contract SoulBoundIdentity | undefined |

### setSoulName

```solidity
function setSoulName(contract SoulName _soulName) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _soulName | contract SoulName | undefined |

### soulBoundIdentity

```solidity
function soulBoundIdentity() external view returns (contract SoulBoundIdentity)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract SoulBoundIdentity | undefined |

### soulName

```solidity
function soulName() external view returns (contract SoulName)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract SoulName | undefined |

### tokenOfOwner

```solidity
function tokenOfOwner(address owner) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tokenURI

```solidity
function tokenURI(string name) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenURI

```solidity
function tokenURI(address owner) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |



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



