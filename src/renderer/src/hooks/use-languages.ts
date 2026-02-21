import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@renderer/lib/api'

export function useAvailableLanguages() {
  return useQuery({
    queryKey: ['languages', 'available'],
    queryFn: () => api.getAvailableLanguages(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useInstalledLanguages() {
  return useQuery({
    queryKey: ['languages', 'installed'],
    queryFn: () => api.getInstalledLanguages()
  })
}

export function useDownloadLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => api.downloadLanguage(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages', 'installed'] })
    }
  })
}

export function useUninstallLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => api.uninstallLanguage(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages', 'installed'] })
    }
  })
}

export function useRefreshAvailableLanguages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.refreshAvailableLanguages(),
    onSuccess: (data) => {
      queryClient.setQueryData(['languages', 'available'], data)
      queryClient.invalidateQueries({ queryKey: ['languages', 'installed'] })
    }
  })
}
