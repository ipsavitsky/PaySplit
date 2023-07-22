// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
// import {_getFeeCollectorRelayContext, _getFeeTokenRelayContext, _getFeeRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

import "hardhat/console.sol";

address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

contract SplitPayPlugin is BasePluginWithEventMetadata {
    event CoveredPercentUpdated(uint256 coveredPercent);

    error PercentTooHigh(uint256 coveredPercent);

    error FeeTooHigh(address feeToken, uint256 fee);
    error FeePaymentFailure(bytes data);
    error UntrustedOrigin(address origin);
    error RelayExecutionFailure(bytes data);
    error InvalidSplitPayMethod(bytes4 data);

    address public immutable trustedOrigin;
    bytes4 public immutable splitPayMethod;

    // Account => token => maxFee
    mapping(address => mapping(address => uint256)) public maxFeePerToken;
    uint256 public coveredPercent;

    constructor(
        address _trustedOrigin,
        bytes4 _splitPayMethod
    )
        BasePluginWithEventMetadata(
            PluginMetadata({
                name: "SplitPay Plugin",
                version: "1.0.0",
                requiresRootAccess: false,
                iconUrl: "",
                appUrl: "https://5afe.github.io/safe-core-protocol-demo/#/relay/${plugin}"
            })
        )
    {
        trustedOrigin = _trustedOrigin;
        splitPayMethod = _splitPayMethod;

        coveredPercent = 0;
    }

    function setCoveredPercent(uint256 newCoveredPercent) external {
        if (newCoveredPercent > 100) {
            revert PercentTooHigh(newCoveredPercent);
        }
        coveredPercent = newCoveredPercent;
        emit CoveredPercentUpdated(coveredPercent);
    }

    // function payFee(ISafeProtocolManager manager, ISafe safe, uint256 nonce) internal {
    //     address feeCollector = _getFeeCollectorRelayContext();
    //     address feeToken = _getFeeTokenRelayContext();
    //     uint256 fee = _getFeeRelayContext();
    //     SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
    //     uint256 maxFee = maxFeePerToken[address(safe)][feeToken];
    //     if (fee > maxFee) revert FeeTooHigh(feeToken, fee);
    //     if (feeToken == NATIVE_TOKEN || feeToken == address(0)) {
    //         // If the native token is used for fee payment, then we directly send the fees to the fee collector
    //         actions[0].to = payable(feeCollector);
    //         actions[0].value = fee;
    //         actions[0].data = "";
    //     } else {
    //         // If a ERC20 token is used for fee payment, then we trigger a token transfer on the token for the fee to the fee collector
    //         actions[0].to = payable(feeToken);
    //         actions[0].value = 0;
    //         actions[0].data = abi.encodeWithSignature("transfer(address,uint256)", feeCollector, fee);
    //     }
    //     // Note: Metadata format has not been proposed
    //     SafeTransaction memory safeTx = SafeTransaction({actions: actions, nonce: nonce, metadataHash: bytes32(0)});
    //     try manager.executeTransaction(safe, safeTx) returns (bytes[] memory) {} catch (bytes memory reason) {
    //         revert FeePaymentFailure(reason);
    //     }
    // }

    // function relayCall(address relayTarget, bytes calldata relayData) internal {
    //     // Check relay data to avoid that module can be abused for arbitrary interactions
    //     if (bytes4(relayData[:4]) != relayMethod) revert InvalidRelayMethod(bytes4(relayData[:4]));

    //     // Perform relay call and require success to avoid that user paid for failed transaction
    //     (bool success, bytes memory data) = relayTarget.call(relayData);
    //     if (!success) revert RelayExecutionFailure(data);
    // }

        // if (trustedOrigin != address(0) && msg.sender != trustedOrigin) revert UntrustedOrigin(msg.sender);

        // relayCall(address(safe), data);
        // // We use the hash of the tx to relay has a nonce as this is unique
        // uint256 nonce = uint256(keccak256(abi.encode(this, manager, safe, data)));
        // payFee(manager, safe, nonce);

    // function payFee(ISafeProtocolManager manager, ISafe safe, uint256 nonce) internal {
    //     address feeCollector = _getFeeCollectorRelayContext();
    //     address feeToken = _getFeeTokenRelayContext();
    //     uint256 fee = _getFeeRelayContext();
    //     SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
    //     uint256 maxFee = maxFeePerToken[address(safe)][feeToken];
    //     if (fee > maxFee) revert FeeTooHigh(feeToken, fee);
    //     if (feeToken == NATIVE_TOKEN || feeToken == address(0)) {
    //         // If the native token is used for fee payment, then we directly send the fees to the fee collector
    //         actions[0].to = payable(feeCollector);
    //         actions[0].value = fee;
    //         actions[0].data = "";
    //     } else {
    //         // If a ERC20 token is used for fee payment, then we trigger a token transfer on the token for the fee to the fee collector
    //         actions[0].to = payable(feeToken);
    //         actions[0].value = 0;
    //         actions[0].data = abi.encodeWithSignature("transfer(address,uint256)", feeCollector, fee);
    //     }
    //     // Note: Metadata format has not been proposed
    //     SafeTransaction memory safeTx = SafeTransaction({actions: actions, nonce: nonce, metadataHash: bytes32(0)});
    //     try manager.executeTransaction(safe, safeTx) returns (bytes[] memory) {} catch (bytes memory reason) {
    //         revert FeePaymentFailure(reason);
    //     }
    // }

    function splitPayCall(address relayTarget, bytes calldata splitPayData) internal {
        // Check relay data to avoid that module can be abused for arbitrary interactions
        if (bytes4(splitPayData[:4]) != splitPayMethod) revert InvalidSplitPayMethod(bytes4(splitPayData[:4]));

        // Perform relay call and require success to avoid that user paid for failed transaction
        (bool success, bytes memory data) = relayTarget.call(splitPayData);
        if (!success) revert RelayExecutionFailure(data);
    }

    function executeFromPlugin(ISafeProtocolManager manager, ISafe safe, address where, uint256 amount) external payable requirePercentPayment(amount) {
        console.log(where);
        console.log(payable(where));
        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
        actions[0].to = payable(where);
        actions[0].value = amount;
        actions[0].data = "";
        // Note: Metadata format has not been proposed
        SafeTransaction memory safeTx = SafeTransaction({actions: actions, nonce: 0, metadataHash: bytes32(0)});
        try manager.executeTransaction(safe, safeTx) returns (bytes[] memory) {} catch (bytes memory reason) {
            revert FeePaymentFailure(reason);
        }
    }

    modifier requirePercentPayment(uint256 amount) {
        require(msg.value * 100 == amount * coveredPercent, "Payment is not correct. You need to send % of the required amount.");
        _;
    }
}
