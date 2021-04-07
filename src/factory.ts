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
  loadOrCreatePair,
  loadOrCreateRouter
} from './helpers'

export function handleNewPool(call: CreateUnipoolCall): void {
  // TODO(onbjerg): Also persist balance proxies
  // Update factory stats

  // Load pair data
  let pair = loadOrCreatePair(call.inputs._uniswapTokenExchange)
  if (pair === null) {
     log.info('Could not load pair', [])
     return
  }
  
  // Load router data
  let router = loadOrCreateRouter(call.inputs._uniswapRouter)
  if (router === null) {
    log.info('Could not load router', [])
    return
  }
  
  let factory = loadOrCreateFactory(call.pair, call.router)
  if (factory === null) {
    log.info('Could not load factory', [])
    return
  }
  factory.poolCount = factory.poolCount + 1

  // Set up pool data source
  PoolDataSource.create(call.outputs.value0)

  // Create pool
  let poolContract = PoolContract.bind(call.outputs.value0)
  let pool = new Pool(call.outputs.value0.toHex())
  pool.pair = pair.id
  let tradedToken = loadOrCreateToken(poolContract.tradedToken())
  if (tradedToken === null) {
    return
  }
  pool.rewardToken = tradedToken.id
  pool.rewards = ZERO_BD
  pool.staked = ZERO_BD

  factory.save()
  pair.save()
  pool.save()
}

export function handleNewPoolWithProxy(call: CreateUnipoolWithProxyCall): void {
  // TODO(onbjerg): Also persist balance proxies
  // Update factory stats

  // Get the inputs
  // Load pair data
  let pair = loadOrCreatePair(call.inputs._uniswapTokenExchange)
  if (pair === null) {
     log.info('Could not load pair', [])
     return
  }
  
  // Load router data
  let router = loadOrCreateRouter(call.inputs._uniswapRouter)
  if (router === null) {
    log.info('Could not load router', [])
    return
  }

  let factory = loadOrCreateFactory(call.to)
  if (factory === null) {
    log.info('Could not load factory', [])
    return
  }
  factory.poolCount = factory.poolCount + 1

 
  // Set up pool data source
  PoolDataSource.create(call.outputs.value0)

  // Create pool
  let poolContract = PoolContract.bind(call.outputs.value0)
  let pool = new Pool(call.outputs.value0.toHex())
  pool.pair = pair.id
  let tradedToken = loadOrCreateToken(poolContract.tradedToken())
  if (tradedToken === null) {
    return
  }
  pool.rewardToken = tradedToken.id
  pool.rewards = ZERO_BD
  pool.staked = ZERO_BD

  factory.save()
  pair.save()
  router.save()
  pool.save()
}