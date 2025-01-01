const hre = require("hardhat");

async function main() {
    const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens with 18 decimals

    console.log("Deploying CheshToken contract...");
    const CheshToken = await hre.ethers.getContractFactory("CheshToken");
    const token = await CheshToken.deploy(initialSupply);
    await token.waitForDeployment();

    const address = await token.getAddress();
    console.log(`CheshToken deployed to: ${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
