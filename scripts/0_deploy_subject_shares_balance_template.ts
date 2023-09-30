import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { randomContractAddress, randomContractId } from '@alephium/web3-test'
import { Settings } from '../alephium.config'
import { SubjectSharesBalance } from '../artifacts/ts'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deploySubjectSharesBalanceTemplate: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const result = await deployer.deployContract(SubjectSharesBalance, {
    initialFields: {
      subject: randomContractAddress(),
      subjectSharesContractId: randomContractId(),
      balance: 0n,
    }
  })
  console.log('SubjectSharesBalance template contract id: ' + result.contractInstance.contractId)
  console.log('SubjectSharesBalance template contract address: ' + result.contractInstance.address)
}

export default deploySubjectSharesBalanceTemplate
