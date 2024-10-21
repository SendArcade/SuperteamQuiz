import React, { useEffect } from 'react'
import { Miniblink, useAction } from '@dialectlabs/blinks'
import { useActionSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana'

interface MiniBlinkComponentProps {
  rpcUrl: string
  actionUrl: string
}

import { BaseBlinkLayoutProps } from '@dialectlabs/blinks-core';

const MiniBlinkComponent: React.FC<MiniBlinkComponentProps> = ({ rpcUrl, actionUrl }) => {
  const { adapter } = useActionSolanaWalletAdapter(rpcUrl)
  const { action, isLoading } = useAction({ url: actionUrl, adapter })

  useEffect(() => {
    if (action) {
      console.log('Action available:', action) // Log action when it becomes available
    }
  }, [action])

  if (isLoading || !action) {
    return <span>Loading...</span>
  }

  return (
    <Miniblink
      selector={(currentAction) =>
        currentAction.actions.find((a) => a.label === 'Pay')!
      }
      action={action}
    />
  )
}

export default MiniBlinkComponent
