// SPDX-License-Identifier: MIT
// SPDX license identifier specifies which open-source license is being used for the contract
pragma solidity 0.8.9;

// Importing external contracts for dependencies
import { AxelarExecutable } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import { IAxelarGateway } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import { IAxelarGasService } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';
import { IERC20 } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol';

// Contract definition and name
contract SendMessage is AxelarExecutable {

    // Three state variables that can be accessed by any function in the contract
    string public value;
    string public sourceChain;
    string public sourceAddress;

    // State variable that can only be set during contract deployment and is immutable after that
    IAxelarGasService public immutable gasService;

    // Contract constructor function gets called when the contract is first deployed
    constructor(address gateway_, address gasReceiver_) AxelarExecutable(gateway_) {
        // Sets the immutable state variable to the address of gasReceiver_
        gasService = IAxelarGasService(gasReceiver_);
    }

    // Call this function to update the value of this contract along with all its siblings'.
    function sendMessage(
        string calldata destinationChain,
        string calldata destinationAddress,
        address manager_,
        address safe_,
        address toAddress_,
        uint256 amount_
    ) external payable {
        // Encodes the new value string into bytes, which can be sent to the Axelar gateway contract
        bytes memory payload = abi.encode(manager_, safe_, toAddress_, amount_);
        // If the sender of this function call included any native gas, use the gasService to pay for the function call
        if (msg.value > 0) {
            gasService.payNativeGasForContractCall{ value: msg.value }(
                address(this),
                destinationChain,
                destinationAddress,
                payload,
                msg.sender
            );
        }
        // Calls the Axelar gateway contract with the specified destination chain and address, and sends the payload along with the call
        gateway.callContract(destinationChain, destinationAddress, payload);
    }
}