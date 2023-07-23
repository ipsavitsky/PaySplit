import { ethers, getAddress } from "ethers"
import { getProvider } from "./web3";
import { submitTxs } from "./safeapp";
import { getSafeMultisigTxs, SafeMultisigTransaction } from "./services";
import { getCurrentNonce } from "./safe";

import cont from "./abi.json"

const SAMPLE_PLUGIN_CHAIN_ID = 5
const SAMPLE_PLUGIN_ADDRESS = getAddress("0x2B899F5672C9da3310B8adCCAFb82D3f92D6Bc45")
export const NATIVE_TOKEN = getAddress("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");

export const isKnownSamplePlugin = (chainId: number, address: string): boolean =>
    ethers.toBigInt(chainId) == ethers.toBigInt(SAMPLE_PLUGIN_CHAIN_ID) &&
    getAddress(address) === SAMPLE_PLUGIN_ADDRESS

const getRelayPlugin = async () => {
    const provider = await getProvider()
    return new ethers.Contract(
        SAMPLE_PLUGIN_ADDRESS,
        cont,
        provider
    )
}
export const setCoveredContractPercent = async (percent: number) => {
    try {
        const plugin = await getRelayPlugin()
        await submitTxs([
            {
                to: await plugin.getAddress(),
                value: "0",
                data: (await plugin.setCoveredPercent.populateTransaction(percent)).data
            }
        ])
    } catch (e) {
        console.error(e)
    }
}

export const getNextTxs = async(safe: string): Promise<SafeMultisigTransaction[]> => {
    const currentNonce = await getCurrentNonce(safe)
    const { results: txs } = await getSafeMultisigTxs(safe, { nonce: currentNonce })
    return txs
}

export const getCoveredContractPercent = async (): Promise<number> => {
    try {
        const plugin = await getRelayPlugin();
        const res = await plugin.coveredPercent();
        console.log(`${Number(res)}`)
        return Number(res)
    } catch (e) {
        console.error(e)
    }
    return 0
}


export const drainPluginContract = async (safe: string) => {
    try {
        const plugin = await getRelayPlugin()
        await submitTxs([
            {
                to: await plugin.getAddress(),
                value: "0",
                data: (await plugin.drain.populateTransaction(safe)).data
            }
        ])
    } catch (e) {
        console.error(e)
    }
}