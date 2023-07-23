import { useEffect, useState } from "react";
import Switch from "react-switch";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SendMessageContract from "../hardhat/artifacts/contracts/SendMessage.sol/SendMessage.json";

const BSC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BSC_CONTRACT_ADDRESS;
const AVALANCHE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_AVALANCHE_CONTRACT_ADDRESS;
const AVALANCHE_RPC_URL = process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL;

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  const manager = "0xAbd9769A78Ee63632A4fb603D85F63b8D3596DF9"
  const safe = "0xb011a210f04144B5866283D22e9A8616DAD87A92"
  const [toAddress, setToAddress] = useState(""); // State variable to hold the message content
  const [amount, setAmount] = useState(""); // State variable to hold the message content
  const [sourceChain, setSourceChain] = useState(""); // State variable to hold the source chain

  const [value, setValue] = useState(""); // State variable to hold the value

  const { config } = usePrepareContractWrite({
    // Calling a hook to prepare the contract write configuration
    address: BSC_CONTRACT_ADDRESS, // Address of the BSC contract
    abi: SendMessageContract.abi, // ABI (Application Binary Interface) of the contract
    functionName: "sendMessage", // Name of the function to call on the contract
    args: ["Linea Goerli", AVALANCHE_CONTRACT_ADDRESS, manager, safe, toAddress, amount], // Arguments to pass to the contract function
    value: 0, // Value to send along with the contract call
  });

  const { data: useContractWriteData, write } = useContractWrite(config); // Calling a hook to get contract write data and the write function

  const { data: useWaitForTransactionData, isSuccess } = useWaitForTransaction({
    // Calling a hook to wait for the transaction to be mined
    hash: useContractWriteData?.hash, // Hash of the transaction obtained from the contract write data
  });

  const handleSendMessage = () => {
    write(); // Initiating the contract call

    toast.info("Sending message...", {
      // Displaying a toast notification
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const provider = new ethers.providers.JsonRpcProvider(AVALANCHE_RPC_URL);
  const contract = new ethers.Contract(
    AVALANCHE_CONTRACT_ADDRESS,
    SendMessageContract.abi,
    provider
  );

  async function readDestinationChainVariables() {
    try {
      const value = await contract.value();
      const sourceChain = await contract.sourceChain();

      console.log(value.toString());
      console.log(sourceChain);
      setValue(value.toString());
      setSourceChain(sourceChain);
    } catch (error) {
      // console.log(error);
      // toast.error("Error reading message");
    }
  }

  useEffect(() => {
    readDestinationChainVariables();
    const body = document.querySelector("body");
    darkMode ? body.classList.add("dark") : body.classList.remove("dark");

    isSuccess
      ? toast.success("Message sent!", {
          position: "top-right",
          autoClose: 7000,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        })
      : useWaitForTransactionData?.error || useContractWriteData?.error
      ? toast.error("Error sending message")
      : null;
  }, [darkMode, useContractWriteData, useWaitForTransactionData]);

  return (
    <div className="container mx-auto px-4 flex flex-col min-h-screen">
      <header className="py-4">
        <div className="flex justify-between items-center">
          <Switch
            onChange={handleToggleDarkMode}
            checked={darkMode}
            onColor="#4F46E5"
            offColor="#D1D5DB"
            uncheckedIcon={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  fontSize: 15,
                  color: "#FFF",
                  paddingRight: 2,
                }}
              >
                ☀️
              </div>
            }
            checkedIcon={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  fontSize: 15,
                  color: "#FFF",
                  paddingRight: 2,
                }}
              >
                🌙
              </div>
            }
            className="react-switch"
          />
          <ConnectButton />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Interchain SplitPay 🪓
        </h1>
        <p className=" mb-8 text-center max-w-3xl text-gray-500">
          An interchain decentralized application using React, Solidity, and
          Axelar General Message Passing that allows users to send transactions
          over different chains using master account(Account Abstraction).
        </p>

        <div className="flex justify-center max-w-3xl">
          <div className="border border-gray-300 rounded-lg p-8 m-2 ">
            <h2 className="text-2xl font-bold mb-4">Send Transaction 📓 </h2>
            <textarea
              type="text"
              placeholder="Recepient Address"
              className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              onChange={(e) => setToAddress(e.target.value)}
            />
            <textarea
              type="number"
              placeholder="Amount"
              className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              onChange={(e) => {setAmount(BigInt(e.target.value)); console.log(amount)}}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full"
              onClick={() => handleSendMessage()}
            >
              Send
            </button>
          </div>
        </div>
      </main>
      <ToastContainer />
      <footer className="flex justify-center items-center py-8 border-t border-gray-300">
        <a
          href="https://github.com/Olanetsoft/fullstack-interchain-dapp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center font-bold text-blue-500 text-lg"
        >
          View on GitHub &rarr;
        </a>
      </footer>
    </div>
  );
}
