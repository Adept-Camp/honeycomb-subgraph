import {
  BigDecimal,
  log
} from '@graphprotocol/graph-ts'
import {
  CreateUnipoolWithProxyCall,
  CreateUnipoolCall
} from '../generated/Factory/Factory'
import {
  Pool as PoolContract
} from '../generated/Factory/Pool'
import {
  Pool as PoolDataSource
} from '../generated/templates'
import {
  Pool
} from '../generated/schema'
import {
  ZERO_BD,
  loadOrCreateFactory,
  loadOrCreateToken,
  loadOrCreatePair
} from './helpers'

export function handleNewPool(call: CreateUnipoolCall): void {
  // TODO(onbjerg): Also persist balance proxies
  // Update factory stats
  let factory = loadOrCreateFactory(call.to)
  if (factory === null) {
    log.info('Could not load factory', [])
    return
  }
  factory.poolCount = factory.poolCount + 1

  // Load pair data
  let pair = loadOrCreatePair(call.inputs._uniswapTokenExchange)
  if (pair === null) {
    log.info('Could not load pair', [])
    return
  }

  // Set up pool data source
  PoolDataSource.create(call.outputs.value0)

  // Create pool
  let poolContract = PoolContract.bind(call.outputs.value0)
  let pool = new Pool(call.outputs.value0.toHex())
  pool.pair = pair.id
  let tradableToken = loadOrCreateToken(poolContract.tradableToken())
  if (tradableToken === null) {
    return
  }
  pool.rewardToken = tradableToken.id
  pool.rewards = ZERO_BD
  pool.staked = ZERO_BD

  factory.save()
  pair.save()
  pool.save()
}

export function handleNewPoolWithProxy(call: CreateUnipoolWithProxyCall): void {
  // TODO(onbjerg): Also persist balance proxies
  // Update factory stats
  let factory = loadOrCreateFactory(call.to)
  if (factory === null) {
    log.info('Could not load factory', [])
    return
  }
  factory.poolCount = factory.poolCount + 1

  // Load pair data
  let pair = loadOrCreatePair(call.inputs._uniswapTokenExchange)
  if (pair === null) {
    log.info('Could not load pair', [])
    return
  }

  // Set up pool data source
  PoolDataSource.create(call.outputs.value0)

  // Create pool
  let poolContract = PoolContract.bind(call.outputs.value0)
  let pool = new Pool(call.outputs.value0.toHex())
  pool.pair = pair.id
  let tradableToken = loadOrCreateToken(poolContract.tradableToken())
  if (tradableToken === null) {
    return
  }
  pool.rewardToken = tradableToken.id
  pool.rewards = ZERO_BD
  pool.staked = ZERO_BD

  factory.save()
  pair.save()
  pool.save()
}