/**
 * @datetime 2026-05-21 00:00:00
 * @model GLM-5.1
 */
import { defineStore } from 'pinia'
import type {
  CreateOpenAppReq,
  ListParams,
  OpenApp,
  OpenAppListItem,
  OpenAppScope,
  OpenAppScopesResponse,
  PaginatedData,
  ResetSecretResponse,
  UpdateOpenAppReq,
} from '~/types'

export const useOpenAppsStore = defineStore('open-apps', {
  state: () => ({
    items: [] as OpenAppListItem[],
    scopes: [] as OpenAppScope[],
    total: 0,
    pending: false,
    scopesPending: false,
  }),

  actions: {
    async fetchList(params?: ListParams) {
      const api = useApi()
      this.pending = true
      try {
        const data = await api.get<PaginatedData<OpenAppListItem>>('/api/open-apps', {
          page: params?.page,
          pageSize: params?.pageSize,
        })
        this.items = data?.items ?? []
        this.total = data?.total ?? 0
      } finally {
        this.pending = false
      }
    },

    async fetchOne(id: string) {
      const api = useApi()
      return api.get<OpenApp>(`/api/open-apps/${id}`)
    },

    async fetchScopes() {
      const api = useApi()
      this.scopesPending = true
      try {
        const data = await api.get<OpenAppScopesResponse>('/api/open-app-scopes')
        this.scopes = data?.items ?? []
        return this.scopes
      } finally {
        this.scopesPending = false
      }
    },

    async create(data: CreateOpenAppReq) {
      const api = useApi()
      return api.post<OpenApp>('/api/open-apps', data)
    },

    async update(id: string, data: UpdateOpenAppReq) {
      const api = useApi()
      return api.put<OpenApp>(`/api/open-apps/${id}`, data)
    },

    async remove(id: string) {
      const api = useApi()
      return api.del<null>(`/api/open-apps/${id}`)
    },

    async resetSecret(id: string) {
      const api = useApi()
      return api.put<ResetSecretResponse>(`/api/open-apps/${id}/secret`)
    },
  },
})
