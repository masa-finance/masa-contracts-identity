# ISoulName









## Methods

### getExtension

```solidity
function getExtension() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getSoulNames

```solidity
function getSoulNames(uint256 identityId) external view returns (string[] sbtNames)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| identityId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| sbtNames | string[] | undefined |

### getSoulNames

```solidity
function getSoulNames(address owner) external view returns (string[] sbtNames)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| sbtNames | string[] | undefined |

### getTokenData

```solidity
function getTokenData(string name) external view returns (string sbtName, uint256 identityId, uint256 expirationDate)
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
| expirationDate | uint256 | undefined |

### mint

```solidity
function mint(address to, string name, uint256 identityId, uint256 period) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| name | string | undefined |
| identityId | uint256 | undefined |
| period | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### soulNameExists

```solidity
function soulNameExists(string name) external view returns (bool exists)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| exists | bool | undefined |




