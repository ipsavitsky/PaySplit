import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getGelatoAddress } from "@gelatonetwork/relay-context";
import { ZeroAddress } from "ethers";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    // We don't use a trusted origin right now to make it easier to test.
    // For production networks it is strongly recommended to set one to avoid potential fee extraction.
    const trustedOrigin =  hre.network.name === "hardhat" ? "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9" : "0xb011a210f04144B5866283D22e9A8616DAD87A92"
    await deploy("SplitPayPlugin", {
        from: deployer,
        args: ["0xe432150cce91c13a887f7D836923d5597adD8E31", trustedOrigin],
        log: true,
        deterministicDeployment: true,
    });
};

deploy.tags = ["plugins"];
export default deploy;