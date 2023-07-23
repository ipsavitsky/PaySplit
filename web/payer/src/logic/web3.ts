import { ethers } from "ethers"
import { PROTOCOL_PUBLIC_RPC } from "./constants"

export const getProvider = async (): Promise<any> => {
    console.log("Use JsonRpcProvider")
    return new ethers.providers.JsonRpcProvider(PROTOCOL_PUBLIC_RPC)
}