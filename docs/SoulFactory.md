# SoulFactory

*Masa Finance*

> Soul Factory

Soul Factory, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee

*From this smart contract we can mint new Soulbound Identities and Soul Name NFTs. This minting can be done paying a fee in ETH, USDC or CORN*

## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### PAUSER_ROLE

```solidity
function PAUSER_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### defaultStableCoin

```solidity
function defaultStableCoin() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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

### mintingIdentityPrice

```solidity
function mintingIdentityPrice() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### mintingNamePrice

```solidity
function mintingNamePrice() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### pause

```solidity
function pause() external nonpayable
```

Pauses the operations in the smart contract

*Sets an emergency stop mechanism that can be triggered by an authorized account.*


### paused

```solidity
function paused() external view returns (bool)
```



*Returns true if the contract is paused, and false otherwise.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### purchase

```solidity
function purchase(address paymentMethod, string name) external payable returns (uint256)
```

Mints a new Soulbound Identity purchasing it

*This function allows the purchase of a soulbount identity usign stable coin (USDC), native token (ETH) or utility token ($CORN)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| paymentMethod | address | Address of token that user want to pay |
| name | string | Name of the new soul name |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | TokenId of the new soulbound identity |

### purchaseIdentityInfo

```solidity
function purchaseIdentityInfo() external view returns (uint256 priceInStableCoin, uint256 priceInETH, uint256 priceInUtilityToken)
```

Returns the price of the identity minting

*Returns all current pricing and amount informations for a purchase*


#### Returns

| Name | Type | Description |
|---|---|---|
| priceInStableCoin | uint256 | Current price of the identity minting in stable coin |
| priceInETH | uint256 | Current price of the identity minting in native token (ETH) |
| priceInUtilityToken | uint256 | Current price of the identity minting in utility token ($CORN) |

### purchaseNameInfo

```solidity
function purchaseNameInfo() external view returns (uint256 priceInStableCoin, uint256 priceInETH, uint256 priceInUtilityToken)
```

Returns the price of the name minting

*Returns all current pricing and amount informations for a purchase*


#### Returns

| Name | Type | Description |
|---|---|---|
| priceInStableCoin | uint256 | Current price of the name minting in stable coin |
| priceInETH | uint256 | Current price of the name minting in native token (ETH) |
| priceInUtilityToken | uint256 | Current price of the name minting in utility token ($CORN) |

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

### reserveWallet

```solidity
function reserveWallet() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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

### setDefaultStableCoin

```solidity
function setDefaultStableCoin(address _defaultStableCoin) external nonpayable
```

Sets the default stable coin to pay the fee in (USDC)

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _defaultStableCoin | address | New default stable coin to pay the fee in |

### setMintingIdentityPrice

```solidity
function setMintingIdentityPrice(uint256 _mintingIdentityPrice) external nonpayable
```

Sets the price of the identity minting in stable coin

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _mintingIdentityPrice | uint256 | New price of the identity minting in stable coin |

### setMintingNamePrice

```solidity
function setMintingNamePrice(uint256 _mintingNamePrice) external nonpayable
```

Sets the price of the name minting in stable coin

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _mintingNamePrice | uint256 | New price of the name minting in stable coin |

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
function setSoulboundIdentity(contract SoulboundIdentity _soulboundIdentity) external nonpayable
```

Sets the SoulboundIdentity contract address linked to this factory

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _soulboundIdentity | contract SoulboundIdentity | New SoulboundIdentity contract address |

### setUtilityToken

```solidity
function setUtilityToken(address _utilityToken) external nonpayable
```

Sets the utility token to pay the fee in ($CORN)

*The caller must have the admin role to call this function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _utilityToken | address | New utility token to pay the fee in |

### soulboundIdentity

```solidity
function soulboundIdentity() external view returns (contract SoulboundIdentity)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract SoulboundIdentity | undefined |

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

### unpause

```solidity
function unpause() external nonpayable
```

Unpauses the operations in the smart contract

*Unsets an emergency stop mechanism. It can be triggered by an authorized account.*


### utilityToken

```solidity
function utilityToken() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |



## Events

### Paused

```solidity
event Paused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

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

### SoulNamePurchased

```solidity
event SoulNamePurchased(address indexed account, string indexed name, uint256 price)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account `indexed` | address | undefined |
| name `indexed` | string | undefined |
| price  | uint256 | undefined |

### SoulboundIdentityPurchased

```solidity
event SoulboundIdentityPurchased(address indexed account, string indexed name, uint256 price)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account `indexed` | address | undefined |
| name `indexed` | string | undefined |
| price  | uint256 | undefined |

### Unpaused

```solidity
event Unpaused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |



