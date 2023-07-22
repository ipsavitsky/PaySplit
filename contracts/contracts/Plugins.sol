// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";

import "hardhat/console.sol";

interface SafeAccount is ISafe {
    function isOwner(address owner) external view returns (bool);
}

contract SplitPayPlugin is BasePluginWithEventMetadata {
    event CoveredPercentUpdated(uint256 coveredPercent);

    error PercentTooHigh(uint256 coveredPercent);

    error FeeTooHigh(address feeToken, uint256 fee);
    error PaymentFailure(bytes data);
    error UntrustedOrigin(address origin);
    error RelayExecutionFailure(bytes data);
    error InvalidSplitPayMethod(bytes4 data);

    address public immutable trustedOrigin;

    uint256 public coveredPercent;

    constructor(
        address _trustedOrigin
    )
        BasePluginWithEventMetadata(
            PluginMetadata({
                name: "SplitPay Plugin",
                version: "1.0.0",
                requiresRootAccess: false,
                iconUrl: "",
                appUrl: "https://ipsavitsky.github.io/PaySplit/#/relay/${plugin}"
            })
        )
    {
        trustedOrigin = _trustedOrigin;

        coveredPercent = 0;

    }

    function setCoveredPercent(SafeAccount safe, uint256 newCoveredPercent) external requireSafeUser(safe) {
        if (msg.sender == trustedOrigin) revert UntrustedOrigin(msg.sender);
        if (newCoveredPercent > 100) {
            revert PercentTooHigh(newCoveredPercent);
        }
        coveredPercent = newCoveredPercent;
        emit CoveredPercentUpdated(coveredPercent);
    }

    function executeFromPlugin(ISafeProtocolManager manager, SafeAccount safe, address where, uint256 amount) external payable requirePercentPayment(amount) requireSafeUser(safe) {
        console.log(where);
        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
        actions[0].to = payable(where);
        actions[0].value = amount;
        actions[0].data = "";
        // Note: Metadata format has not been proposed
        SafeTransaction memory safeTx = SafeTransaction({actions: actions, nonce: 0, metadataHash: bytes32(0)});
        try manager.executeTransaction(safe, safeTx) returns (bytes[] memory) {} catch (bytes memory reason) {
            revert PaymentFailure(reason);
        }
    }

    modifier requirePercentPayment(uint256 amount) {
        require(msg.value * 100 == amount * coveredPercent, "Payment is not correct. You need to send % of the required amount.");
        _;
    }

    modifier requireSafeUser(SafeAccount safe) {
        require(safe.isOwner(msg.sender), "Ownable: You are not the safe owner, Bye.");
        _;
    }
}
