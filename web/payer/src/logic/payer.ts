import { ethers } from "ethers"
import { getProvider } from "./web3";
import cont from "../contractAbi/contractAbi.json"
import { MetaMaskSDK } from '@metamask/sdk';

const SAMPLE_PLUGIN_CHAIN_ID = 5
const SAMPLE_PLUGIN_ADDRESS = "0x4ab38A01121D95643f0FFA7e19D34685B9Bb14A8"

export interface TokenInfo {
    address: string,
    symbol: string,
    decimals: bigint
}

const getRelayPlugin = async () => {
    const provider = await getProvider()
    return new ethers.Contract(
        SAMPLE_PLUGIN_ADDRESS,
        cont,
        provider
    )
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

export const pay_EOA_part = async (signer: any, accountFrom: string, accountTo: string, safe: string, txAmount: bigint, percentage: number | null) => {
    try {
        const plugin = await getRelayPlugin()
        const manager = "0xAbd9769A78Ee63632A4fb603D85F63b8D3596DF9"

        console.log(`${percentage}`)
        if (percentage !== null) {
            const str_send_am = String(Math.floor(Number(txAmount) * (100 - percentage) / 100))
            console.log(str_send_am)
            console.log(`${Object.getOwnPropertyNames(plugin.populateTransaction)}`)
            console.log(`${Object.getOwnPropertyNames(plugin.populateTransaction.executeFromPlugin)}`)
            console.log({signer})
            let tx = await plugin.connect(signer).executeFromPlugin(manager, safe, accountTo, txAmount, {value: str_send_am})
            const receipe = await tx.wait();
            // ethereum.request({ method: 'executeFromPlugin', params: [
            //     {
            //         from: accountFrom,
            //         to: SAMPLE_PLUGIN_ADDRESS,
            //         value: str_send_am,
            //         data: (await plugin.populateTransaction.executeFromPlugin(manager, safe, accountTo, txAmount)).data
            //     }
            // ] });
        } else throw "perc is null"
    } catch (e) {
        console.error(e)
    }
}