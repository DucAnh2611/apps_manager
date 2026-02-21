import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@renderer/lib/api'

export function useApps() {
  return useQuery({
    queryKey: ['apps'],
    queryFn: () => api.getApps()
  })
}

export function useAddApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      name: string
      path: string
      args?: string | null
      icon?: string | null
      color?: string | null
      categories?: string[]
    }) => api.addApp(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apps'] })
  })
}

export function useUpdateApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: number
      name?: string
      path?: string
      args?: string | null
      icon?: string | null
      color?: string | null
      categories?: string[]
      favorite?: number
    }) => api.updateApp(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apps'] })
  })
}

export function useDeleteApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteApp(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apps'] })
  })
}

export function useLaunchApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.launchApp(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apps'] })
  })
}

export function useBrowseForApp() {
  return useMutation({
    mutationFn: () => api.browseForApp()
  })
}

export function useBrowseForIcon() {
  return useMutation({
    mutationFn: () => api.browseForIcon()
  })
}
