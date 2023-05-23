import * as fs from "fs";

const deploymentsFolder = "./deployments/";
const addressesFile = "./addresses.json";

/**
 * main function
 */
async function main() {
  // JSON to be written in ./addresses.json file
  let addresses = {};

  fs.readdirSync(deploymentsFolder).forEach((network) => {
    // for each network
    addresses[network] = {};
    const networkFolder = `${deploymentsFolder}${network}/`;

    fs.readdirSync(networkFolder)
      .filter((fn) => fn.endsWith(".json"))
      .forEach((file) => {
        // for each contract
        const contract = file.slice(0, -5);
        const jsonString = fs.readFileSync(`${networkFolder}${file}`, "utf-8");
        const json = JSON.parse(jsonString);

        addresses[network][contract] = json.address;
      });
  });

  // Write addresses to /addresses.json file
  fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
