import { Box, Typography } from '@mui/material'
import Button from 'components/Button/OutlineButton'
import Input from 'components/Input'
import { ReactComponent as Invite } from 'assets/svg/invite.svg'
import useCopyClipboard from 'hooks/useCopyClipboard'

//TODO 1、join DAO modal 2、verify account and signature
export default function InviteUser() {
  const link = 'http://localhost:3000/governance/daoInfo/:chainId/:address/member'
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <Box mt={10}>
      <Typography maxWidth={'100%'} color="#3f5170" fontWeight={500} fontSize={14}>
        Share this secret link to invite people to this workspace. Only users who can invite members can see this. You
        can reset the link for all space members to generate a new invite link.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 10,
          mt: 10,
          background: '#F8FBFF',
          border: '1px solid #d4d7e2',
          borderRadius: '8px',
          '& .css-jh7bmd-MuiInputBase-root.MuiInputBase-root': {
            padding: '0 0 0 20px'
          },
          '& .MuiInputBase-root.Mui-focused, & .css-jh7bmd-MuiInputBase-root.Mui-focused, & .css-jh7bmd-MuiInputBase-root.MuiInputBase-root': {
            border: 'none!important'
          },
          '& input': {
            fontSize: 14,
            fontWeight: 500,
            height: 30,
            color: '#80829f',
            padding: 0,
            border: 0
          },
          '& button': {
            gap: 10,
            width: 160,
            height: 36,
            marginRight: 10,
            borderColor: '#97b7ef',
            borderRadius: '8px',
            '&:hover': {
              borderColor: '#97b7ef'
            },
            '& svg path': {
              fill: '#97b7ef'
            },
            '& p': {
              fontWeight: 500,
              fontSize: 14,
              color: '#97b7ef'
            }
          }
        }}
      >
        <Input value={link} readOnly />
        <Button onClick={() => setCopied(link)}>
          <Invite />
          <Typography maxWidth={'100%'}>{isCopied ? 'Copied Link' : 'Copy Link'}</Typography>
        </Button>
      </Box>
    </Box>
  )
}