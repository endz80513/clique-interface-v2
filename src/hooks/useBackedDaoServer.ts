import { ChainId } from 'constants/chain'
import { useCallback, useEffect, useState } from 'react'
import { useHomeListPaginationCallback } from 'state/pagination/hooks'
import { useActiveWeb3React } from '.'
import { getHomeDaoList, getMyJoinedDao, switchJoinDao } from '../utils/fetch/server'

export function useMyJoinedDao() {
  const { account } = useActiveWeb3React()
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<
    {
      chainId: ChainId
      daoName: string
      daoAddress: string
    }[]
  >([])

  useEffect(() => {
    ;(async () => {
      if (!account) {
        setResult([])
        return
      }
      setLoading(true)
      try {
        const res = await getMyJoinedDao(account)
        setLoading(false)
        const data = res.data.data
        if (!data) {
          setResult([])
          return
        }

        const list = data.map((item: any) => ({
          chainId: item.chainId,
          daoName: item.daoName,
          daoAddress: item.daoAddress
        }))
        setResult(list)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useMyJoinedDao', error)
      }
    })()
  }, [account])

  return {
    loading: loading,
    result
  }
}

export interface HomeListProp {
  daoName: string
  daoLogo: string
  daoAddress: string
  chainId: ChainId
  proposals: number
  members: number
  joinSwitch: boolean
}

export function useHomeDaoList() {
  const {
    data: { keyword, category, currentPage },
    setKeyword,
    setCategory,
    setCurrentPage
  } = useHomeListPaginationCallback()

  const [firstLoadData, setFirstLoadData] = useState(true)
  const { account } = useActiveWeb3React()
  const [loading, setLoading] = useState<boolean>(false)
  const [total, setTotal] = useState<number>(0)
  const pageSize = 1
  const [result, setResult] = useState<HomeListProp[]>([])

  useEffect(() => {
    if (firstLoadData) {
      setFirstLoadData(false)
      return
    }
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await getHomeDaoList(
          {
            account: account || '',
            category,
            keyword
          },
          (currentPage - 1) * pageSize,
          pageSize
        )
        setLoading(false)
        const data = res.data.data as any
        if (!data) {
          setResult([])
          return
        }
        setTotal(data.total)
        const list: HomeListProp[] = data.list.map((item: any) => ({
          daoName: item.daoName,
          daoLogo: item.daoLogo,
          daoAddress: item.daoAddress,
          chainId: item.chainId,
          proposals: item.proposals,
          members: item.members,
          joinSwitch: item.joinSwitch
        }))
        setResult(list)
      } catch (error) {
        setResult([])
        setLoading(false)
        console.error('useHomeDao', error)
      }
    })()
  }, [account, category, currentPage, keyword])

  return {
    loading: loading,
    page: {
      setCurrentPage,
      currentPage,
      total,
      totalPage: Math.ceil(total / pageSize),
      pageSize
    },
    search: {
      keyword,
      setKeyword,
      category,
      setCategory
    },
    result
  }
}

export function useMemberJoinDao(defaultJoined: boolean, defaultMembers: number) {
  const [isJoined, setIsJoined] = useState(defaultJoined)
  const [curMembers, setCurMembers] = useState(defaultMembers)
  const [loading, setLoading] = useState(false)
  const { account } = useActiveWeb3React()

  useEffect(() => {
    setIsJoined(defaultJoined)
  }, [defaultJoined])

  useEffect(() => {
    setCurMembers(defaultMembers)
  }, [defaultMembers])

  const switchJoin = useCallback(
    async (join: boolean, chainId: ChainId, daoAddress: string, signature: string) => {
      if (!account || !signature) {
        return
      }
      setLoading(true)
      try {
        await switchJoinDao(account, chainId, daoAddress, join, signature)
        setIsJoined(join)
        setCurMembers(join ? curMembers + 1 : curMembers - 1)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    },
    [account, curMembers]
  )

  return {
    loading,
    isJoined,
    curMembers,
    switchJoin
  }
}