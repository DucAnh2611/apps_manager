import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@renderer/lib/api'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getAllSettings()
  })
}

export function useSetSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => api.setSetting(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  })
}

export function useResetAllSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.resetAllSettings(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  })
}
