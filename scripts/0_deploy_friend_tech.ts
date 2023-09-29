import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { FriendTech } from '../artifacts/ts'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployFriendTech: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Get settings
  const result = await deployer.deployContract(FriendTech, {
    initialFields: {
      owner: deployer.account.address
    }
  })
  console.log('FriendTech contract id: ' + result.contractInstance.contractId)
  console.log('FriendTech contract address: ' + result.contractInstance.address)
}

export default deployFriendTech
