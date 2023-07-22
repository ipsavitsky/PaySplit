import { ethers, getAddress, ZeroAddress } from "ethers"
import { getProvider } from "./web3";
import { GelatoRelay } from "@gelatonetwork/relay-sdk"
import { getSafeInfo, submitTxs } from "./safeapp";
import { getManager } from "./protocol";
import { getCurrentNonce } from "./safe";
import { getSafeMultisigTxs, SafeMultisigTransaction } from "./services";
import cont from "./abi.json"

const SAMPLE_PLUGIN_CHAIN_ID = 5
const SAMPLE_PLUGIN_ADDRESS = getAddress("0x02d60EcbdEC249860ACF94A2ba2f92C87b3A3cEF")
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
