# SoulBoundFactory









## Methods

### mintSoulBoundIdentity

```solidity
function mintSoulBoundIdentity() external nonpayable
```






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


### setSoulBoundIdentity

```solidity
function setSoulBoundIdentity(contract SoulBoundIdentity _soulBoundIdentity) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _soulBoundIdentity | contract SoulBoundIdentity | undefined |

### setSoulBoundName

```solidity
function setSoulBoundName(contract SoulBoundName _soulBoundName) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _soulBoundName | contract SoulBoundName | undefined |

### soulBoundIdentity

```solidity
function soulBoundIdentity() external view returns (contract SoulBoundIdentity)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract SoulBoundIdentity | undefined |

### soulBoundName

```solidity
function soulBoundName() external view returns (contract SoulBoundName)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract SoulBoundName | undefined |

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



