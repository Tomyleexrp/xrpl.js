import { Client, Payment, SetRegularKey } from '../../dist/npm'

const client = new Client('wss://s.altnet.rippletest.net:51233')

/*
 * The snippet walks us through an example usage of RegularKey.
 * Later,
 */
async function setRegularKey(): Promise<void> {
  await client.connect()
  const { wallet: wallet1 } = await client.fundWallet()
  const { wallet: wallet2 } = await client.fundWallet()
  const { wallet: regularKeyWallet } = await client.fundWallet()

  console.log('Balances before payment')
  console.log(await client.getXrpBalance(wallet1.classicAddress))
  console.log(await client.getXrpBalance(wallet2.classicAddress))

  // assigns key-pair(regularKeyWallet) to wallet1 using `SetRegularKey`.
  const tx: SetRegularKey = {
    TransactionType: 'SetRegularKey',
    Account: wallet1.classicAddress,
    RegularKey: regularKeyWallet.classicAddress,
  }
  const response = await client.submitAndWait(tx, {
    wallet: wallet1,
  })

  console.log('Response for successful SetRegularKey tx')
  console.log(response)

  /*
   * when wallet1 sends payment to wallet2 and
   * signs using the regular key wallet, the transaction goes through.
   */
  const payment: Payment = {
    TransactionType: 'Payment',
    Account: wallet1.classicAddress,
    Destination: wallet2.classicAddress,
    Amount: '1000',
  }

  const submitTx = await client.submit(payment, {
    wallet: regularKeyWallet,
  })
  console.log('Response for tx signed using Regular Key:')
  console.log(submitTx)
  console.log('Balances after payment:')
  console.log(await client.getXrpBalance(wallet1.classicAddress))
  console.log(await client.getXrpBalance(wallet2.classicAddress))

  await client.disconnect()
}
void setRegularKey()
