import { useContext } from 'react'
import { PageContext, PageContextValue } from '../providers/page-provider'

export default function usePage() {
  const pageContext = useContext<PageContextValue>(PageContext)

  if (!pageContext) {
    throw new Error('usePage must be used within a PageProvider')
  }

  return pageContext
}
