import React, { createContext, useContext, useState, useCallback } from 'react'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])
  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSideBar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSideBar must be used within SidebarProvider')
  return ctx
}


