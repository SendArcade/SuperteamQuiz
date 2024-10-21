'use client'

import React, { useState, useEffect } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function Header() {

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <div className="flex items-center">
          <h1 className="text-[24px] leading-custom font-bold text-left">
            <span>Superteam Quiz</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <WalletMultiButton />
      </div>
    </header>
  )
}
