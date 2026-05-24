<!-- @datetime 2026-05-21 00:00:00 @model GLM-5.1 -->
<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">App Versions</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage mobile app version releases
        </p>
      </div>
      <UButton icon="i-heroicons-plus" label="Create Version" @click="openCreateModal" />
    </div>

    <!-- Filters -->
    <div class="mb-4 flex flex-wrap gap-3">
      <USelect
        v-model="filters.platform"
        :items="platformOptions"
        placeholder="All Platforms"
        class="w-40"
        @update:model-value="onFilterChange"
      />
      <USelect
        v-model="filters.channel"
        :items="channelOptions"
        placeholder="All Channels"
        class="w-40"
        @update:model-value="onFilterChange"
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
              <th class="px-4 py-3">Platform</th>
              <th class="px-4 py-3">Channel</th>
              <th class="px-4 py-3">Version</th>
              <th class="px-4 py-3">Code</th>
              <th class="px-4 py-3">Changelog</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Updated</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in versionStore.items"
              :key="item.id"
              class="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <td class="px-4 py-3 font-mono text-gray-900 dark:text-white">{{ item.id }}</td>
              <td class="px-4 py-3">
                <UBadge
                  :label="item.platform"
                  :color="item.platform === 'android' ? 'success' : 'info'"
                  variant="subtle"
                  size="md"
                />
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :label="item.channel"
                  :color="item.channel === 'release' ? 'success' : 'warning'"
                  variant="subtle"
                  size="md"
                />
              </td>
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {{ item.versionName }}
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ item.versionCode }}</td>
              <td class="max-w-[200px] px-4 py-3">
                <div v-if="item.changeLogTitle || item.changeLog">
                  <p class="truncate text-gray-600 dark:text-gray-300" :title="item.changeLog">
                    {{ item.changeLogTitle || item.changeLog }}
                  </p>
                  <button
                    v-if="item.changeLog && item.changeLog !== item.changeLogTitle"
                    class="mt-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    @click="openChangelogModal(item)"
                  >
                    Click to view all
                  </button>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :label="item.enabled ? 'Enabled' : 'Disabled'"
                  :color="item.enabled ? 'success' : 'error'"
                  variant="subtle"
                  size="md"
                />
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {{ item.updatedAt ? formatDate(item.updatedAt) : '-' }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
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
            <tr v-if="versionStore.pending">
              <td colspan="9" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </td>
            </tr>
            <tr v-else-if="versionStore.items.length === 0">
              <td colspan="9" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No versions found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">Total: {{ versionStore.total }}</p>
          <UPagination
            v-model:page="currentPage"
            :total="versionStore.total"
            :items-per-page="pageSize"
          />
        </div>
      </template>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="modalOpen" :title="isEditing ? 'Edit Version' : 'Create Version'">
      <template #body>
        <UForm :state="form" @submit="onSubmit">
          <div class="space-y-4">
            <UFormField label="Platform" name="platform" required>
              <USelect
                v-model="form.platform"
                :items="platformRequiredItems"
                placeholder="Select platform"
              />
            </UFormField>

            <UFormField label="Channel" name="channel" required>
              <USelect
                v-model="form.channel"
                :items="channelRequiredItems"
                placeholder="Select channel"
              />
            </UFormField>

            <UFormField label="Version Name" name="versionName" required>
              <UInput v-model="form.versionName" placeholder="e.g. 2.1.0" class="w-full" />
            </UFormField>

            <UFormField label="Version Code" name="versionCode" required>
              <UInput
                v-model.number="form.versionCode"
                type="number"
                placeholder="e.g. 30"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Changelog Title" name="changeLogTitle">
              <UInput
                v-model="form.changeLogTitle"
                placeholder="e.g. New Features"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Changelog" name="changeLog">
              <div class="rounded-md border border-gray-200 dark:border-gray-700">
                <div class="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    :class="[
                      'px-3 py-1.5 text-sm font-medium',
                      changelogTab === 'write'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400 border-b-2'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                    ]"
                    @click="changelogTab = 'write'"
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    :class="[
                      'px-3 py-1.5 text-sm font-medium',
                      changelogTab === 'preview'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400 border-b-2'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                    ]"
                    @click="changelogTab = 'preview'"
                  >
                    Preview
                  </button>
                </div>
                <div v-if="changelogTab === 'write'">
                  <textarea
                    v-model="form.changeLog"
                    class="w-full rounded-b-md bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white"
                    placeholder="- Added dark mode&#10;- Fixed login crash"
                    :rows="6"
                  />
                </div>
                <div
                  v-else
                  class="prose prose-sm dark:prose-invert max-w-none rounded-b-md bg-white px-3 py-2 dark:bg-gray-800"
                >
                  <div v-if="form.changeLog" v-html="renderMarkdown(form.changeLog)" />
                  <p v-else class="text-gray-400">Nothing to preview</p>
                </div>
              </div>
            </UFormField>

            <UFormField label="Update URL" name="updateUrl">
              <UInput
                v-model="form.updateUrl"
                placeholder="https://example.com/app-2.1.0.apk"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Enabled" name="enabled">
              <USwitch v-model="form.enabled" />
            </UFormField>
          </div>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" color="neutral" @click="modalOpen = false">Cancel</UButton>
          <UButton :loading="submitting" @click="onSubmit">{{
            isEditing ? 'Update' : 'Create'
          }}</UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteModalOpen" title="Confirm Delete">
      <template #body>
        <p class="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete version
          <strong>{{ deleteTarget?.versionName }}</strong> (ID: {{ deleteTarget?.id }})? This action
          cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" color="neutral" @click="deleteModalOpen = false">Cancel</UButton>
          <UButton color="error" :loading="deleting" @click="onDelete">Delete</UButton>
        </div>
      </template>
    </UModal>

    <!-- Changelog Modal -->
    <UModal
      v-model:open="changelogModalOpen"
      :title="changelogTarget?.changeLogTitle || 'Changelog'"
    >
      <template #body>
        <div
          class="prose prose-sm dark:prose-invert max-w-none"
          v-html="renderMarkdown(changelogTarget?.changeLog || '')"
        />
      </template>
      <template #footer>
        <UButton @click="changelogModalOpen = false">Close</UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { AppVersion, CreateVersionReq, Platform, Channel, UpdateVersionReq } from '~/types'

const versionStore = useVersionsStore()
const toast = useToast()

const currentPage = ref(1)
const pageSize = ref(20)
const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const deleteTarget = ref<AppVersion | null>(null)
const changelogTab = ref<'write' | 'preview'>('write')
const changelogModalOpen = ref(false)
const changelogTarget = ref<AppVersion | null>(null)

const filters = reactive({
  platform: 'all' as Platform | 'all',
  channel: 'all' as Channel | 'all',
})

const platformOptions = [
  { label: 'All Platforms', value: 'all' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
]

const channelOptions = [
  { label: 'All Channels', value: 'all' },
  { label: 'Beta', value: 'beta' },
  { label: 'Release', value: 'release' },
]

const platformRequiredItems = [
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
]

const channelRequiredItems = [
  { label: 'Beta', value: 'beta' },
  { label: 'Release', value: 'release' },
]

const form = reactive<CreateVersionReq & { enabled: boolean }>({
  platform: 'android',
  channel: 'release',
  versionCode: 1,
  versionName: '',
  changeLogTitle: '',
  changeLog: '',
  updateUrl: '',
  enabled: true,
})

const renderMarkdown = (text: string): string => {
  return marked.parse(text, { async: false }) as string
}

const openChangelogModal = (item: AppVersion) => {
  changelogTarget.value = item
  changelogModalOpen.value = true
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

const onFilterChange = () => {
  currentPage.value = 1
  fetchVersions()
}

const fetchVersions = () => {
  versionStore.fetchList({
    page: currentPage.value,
    pageSize: pageSize.value,
    platform: filters.platform === 'all' ? undefined : filters.platform,
    channel: filters.channel === 'all' ? undefined : filters.channel,
  })
}

watch(currentPage, () => fetchVersions())

onMounted(() => fetchVersions())

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  Object.assign(form, {
    platform: 'android',
    channel: 'release',
    versionCode: 1,
    versionName: '',
    changeLogTitle: '',
    changeLog: '',
    updateUrl: '',
    enabled: true,
  })
  changelogTab.value = 'write'
  modalOpen.value = true
}

const openEditModal = (item: AppVersion) => {
  isEditing.value = true
  editingId.value = item.id
  Object.assign(form, {
    platform: item.platform,
    channel: item.channel,
    versionCode: item.versionCode,
    versionName: item.versionName,
    changeLogTitle: item.changeLogTitle || '',
    changeLog: item.changeLog || '',
    updateUrl: item.updateUrl || '',
    enabled: item.enabled,
  })
  changelogTab.value = 'write'
  modalOpen.value = true
}

const onSubmit = async () => {
  submitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      const data: UpdateVersionReq = { ...form }
      await versionStore.update(editingId.value, data)
      toast.add({ title: 'Version updated', color: 'success' })
    } else {
      await versionStore.create(form)
      toast.add({ title: 'Version created', color: 'success' })
    }
    modalOpen.value = false
    fetchVersions()
  } catch {
    // Error handled by useApi
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (item: AppVersion) => {
  deleteTarget.value = item
  deleteModalOpen.value = true
}

const onDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await versionStore.remove(deleteTarget.value.id)
    toast.add({ title: 'Version deleted', color: 'success' })
    deleteModalOpen.value = false
    fetchVersions()
  } catch {
    // Error handled by useApi
  } finally {
    deleting.value = false
  }
}
</script>
