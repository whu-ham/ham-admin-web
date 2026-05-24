/**
 * @datetime 2026-05-21 00:00:00
 * @model GLM-5.1
 */

// ===== Platform & Channel =====
export type Platform = 'android' | 'ios'
export type Channel = 'beta' | 'release'

// ===== AppVersion =====
export interface AppVersion {
  id: number
  platform: Platform
  channel: Channel
  versionCode: number
  versionName: string
  changeLogTitle?: string
  changeLog?: string
  updateUrl?: string
  updatedAt?: string
  enabled: boolean
}

export interface CreateVersionReq {
  platform: Platform
  channel: Channel
  versionCode: number
  versionName: string
  changeLogTitle?: string
  changeLog?: string
  updateUrl?: string
  enabled?: boolean
}

export interface UpdateVersionReq {
  platform?: Platform
  channel?: Channel
  versionCode?: number
  versionName?: string
  changeLogTitle?: string
  changeLog?: string
  updateUrl?: string
  enabled?: boolean
}

export interface ListVersionsParams {
  platform?: Platform
  channel?: Channel
  page?: number
  pageSize?: number
}

// ===== OpenApp =====
export type RedirectUriMatchMode = 'exact' | 'loopback_port_agnostic'

export interface OpenAppRedirectUri {
  uri: string
  matchMode: RedirectUriMatchMode
}

export interface OpenAppScope {
  scope: string
  label: string
  description?: string
  category: string
  required: boolean
  grantable: boolean
}

export interface OpenApp {
  id: string
  name: string
  iconUrl?: string
  description?: string
  redirectUris?: OpenAppRedirectUri[]
  appId: string
  appSecret?: string
  allowedScopes?: string[]
  createdAt?: string
}

export interface OpenAppListItem {
  id: string
  name: string
  iconUrl?: string
  description?: string
  redirectUris?: OpenAppRedirectUri[]
  appId: string
  allowedScopes?: string[]
  createdAt?: string
}

export interface CreateOpenAppReq {
  name: string
  iconUrl?: string
  description?: string
  redirectUris: OpenAppRedirectUri[]
  allowedScopes: string[]
}

export interface UpdateOpenAppReq {
  name?: string
  iconUrl?: string
  description?: string
  redirectUris?: OpenAppRedirectUri[]
  allowedScopes?: string[]
}

export interface ResetSecretResponse {
  appSecret: string
}

export interface OpenAppScopesResponse {
  items: OpenAppScope[]
}

// ===== Common API Response =====
export interface ApiResponse<T> {
  code: string
  message: string
  data: T
}

export interface PaginatedData<T> {
  items: T[]
  total: number
}

export interface ListParams {
  page?: number
  pageSize?: number
}
