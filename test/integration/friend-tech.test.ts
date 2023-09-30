import { getSigners, testAddress, testPrivateKey } from '@alephium/web3-test'
import { deployToDevnet } from '@alephium/cli'
import { web3, Project, ONE_ALPH } from '@alephium/web3'
import { FriendTechInstance, FriendTech, UpdateOwner, SetSubjectFeePercent, SetProtocolFeePercent } from '../../artifacts/ts'
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

  it('Pricing should work as expected', async () => {
    if (friendTech === undefined) {
      fail(`Friend tech contract is not deployed on group ${group}`)
    }

    const getPrice = async (supply: bigint, amount: bigint = 1n) => {
      const result = await FriendTech.tests.getPrice({
        initialFields: { owner: testAddress, totalProtocolFee: 0n, subjectFeePercent: 500n, protocolFeePercent: 500n },
        testArgs: { supply, amount }
      })
      return Number(result.returns) / Number(ONE_ALPH)
    }

    expect(await getPrice(0n)).toEqual(0)
    expect(await getPrice(1n)).toEqual(0.0000625)
    expect(await getPrice(2n)).toEqual(0.00025)
    expect(await getPrice(3n)).toEqual(0.0005625)
    expect(await getPrice(50n)).toEqual(0.15625)
    expect(await getPrice(100n)).toEqual(0.625)
    expect(await getPrice(200n)).toEqual(2.5)
    expect(await getPrice(296n)).toEqual(5.476)
  })

  it('Set fee precent should work', async () => {
    if (friendTech === undefined) {
      fail(`Friend tech contract is not deployed on group ${group}`)
    }

    let states = await friendTech.fetchState()
    expect(states.fields.protocolFeePercent).toEqual(500n)
    expect(states.fields.subjectFeePercent).toEqual(500n)
    expect(states.fields.owner).toEqual(testAddress)

    const owner = new PrivateKeyWallet({ privateKey: testPrivateKey })
    const [signer1] = await getSigners(1, ONE_ALPH * 1000n, group)

    // Non-owner can not update subject fee percent
    await expect(SetSubjectFeePercent.execute(signer1, {
      initialFields: {
        feePercent: 600n,
        friendTech: friendTech.address
      }
    })).rejects.toThrow(Error)

    // Non-owner can not update protocol fee percent
    await expect(SetProtocolFeePercent.execute(signer1, {
      initialFields: {
        feePercent: 600n,
        friendTech: friendTech.address
      }
    })).rejects.toThrow(Error)

    // Owner can not update subject fee percent
    await SetSubjectFeePercent.execute(owner, {
      initialFields: {
        feePercent: 600n,
        friendTech: friendTech.address
      }
    })

    // Owner can not update protocol fee percent
    await SetProtocolFeePercent.execute(owner, {
      initialFields: {
        feePercent: 600n,
        friendTech: friendTech.address
      }
    })

    // Check owner is updated
    states = await friendTech.fetchState()
    expect(states.fields.protocolFeePercent).toEqual(600n)
    expect(states.fields.subjectFeePercent).toEqual(600n)
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