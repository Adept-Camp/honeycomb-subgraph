import {
  BigInt,
  BigDecimal,
  Address,
  log
} from '@graphprotocol/graph-ts'
import {
  ERC20
} from '../generated/UnipoolFactory/ERC20'
import {
  Pair as PairContract
} from '../generated/UnipoolFactory/Pair'
import {
  UnipoolFactory,
  BalanceProxy,
  Pool,
  Token,
  Pair,
  Router
} from '../generated/schema'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function loadOrCreateFactory(address: Address): UnipoolFactory {
  let factory = UnipoolFactory.load(address.toHex())
  if (factory === null) {
    factory = new UnipoolFactory(address.toHex())
    factory.poolCount = 0
    factory.save() 
  }
  return factory as UnipoolFactory
}

export function loadOrCreateBalanceProxy(address: Address): BalanceProxy{
  let proxy = BalanceProxy.load(address.toHex())
  if (proxy === null) {
    proxy = new BalanceProxy(address.toHex())
    proxy.save() 
  }
  return proxy as BalanceProxy

}

export function loadOrCreatePool(address: Address): Pool {
  let pool = Pool.load(address.toHex())
  if (pool === null){
    pool = new Pool(address.toHex())
    // should it be filled with new data?
    pool.save()
  }
  return pool as Pool
}

export function loadOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHex())
  if (token === null) {
    let tokenContract = ERC20.bind(address)

    token = new Token(address.toHex())
    token.symbol = tokenContract.symbol()
    token.name = tokenContract.name()
    token.decimals = BigInt.fromI32(tokenContract.decimals())
    token.save()
  }
  return token as Token
}

export function loadOrCreatePair(address: Address): Pair {
  let pair = Pair.load(address.toHex())

if (pair === null) { // was ===
    let pairContract = PairContract.bind(address)
    pair = new Pair(address.toHex())
    let token0 = pairContract.try_token0()
    if (token0.reverted) {
      log.info('Could not get token0 address from pair', [])
      return null
    }
    let token1 = pairContract.try_token1()
    if (token1.reverted) {
      log.info('Could not get token1 address from pair', [])
      return null
    }
    pair.token0 = loadOrCreateToken(token0.value).id
    pair.token1 = loadOrCreateToken(token1.value).id
    pair.save()
  }

//  pair.token0 = "0x5f1F81de1D21b97a5d0D5d62d89BDE9DdEc27325"
//  pair.token1 = "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d"
//  pair.save()

  return pair as Pair

}

export function loadOrCreateRouter(address: Address): Router {
  let router = Router.load(address.toHex())
  if (router === null) {
//      let tokenContract = ERC20.bind(address)

//      token = new Token(address.toHex())
//      token.symbol = tokenContract.symbol()
//      token.name = tokenContract.name()
//      token.decimals = BigInt.fromI32(tokenContract.decimals())
//      token.save()
  }
  return router as Router
}

