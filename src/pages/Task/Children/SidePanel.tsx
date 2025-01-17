import { Alert, Box, Drawer, Typography, styled, Radio, RadioGroup, FormControlLabel } from '@mui/material'
import SaveButton from 'components/Button/OutlineButton'
import ConfirmButton from 'components/Button/Button'
import Image from 'components/Image'
import { timeStampToFormat } from 'utils/dao'
import Select from 'components/Select/SearchSelect'
import DateTimePicker from 'components/DateTimePicker'
import Input from 'components/Input'
import React, { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import assign from 'assets/images/assign.png'
import select from 'assets/images/select.png'
import dateIcon from 'assets/images/date.png'
import proposalIcon from 'assets/images/proposal.png'
import { ReactComponent as ArrowBackIcon } from 'assets/svg/arrow_back.svg'
import useBreakpoint from 'hooks/useBreakpoint'
import {
  ProposalListBaseProp,
  useCreateTask,
  useGetTaskDetail,
  useJobsList,
  useUpdateTask
} from 'hooks/useBackedTaskServer'
import { ITaskQuote } from 'pages/TeamSpaces/Task/DragTaskPanel'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import useModal from 'hooks/useModal'
import { shortenAddress } from 'utils'
import Editor from 'pages/DaoInfo/Children/Proposal/Editor'

const ColSentence = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'row',
  alignItems: 'center',
  margin: '80px 0 0',
  '& button': {
    border: '1px solid #0049c6'
  }
}))

const RowContent = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
  '& .lContent': {
    minWidth: 160,
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    '& img': {
      width: 14,
      height: 14
    }
  },
  '& .css-jh7bmd-MuiInputBase-root': {
    width: 219,
    minHeight: 36
  },
  '& .css-jh7bmd-MuiInputBase-root.MuiInputBase-root': {
    padding: '0 0 0 20px'
  },
  '& .MuiInputBase-root.Mui-focused, & .css-jh7bmd-MuiInputBase-root.Mui-focused, & .css-jh7bmd-MuiInputBase-root.MuiInputBase-root': {
    border: 'none!important'
  },
  '& input': {
    padding: 0,
    height: 30,
    '&::placeholder': {
      color: '#97b7ef'
    }
  },
  '& .css-1iid421-MuiFormControl-root-MuiTextField-root input': {
    paddingLeft: 20,
    fontSize: 14
  },
  '& button': {
    border: '1px solid #d4d7e2'
  }
}))

const TaskStatus: any = {
  'Not started': 'A_notStarted',
  'In progress': 'B_inProgress',
  Done: 'C_done',
  'No status': 'D_notStatus'
}

export const MapTaskStatus: any = {
  A_notStarted: 'Not started',
  B_inProgress: 'In progress',
  C_done: 'Done',
  D_notStatus: 'No status'
}

// const PriorityType: any = {
//   High: 'A_High',
//   Medium: 'B_Medium',
//   Low: 'C_Low'
// }

export const MapPriorityType: any = {
  A_High: 'High',
  B_Medium: 'Medium',
  C_Low: 'Low'
}

const statusList = ['Not started', 'In progress', 'Done', 'No status']
// const priorityList = ['High', 'Medium', 'Low']

export default function SidePanel({
  open,
  onDismiss,
  proposalBaseList,
  TeamSpacesInfo,
  editData
}: {
  open: boolean
  onDismiss: () => void
  proposalBaseList: ProposalListBaseProp[]
  TeamSpacesInfo: any
  editData: ITaskQuote
}) {
  const { result: jobsList } = useJobsList('C_member', TeamSpacesInfo?.daoAddress, Number(TeamSpacesInfo?.chainId))
  const assigneeList = useMemo(() => {
    if (!jobsList) return []
    const _arr: any = []
    jobsList.map(item => {
      _arr.push(
        Object.assign({}, item, { label: item.nickname + '-' + shortenAddress(item.account), value: item.account })
      )
    })
    return _arr
  }, [jobsList])

  const proposalList = useMemo(() => {
    if (!proposalBaseList) return []
    const arr: any = []
    proposalBaseList.map((item: any) => {
      arr.push(Object.assign({}, item, { label: item.title, value: item.proposalId }))
    })
    return arr
  }, [proposalBaseList])
  const updateProposal = useMemo(() => {
    if (!editData || !proposalBaseList) return
    const res = proposalBaseList.filter((item: any) => editData.proposalId === item.proposalId)[0]
    return res ? res.proposalId : ''
  }, [editData, proposalBaseList])

  const toggleDrawer = useCallback(
    e => {
      if (
        e.type === 'keydown' &&
        ((e as React.KeyboardEvent).key === 'Tab' || (e as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }
      onDismiss()
    },
    [onDismiss]
  )

  const isSmDown = useBreakpoint('sm')
  const { result: taskDetailData } = useGetTaskDetail(editData?.taskId)
  const [currentStatus, setCurrentStatus] = useState(MapTaskStatus[editData?.status] ?? '')
  const [assignees, setAssignees] = useState(editData?.assignAccount ?? '')
  const [priority, setPriority] = useState<any>(editData?.priority ?? '')
  const [proposal, setProposal] = useState(updateProposal ?? '')
  const [value, setValue] = useState(editData?.taskName ?? '')
  const [endTime, setEndTime] = useState<any>(editData?.deadline ?? null)
  const [content, setContent] = useState<any>(taskDetailData?.content ?? '')
  const create = useCreateTask()
  const update = useUpdateTask()
  const { showModal } = useModal()

  useEffect(() => {
    setContent(taskDetailData?.content)
  }, [taskDetailData?.content])

  const createCallback = useCallback(() => {
    if (!TeamSpacesInfo || !value) return

    create(
      assignees,
      content,
      endTime,
      priority,
      Number(proposal),
      '0',
      TeamSpacesInfo.teamSpacesId,
      currentStatus ? TaskStatus[currentStatus] : 'A_notStarted',
      value
    ).then((res: any) => {
      if (res.data.code === 200) {
        onDismiss()
        showModal(<MessageBox type="success">Create task success</MessageBox>)
      } else showModal(<MessageBox type="failure">Something wrong</MessageBox>)
    })
  }, [
    TeamSpacesInfo,
    assignees,
    content,
    create,
    currentStatus,
    endTime,
    onDismiss,
    priority,
    proposal,
    showModal,
    value
  ])

  const updateCallback = useCallback(() => {
    if (!editData) return
    update(
      assignees,
      content,
      endTime,
      false,
      priority,
      Number(proposal),
      '0',
      editData.spacesId,
      TaskStatus[currentStatus],
      editData.taskId,
      value,
      editData.weight
    ).then(res => {
      onDismiss()
      showModal(<MessageBox type="success">Update success</MessageBox>)
      console.log(res)
    })
  }, [assignees, content, currentStatus, editData, endTime, onDismiss, priority, proposal, showModal, update, value])

  const getActions = useCallback(() => {
    if (editData) {
      return (
        <SaveButton disabled={!value.trim()} width="140px" height="36px" color="#0049C6" onClick={updateCallback}>
          Save
        </SaveButton>
      )
    } else {
      return (
        <ConfirmButton disabled={!value.trim()} width="140px" height="36px" color="#ffffff" onClick={createCallback}>
          Confirm
        </ConfirmButton>
      )
    }
  }, [createCallback, editData, updateCallback, value])

  return (
    <Box maxWidth="608px" width="100%">
      <Drawer
        sx={{
          width: '100%',
          '& .MuiDrawer-paper': {
            padding: 20,
            width: '40vw'
          },
          '& .title': {
            margin: '10px 0'
          },
          '& .Mui-focused, & .MuiInputBase-root': {
            border: 'none!important'
          }
        }}
        anchor={'right'}
        open={open}
        onClose={toggleDrawer}
      >
        <Box
          sx={{
            marginLeft: { sm: 20, xs: 0 },
            marginTop: { sm: 20, xs: 10 },
            '& button': {
              gap: 6
            }
          }}
        >
          <Typography
            sx={{ cursor: 'pointer' }}
            fontWeight={600}
            display={'inline-flex'}
            onClick={onDismiss}
            alignItems="center"
          >
            <ArrowBackIcon style={{ marginRight: 10 }}></ArrowBackIcon>
            Back
          </Typography>
        </Box>
        <Input
          className="title"
          value={value}
          hideBorder={true}
          onChange={e => setValue(e.target.value)}
          placeholder="Untitled"
          focused
          style={{ fontSize: 30, color: '#3F5170', fontWeight: 700 }}
        />
        <RowContent>
          <Box className={'lContent'}>
            <Image src={assign}></Image>
            <Typography>Assignee</Typography>
          </Box>
          <Select
            options={assigneeList}
            placeholder="Empty"
            width={isSmDown ? 160 : 219}
            height={isSmDown ? 40 : undefined}
            value={assignees}
            multiple={false}
            onChange={(value: any, option: any) => {
              console.log(value)
              setAssignees(option.value)
            }}
          />
        </RowContent>
        <RowContent>
          <Box className={'lContent'}>
            <Image src={select}></Image>
            <Typography>Status</Typography>
          </Box>
          <Select
            options={statusList}
            placeholder="Empty"
            width={isSmDown ? 160 : 219}
            height={isSmDown ? 40 : undefined}
            value={currentStatus}
            multiple={false}
            onChange={(value: any) => setCurrentStatus(value)}
          />
        </RowContent>
        <RowContent>
          <Box className={'lContent'}>
            <Image src={select}></Image>
            <Typography>Priority</Typography>
          </Box>
          {/* <Select
            options={priorityList}
            placeholder="Empty"
            width={isSmDown ? 160 : 219}
            height={isSmDown ? 40 : undefined}
            value={priority}
            multiple={false}
            onChange={(value: any) => setPriority(value)}
          /> */}
          <RadioGroup
            sx={{ marginLeft: 10 }}
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={priority}
            onChange={(e: any) => setPriority(e.target.value)}
          >
            <FormControlLabel
              value="A_High"
              control={<Radio />}
              label="High"
              sx={{
                marginRight: 10,
                '& svg path': {
                  fill: '#E46767'
                },
                '& .Mui-checked svg path': {
                  fill: '#E46767'
                }
                // '&::after': {
                //   content: "''",
                //   width: 4,
                //   height: 16,
                //   marginLeft: 4,
                //   backgroundColor: '#E46767'
                // }
              }}
            />
            <FormControlLabel
              value="B_Medium"
              control={<Radio />}
              label="Medium"
              sx={{
                marginRight: 10,
                '& svg path': {
                  fill: '#EFCC97'
                },
                '& .Mui-checked svg path': {
                  fill: '#EFCC97'
                }
                // '&::after': {
                //   content: "''",
                //   width: 4,
                //   height: 16,
                //   marginLeft: 4,
                //   backgroundColor: '#EFCC97'
                // }
              }}
            />
            <FormControlLabel
              value="C_Low"
              control={<Radio />}
              label="Low"
              sx={{
                marginRight: 10,
                '& svg path': {
                  fill: '#CAE7ED'
                },
                '& .Mui-checked svg path': {
                  fill: '#CAE7ED'
                }
                // '&::after': {
                //   content: "''",
                //   width: 4,
                //   height: 16,
                //   marginLeft: 4,
                //   backgroundColor: '#CAE7ED'
                // }
              }}
            />
          </RadioGroup>
        </RowContent>
        {/* <RowContent>
          <Box className={'lContent'}>
            <Image src={select}></Image>
            <Typography>Task Type</Typography>
          </Box>
          <Input value={value} onChange={e => setValue(e.target.value)} placeholder="Empty" />
        </RowContent> */}
        <RowContent>
          <Box className={'lContent'}>
            <Image src={dateIcon}></Image>
            <Typography>Due date</Typography>
          </Box>
          <DateTimePicker
            label="Empty"
            value={endTime ? new Date(endTime * 1000) : null}
            onValue={(timestamp: SetStateAction<number | undefined>) => setEndTime(timestamp)}
          ></DateTimePicker>
        </RowContent>
        <RowContent mt={10}>
          <Box className={'lContent'}>
            <Image src={dateIcon}></Image>
            <Typography>Date Created</Typography>
          </Box>
          <Typography fontSize={16} marginLeft={14}>
            {timeStampToFormat(new Date().getTime(), 'Y-MM-DD HH:mm')}
          </Typography>
        </RowContent>
        <RowContent mt={10} mb={10}>
          <Box className={'lContent'}>
            <Image src={proposalIcon}></Image>
            <Typography>Proposal</Typography>
          </Box>
          <Select
            options={proposalList}
            placeholder="Choose a proposal"
            width={isSmDown ? 160 : 219}
            height={isSmDown ? 40 : undefined}
            value={proposal}
            multiple={false}
            onChange={(value: any) => {
              setProposal(value)
            }}
          />
        </RowContent>
        <RowContent>
          <Editor content={content} setContent={setContent} />
        </RowContent>
        {!value.trim() ? <Alert severity="error">Title required</Alert> : ''}
        {/* <RowContent mt={10}>
          <Box className={'lContent'}>
            <Image src={rewardIcon}></Image>
            <Typography>Reward</Typography>
          </Box>
          <SaveButton width={125} height={26} fontWeight={400} onClick={() => {}}>
            Set Reward
          </SaveButton>
        </RowContent> */}
        {/* <Box
          sx={{
            mt: 20,
            display: 'flex',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            '& img': {
              width: 14,
              height: 14
            }
          }}
        >
          <Image src={addIcon}></Image>
          <Typography>Add Property</Typography>
        </Box> */}
        <ColSentence>{getActions()}</ColSentence>
      </Drawer>
    </Box>
  )
}
