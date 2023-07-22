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
    const trustedOrigin = "0x4Ed4a978b67E1a8710c9f00c0e1224151AE26B5F" // hre.network.name === "hardhat" ? ZeroAddress : getGelatoAddress(hre.network.name)
    await deploy("SplitPayPlugin", {
        from: deployer,
        args: [trustedOrigin],
        log: true,
        deterministicDeployment: true,
    });
};

deploy.tags = ["plugins"];
export default deploy;