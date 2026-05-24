<!-- @datetime 2026-05-21 00:00:00 @model GLM-5.1 -->
<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Open Applications</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage third-party open applications and credentials
        </p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        label="Create Application"
        color="success"
        @click="openCreateModal"
      />
    </div>

    <!-- Table -->
    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 text-xs text-gray-500 uppercase dark:border-gray-700 dark:text-gray-400"
          >
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">App ID</th>
              <th class="px-4 py-3">Scopes</th>
              <th class="px-4 py-3">Redirect URIs</th>
              <th class="px-4 py-3">Created</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in openAppStore.items"
              :key="item.id"
              class="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <td class="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                {{ item.id }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <img v-if="item.iconUrl" :src="item.iconUrl" alt="" class="size-6 rounded" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.name }}</p>
                    <button
                      v-if="item.description"
                      class="mt-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      @click="openDetailModal(item, 'description')"
                    >
                      View description
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                {{ item.appId }}
              </td>
              <td class="max-w-[280px] px-4 py-3">
                <div v-if="item.allowedScopes?.length" class="flex flex-wrap gap-1.5">
                  <UBadge
                    v-for="scope in item.allowedScopes"
                    :key="scope"
                    :label="scope"
                    :color="scopeBadgeColor(scope)"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="max-w-[240px] px-4 py-3">
                <div v-if="item.redirectUris?.length">
                  <div class="flex items-center gap-2">
                    <span class="truncate font-mono text-xs text-gray-500 dark:text-gray-400">
                      {{ item.redirectUris[0]?.uri }}
                    </span>
                    <UBadge
                      :label="formatMatchMode(item.redirectUris[0]?.matchMode)"
                      variant="soft"
                      size="sm"
                      color="neutral"
                    />
                  </div>
                  <button
                    class="mt-1 block text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    @click="openDetailModal(item, 'redirectUris')"
                  >
                    {{
                      item.redirectUris.length > 1
                        ? `View all (${item.redirectUris.length})`
                        : 'View full'
                    }}
                  </button>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {{ item.createdAt ? formatDate(item.createdAt) : '-' }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <UTooltip text="Reset Secret">
                    <UButton
                      icon="i-heroicons-arrow-path"
                      variant="ghost"
                      color="warning"
                      size="xs"
                      @click="confirmResetSecret(item)"
                    />
                  </UTooltip>
                  <UTooltip text="Edit">
                    <UButton
                      icon="i-heroicons-pencil-square"
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      @click="openEditModal(item)"
                    />
                  </UTooltip>
                  <UTooltip text="Delete">
                    <UButton
                      icon="i-heroicons-trash"
                      variant="ghost"
                      color="error"
                      size="xs"
                      @click="confirmDelete(item)"
                    />
                  </UTooltip>
                </div>
              </td>
            </tr>
            <tr v-if="openAppStore.pending">
              <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </td>
            </tr>
            <tr v-else-if="openAppStore.items.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No open applications found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">Total: {{ openAppStore.total }}</p>
          <UPagination
            v-model:page="currentPage"
            :total="openAppStore.total"
            :items-per-page="pageSize"
          />
        </div>
      </template>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="modalOpen" :title="isEditing ? 'Edit Application' : 'Create Application'">
      <template #body>
        <div class="space-y-5">
          <UFormField label="Name" name="name" required>
            <UInput v-model="form.name" placeholder="e.g. My SSO App" class="w-full" />
          </UFormField>

          <UFormField label="Icon URL" name="iconUrl">
            <UInput
              v-model="form.iconUrl"
              placeholder="https://example.com/icon.png"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Description" name="description">
            <UTextarea
              v-model="form.description"
              placeholder="A third-party application"
              :rows="2"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Redirect URIs" name="redirectUris" :required="!isEditing">
            <div class="space-y-2">
              <div
                v-for="(redirect, i) in form.redirectUris"
                :key="i"
                class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem_auto]"
              >
                <UInput
                  v-model="redirect.uri"
                  placeholder="https://myapp.example.com/callback"
                  class="w-full"
                />
                <USelect
                  v-model="redirect.matchMode"
                  :items="matchModeItems(redirect.uri)"
                  :disabled="!isLoopbackRedirect(redirect.uri)"
                  class="w-full"
                />
                <UButton
                  v-if="form.redirectUris.length > 1"
                  icon="i-heroicons-x-mark"
                  variant="ghost"
                  color="error"
                  size="sm"
                  @click="removeRedirectUri(i)"
                />
              </div>
              <UButton
                icon="i-heroicons-plus"
                variant="ghost"
                color="neutral"
                size="sm"
                label="Add URI"
                @click="addRedirectUri"
              />
            </div>
          </UFormField>

          <UFormField label="Allowed Scopes" name="allowedScopes">
            <div v-if="openAppStore.scopesPending" class="text-sm text-gray-500 dark:text-gray-400">
              Loading scopes...
            </div>
            <div v-else-if="scopeGroups.length" class="space-y-4">
              <div
                v-for="group in scopeGroups"
                :key="group.category"
                :class="[
                  'rounded-md border p-3',
                  group.category === 'mcp'
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40',
                ]"
              >
                <div class="mb-3 flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ formatScopeCategory(group.category) }}
                    </h3>
                    <p
                      v-if="group.category === 'mcp'"
                      class="mt-1 text-xs text-amber-700 dark:text-amber-300"
                    >
                      MCP grants allow tool and API access.
                    </p>
                  </div>
                  <UBadge
                    v-if="group.category === 'mcp'"
                    label="Tool access"
                    color="warning"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <UCheckbox
                    v-for="scope in group.scopes"
                    :key="scope.scope"
                    :model-value="form.allowedScopes.includes(scope.scope)"
                    :label="scope.label"
                    :description="scope.description || scope.scope"
                    :disabled="scope.required || !scope.grantable"
                    @update:model-value="toggleScope(scope.scope, Boolean($event))"
                  />
                </div>
              </div>
            </div>
            <UAlert
              v-else
              icon="i-heroicons-exclamation-triangle"
              color="warning"
              variant="subtle"
              title="Scope registry unavailable"
              description="Scopes cannot be edited until the supported scope registry is loaded."
            />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" color="neutral" @click="modalOpen = false">Cancel</UButton>
          <UButton
            :color="isEditing ? 'primary' : 'success'"
            :loading="submitting"
            @click="onSubmit"
          >
            {{ isEditing ? 'Update' : 'Create' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Secret Display Modal -->
    <UModal v-model:open="secretModalOpen" title="Application Credentials">
      <template #body>
        <div class="space-y-3">
          <UAlert
            icon="i-heroicons-exclamation-triangle"
            color="warning"
            variant="subtle"
            title="Save this secret now"
            description="The app secret is shown only once after creation or reset."
          />
          <UFormField label="App ID">
            <UInput :model-value="secretData.appId" readonly>
              <template #trailing>
                <UButton
                  icon="i-heroicons-clipboard"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="copyToClipboard(secretData.appId)"
                />
              </template>
            </UInput>
          </UFormField>
          <UFormField label="App Secret">
            <UInput :model-value="secretData.appSecret" readonly type="password">
              <template #trailing>
                <UButton
                  icon="i-heroicons-clipboard"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="copyToClipboard(secretData.appSecret)"
                />
              </template>
            </UInput>
          </UFormField>
        </div>
      </template>
      <template #footer>
        <UButton @click="secretModalOpen = false">Close</UButton>
      </template>
    </UModal>

    <!-- Reset Secret Confirmation Modal -->
    <UModal v-model:open="resetSecretModalOpen" title="Reset Application Secret">
      <template #body>
        <p class="text-gray-600 dark:text-gray-300">
          Are you sure you want to reset the secret for <strong>{{ resetTarget?.name }}</strong
          >? The old secret will be immediately invalidated.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" color="neutral" @click="resetSecretModalOpen = false"
            >Cancel</UButton
          >
          <UButton color="warning" :loading="resetting" @click="onResetSecret"
            >Reset Secret</UButton
          >
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteModalOpen" title="Confirm Delete">
      <template #body>
        <p class="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete application <strong>{{ deleteTarget?.name }}</strong
          >? This action cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" color="neutral" @click="deleteModalOpen = false">Cancel</UButton>
          <UButton color="error" :loading="deleting" @click="onDelete">Delete</UButton>
        </div>
      </template>
    </UModal>

    <!-- Detail Modal -->
    <UModal v-model:open="detailModalOpen" :title="detailModalTitle">
      <template #body>
        <div
          v-if="detailModalType === 'description'"
          class="whitespace-pre-wrap text-gray-600 dark:text-gray-300"
        >
          {{ detailModalItem?.description }}
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(redirect, i) in detailModalItem?.redirectUris"
            :key="i"
            class="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800"
          >
            <span class="font-mono text-sm break-all text-gray-700 dark:text-gray-300">
              {{ redirect.uri }}
            </span>
            <UBadge
              :label="formatMatchMode(redirect.matchMode)"
              color="neutral"
              variant="soft"
              size="sm"
            />
            <UButton
              icon="i-heroicons-clipboard"
              variant="ghost"
              color="neutral"
              size="xs"
              class="shrink-0"
              @click="copyToClipboard(redirect.uri)"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <UButton @click="detailModalOpen = false">Close</UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type {
  CreateOpenAppReq,
  OpenApp,
  OpenAppListItem,
  OpenAppRedirectUri,
  OpenAppScope,
  RedirectUriMatchMode,
  UpdateOpenAppReq,
} from '~/types'

type ScopeGroup = {
  category: string
  scopes: OpenAppScope[]
}

type OpenAppForm = {
  name: string
  iconUrl: string
  description: string
  redirectUris: OpenAppRedirectUri[]
  allowedScopes: string[]
}

const openAppStore = useOpenAppsStore()
const toast = useToast()

const currentPage = ref(1)
const pageSize = ref(20)
const modalOpen = ref(false)
const secretModalOpen = ref(false)
const resetSecretModalOpen = ref(false)
const deleteModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)
const resetting = ref(false)
const deleting = ref(false)
const resetTarget = ref<OpenAppListItem | null>(null)
const deleteTarget = ref<OpenAppListItem | null>(null)

const detailModalOpen = ref(false)
const detailModalType = ref<'description' | 'redirectUris'>('description')
const detailModalItem = ref<OpenAppListItem | null>(null)
const detailModalTitle = computed(() => {
  if (detailModalType.value === 'description') return 'Description'
  return 'Redirect URIs'
})

const secretData = reactive({
  appId: '',
  appSecret: '',
})

const form = reactive<OpenAppForm>({
  name: '',
  iconUrl: '',
  description: '',
  redirectUris: [{ uri: '', matchMode: 'exact' }],
  allowedScopes: [],
})

const matchModeOptions = {
  exact: { label: 'Exact', value: 'exact' },
  loopback: { label: 'Loopback any port', value: 'loopback_port_agnostic' },
}

const scopeGroups = computed<ScopeGroup[]>(() => {
  const groups = new Map<string, OpenAppScope[]>()
  for (const scope of openAppStore.scopes) {
    const category = normalizeScopeCategory(scope.category || inferScopeCategory(scope.scope))
    groups.set(category, [...(groups.get(category) ?? []), scope])
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => scopeCategorySort(a) - scopeCategorySort(b) || a.localeCompare(b))
    .map(([category, scopes]) => ({
      category,
      scopes: scopes.sort(
        (a, b) => Number(b.required) - Number(a.required) || a.scope.localeCompare(b.scope),
      ),
    }))
})

const requiredScopes = computed(() => openAppStore.scopes.filter((scope) => scope.required))

const openDetailModal = (item: OpenAppListItem, type: 'description' | 'redirectUris') => {
  detailModalItem.value = item
  detailModalType.value = type
  detailModalOpen.value = true
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

const formatMatchMode = (matchMode?: RedirectUriMatchMode) => {
  if (matchMode === 'loopback_port_agnostic') return 'Any loopback port'
  return 'Exact'
}

const formatScopeCategory = (category: string) => {
  if (category === 'mcp') return 'MCP'
  if (category === 'identity') return 'Identity'
  return category.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const scopeBadgeColor = (scope: string) => {
  return normalizeScopeCategory(inferScopeCategory(scope)) === 'mcp' ? 'warning' : 'info'
}

const inferScopeCategory = (scope: string) => {
  if (scope === 'mcp' || scope.startsWith('mcp:')) return 'mcp'
  if (['openid', 'profile', 'is_student'].includes(scope)) return 'identity'
  return 'other'
}

const normalizeScopeCategory = (category: string) => {
  return category.toLowerCase()
}

const scopeCategorySort = (category: string) => {
  if (category === 'identity') return 0
  if (category === 'mcp') return 1
  return 2
}

const isLoopbackRedirect = (uri: string) => {
  try {
    const parsed = new URL(uri)
    return parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname)
  } catch {
    return false
  }
}

const matchModeItems = (uri: string) => {
  if (isLoopbackRedirect(uri)) {
    return [matchModeOptions.exact, matchModeOptions.loopback]
  }
  return [matchModeOptions.exact]
}

const normalizeRedirectUris = () => {
  for (const redirect of form.redirectUris) {
    if (!isLoopbackRedirect(redirect.uri)) {
      redirect.matchMode = 'exact'
    }
  }
}

watch(() => form.redirectUris, normalizeRedirectUris, { deep: true })

const applyRequiredScopes = () => {
  for (const scope of requiredScopes.value) {
    if (!form.allowedScopes.includes(scope.scope)) {
      form.allowedScopes.push(scope.scope)
    }
  }
}

watch(requiredScopes, applyRequiredScopes)

const ensureScopesLoaded = async () => {
  if (openAppStore.scopes.length > 0 || openAppStore.scopesPending) return
  await openAppStore.fetchScopes()
  applyRequiredScopes()
}

const resetForm = (app?: OpenApp | OpenAppListItem) => {
  Object.assign(form, {
    name: app?.name ?? '',
    iconUrl: app?.iconUrl ?? '',
    description: app?.description ?? '',
    redirectUris: app?.redirectUris?.length
      ? app.redirectUris.map((redirect) => ({ ...redirect }))
      : [{ uri: '', matchMode: 'exact' as RedirectUriMatchMode }],
    allowedScopes: [...(app?.allowedScopes ?? [])],
  })
  applyRequiredScopes()
  normalizeRedirectUris()
}

const addRedirectUri = () => {
  form.redirectUris.push({ uri: '', matchMode: 'exact' })
}

const removeRedirectUri = (index: number) => {
  form.redirectUris.splice(index, 1)
}

const toggleScope = (scope: string, checked: boolean) => {
  const scopeMeta = openAppStore.scopes.find((item) => item.scope === scope)
  if (scopeMeta?.required) {
    applyRequiredScopes()
    return
  }

  if (checked && !form.allowedScopes.includes(scope)) {
    form.allowedScopes.push(scope)
  } else if (!checked) {
    form.allowedScopes = form.allowedScopes.filter((item) => item !== scope)
    applyRequiredScopes()
  }
}

const fetchOpenApps = () => {
  openAppStore.fetchList({ page: currentPage.value, pageSize: pageSize.value })
}

watch(currentPage, () => fetchOpenApps())

onMounted(() => {
  fetchOpenApps()
  ensureScopesLoaded()
})

const openCreateModal = async () => {
  isEditing.value = false
  editingId.value = null
  await ensureScopesLoaded()
  resetForm()
  modalOpen.value = true
}

const openEditModal = async (item: OpenAppListItem) => {
  isEditing.value = true
  editingId.value = item.id
  await ensureScopesLoaded()
  try {
    const detail = await openAppStore.fetchOne(item.id)
    resetForm(detail)
  } catch {
    resetForm(item)
  }
  modalOpen.value = true
}

const buildRedirectUris = () => {
  return form.redirectUris
    .map((redirect) => ({
      uri: redirect.uri.trim(),
      matchMode: redirect.matchMode,
    }))
    .filter((redirect) => redirect.uri)
}

const validateForm = () => {
  if (!form.name) {
    toast.add({ title: 'Name is required', color: 'error' })
    return false
  }

  const redirectUris = buildRedirectUris()
  if (!isEditing.value && redirectUris.length === 0) {
    toast.add({ title: 'At least one redirect URI is required', color: 'error' })
    return false
  }

  const invalidLoopback = redirectUris.find(
    (redirect) =>
      redirect.matchMode === 'loopback_port_agnostic' && !isLoopbackRedirect(redirect.uri),
  )
  if (invalidLoopback) {
    toast.add({
      title: 'Loopback any port is only available for http://localhost and http://127.0.0.1',
      color: 'error',
    })
    return false
  }

  return true
}

const onSubmit = async () => {
  normalizeRedirectUris()
  if (!validateForm()) return

  submitting.value = true
  try {
    const redirectUris = buildRedirectUris()
    if (isEditing.value && editingId.value) {
      const data: UpdateOpenAppReq = {
        name: form.name,
        iconUrl: form.iconUrl || undefined,
        description: form.description || undefined,
        redirectUris,
        allowedScopes: [...form.allowedScopes],
      }
      await openAppStore.update(editingId.value, data)
      toast.add({ title: 'Application updated', color: 'success' })
    } else {
      const data: CreateOpenAppReq = {
        name: form.name,
        iconUrl: form.iconUrl || undefined,
        description: form.description || undefined,
        redirectUris,
        allowedScopes: [...form.allowedScopes],
      }
      const result = await openAppStore.create(data)
      toast.add({ title: 'Application created', color: 'success' })
      if (result?.appSecret) {
        secretData.appId = result.appId
        secretData.appSecret = result.appSecret
        secretModalOpen.value = true
      }
    }
    modalOpen.value = false
    fetchOpenApps()
  } catch {
    // Error handled by useApi
  } finally {
    submitting.value = false
  }
}

const confirmResetSecret = (item: OpenAppListItem) => {
  resetTarget.value = item
  resetSecretModalOpen.value = true
}

const onResetSecret = async () => {
  if (!resetTarget.value) return
  resetting.value = true
  try {
    const result = await openAppStore.resetSecret(resetTarget.value.id)
    toast.add({ title: 'Secret reset successfully', color: 'success' })
    resetSecretModalOpen.value = false
    secretData.appId = resetTarget.value.appId
    secretData.appSecret = result.appSecret
    secretModalOpen.value = true
  } catch {
    // Error handled by useApi
  } finally {
    resetting.value = false
  }
}

const confirmDelete = (item: OpenAppListItem) => {
  deleteTarget.value = item
  deleteModalOpen.value = true
}

const onDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await openAppStore.remove(deleteTarget.value.id)
    toast.add({ title: 'Application deleted', color: 'success' })
    deleteModalOpen.value = false
    fetchOpenApps()
  } catch {
    // Error handled by useApi
  } finally {
    deleting.value = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: 'Copied to clipboard', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to copy', color: 'error' })
  }
}
</script>
