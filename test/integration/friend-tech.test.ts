import { getSigners, testAddress, testPrivateKey } from '@alephium/web3-test'
import { deployToDevnet } from '@alephium/cli'
import { web3, Project, ONE_ALPH } from '@alephium/web3'
import { FriendTechInstance, FriendTech, UpdateOwner } from '../../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet';

describe('Friend tech', () => {
  const group = 0
  let friendTech: FriendTechInstance | undefined = undefined

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    await Project.build()

    const deployments = await deployToDevnet()
    const deployed = deployments.getDeployedContractResult(0, 'FriendTech')
    if (deployed === undefined) {
      fail(`The contract is not deployed on group ${group}`)
    }

    friendTech = FriendTech.at(deployed.contractInstance.address)
  })

  it('UpdateOwner should work', async () => {
    if (friendTech === undefined) {
      fail(`Friend tech contract is not deployed on group ${group}`)
    }

    let states = await friendTech.fetchState()
    expect(states.fields.owner).toEqual(testAddress)

    const owner = new PrivateKeyWallet({ privateKey: testPrivateKey })
    const [signer1, signer2] = await getSigners(2, ONE_ALPH * 1000n, group)

    // Non-owner can not update owner
    await expect(UpdateOwner.execute(signer1, {
      initialFields: {
        newOwner: signer2.address,
        friendTech: friendTech.address
      }
    })).rejects.toThrow(Error)

    // Owner can update owner
    await UpdateOwner.execute(owner, {
      initialFields: {
        newOwner: signer2.address,
        friendTech: friendTech.address
      }
    })

    // Check owner is updated
    states = await friendTech.fetchState()
    expect(states.fields.owner).toEqual(signer2.address)
  })
});