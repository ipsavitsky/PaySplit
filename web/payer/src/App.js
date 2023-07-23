import './App.css';

import { ethers } from "ethers";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { getCoveredContractPercent, pay_EOA_part } from "./logic/payer.ts";
import { MetaMaskSDK } from '@metamask/sdk';

import contract from './contractAbi/contractAbi.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    // reset state, just in case
    setCurrentAccount("");

    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);
    

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

        setupEventListener()
    } else {
        console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Make sure you have metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

        // TODO: you might want to add event listeners here
        /*
        connectedContract.on("EventName", () => {
          console.log("Event EventName triggered.")
        });
        */

        console.log("Completed event listener setup")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  const [safeAddress, setSafeAddress] = useState('');
  const [targetAddress, settargetAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [percent, setPercent] = useState('');

  const handleSafeAddressChange = (e) => {
    setSafeAddress(e.target.value);
  };

  const handleTargetAddressChange = (e) => {
    settargetAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleRefreshAmount = async () => {
    setPercent(await getCoveredContractPercent());
  };

  handleRefreshAmount();

  const handleButtonClick = () => {
    // const options = {
    //   injectProvider: false,
    //   communicationLayerPreference: 'webrtc',
    // };
    // const MMSDK = new MetaMaskSDK(options);
    

    // const ethereum = MMSDK.getProvider();
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    pay_EOA_part(signer, currentAccount, targetAddress, safeAddress, amount, percent)
  };

  // TODO: add your contract-specific data & UI elements here
  const RenderUI = () => {
    return (
      <div>
        <div>
        <p>Covered percent: {percent}</p>
        <button onClick={handleRefreshAmount}>Refresh percent</button>
        </div>
        <div>
          <label htmlFor="safeAddress">safeAddress:</label>
          <input
            type="text"
            id="safeAddress"
            value={safeAddress}
            onChange={handleSafeAddressChange}
          />
        </div>
        <div>
          <label htmlFor="targetAddress">targetAddress:</label>
          <input
            type="text"
            id="targetAddress"
            value={targetAddress}
            onChange={handleTargetAddressChange}
          />
        </div>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="amount"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
        <button onClick={handleButtonClick}>Submit</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
          {currentAccount === "" ? renderNotConnectedContainer() : RenderUI()}
      </header>
    </div>
  );
}

export default App;
