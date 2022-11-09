/* eslint-disable no-bitwise -- bitwise necessary for enabling flags */
import { assert } from 'chai'
import { AMMWithdrawFlags, validate, ValidationError } from 'xrpl-local'

/**
 * AMMWithdraw Transaction Verification Testing.
 *
 * Providing runtime verification testing for each specific transaction type.
 */
describe('AMMWithdraw', function () {
  const LPTokenIn = {
    currency: 'B3813FCAB4EE68B3D0D735D6849465A9113EE048',
    issuer: 'rH438jEAzTs5PYtV6CHZqpDpwCKQmPW9Cg',
    value: '1000',
  }
  let withdraw

  beforeEach(function () {
    withdraw = {
      TransactionType: 'AMMWithdraw',
      Account: 'rWYkbWkCeg8dP6rXALnjgZSjjLyih5NXm',
      Sequence: 1337,
      Flags: 0,
    } as any
  })

  it(`verifies valid AMMWithdraw with LPTokenIn`, function () {
    withdraw.LPTokenIn = LPTokenIn
    assert.doesNotThrow(() => validate(withdraw))
  })

  it(`verifies valid AMMWithdraw with Amount`, function () {
    withdraw.Amount = '1000'
    withdraw.Flags |= AMMWithdrawFlags.tfSingleAsset
    assert.doesNotThrow(() => validate(withdraw))
  })

  it(`verifies valid AMMWithdraw with Amount and Amount2`, function () {
    withdraw.Amount = '1000'
    withdraw.Amount2 = '1000'
    assert.doesNotThrow(() => validate(withdraw))
  })

  it(`verifies valid AMMWithdraw with Amount and LPTokenIn`, function () {
    withdraw.Amount = '1000'
    withdraw.LPTokenIn = LPTokenIn
    assert.doesNotThrow(() => validate(withdraw))
  })

  it(`verifies valid AMMWithdraw with Amount and EPrice`, function () {
    withdraw.Amount = '1000'
    withdraw.EPrice = '25'
    assert.doesNotThrow(() => validate(withdraw))
  })

  it(`throws w/ must set at least LPTokenIn or Amount`, function () {
    assert.throws(
      () => validate(withdraw),
      ValidationError,
      'AMMWithdraw: must set at least LPTokenIn or Amount',
    )
  })

  it(`throws w/ must set Amount with Amount2`, function () {
    withdraw.Amount2 = '500'
    assert.throws(
      () => validate(withdraw),
      ValidationError,
      'AMMWithdraw: must set Amount with Amount2',
    )
  })

  it(`throws w/ must set Amount with EPrice`, function () {
    withdraw.EPrice = '25'
    assert.throws(
      () => validate(withdraw),
      ValidationError,
      'AMMWithdraw: must set Amount with EPrice',
    )
  })

  it(`throws w/ LPTokenIn must be an IssuedCurrencyAmount`, function () {
    withdraw.LPTokenIn = 1234
    assert.throws(
      () => validate(withdraw),
      ValidationError,
      'AMMWithdraw: LPTokenIn must be an IssuedCurrencyAmount',
    )
  })

  it(`throws w/ Amount must be an Amount`, function () {
    withdraw.Amount = 1234
    assert.throws(
      () => validate(withdraw),
      ValidationError,
      'AMMWithdraw: Amount must be an Amount',
    )
  })

  it(`throws w/ Amount2 must be an Amount`, function () {
    withdraw.Amount = '1000'
    withdraw.Amount2 = 1234
    assert.throws(
      () => validate(withdraw),
      ValidationError,
      'AMMWithdraw: Amount2 must be an Amount',
    )
  })

  it(`throws w/ EPrice must be an Amount`, function () {
    withdraw.Amount = '1000'
    withdraw.EPrice = 1234
    assert.throws(
      () => validate(withdraw),
      ValidationError,
      'AMMWithdraw: EPrice must be an Amount',
    )
  })
})
