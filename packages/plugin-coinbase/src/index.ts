import { createRequire } from "node:module";

import { ethers } from "ethers";

import { elizaLogger } from "@elizaos/core";

const require = createRequire(import.meta.url);

const ERC20_ABI = [
    "constructor(string name_, string symbol_, uint256 totalSupply_)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const ERC20_BYTECODE =
    "0x608060405234801561001057600080fd5b506040516108023803806108028339818101604052810190610032919061022a565b82600390805190602001906100489291906100c0565b5081600490805190602001906100609291906100c0565b5080600281905550806000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050505061040f565b8280546100cc90610330565b90600052602060002090601f0160209004810192826100ee5760008555610135565b82601f1061010757805160ff1916838001178555610135565b82800160010185558215610135579182015b82811115610134578251825591602001919060010190610119565b5b5090506101429190610146565b5090565b5b8082111561015f576000816000905550600101610147565b5090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6101ca82610181565b810181811067ffffffffffffffff821117156101e9576101e8610192565b5b80604052505050565b60006101fc610163565b905061020882826101c1565b919050565b600067ffffffffffffffff82111561022857610227610192565b5b61023182610181565b9050602081019050919050565b6000806040838503121561024157610240610177565b5b600083013567ffffffffffffffff81111561025f5761025e61017c565b5b61026b8582860161020d565b925050602083013567ffffffffffffffff81111561028c5761028b61017c565b5b6102988582860161020d565b9150509250929050565b600082825260208201905092915050565b60005b838110156102d25780820151818401526020810190506102b7565b838111156102e1576000848401525b50505050565b60006102f2826102a2565b6102fc81856102ad565b935061030c8185602086016102be565b61031581610181565b840191505092915050565b6000819050919050565b6000600282049050600182168061034857607f821691505b6020821081141561035c5761035b6103c0565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6103e48161031d565b82525050565b60006020820190506103ff60008301846103db565b92915050565b6103c8806104216000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806306fdde031461006757806318160ddd146100855780632e0f2625146100a357806370a08231146100c157806395d89b41146100f1578063a9059cbb1461010f575b600080fd5b61006f61012b565b60405161007c91906102c8565b60405180910390f35b61008d6101b9565b60405161009a91906102ea565b60405180910390f35b6100ab6101bf565b6040516100b891906102ea565b60405180910390f35b6100db60048036038101906100d69190610336565b6101c5565b6040516100e891906102ea565b60405180910390f35b6100f96101dd565b60405161010691906102c8565b60405180910390f35b61012960048036038101906101249190610363565b61026b565b005b60606003805461013a906103d2565b80601f0160208091040260200160405190810160405280929190818152602001828054610166906103d2565b80156101b35780601f10610188576101008083540402835291602001916101b3565b820191906000526020600020905b81548152906001019060200180831161019657829003601f168201915b5050505050905090565b60025481565b600a81565b60006020528060005260406000206000915090505481565b6060600480546101ec906103d2565b80601f0160208091040260200160405190810160405280929190818152602001828054610218906103d2565b80156102655780601f1061023a57610100808354040283529160200191610265565b820191906000526020600020905b81548152906001019060200180831161024857829003601f168201915b5050505050905090565b806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561031457806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461030091906104a2565b925050819055505b806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461036091906104f8565b92505081905550505050565b600081519050919050565b600082825260208201905092915050565b60005b838110156103a557808201518184015260208101905061038a565b838111156103b4576000848401525b50505050565b6000601f19601f8301169050919050565b60006103d68261036b565b6103e08185610376565b93506103f0818560208601610387565b6103f9816103ba565b840191505092915050565b6000819050919050565b61041781610404565b82525050565b600060208201905081810360008301526104378184610387565b905092915050565b600060208201905061045460008301846103db565b92915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006104888261045d565b9050919050565b6104988161047d565b81146104a357600080fd5b50565b60006104ad82610404565b91506104b883610404565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156104ed576104ec6104c9565b5b828201905092915050565b600061050382610404565b915061050e83610404565b925082821015610521576105206104c9565b5b82820390509291505056fea2646970667358221220d7821cf3f952515f1ab0f2f2f5a4c2f5c2f8a68e6e25f51716fb8ba2e4d5a85964736f6c63430008120033";

interface IAgentRuntime {
    character: {
        name: string;
        settings: {
            secrets?: {
                COINBASE_API_KEY?: string;
                COINBASE_PRIVATE_KEY?: string;
                COINBASE_GENERATED_WALLET_HEX_SEED?: string;
                COINBASE_GENERATED_WALLET_ID?: string;
                COINBASE_ORGANIZATION_ID?: string;
            };
            networks?: {
                [key: string]: {
                    chainId: string;
                    name: string;
                    enabled: boolean;
                    rpcUrl: string;
                    explorerUrl: string;
                };
            };
            defaultNetwork?: string;
        };
    };
    getSetting: (key: string) => string | undefined;
}

interface State {
    recentMessages: Array<{
        content: {
            name: string;
            symbol: string;
            totalSupply: string;
            decimals: number;
            network: string;
            text: string;
            contractType: string;
        };
    }>;
}

type Memory = Record<never, never>;
type HandlerOptions = Record<never, never>;

type HandlerCallback = (
    response: { text: string; error?: Error },
    actions?: unknown[]
) => void;

export const deployTokenContractAction = {
    name: "DEPLOY_TOKEN_CONTRACT",
    description: "Deploy an ERC20 token contract using ethers.js",
    validate: async (runtime: IAgentRuntime) => {
        elizaLogger.info("Validating runtime for DEPLOY_TOKEN_CONTRACT...");
        return (
            !!(
                runtime.character.settings.secrets?.COINBASE_API_KEY ||
                process.env.COINBASE_API_KEY
            ) &&
            !!(
                runtime.character.settings.secrets?.COINBASE_PRIVATE_KEY ||
                process.env.COINBASE_PRIVATE_KEY
            )
        );
    },
    handler: async (
        runtime: IAgentRuntime,
        memory: Memory,
        state: State,
        _options: HandlerOptions,
        callback: HandlerCallback
    ) => {
        elizaLogger.debug("Starting DEPLOY_TOKEN_CONTRACT handler...");
        try {
            const privateKey = process.env.COINBASE_GENERATED_WALLET_HEX_SEED;

            if (!privateKey) {
                throw new Error("Missing required private key");
            }

            elizaLogger.debug("Configuring ethers.js provider and wallet");

            const provider = new ethers.JsonRpcProvider(
                "https://mainnet.base.org"
            );

            const wallet = new ethers.Wallet(`0x${privateKey}`, provider);

            // Check wallet balance
            const balance = await provider.getBalance(wallet.address);
            elizaLogger.debug(
                `Wallet balance: ${ethers.formatEther(balance)} ETH`
            );

            if (balance === BigInt(0)) {
                callback(
                    {
                        text: `Wallet ${wallet.address} needs Base ETH to deploy the contract. Please send some ETH to this address.`,
                        error: new Error("Insufficient funds"),
                    },
                    []
                );
                return;
            }

            elizaLogger.debug("Deploying token contract with params:", {
                name: state.recentMessages[0].content.name,
                symbol: state.recentMessages[0].content.symbol,
                totalSupply: state.recentMessages[0].content.totalSupply,
                decimals: state.recentMessages[0].content.decimals,
            });

            const factory = new ethers.ContractFactory(
                ERC20_ABI,
                ERC20_BYTECODE,
                wallet
            );

            const contract = await factory.deploy(
                state.recentMessages[0].content.name,
                state.recentMessages[0].content.symbol,
                ethers.parseUnits(
                    state.recentMessages[0].content.totalSupply,
                    state.recentMessages[0].content.decimals
                )
            );

            elizaLogger.debug("Token contract deployment initiated");
            await contract.waitForDeployment();
            elizaLogger.debug("Token contract deployment completed");

            const contractAddress = await contract.getAddress();
            const transactionHash = contract.deploymentTransaction()?.hash;
            const transactionUrl = `https://basescan.org/tx/${transactionHash}`;

            callback(
                {
                    text: `Token contract deployed successfully:
- Name: ${state.recentMessages[0].content.name}
- Symbol: ${state.recentMessages[0].content.symbol}
- Network: base-mainnet
- Contract Address: ${contractAddress}
- Transaction URL: ${transactionUrl}
- Total Supply: ${state.recentMessages[0].content.totalSupply}
- Decimals: ${state.recentMessages[0].content.decimals}`,
                },
                []
            );
        } catch (error) {
            elizaLogger.error("Error deploying token contract:", error);
            callback(
                {
                    text: `Failed to deploy token contract: ${error instanceof Error ? error.message : String(error)}`,
                    error:
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                },
                []
            );
        }
    },
};
