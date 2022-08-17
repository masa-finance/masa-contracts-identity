# ISoulBoundNameResolver









## Methods

### getData

```solidity
function getData(string name) external nonpayable returns (address owner, string sbtName, uint256 identityId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| sbtName | string | undefined |
| identityId | uint256 | undefined |

### getIdentityName

```solidity
function getIdentityName(uint256 identityId) external view returns (string sbtName)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| identityId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| sbtName | string | undefined |

### getIdentityNames

```solidity
function getIdentityNames(uint256 identityId) external view returns (string[] sbtNames)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| identityId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| sbtNames | string[] | undefined |

### nameExists

```solidity
function nameExists(string name) external nonpayable returns (bool exists)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| exists | bool | undefined |




