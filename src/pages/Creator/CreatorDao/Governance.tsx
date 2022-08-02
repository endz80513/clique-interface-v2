import { Alert, Box, Link, styled } from '@mui/material'
import { BlackButton } from 'components/Button/Button'
import ChainSelect from 'components/Select/ChainSelect'
import { ChainList, ChainListMap } from 'constants/chain'
import { ContainerWrapper, CreatorBox } from '../StyledCreate'
// import UploadImage from 'components/UploadImage'
import Input from 'components/Input'
import TokenRow from 'components/Governance/TokenRow'
import InputNumerical from 'components/Input/InputNumerical'
import { toFormatGroup } from 'utils/dao'
import OutlineButton from 'components/Button/OutlineButton'
import DateTimeSet from 'components/Governance/DateTimeSet'
import VotingTypesSelect from 'components/Governance/VotingTypesSelect'
import { useBuildingDaoDataCallback } from 'state/buildingGovDao/hooks'
import { useTokenByChain } from 'state/wallet/hooks'
import { isAddress } from 'utils'
import { useCallback, useMemo } from 'react'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import { useCreateDaoCallback } from 'hooks/useGovernanceDaoCallback'
import useModal from 'hooks/useModal'
import TransacitonPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import { useActiveWeb3React } from 'hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import CategoriesSelect from 'components/Governance/CategoriesSelect'

const TopWrapper = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '296fr 564fr',
  gap: 24
})

export default function Governance({ back, next }: { back: () => void; next: (hash: string) => void }) {
  const { buildingDaoData, updateBuildingDaoKeyData } = useBuildingDaoDataCallback()
  const createDaoCallback = useCreateDaoCallback()
  const { showModal, hideModal } = useModal()
  const { chainId, account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const onCreateDao = useCallback(() => {
    showModal(<TransacitonPendingModal />)
    createDaoCallback()
      .then(hash => {
        hideModal()
        next(hash)
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
  }, [createDaoCallback, hideModal, next, showModal])

  const govToken = useTokenByChain(
    isAddress(buildingDaoData.tokenAddress) ? buildingDaoData.tokenAddress : undefined,
    buildingDaoData.baseChainId
  )

  const currentBaseChain = useMemo(
    () => (buildingDaoData.baseChainId ? ChainListMap[buildingDaoData.baseChainId] || null : null),
    [buildingDaoData.baseChainId]
  )

  const nextHandler = useMemo(() => {
    if (
      !buildingDaoData.daoName.trim() ||
      !buildingDaoData.daoHandle.trim() ||
      !buildingDaoData.description.trim() ||
      !buildingDaoData.daoImage
    ) {
      return {
        disabled: true,
        error: 'Basic data required'
      }
    }
    if (!buildingDaoData.baseChainId) {
      return {
        disabled: true,
        error: 'Network required'
      }
    }
    if (!govToken?.token) {
      return {
        disabled: true,
        error: 'Token required'
      }
    }
    if (!buildingDaoData.createProposalMinimum) {
      return {
        disabled: true,
        error: 'Minimum tokens needed to create proposal required'
      }
    }
    if (!buildingDaoData.executeMinimum) {
      return {
        disabled: true,
        error: 'Minimum votes needed for proposal to execute required'
      }
    }
    if (!buildingDaoData.defaultVotingPeriod) {
      return {
        disabled: true,
        error: 'Default voting period required'
      }
    }
    if (!buildingDaoData.category.trim()) {
      return {
        disabled: true,
        error: 'Categories required'
      }
    }
    if (buildingDaoData.votingTypes === undefined) {
      return {
        disabled: true,
        error: 'Voting types required'
      }
    }
    if (!account) {
      return {
        disabled: true,
        error: (
          <>
            You need to{' '}
            <Link sx={{ cursor: 'pointer' }} onClick={toggleWalletModal}>
              connect
            </Link>{' '}
            your wallet
          </>
        )
      }
    }
    return {
      disabled: false,
      handler: onCreateDao
    }
  }, [buildingDaoData, govToken?.token, onCreateDao, toggleWalletModal, account])

  return (
    <ContainerWrapper>
      <CreatorBox>
        <TopWrapper>
          <Box>
            <ChainSelect
              chainList={ChainList}
              selectedChain={currentBaseChain}
              onChange={e => updateBuildingDaoKeyData('baseChainId', e?.id || null)}
              label="*Network"
            />
            <Box display={'flex'} justifyContent="center">
              <CurrencyLogo size="86px" style={{ margin: '30px auto' }} />
            </Box>
            {/* <UploadImage disabled sx={{ margin: '30px auto' }} size={86} /> */}
          </Box>
          <Box>
            <Input
              value={buildingDaoData.tokenAddress}
              errSet={() => updateBuildingDaoKeyData('tokenAddress', '')}
              onChange={e => updateBuildingDaoKeyData('tokenAddress', e.target.value || '')}
              style={{ marginBottom: 50 }}
              placeholder="0x"
              type="address"
              label="*Token Contract Address"
              rightLabel={<Link underline="none">{`Create a new token>`}</Link>}
            />
            <TokenRow totalSupply={govToken?.totalSupply} />
          </Box>
        </TopWrapper>
        <Box display={'grid'} gap="16px">
          <InputNumerical
            noDecimals
            showFormatWrapper={() =>
              buildingDaoData.createProposalMinimum ? toFormatGroup(buildingDaoData.createProposalMinimum) : ''
            }
            value={buildingDaoData.createProposalMinimum}
            onChange={e => updateBuildingDaoKeyData('createProposalMinimum', e.target.value || '')}
            label="*Minimum tokens needed to create proposal"
            placeholder="100,000"
          />
          <InputNumerical
            noDecimals
            showFormatWrapper={() =>
              buildingDaoData.executeMinimum ? toFormatGroup(buildingDaoData.executeMinimum) : ''
            }
            value={buildingDaoData.executeMinimum}
            onChange={e => updateBuildingDaoKeyData('executeMinimum', e.target.value || '')}
            label="*Minimum votes needed for proposal to execute"
            placeholder="100,000"
          />
          <DateTimeSet
            value={buildingDaoData.defaultVotingPeriod}
            onUpdate={num => updateBuildingDaoKeyData('defaultVotingPeriod', num)}
          />
          <CategoriesSelect
            value={buildingDaoData.category}
            onChange={val => updateBuildingDaoKeyData('category', val)}
          />
          <VotingTypesSelect
            width={296}
            value={buildingDaoData.votingTypes}
            onChange={e => updateBuildingDaoKeyData('votingTypes', e.target.value)}
          />
        </Box>
      </CreatorBox>

      {nextHandler.error ? (
        <Alert severity="error">{nextHandler.error}</Alert>
      ) : (
        <Alert severity="info">You will create a DAO in {chainId ? ChainListMap[chainId].name : '--'}</Alert>
      )}

      <Box mt={30} display="flex" justifyContent={'center'} gap="40px">
        <OutlineButton width="166px" onClick={back}>
          Back
        </OutlineButton>
        <BlackButton width="252px" disabled={nextHandler.disabled} onClick={nextHandler.handler}>
          Add DAO
        </BlackButton>
      </Box>
    </ContainerWrapper>
  )
}