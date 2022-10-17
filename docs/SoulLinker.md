# SoulLinker

*Masa Finance*

> Soul linker

Soul linker smart contract that let add links to a Soulbound token.



## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### addLinkedSBT

```solidity
function addLinkedSBT(address token) external nonpayable
```

Adds an SBT to the list of linked SBTs

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of the SBT contract |

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

### hasLinks

```solidity
function hasLinks(address token, uint256 tokenId) external pure returns (bool)
```

Query if the contract has links for the given token id



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of the token linked to the soul |
| tokenId | uint256 | Id of the token linked to the soul |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | `true` if the contract has links, `false` otherwise |

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

### removeLinkedSBT

```solidity
function removeLinkedSBT(address token) external nonpayable
```

Removes an SBT from the list of linked SBTs

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of the SBT contract |

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

### setSoulboundIdentity

```solidity
function setSoulboundIdentity(contract ISoulboundIdentity _soulboundIdentity) external nonpayable
```

Sets the SoulboundIdentity contract address linked to this soul name

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _soulboundIdentity | contract ISoulboundIdentity | Address of the SoulboundIdentity contract |

### soulboundIdentity

```solidity
function soulboundIdentity() external view returns (contract ISoulboundIdentity)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ISoulboundIdentity | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

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

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
```





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





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |



