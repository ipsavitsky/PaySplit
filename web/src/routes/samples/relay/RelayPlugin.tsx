import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Relay.css";
import { CircularProgress, Card } from '@mui/material';
import { setCoveredContractPercent, getCoveredContractPercent, isKnownSamplePlugin } from "../../../logic/sample";
import { getSafeInfo, isConnectedToSafe, submitTxs } from "../../../logic/safeapp";
import { SafeInfo } from '@safe-global/safe-apps-sdk';

// import { assert } from "console";

// this is the worst thing ever???
function multiplyBigIntByFloat(bigintNum: bigint, floatNum: number): number {
    const result = Number(bigintNum) * floatNum;
    return result;
}

export const RelayPlugin: FunctionComponent<{}> = () => {
    const { pluginAddress } = useParams();
    const [safeInfo, setSafeInfo] = useState<SafeInfo | undefined>(undefined)
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setCoveredPercentage(await getCoveredContractPercent())
            } catch (e) {
                console.error(e)
            }
        }
        fetchData()
    }, [])

    const setPercentHandle = useCallback(async (part: number) => {
        await setCoveredContractPercent(part);
    }, []);

    const isLoading = safeInfo === undefined;

    return (
        <div className="Sample centered">
            <Card className="Settings">
                {isLoading && <CircularProgress />}
                {safeInfo !== undefined && <>
                    <div>
                        Current split allowance is {coveredPercentage}% <br/> 
                        <input type="range" min="0" max="100" defaultValue={coveredPercentage!} value={prepaidAmount} onChange={(event) => setPrepaidAmount(parseInt(event.target.value, 10))} /> <br />
                        {prepaidAmount}% of the transaction will be paid from the Safe Wallet.
                    </div> <br />
                    <button className="button-18" onClick={() => setPercentHandle(prepaidAmount)}>Set prepaid amount</button>
                </>}
            </Card>
        </div>
    );
};
