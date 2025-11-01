"use client"

import { SearchProvider } from "@/contexts/SearchContext"

export default function Providers({ children }) {
  return <SearchProvider>{children}</SearchProvider>
}

