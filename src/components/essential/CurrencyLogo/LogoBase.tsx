import { useState } from 'react'
// import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
// import { ReactComponent as DefaultSvg } from 'assets/svg/default_img.svg'
import createTokenIcon from 'assets/images/create-token-ball.png'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export interface LogoProps {
  srcs: string[]
  alt?: string
  style?: React.CSSProperties
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, style }: LogoProps) {
  const [, refresh] = useState<number>(0)

  const src: string | undefined = srcs.find(src => !BAD_SRCS[src])

  if (src) {
    return (
      <img
        style={{ ...style }}
        alt={alt}
        src={src}
        onError={() => {
          if (src) BAD_SRCS[src] = true
          refresh(i => i + 1)
        }}
      />
    )
  }

  // return <DefaultSvg style={{ ...style }} />
  return <img style={{ ...style }} src={createTokenIcon} />
}
