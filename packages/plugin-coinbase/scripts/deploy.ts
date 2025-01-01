import { ethers } from "hardhat";

async function main() {
    const initialSupply = ethers.parseEther("1000000"); // 1 million tokens with 18 decimals

    console.log("Deploying CheshToken contract...");
    const CheshToken = await ethers.getContractFactory("CheshToken");
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
