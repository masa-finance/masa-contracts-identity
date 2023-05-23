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
      .forEach((file) => {
        // for each contract
        const contract = file.slice(0, -5);
        const jsonString = fs.readFileSync(`${networkFolder}${file}`, "utf-8");
        const json = JSON.parse(jsonString);
        console.log(`  Address: ${json.address} Contract: ${contract}`);
      });
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
