import { createContext, useState } from 'react'

export type Page = 'apps' | 'stats' | 'settings'

export type PageContextValue = { page: Page; setPage: (page: Page) => void }

export const PageContext = createContext<PageContextValue>({ page: 'apps', setPage: () => {} })

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<Page>('apps')

  return <PageContext.Provider value={{ page, setPage }}>{children}</PageContext.Provider>
}
