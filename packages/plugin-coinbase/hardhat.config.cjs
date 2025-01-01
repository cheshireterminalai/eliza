require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        "base-mainnet": {
            url: "https://mainnet.base.org",
            accounts: [`0x${process.env.COINBASE_GENERATED_WALLET_HEX_SEED}`],
            chainId: 8453,
        },
    },
};
