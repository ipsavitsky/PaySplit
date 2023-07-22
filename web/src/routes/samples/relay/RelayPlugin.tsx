import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { formatUnits, isAddress, parseUnits } from "ethers"
import { useParams } from "react-router-dom";
import "./Relay.css";
import { CircularProgress, FormControl, InputLabel, Select, MenuItem, TextField, Button, Typography, Card } from '@mui/material';
import { setCoveredContractPercent, getCoveredContractPercent, pay_EOA_part, isKnownSamplePlugin } from "../../../logic/sample";
import { getSafeInfo, isConnectedToSafe, submitTxs } from "../../../logic/safeapp";
import { SafeInfo } from '@safe-global/safe-apps-sdk';
import { NextTxsList } from "./NextTxs";
import { SafeMultisigTransaction } from "../../../logic/services";
import { RelayDialog } from "./RelayDialog";
import { Percent } from "@mui/icons-material";
// import { assert } from "console";

// this is the worst thing ever???
function multiplyBigIntByFloat(bigintNum: bigint, floatNum: number): number {
    const result = Number(bigintNum) * floatNum;
    return result;
}

export const RelayPlugin: FunctionComponent<{}> = () => {
    const { pluginAddress } = useParams();
    // const [newMaxFee, setNewMaxFee] = useState<string>("");
    // const [txToRelay, setTxToRelay] = useState<SafeMultisigTransaction | undefined>(undefined);
    const [safeInfo, setSafeInfo] = useState<SafeInfo | undefined>(undefined)
    // const [feeTokens, setFeeTokens] = useState<string[]>([])
    // const [maxFee, setMaxFee] = useState<bigint | undefined>(undefined)
    // const [selectedFeeToken, setSelectedFeeToken] = useState<string | undefined>(undefined)
    // const [selectedFeeTokenInfo, setSelectedFeeTokenInfo] = useState<TokenInfo | undefined>(undefined)
    const [destinationAddress, setDestinationAddress] = useState<string>("");
    const [txAmount, setTxAmount] = useState<string>("");
    const [prepaidAmount, setPrepaidAmount] = useState<number>(0.0);
    const [coveredPercentage, setCoveredPercentage] = useState<number | null>(null);
    console.log({ pluginAddress })
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!await isConnectedToSafe()) throw Error("Not connected to Safe")
                const info = await getSafeInfo()
                if (!isKnownSamplePlugin(info.chainId, pluginAddress!!)) throw Error("Unknown Plugin")
                setSafeInfo(info)
            } catch (e) {
                console.error(e)
            }
        }
        fetchData();
    }, [pluginAddress]);

    const setPercentHandle = useCallback(async (part: number) => {
        await setCoveredContractPercent(part);
    }, []);

    const getPercentHandle = useCallback(async () => {
        const resp = await getCoveredContractPercent();
        console.log(`${Number(resp)}`)
        setCoveredPercentage(Number(resp))
    }, []);

    const executePayment = useCallback(async () => {
        if(!isAddress(destinationAddress)) return
        await pay_EOA_part(destinationAddress, parseUnits(txAmount, "wei"), coveredPercentage);
    }, [destinationAddress, txAmount, coveredPercentage]);

    const isLoading = safeInfo === undefined;

    return (
        <div className="Sample">
            <Card className="Settings">
                {isLoading && <CircularProgress />}
                {safeInfo !== undefined && <>
                    <div>
                        <div>
                            <Typography variant="body1">Address:</Typography>
                            <TextField label={`address`} value={destinationAddress} onChange={(event) => setDestinationAddress(event.target.value)} />
                        </div>
                        <div>
                            <Typography variant="body1">Amount:</Typography>
                            <TextField label={`amount`} value={txAmount} onChange={(event) => setTxAmount(event.target.value)} />
                        </div>
                        <button onClick={() => getPercentHandle()}>Get covered percentage</button>

                        {coveredPercentage !== null && <>
                            <div>
                                Safe wallet covered {coveredPercentage}% of your transaction. <br />
                                <button onClick={() => executePayment()}>Send funds</button>
                            </div>
                        </>}<br />


                        <div>
                            <input type="range" min="0" max="100" value={prepaidAmount} onChange={(event) => setPrepaidAmount(parseInt(event.target.value, 10))} /> <br />
                            You will pay {prepaidAmount}% of the transaction.
                        </div>
                        <button onClick={() => setPercentHandle(prepaidAmount)}>Set prepaid amount</button>
                    </div>
                </>}
            </Card>
        </div>
    );
};
