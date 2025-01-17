import MULTICALL_ABI from './abi.json'
import { ChainId } from '../chain'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.POLYGON]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [ChainId.ROPSTEN]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.KOVAN]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.RINKEBY]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.GOERLI]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.KLAYTN_BAOBAB]: '0xaf64127961e233331ac24e77e6590d8b96c3da76',
  [ChainId.KLAYTN]: '0x2AC73343B61ec8C0301aebB39514d1cD12f9013A',
  [ChainId.BSC]: '0xa9193376D09C7f31283C54e56D013fCF370Cd9D9',
  [ChainId.BSCTEST]: '0x1b37e704388e2f544c62177173e62ac46ce0b9e7',
  [ChainId.ZKSYNC_ERA]: '0x6F083E74b9154f357303C1D5b16152A4aa22957e',
  [ChainId.ZKSYNC_ERA_TESTNET]: '0x86435736988b0f4a8E66b604054E9e8EccE364ad',
  [ChainId.POLYGON_MUMBAI]: '0xa72E367726540518e4A3B8157Ef8c3e4DAFa56E7',
  [ChainId.POLYGON_MANGO]: '0x4a47c6f9Aa7Bb3fA79adB3754F1Ad356ef769f18',
  [ChainId.COINBASE_TESTNET]: '0xb9310Af016a805149DD5626347660E08dA9d7e3b',
  [ChainId.ZetaChain_TESTNET]: '0x548Cfe798EB20639cb7D9C26b69305dc91b1B502',
  [ChainId.SEPOLIA]: '0xE78D911B56a6321bF622172D32D916f9563e8D84'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
