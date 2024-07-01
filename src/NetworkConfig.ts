interface NetworkConfig {
  admin: string;
  projectFeeReceiver: string;
  protocolFeeReceiver: string;
  protocolFeeAmount: number;
  protocolFeePercent: number;
  protocolFeePercentSub: number;
  authorityWallet: string;
  baseUri: string;
  soulNameContractUri: string;
  paymentMethodsSoulBoundCreditScore: string[];
  paymentMethodsSoulBoundGreen: string[];
  paymentMethodsSoulLinker: string[];
  paymentMethodsSoulStore: string[];
  swapRouter: string;
  usdcToken: string;
  masaToken: string;
  wethToken: string;
  soulBoundCreditScoreName: string;
  soulBoundCreditScoreSymbol: string;
  soulBoundCreditScoreMintingPrice: number;
  soulBoundGreenName: string;
  soulBoundGreenSymbol: string;
  soulBoundGreenMintingPrice: number;
  soulBoundIdentityName: string;
  soulBoundIdentitySymbol: string;
  soulNameName: string;
  soulNameSymbol: string;
  soulNameExtension: string;
  soulNamePrice1Len: number;
  soulNamePrice2Len: number;
  soulNamePrice3Len: number;
  soulNamePrice4Len: number;
  soulNamePrice5Len: number;
}

export function getNetworkConfig(
  networkName: string | undefined
): NetworkConfig {
  let networkConfig: NetworkConfig = {
    admin: getAdminAddress(networkName),
    projectFeeReceiver: "", // depends on network
    protocolFeeReceiver: "", // depends on network
    protocolFeeAmount: 0, // ok
    protocolFeePercent: 0, // ok
    protocolFeePercentSub: 0, // ok
    authorityWallet: isMainnet(networkName)
      ? "0x5b45dAA4645F79a419811dc0657FA1b2695c6Ab7"
      : "0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F",
    baseUri: isMainnet(networkName)
      ? "https://metadata.masa.finance/v1.0"
      : "https://beta.metadata.masa.finance/v1.0",
    soulNameContractUri: isMainnet(networkName)
      ? "ar://vFTF3cpr4r-oqBpeIlpd0VpGU-8AzGS2AQqNgnDXWAM"
      : "ar://bfG2m3VJU19fj6uGgyaxNY0QhK0G7RINYtw-GRVVqTM",
    paymentMethodsSoulBoundCreditScore: ["0x0000000000000000000000000000000000000000"],
    paymentMethodsSoulBoundGreen: ["0x0000000000000000000000000000000000000000"],
    paymentMethodsSoulLinker: ["0x0000000000000000000000000000000000000000"],
    paymentMethodsSoulStore: [],
    swapRouter: "",
    usdcToken: "",
    masaToken: "",
    wethToken: "",
    soulBoundCreditScoreName: "Masa Credit Score",
    soulBoundCreditScoreSymbol: "MCS",
    soulBoundCreditScoreMintingPrice:
      isCelo(networkName) || isBsc(networkName)
        ? 1000000000000000000
        : isEthereum(networkName) ||
            isPolygon(networkName) ||
            isScroll(networkName) ||
            isOpbnb(networkName)
          ? 1000000
          : 0,
    soulBoundGreenName: "Masa Green",
    soulBoundGreenSymbol: "MG-2FA",
    soulBoundGreenMintingPrice:
      isCelo(networkName) || isBsc(networkName)
        ? 1000000000000000000
        : isEthereum(networkName) ||
            isPolygon(networkName) ||
            isScroll(networkName) ||
            isOpbnb(networkName)
          ? 1000000
          : 0,
    soulBoundIdentityName: isBase(networkName)
      ? "Base Identity"
      : isCelo(networkName)
        ? "Celo Prosperity Passport"
        : "Masa Identity",
    soulBoundIdentitySymbol: isBase(networkName)
      ? "BID"
      : isCelo(networkName)
        ? "CPP"
        : "MID",
    soulNameName: isBase(networkName)
      ? "Base Domain Name"
      : isCelo(networkName)
        ? "Celo Domain Name"
        : "Masa Soul Name",
    soulNameSymbol: isBase(networkName)
      ? "BDN"
      : isCelo(networkName)
        ? "CDN"
        : "MSN",
    soulNameExtension: isBase(networkName)
      ? ".base"
      : isCelo(networkName)
        ? ".celo"
        : ".soul",
    soulNamePrice1Len: isBsc(networkName)
      ? 6250000000000000000000
      : isCelo(networkName)
        ? 100000000000000000000
        : isEthereum(networkName)
          ? 6250000000
          : isBase(networkName)
            ? 100000000
            : 0,
    soulNamePrice2Len: isBsc(networkName)
      ? 1250000000000000000000
      : isCelo(networkName)
        ? 25000000000000000000
        : isEthereum(networkName)
          ? 1250000000
          : isBase(networkName)
            ? 50000000
            : 0,
    soulNamePrice3Len: isBsc(networkName)
      ? 250000000000000000000
      : isCelo(networkName)
        ? 5000000000000000000
        : isEthereum(networkName)
          ? 250000000
          : isBase(networkName)
            ? 15000000
            : 0,
    soulNamePrice4Len: isBsc(networkName)
      ? 50000000000000000000
      : isCelo(networkName)
        ? 1000000000000000000
        : isEthereum(networkName)
          ? 50000000
          : isBase(networkName)
            ? 5000000
            : 0,
    soulNamePrice5Len: isBsc(networkName)
      ? 10000000000000000000
      : isEthereum(networkName)
        ? 10000000
        : isBase(networkName)
          ? 1000000
          : 0
  };

  return networkConfig;
}

function isMainnet(networkName: string | undefined): boolean {
  return (
    networkName === "ethereum" ||
    networkName === "masa" ||
    networkName === "bsc" ||
    networkName === "base" ||
    networkName === "polygon" ||
    networkName === "celo" ||
    networkName === "opbnb" ||
    networkName === "scroll"
  );
}

function isCelo(networkName: string | undefined): boolean {
  return networkName === "celo" || networkName === "alfajores";
}

function isBase(networkName: string | undefined): boolean {
  return networkName === "base" || networkName === "basegoerli";
}

function isBsc(networkName: string | undefined): boolean {
  return networkName === "bsc" || networkName === "bsctest";
}

function isEthereum(networkName: string | undefined): boolean {
  return networkName === "ethereum" || networkName === "sepolia";
}

function isPolygon(networkName: string | undefined): boolean {
  return networkName === "polygon" || networkName === "polygonmumbai";
}

function isOpbnb(networkName: string | undefined): boolean {
  return networkName === "opbnb" || networkName === "opbnbtest";
}

function isScroll(networkName: string | undefined): boolean {
  return networkName === "scroll" || networkName === "scrolltest";
}

function getAdminAddress(networkName: string | undefined): string {
  switch (networkName) {
    case "ethereum":
      return "0x0f97D276203408a410d430b5dada7870AE1E45C9";
    case "sepolia":
      return "0x574f1dC03c4ACBa6b401fDC607610BF10A1659fF";
    case "masa":
      return "0x06168A0f16DFbe0cea6fa3E2807026617C96a2b8";
    case "masatest":
      return "0x19B35C375BE865A902423590f68B8B5f0ec02574";
    case "base":
      return "0x503aac45399e32B99BD6Ffa83F723D367f15e222";
    case "basegoerli":
      return "0x503aac45399e32B99BD6Ffa83F723D367f15e222";
    case "bsc":
      return "0xD9f8D4359C034E1290d83b70e73e32fdd31a663B";
    case "bsctest":
      return "0xd207773F00222aA85A44770ed18F9D09861F6f0b";
    case "polygon":
      return "0x47d640442215b49f22FC227488d2e840E10fff4D";
    case "polygonmumbai":
      return "0x46c9cdA3F83C5c13C767A07b6E80aEd302E40B28";
    default: // hardhat or undefined
      return "";
  }
}
