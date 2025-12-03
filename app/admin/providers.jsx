'use client'

import { SessionProvider } from 'next-auth/react'

export function AdminSessionProvider({ children }) {
  return (
    <SessionProvider basePath="/api/adminauth">
      {children}
    </SessionProvider>
  )
}
