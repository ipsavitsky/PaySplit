import { ethers, getAddress, ZeroAddress } from "ethers"
import { getProvider } from "./web3";
import { submitTxs } from "./safeapp";
import { getManager } from "./protocol";
import { getCurrentNonce } from "./safe";
import { getSafeMultisigTxs, SafeMultisigTransaction } from "./services";

const SAMPLE_PLUGIN_CHAIN_ID = 5
const SAMPLE_PLUGIN_ADDRESS = getAddress("0x60D996eF6F281eD4f562537fab84CFE192FF0206")
export const NATIVE_TOKEN = getAddress("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
const SAMPLE_PLUGIN_ABI = [
    "function maxFeePerToken(address account, address token) public view returns (uint256 maxFee)",
    "function setMaxFeePerToken(address token, uint256 maxFee) external",
    "function executeFromPlugin(address manager, address safe, bytes calldata data) external"
]
const ECR20_ABI = [
    "function decimals() public view returns (uint256 decimals)",
    "function symbol() public view returns (string symbol)",
]

export const isKnownSamplePlugin = (chainId: number, address: string): boolean =>
    ethers.toBigInt(chainId) == ethers.toBigInt(SAMPLE_PLUGIN_CHAIN_ID) &&
    getAddress(address) === SAMPLE_PLUGIN_ADDRESS

const getRelayPlugin = async () => {
    const provider = await getProvider()
    return new ethers.Contract(
        SAMPLE_PLUGIN_ADDRESS,
        SAMPLE_PLUGIN_ABI,
        provider
    )
}

export const openTransaction = async (account: string, amount: number) => {
    try {
        const plugin = await getRelayPlugin()
        await submitTxs([
            {
                to: await plugin.getAddress(),
                value: "0",
                data: undefined
            }
        ])
    } catch (e) {
        console.error(e);
    }
}