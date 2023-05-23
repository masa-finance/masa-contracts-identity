import * as fs from "fs";

const deploymentsFolder = "./deployments/";

/**
 * main function
 */
async function main() {
  fs.readdirSync(deploymentsFolder).forEach((network) => {
    // for each network
    console.log(`Network: ${network}`);
    const networkFolder = `${deploymentsFolder}${network}/`;
    fs.readdirSync(networkFolder)
      .filter((fn) => fn.endsWith(".json"))
      .forEach((contract) => {
        // for each contract
        console.log(`Contract: ${contract}`);
      });
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
