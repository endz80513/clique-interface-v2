import {
  Box,
  ButtonGroup,
  Stack,
  styled,
  Button as MuiButton,
  Typography,
  Switch,
  Alert,
  Snackbar,
  Link
} from '@mui/material'
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import theme from 'theme'
import Input from 'components/Input'
import DownloadIcon from '@mui/icons-material/Download'
import Editor from 'pages/DaoInfo/Children/Proposal/Editor'
import DateTimePicker from 'components/DateTimePicker'
import { BlackButton } from 'components/Button/Button'
import ChainSelect from 'components/Select/ChainSelect'
import { ChainId, ChainList, ChainListMap } from 'constants/chain'
import { useActiveWeb3React } from 'hooks'
import { isAddress } from 'utils'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { tryParseAmount } from 'utils/parseAmount'
import { PUBLICSALE_ADDRESS } from '../../constants'
import { Currency, Token } from 'constants/token'
import { getTokenPrices } from 'utils/fetch/server'
import useModal from 'hooks/useModal'
import TransactiontionSubmittedModal from 'components/Modal/TransactionModals/TransactiontionSubmittedModal'
import TransacitonPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import { useCreatePublicSaleCallback } from 'hooks/useCreatePublicSaleCallback'
import SelectCurrencyModal from 'components/Input/CurrencyInputPanel/SelectCurrencyModal'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { BigNumber } from 'bignumber.js'
import JSBI from 'jsbi'

enum saleTypes {
  GENERAL = 'general',
  DISCOUNT = 'discount'
}

enum purchaseType {
  ONETIME,
  LIMIT
}

enum priceType {
  UNIT,
  PACKAGE
}
const RowWrapper = styled(Stack)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  marginBottom: 20,
  '& button.Mui-selected': {
    color: '#ff9',
    backgroundColor: theme.palette.primary.main
  },
  '& .css-1ujnqem-MuiTabs-root': {
    border: '2px solid',
    borderRadius: 16,
    borderColor: theme.palette.primary.main
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'unset',
    padding: '20px'
  }
}))

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  '& button': {
    borderWidth: '2px',
    color: theme.palette.text.primary,
    fontWeight: 600,
    '&:hover': {
      borderWidth: '2px'
    },
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white
    }
  }
}))

const UploadLabel = styled('label')({
  border: '1px solid',
  width: 127,
  height: 20,
  fontWeight: 500,
  fontSize: 12,
  cursor: 'pointer',
  display: 'inline-block',
  textAlign: 'center',
  borderRadius: '16px'
})

const currencyOptions = [
  new Token(ChainId.GOERLI, '0x57F013F27360E62efc1904D8c4f4021648ABa7a9', 6, 'mUSDT', 'mUSDT'),
  new Token(ChainId.GOERLI, '0x53C0475aa628D9C8C5724A2eb8B5Fd81c32a9267', 18, 'tyy', 'tyy'),
  new Token(ChainId.GOERLI, '0x3c0837064c3a440fe44c9002c743dcab94e16454', 18, 'A', 'A'),
  new Token(ChainId.GOERLI, '0x2358fbd8a8e0470b593328503c0f9666540339a1', 18, 'B', 'B'),
  new Token(ChainId.GOERLI, '0xe8a67c44933b8750204ca4ddd2307aab0547310d', 18, 'C', 'C')
]

export default function Index() {
  const { chainId, account } = useActiveWeb3React()
  const [salePriceType, setSalePriceType] = useState(priceType.UNIT)
  const [saleMode, setSaleMode] = useState(saleTypes.DISCOUNT)
  const [purchase, setPurchaseLimit] = useState(purchaseType.ONETIME)
  const [unitPrice, setUnitPrice] = useState('')
  const [packagePrice, setPackagePrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [minPurchase, setMinPurchase] = useState('')
  const [maxPurchase, setMaxPurchase] = useState('')
  const [content, setContent] = useState('')
  const [startTime, setStartTime] = useState<number>()
  const [endTime, setEndTime] = useState<number>()
  const [isWhitelist, setIsWhiteList] = useState<boolean>(true)
  const [saleToken, setSaleToken] = useState<Currency>()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [salesAmount, setSalesAmount] = useState('')
  const [receiveToken, setReceiveToken] = useState<Currency>()
  const [baseChainId, setCurrentBaseChain] = useState<any>('')
  const [oneTimePrice, setOnetimePrice] = useState<string>('')
  const [currencyRatio, setCurrencyRatio] = useState('')
  const { showModal, hideModal } = useModal()

  const handleChangeOneTimePrice = useCallback(e => {
    setOnetimePrice(e.target.value)
    setMaxPurchase(e.target.value)
    setMinPurchase(e.target.value)
  }, [])

  const createPublicSaleCallback = useCreatePublicSaleCallback()

  const [publicSaleList, setPublicSaleList] = useState<string[]>(['0x5159ed45c75C406CFCd832caCEE5B5E48eaD568E'])

  const insertLine = useCallback((list: string[], newItem: string) => {
    const _ret = list.filter(item => item.toLowerCase() !== newItem.toLowerCase())
    _ret.push(newItem)
    return _ret
  }, [])

  const uploadCSV = useCallback(() => {
    const el = document.getElementById('upload_CSV') as HTMLInputElement
    if (!el || !el.files) return
    const reader = new FileReader()
    reader.onload = function() {
      const ret: string[] = []
      const textInput = reader.result as string
      const allRows = textInput.split(/\r?\n|\r/)
      for (let i = 0; i < allRows.length; i++) {
        const splitTextInput = allRows[i].split(',')
        if (!splitTextInput[0]?.trim() || !splitTextInput[1]?.trim()) {
          continue
        }
        if (!isAddress(splitTextInput[0]?.trim())) {
          setOpenSnackbar(true)
          el.value = ''
          return
        }
        ret.push(splitTextInput[0].trim())
      }
      el.value = ''
      let newList: string[] = []
      for (const item of ret) {
        newList = insertLine(newList, item)
        setPublicSaleList(newList)
      }
    }
    reader.readAsBinaryString(el.files[0])
  }, [insertLine])
  const currentBaseChain = useMemo(() => (baseChainId ? ChainListMap[baseChainId] || null : null), [baseChainId])
  const onSelectCurrency = useCallback((cur: Currency) => {
    setSaleToken(cur)
  }, [])

  const saleTokenBalance = useCurrencyBalance(account || undefined, saleToken)

  const onSelectReceiveCurrency = useCallback((cur: Currency) => {
    setReceiveToken(cur)
  }, [])

  useEffect(() => {
    if (!saleToken || !receiveToken) return
    let result: any = []
    let ratio
    const tokens = (saleToken?.address || '') + ',' + (receiveToken?.address || '')
    ;(async () => {
      try {
        const res = await getTokenPrices(Number(chainId), tokens)
        result = res?.data
        const saleTokenData = result?.data[0]
        const receiveTokenData = result?.data[1]
        ratio = new BigNumber(saleTokenData?.price)
          .div(new BigNumber(receiveTokenData?.price))
          .toFixed(6, BigNumber.ROUND_FLOOR)
          .toString()
      } catch (error) {
        console.error(error)
      }
      setCurrencyRatio(ratio ?? '')
    })()
  }, [chainId, receiveToken, saleToken])

  const inputValueAmount = tryParseAmount(salesAmount, saleToken || undefined)

  const maxPurchaseCa = tryParseAmount(maxPurchase, receiveToken)
  const minPurchaseCa = tryParseAmount(minPurchase, receiveToken)
  const salePriceCa = tryParseAmount(salePrice, receiveToken)
  const oneTimePriceCa = tryParseAmount(oneTimePrice, receiveToken)

  const handlePublic = useCallback(() => {
    if (!saleToken || !startTime || !endTime || !account || !receiveToken || !inputValueAmount || !salePriceCa) return
    const receiveTokenAddr = receiveToken?.address
    const saleTokenAddr = saleToken?.address

    showModal(<TransacitonPendingModal />)
    createPublicSaleCallback(
      content,
      baseChainId,
      account,
      endTime,
      purchase === purchaseType.ONETIME ? oneTimePriceCa?.raw.toString() || '' : maxPurchaseCa?.raw.toString() || '',
      purchase === purchaseType.ONETIME ? oneTimePriceCa?.raw.toString() || '' : minPurchaseCa?.raw.toString() || '',
      receiveTokenAddr,
      inputValueAmount.raw.toString(),
      salePriceCa.raw.toString(),
      saleTokenAddr,
      saleMode,
      startTime,
      publicSaleList
    )
      .then(hash => {
        hideModal()
        showModal(<TransactiontionSubmittedModal hash={hash} />)
      })
      .catch((err: any) => {
        hideModal()
        showModal(
          <MessageBox type="error">
            {err?.data?.message || err?.error?.message || err?.message || 'unknown error'}
          </MessageBox>
        )
        console.error(err)
      })
  }, [
    saleToken,
    startTime,
    endTime,
    account,
    receiveToken,
    inputValueAmount,
    salePriceCa,
    showModal,
    createPublicSaleCallback,
    content,
    baseChainId,
    purchase,
    oneTimePriceCa?.raw,
    maxPurchaseCa?.raw,
    minPurchaseCa?.raw,
    saleMode,
    publicSaleList,
    hideModal
  ])

  const [approveState, approveCallback] = useApproveCallback(
    inputValueAmount,
    baseChainId ? PUBLICSALE_ADDRESS[baseChainId as ChainId] : undefined
  )

  console.log(approveState)
  const [estimation, setEstimation] = useState('')

  const paramsCheck: {
    disabled: boolean
    handler?: () => void
    error?: undefined | string | JSX.Element
  } = useMemo(() => {
    if (!baseChainId) {
      return {
        disabled: true,
        error: 'Network required'
      }
    }
    if (!saleToken) {
      return {
        disabled: true,
        error: 'Sale Token required'
      }
    }
    if (salePriceType === priceType.UNIT) {
      if (!unitPrice) {
        return {
          disabled: true,
          error: 'Unit Price required'
        }
      }
    }
    if (salePriceType === priceType.PACKAGE) {
      if (!packagePrice) {
        return {
          disabled: true,
          error: 'Package Price required'
        }
      }
    }
    if (!salesAmount) {
      return {
        disabled: true,
        error: 'Sales Amount required'
      }
    }
    if (purchase === purchaseType.ONETIME) {
      if (!oneTimePrice) {
        return {
          disabled: true,
          error: 'One-time Price required'
        }
      }
    }
    if (purchase === purchaseType.LIMIT) {
      if (!minPurchase) {
        return {
          disabled: true,
          error: 'Min Purchase required'
        }
      }
      if (Number(minPurchase) < 0) {
        return {
          disabled: true,
          error: 'Min Purchase must be bigger than 0'
        }
      }
      if (Number(maxPurchase) < 0) {
        return {
          disabled: true,
          error: 'Max Purchase must be bigger than 0'
        }
      }
      if (!maxPurchase) {
        return {
          disabled: true,
          error: 'Max Price required'
        }
      }
      if (minPurchase > maxPurchase) {
        return {
          disabled: true,
          error: 'Max purchase must be bigger than Min purchase'
        }
      }
    }
    if (!startTime) {
      return {
        disabled: true,
        error: 'Start time required'
      }
    }
    if (!endTime) {
      return {
        disabled: true,
        error: 'End time required'
      }
    }
    if (endTime <= startTime) {
      return {
        disabled: true,
        error: 'The start time must be earlier than the end time'
      }
    }
    return {
      disabled: false,
      handler: handlePublic
    }
  }, [
    baseChainId,
    endTime,
    handlePublic,
    maxPurchase,
    minPurchase,
    oneTimePrice,
    packagePrice,
    purchase,
    salePriceType,
    saleToken,
    salesAmount,
    startTime,
    unitPrice
  ])

  return (
    <Box
      sx={{
        maxWidth: 964,
        width: '100%',
        margin: '30px auto 20px',
        textAlign: 'center',
        fontSize: 12,
        padding: { xs: '0 16px', sm: undefined }
      }}
    >
      <Typography variant="h3" mb={100}>
        Create Public Sale
      </Typography>
      <RowWrapper>
        <Typography color={theme.palette.text.secondary} fontWeight={500} variant="inherit">
          Way of sale
        </Typography>
        <StyledButtonGroup>
          <MuiButton
            className={saleMode === saleTypes.GENERAL ? 'active' : ''}
            onClick={() => setSaleMode(saleTypes.GENERAL)}
          >
            General sale
          </MuiButton>
          <MuiButton
            className={saleMode === saleTypes.DISCOUNT ? 'active' : ''}
            onClick={() => setSaleMode(saleTypes.DISCOUNT)}
          >
            Discount sale
          </MuiButton>
        </StyledButtonGroup>
      </RowWrapper>
      <RowWrapper>
        <Typography color={theme.palette.text.secondary} fontWeight={500} variant="inherit">
          Select Network
        </Typography>
        <ChainSelect
          width="200px"
          chainList={ChainList}
          selectedChain={currentBaseChain}
          label=""
          onChange={e => setCurrentBaseChain(e?.id || null)}
        />
      </RowWrapper>
      <Stack
        display={'grid'}
        gridTemplateColumns="1fr 1fr"
        gap={50}
        sx={{
          textAlign: 'left'
        }}
      >
        <Stack display={'flex'} alignItems={'space'} flexDirection={'column'} justifyContent={'space-Between'} gap={10}>
          <Input
            onClick={() =>
              showModal(<SelectCurrencyModal onSelectCurrency={onSelectCurrency} currencyOptions={currencyOptions} />)
            }
            style={{ marginTop: 0 }}
            value={saleToken?.symbol || ''}
            placeholder=""
            label="Sale token"
            endAdornment=""
            rightLabel={<></>}
            type="amount"
          />
        </Stack>
        <Input
          style={{ marginTop: 0 }}
          value={salesAmount}
          errSet={() => setSalesAmount('')}
          onChange={e => {
            if (JSBI.GT(JSBI.BigInt(e.target.value), JSBI.BigInt(saleTokenBalance?.raw?.toString() || '0'))) return
            setSalesAmount(e.target.value || '')
          }}
          placeholder="0"
          label="Sale amount"
          endAdornment={saleToken?.symbol}
          rightLabel={
            <>
              Balance: {saleTokenBalance?.toSignificant(6, { groupSeparator: ',' }) || '-'} {saleToken?.symbol}
            </>
          }
          type="amount"
        />
      </Stack>
      <Stack display={'grid'} style={{ marginBottom: 20 }} gridTemplateColumns="1fr 1fr" gap={50}>
        <Input
          onClick={() =>
            showModal(
              <SelectCurrencyModal onSelectCurrency={onSelectReceiveCurrency} currencyOptions={currencyOptions} />
            )
          }
          readOnly
          value={receiveToken?.symbol || ''}
          placeholder=""
          label="Receiving Token"
          rightLabel=""
          type="receive"
        />
        <Input
          readOnly
          style={{ marginTop: 0 }}
          value={estimation}
          errSet={() => {}}
          onChange={() => {}}
          placeholder="0"
          label="Equivalent estimate"
          endAdornment={receiveToken?.symbol}
          rightLabel={
            saleToken && receiveToken ? (
              <>
                1 {saleToken?.symbol} = {currencyRatio} {receiveToken?.symbol}
              </>
            ) : (
              ''
            )
          }
          type="estimate"
        />
      </Stack>
      <Box
        sx={{
          padding: 16,
          marginBottom: 20,
          border: `1px solid ${theme.bgColor.bg2}`,
          boxShadow: `inset 0px -1px 0px ${theme.bgColor.bg2}`,
          borderRadius: theme.borderRadius.default
        }}
        display={'grid'}
        gridTemplateColumns="1fr 1fr"
        gap={50}
      >
        <Stack spacing={10}>
          <Typography color={theme.palette.text.secondary} textAlign={'left'} fontWeight={500} variant="inherit">
            Sale price
          </Typography>
          <StyledButtonGroup style={{ width: '350px' }}>
            <MuiButton
              className={salePriceType === priceType.UNIT ? 'active' : ''}
              onClick={() => {
                setSalePriceType(priceType.UNIT)
                const val = new BigNumber(Number(estimation))
                  .div(new BigNumber(0.9))
                  .div(new BigNumber(Number(salesAmount)))
                setUnitPrice(val.toString())
                const discountAmount = new BigNumber(Number(unitPrice))
                  .multipliedBy(Number(salesAmount))
                  .multipliedBy(new BigNumber(0.9))
                setEstimation(discountAmount.toString())
              }}
            >
              Unit price
            </MuiButton>
            <MuiButton
              className={salePriceType === priceType.PACKAGE ? 'active' : ''}
              onClick={() => {
                setSalePriceType(priceType.PACKAGE)
                const discountAmount = new BigNumber(Number(unitPrice)).multipliedBy(Number(salesAmount))
                setPackagePrice(discountAmount.toString())
              }}
            >
              Package price
            </MuiButton>
          </StyledButtonGroup>
        </Stack>
        {salePriceType === priceType.UNIT ? (
          <Input
            style={{ marginTop: 0 }}
            value={unitPrice}
            errSet={() => setUnitPrice('')}
            onChange={e => {
              setUnitPrice(e.target.value || '')
              setSalePrice(e.target.value || '')
              const discountAmount = new BigNumber(Number(e.target.value || ''))
                .multipliedBy(Number(salesAmount))
                .multipliedBy(new BigNumber(0.9))
              setEstimation(discountAmount.toString())
            }}
            placeholder="0.1"
            endAdornment={saleToken?.symbol}
            label="Unit price"
            rightLabel={`Package price: ${estimation} ${saleToken?.symbol ?? '-'} `}
            type="unit"
          />
        ) : (
          <Input
            style={{ marginTop: 0 }}
            value={packagePrice}
            errSet={() => setPackagePrice('')}
            onChange={e => {
              setPackagePrice(e.target.value || '')
              setSalePrice(e.target.value || '')
              const discountAmount = new BigNumber(Number(e.target.value || '')).multipliedBy(new BigNumber(0.9))
              setEstimation(discountAmount.toString())
              const val = new BigNumber(Number(estimation)).div(new BigNumber(Number(salesAmount)))
              setUnitPrice(val.toString())
            }}
            placeholder="0"
            endAdornment={saleToken?.symbol}
            label="Package price"
            rightLabel={`Unit price: ${unitPrice} ${saleToken?.symbol ?? '-'}`}
            type="package"
          />
        )}
      </Box>
      <RowWrapper padding={'0 16px'}>
        <Typography color={theme.palette.text.secondary} fontWeight={500} variant="inherit">
          Methods of sales
        </Typography>
        <StyledButtonGroup>
          <MuiButton
            className={purchase === purchaseType.ONETIME ? 'active' : ''}
            onClick={() => {
              setPurchaseLimit(purchaseType.ONETIME)
              setMaxPurchase('')
              setMinPurchase('')
            }}
          >
            One-time purchase
          </MuiButton>
          <MuiButton
            className={purchase === purchaseType.LIMIT ? 'active' : ''}
            onClick={() => {
              setPurchaseLimit(purchaseType.LIMIT)
              setOnetimePrice('')
            }}
          >
            Purchase limit
          </MuiButton>
        </StyledButtonGroup>
      </RowWrapper>
      <Box
        sx={{
          padding: 16,
          marginBottom: 20,
          border: `1px solid ${theme.bgColor.bg2}`,
          boxShadow: `inset 0px -1px 0px ${theme.bgColor.bg2}`,
          borderRadius: theme.borderRadius.default
        }}
      >
        {purchase === purchaseType.ONETIME ? (
          <Stack display={'grid'} gridTemplateColumns="1fr 1fr" alignItems={'center'}>
            <Typography color={theme.palette.text.secondary} textAlign={'left'} fontWeight={500} variant="inherit">
              One-time purchase amount
            </Typography>
            <Input
              style={{ marginTop: 0 }}
              value={oneTimePrice}
              errSet={() => setOnetimePrice('')}
              onChange={handleChangeOneTimePrice}
              placeholder=""
              label=""
              endAdornment={saleToken?.symbol}
              rightLabel={<></>}
              type="oneTime"
            />
          </Stack>
        ) : (
          <Stack display={'grid'} gridTemplateColumns="1fr 1fr" alignItems={'center'}>
            <Typography color={theme.palette.text.secondary} textAlign={'left'} fontWeight={500} variant="inherit">
              purchase limit
            </Typography>
            <Stack display={'grid'} gridTemplateColumns="4fr 1fr 4fr" alignItems={'center'}>
              <Input
                style={{ marginTop: 0 }}
                value={minPurchase}
                errSet={() => setMinPurchase('')}
                onChange={e => setMinPurchase(e.target.value || '')}
                placeholder="min"
                label=""
                endAdornment="RAI"
                rightLabel={<></>}
                type="min"
              />
              -
              <Input
                style={{ marginTop: 0 }}
                value={maxPurchase}
                errSet={() => setMaxPurchase('')}
                onChange={e => setMaxPurchase(e.target.value || '')}
                endAdornment="RAI"
                placeholder="max"
                label=""
                rightLabel={<></>}
                type="max"
              />
            </Stack>
          </Stack>
        )}
      </Box>
      <RowWrapper padding={'0 16px'}>
        <Typography color={theme.palette.text.secondary} fontWeight={500} variant="inherit">
          Discount
        </Typography>
        <Typography color={theme.palette.text.secondary} fontWeight={500} variant="inherit">
          10%
        </Typography>
      </RowWrapper>
      <RowWrapper padding={'0 16px'}>
        <Typography color={theme.palette.text.secondary} fontWeight={500} variant="inherit">
          Event time
        </Typography>
        <Box display={'grid'} gridTemplateColumns="80px 1fr 70px 1fr" alignItems={'center'} gap="12px 24px">
          <Typography fontSize={12}>Start Time</Typography>
          <DateTimePicker
            value={startTime ? new Date(startTime * 1000) : null}
            onValue={(timestamp: SetStateAction<number | undefined>) => setStartTime(timestamp)}
          ></DateTimePicker>
          <Typography fontSize={12}>End Time</Typography>
          <DateTimePicker
            onValue={(timestamp: SetStateAction<number | undefined>) => setEndTime(timestamp)}
            minDateTime={startTime ? new Date(startTime * 1000) : undefined}
            value={endTime ? new Date(endTime * 1000) : null}
          ></DateTimePicker>
        </Box>
      </RowWrapper>
      <RowWrapper padding={'0 16px'}>
        <Typography color={theme.palette.text.secondary} textAlign={'left'} fontWeight={500} variant="inherit">
          Whitelist
        </Typography>
        <Switch
          checked={isWhitelist}
          onChange={() => {
            setIsWhiteList(!isWhitelist)
          }}
        />
      </RowWrapper>

      {isWhitelist ? (
        <Stack
          gap={20}
          sx={{
            height: 60,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <input accept=".csv" type="file" onChange={uploadCSV} id="upload_CSV" style={{ width: 0, height: 0 }} />
          <UploadLabel htmlFor="upload_CSV">Upload CSV file</UploadLabel>
          <Typography color={theme.palette.text.secondary} textAlign={'left'} fontWeight={500} variant="inherit">
            {publicSaleList.length} address(s)
          </Typography>
          <Link href="/template/swap-list.csv">
            <Typography display={'flex'} alignItems="center" fontSize={12}>
              Download Templates
              <DownloadIcon sx={{ height: 16 }} />
            </Typography>
          </Link>
        </Stack>
      ) : (
        ''
      )}
      <Stack spacing={10} padding={'0 16px'} mb={50}>
        <Typography color={theme.palette.text.secondary} textAlign={'left'} fontWeight={500} variant="inherit">
          About Product
        </Typography>
        <Editor content={content} setContent={setContent} />
      </Stack>
      {paramsCheck.error ? (
        <Alert severity="error">{paramsCheck.error}</Alert>
      ) : (
        <Alert severity="info">You will create a public sale in {chainId ? ChainListMap[chainId]?.name : '--'}</Alert>
      )}
      <Stack display="flex" justifyContent="center" mt={30} flexDirection={'row'} spacing={60}>
        <BlackButton
          width="252px"
          disabled={paramsCheck.disabled}
          onClick={approveState === ApprovalState.NOT_APPROVED ? approveCallback : paramsCheck.handler}
        >
          {approveState === ApprovalState.PENDING
            ? 'Approving'
            : approveState === ApprovalState.NOT_APPROVED
            ? 'Approve'
            : 'Public'}
        </BlackButton>
      </Stack>
      <Snackbar
        open={openSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="error">Address format error, please download the template.</Alert>
      </Snackbar>
    </Box>
  )
}