import {
  BigDecimal,
  Address,
  log
} from '@graphprotocol/graph-ts'
import {
  CreateUnipoolWithProxyCall,
  CreateUnipoolCall
}  from '../generated/UnipoolFactory/UnipoolFactory'
import {
  Pool as PoolContract
} from '../generated/UnipoolFactory/Pool'
import {
  Proxy
} from '../generated/UnipoolFactory/Proxy'
import {
  Pool as PoolDataSource
} from '../generated/templates'
import {
  Pool
} from '../generated/schema'
import {
  ZERO_BD,
  loadOrCreateFactory,
  loadOrCreateBalanceProxy,
  loadOrCreateToken,
  loadOrCreatePair,
  loadOrCreateRouter,
  loadTradedToken
} from './helpers'

//export function handleNewFactory(call: ConstructorCall): void{
//  let rewardToken = loadOrCreateToken( call.inputs._rewardToken)
//  let factory = loadOrCreateFactory(call.inputs._rewardToken)
//
//  rewardToken.save()
//  factory.save()
//} 

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
  PoolDataSource.create(call.outputValues[0].value.toAddress())
  
  // Create pool
  let poolContract = PoolContract.bind(call.outputValues[0].value.toAddress())
  let pool = new Pool(call.outputValues[0].value.toAddress().toHex())
  pool.pair = pair.id
  let tradableToken = loadOrCreateToken(poolContract.tradableToken())
  if (tradableToken === null) {
    return
  }

  let proxy = loadOrCreateBalanceProxy(Address.fromString(pool.id))
  if (proxy === null) {
    log.info('Could not load proxy', [])
    return
  }

  //pool.rewardToken = "0x5f1F81de1D21b97a5d0D5d62d89BDE9DdEc27325" //tradedToken.id
  pool.rewardToken = loadTradedToken(Address.fromString(pair.id), Address.fromString(tradableToken.id)).id
  pool.rewards = ZERO_BD
  pool.staked = ZERO_BD

  factory.save()
  pair.save()
  router.save()
  pool.save()
  proxy.save()
}



