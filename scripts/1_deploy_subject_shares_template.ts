import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { randomContractAddress, randomContractId } from '@alephium/web3-test'
import { Settings } from '../alephium.config'
import { SubjectShares } from '../artifacts/ts'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deploySubjectSharesTemplate: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const result = await deployer.deployContract(SubjectShares, {
    initialFields: {
      subjectSharesBalanceTemplateId: '',
      subject: randomContractAddress(),
      friendContractId: randomContractId(),
      subjectOwnBalance: 0n,
      supply: 0n,
    }
  })
  console.log('SubjectShares template contract id: ' + result.contractInstance.contractId)
  console.log('SubjectShares template contract address: ' + result.contractInstance.address)
}

export default deploySubjectSharesTemplate
