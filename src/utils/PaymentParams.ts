import {
  MASA_GOERLI,
  SWAPROUTER_GOERLI,
  USDC_GOERLI,
  WETH_GOERLI
} from "../../src/constants";

export function paymentParams(networkName: string, ethers: any) {
  let swapRouter: string;
  let wrappedNativeToken: string; // weth
  let stableCoin: string; // usdc
  let masaCoin: string; // masa

  if (networkName == "mainnet") {
    // mainnet
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    stableCoin = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    masaCoin = ethers.constants.AddressZero;
  } else if (networkName == "goerli") {
    // goerli
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = WETH_GOERLI;
    stableCoin = USDC_GOERLI;
    masaCoin = MASA_GOERLI;
  } else if (networkName == "hardhat") {
    // hardhat
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = WETH_GOERLI;
    stableCoin = USDC_GOERLI;
    masaCoin = MASA_GOERLI;
  } else {
    console.log(networkName);
    throw new Error("Network not supported");
  }

  return {
    swapRouter,
    wrappedNativeToken,
    stableCoin,
    masaCoin
  };
};
