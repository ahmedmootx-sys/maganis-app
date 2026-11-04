import { registerPlugin } from '@capacitor/core'

export interface NativeAppInfo {
  applicationId: string
  versionName: string
  versionCode: number
  buildType: 'debug' | 'release'
  sdkInt: number
  deviceModel: string
  debuggable: boolean
  signingSha256: string
}

export interface NativeRecoveryEvent {
  key: string
  recoveredFrom: string
  reason: string
  timestamp: number
}

export interface NativeKvReadAllResult {
  data: Record<string, string>
  recoveryEvents: NativeRecoveryEvent[]
}

export interface NativeKvStatsResult {
  keyCount: number
  totalBytes: number
  freeSpaceBytes: number
}

export interface NativeMediaItem {
  mime: string
  dataUrl: string
}

export interface NativeMediaUsageResult {
  count: number
  totalBytes: number
  freeSpaceBytes: number
}

export interface BackupFileItem {
  name: string
  size: number
  modified: number
  isOwn: boolean
  uri?: string
  target?: 'internal' | 'downloads' | 'folder'
}

export interface FolderStatusResult {
  permissionHeld: boolean
  exists: boolean
  writable: boolean
  displayName: string
}

export interface MaganisNativePlugin {
  getInfo(): Promise<NativeAppInfo>
  kvReadAll(): Promise<NativeKvReadAllResult>
  kvWrite(options: {
    key: string
    value: string
  }): Promise<{ success: boolean; key: string }>
  kvWriteChunk(options: {
    key: string
    chunkIndex: number
    totalChunks: number
    chunkData: string
  }): Promise<{
    success: boolean
    key: string
    chunksAssembled?: number
    chunkReceived?: number
    remaining?: number
  }>
  kvRemove(options: { key: string }): Promise<{ success: boolean }>
  kvClear(): Promise<{ success: boolean }>
  kvStats(): Promise<NativeKvStatsResult>
  mediaGet(options: {
    id: string
  }): Promise<{ mime?: string; dataUrl?: string }>
  mediaSet(options: {
    id: string
    mime: string
    dataUrl: string
  }): Promise<{ success: boolean; id: string }>
  mediaRemove(options: { id: string }): Promise<{ success: boolean }>
  mediaGetAll(): Promise<{ items: Record<string, NativeMediaItem> }>
  mediaUsage(): Promise<NativeMediaUsageResult>

  // Task N3: Streaming & Backup Methods
  openWrite(options: {
    target: 'internal' | 'downloads' | 'folder' | 'saveAs'
    name: string
    mime?: string
    folderUri?: string
  }): Promise<{ handle: string; uri?: string }>
  append(options: {
    handle: string
    chunkBase64: string
  }): Promise<{ success: boolean; bytesWritten: number }>
  close(options: {
    handle: string
  }): Promise<{ success: boolean; bytes: number; sha256: string; uri?: string }>
  abort(options: { handle: string }): Promise<{ success: boolean }>

  openRead(options: {
    target?: 'internal' | 'downloads' | 'folder'
    name?: string
    uri?: string
  }): Promise<{ handle: string; size: number }>
  readChunk(options: {
    handle: string
    length?: number
  }): Promise<{ chunkBase64: string; bytesRead: number; eof: boolean }>
  closeRead(options: { handle: string }): Promise<{ success: boolean }>

  verify(options: {
    target?: 'internal' | 'downloads' | 'folder'
    name?: string
    uri?: string
  }): Promise<{ success: boolean; bytes: number; sha256: string }>
  list(options: {
    target: 'internal' | 'downloads' | 'folder'
    folderUri?: string
  }): Promise<{ files: BackupFileItem[] }>
  delete(options: {
    target: 'internal' | 'downloads' | 'folder'
    name?: string
    uri?: string
  }): Promise<{ success: boolean }>
  shareFile(options: {
    name: string
    target?: 'internal' | 'downloads'
    uri?: string
  }): Promise<{ success: boolean }>

  pickFolder(): Promise<{ uri: string; displayName: string }>
  folderStatus(options: { uri: string }): Promise<FolderStatusResult>
  releaseFolder(options: { uri: string }): Promise<{ success: boolean }>
  saveAs(options: {
    name: string
    mime?: string
    sourceName?: string
  }): Promise<{ success: boolean; bytes?: number; uri?: string }>

  // Task N4: Notifications & Device Integration Methods
  openSettings(options?: {
    kind: 'appNotifications' | 'channel' | 'exactAlarm' | 'batteryOptimization'
    channelId?: string
  }): Promise<{ success: boolean }>
  getPowerStatus(): Promise<{ ignoringBatteryOptimizations: boolean }>
  getChannelStatus(options: {
    channelId: string
  }): Promise<{ exists: boolean; enabled: boolean; importance: number }>
  keepScreenOn(options: {
    enabled: boolean
  }): Promise<{ success: boolean; enabled: boolean }>

  // Task N5: Logging, Diagnostics & Safe Mode
  appendLog(options: { line: string }): Promise<void>
  getLogs(options?: {
    limit?: number
  }): Promise<{ lines: string[]; totalLines: number }>
  clearLogs(): Promise<{ success: boolean }>
  getNativeCrashLogs(): Promise<{
    crashes: Array<{ filename: string; timestamp: number; content: string }>
  }>
  getExitReasons(): Promise<{
    reasons: Array<{
      reasonCode: number
      reasonAr: string
      timestamp: number
      importance: number
      pssKb: number
      rssKb: number
      description: string
    }>
    supported: boolean
  }>
  isSafeMode(): Promise<{ safeMode: boolean; launchCount: number }>
  resetCrashLoop(): Promise<{ success: boolean }>
  clearWebViewCache(): Promise<{ success: boolean }>
  exportRawSnapshot(): Promise<{
    success: boolean
    filePath: string
    fileName: string
    fileSizeBytes: number
  }>
}

// In-memory web mock store for tests running without Capacitor
const webMockKv: Record<string, string> = {}
const webMockMedia: Record<string, NativeMediaItem> = {}
const webMockRecoveryEvents: NativeRecoveryEvent[] = []

interface MockFileRecord {
  name: string
  content: string
  modified: number
  isOwn: boolean
}

const mockFiles: {
  internal: Record<string, MockFileRecord>
  downloads: Record<string, MockFileRecord>
  folder: Record<string, MockFileRecord>
} = {
  internal: {},
  downloads: {},
  folder: {},
}

interface MockWriteStream {
  target: 'internal' | 'downloads' | 'folder' | 'saveAs'
  name: string
  chunks: Uint8Array[]
}

interface MockReadStream {
  bytes: Uint8Array
  offset: number
}

const mockWriteHandles: Record<string, MockWriteStream> = {}
const mockReadHandles: Record<string, MockReadStream> = {}

export function clearMockFilesForTesting() {
  mockFiles.internal = {}
  mockFiles.downloads = {}
  mockFiles.folder = {}
  for (const k of Object.keys(mockWriteHandles)) delete mockWriteHandles[k]
  for (const k of Object.keys(mockReadHandles)) delete mockReadHandles[k]
}

async function computeSha256(str: string): Promise<string> {
  if (
    typeof crypto !== 'undefined' &&
    crypto.subtle &&
    typeof TextEncoder !== 'undefined'
  ) {
    const enc = new TextEncoder().encode(str)
    const buf = await crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Deterministic fallback hash for pure Node without crypto.subtle
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return 'checksum_' + Math.abs(h).toString(16).padStart(16, '0')
}

export const webMockImplementation: MaganisNativePlugin = {
  async getInfo(): Promise<NativeAppInfo> {
    return {
      applicationId: 'app.maganis.coach.web',
      versionName: 'web',
      versionCode: 1,
      buildType: import.meta.env.DEV ? 'debug' : 'release',
      sdkInt: 0,
      deviceModel:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
      debuggable: import.meta.env.DEV,
      signingSha256: 'web-unsigned',
    }
  },
  async kvReadAll(): Promise<NativeKvReadAllResult> {
    const events = [...webMockRecoveryEvents]
    webMockRecoveryEvents.length = 0
    return {
      data: { ...webMockKv },
      recoveryEvents: events,
    }
  },
  async kvWrite(options: {
    key: string
    value: string
  }): Promise<{ success: boolean; key: string }> {
    webMockKv[options.key] = options.value
    return { success: true, key: options.key }
  },
  async kvWriteChunk(options: {
    key: string
    chunkIndex: number
    totalChunks: number
    chunkData: string
  }): Promise<{ success: boolean; key: string; chunksAssembled?: number }> {
    if (!webMockKv[options.key + '__chunks']) {
      webMockKv[options.key + '__chunks'] = ''
    }
    webMockKv[options.key + '__chunks'] += options.chunkData
    if (options.chunkIndex === options.totalChunks - 1) {
      webMockKv[options.key] = webMockKv[options.key + '__chunks']
      delete webMockKv[options.key + '__chunks']
      return {
        success: true,
        key: options.key,
        chunksAssembled: options.totalChunks,
      }
    }
    return { success: true, key: options.key }
  },
  async kvRemove(options: { key: string }): Promise<{ success: boolean }> {
    delete webMockKv[options.key]
    return { success: true }
  },
  async kvClear(): Promise<{ success: boolean }> {
    for (const k of Object.keys(webMockKv)) delete webMockKv[k]
    return { success: true }
  },
  async kvStats(): Promise<NativeKvStatsResult> {
    const keys = Object.keys(webMockKv)
    let total = 0
    for (const k of keys) total += webMockKv[k]?.length ?? 0
    return {
      keyCount: keys.length,
      totalBytes: total,
      freeSpaceBytes: 1024 * 1024 * 500, // 500 MB mock
    }
  },
  async mediaGet(options: {
    id: string
  }): Promise<{ mime?: string; dataUrl?: string }> {
    const item = webMockMedia[options.id]
    if (!item) return {}
    return { mime: item.mime, dataUrl: item.dataUrl }
  },
  async mediaSet(options: {
    id: string
    mime: string
    dataUrl: string
  }): Promise<{ success: boolean; id: string }> {
    webMockMedia[options.id] = {
      mime: options.mime,
      dataUrl: options.dataUrl,
    }
    return { success: true, id: options.id }
  },
  async mediaRemove(options: { id: string }): Promise<{ success: boolean }> {
    delete webMockMedia[options.id]
    return { success: true }
  },
  async mediaGetAll(): Promise<{ items: Record<string, NativeMediaItem> }> {
    return { items: { ...webMockMedia } }
  },
  async mediaUsage(): Promise<NativeMediaUsageResult> {
    const keys = Object.keys(webMockMedia)
    let total = 0
    for (const k of keys) total += webMockMedia[k]?.dataUrl?.length ?? 0
    return {
      count: keys.length,
      totalBytes: total,
      freeSpaceBytes: 1024 * 1024 * 500,
    }
  },

  // Streaming & Backup Mock
  async openWrite(options) {
    const handle = 'mock-write-' + Math.random().toString(36).slice(2)
    mockWriteHandles[handle] = {
      target: options.target,
      name: options.name,
      chunks: [],
    }
    return { handle, uri: `mock://uri/${options.target}/${options.name}` }
  },
  async append(options) {
    const stream = mockWriteHandles[options.handle]
    if (!stream) throw new Error('Invalid mock write handle')
    let binary = ''
    try {
      binary = atob(options.chunkBase64)
    } catch {
      binary = options.chunkBase64
    }
    const u8 = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      u8[i] = binary.charCodeAt(i)
    }
    stream.chunks.push(u8)
    return { success: true, bytesWritten: u8.length }
  },
  async close(options) {
    const stream = mockWriteHandles[options.handle]
    if (!stream) throw new Error('Invalid mock write handle')
    delete mockWriteHandles[options.handle]

    const totalBytes = stream.chunks.reduce((sum, c) => sum + c.length, 0)
    const fullBytes = new Uint8Array(totalBytes)
    let pos = 0
    for (const c of stream.chunks) {
      fullBytes.set(c, pos)
      pos += c.length
    }
    const fullContent = new TextDecoder().decode(fullBytes)
    const hash = await computeSha256(fullContent)

    const bucket =
      stream.target === 'downloads'
        ? mockFiles.downloads
        : stream.target === 'folder'
          ? mockFiles.folder
          : mockFiles.internal

    bucket[stream.name] = {
      name: stream.name,
      content: fullContent,
      modified: Date.now(),
      isOwn: fullContent.includes('maganis-snapshot'),
    }

    return { success: true, bytes: totalBytes, sha256: hash }
  },
  async abort(options) {
    delete mockWriteHandles[options.handle]
    return { success: true }
  },
  async openRead(options) {
    const bucket =
      options.target === 'downloads'
        ? mockFiles.downloads
        : options.target === 'folder'
          ? mockFiles.folder
          : mockFiles.internal
    const rec = options.name ? bucket[options.name] : undefined
    if (!rec) throw new Error('File not found in mock store: ' + options.name)
    const handle = 'mock-read-' + Math.random().toString(36).slice(2)
    const bytes = new TextEncoder().encode(rec.content)
    mockReadHandles[handle] = { bytes, offset: 0 }
    return {
      handle,
      size: bytes.length,
    }
  },
  async readChunk(options) {
    const stream = mockReadHandles[options.handle]
    if (!stream) throw new Error('Invalid mock read handle')
    const len = options.length || 262144
    const slice = stream.bytes.subarray(stream.offset, stream.offset + len)
    stream.offset += slice.length
    const eof = stream.offset >= stream.bytes.length
    let binary = ''
    for (let i = 0; i < slice.length; i++) {
      binary += String.fromCharCode(slice[i])
    }
    const b64 = btoa(binary)
    return { chunkBase64: b64, bytesRead: slice.length, eof }
  },
  async closeRead(options) {
    delete mockReadHandles[options.handle]
    return { success: true }
  },
  async verify(options) {
    const bucket =
      options.target === 'downloads'
        ? mockFiles.downloads
        : options.target === 'folder'
          ? mockFiles.folder
          : mockFiles.internal
    const rec = options.name ? bucket[options.name] : undefined
    if (!rec)
      throw new Error(
        'File not found in mock store for verify: ' + options.name,
      )
    const bytes = new TextEncoder().encode(rec.content).length
    const hash = await computeSha256(rec.content)
    return { success: true, bytes, sha256: hash }
  },
  async list(options) {
    const bucket =
      options.target === 'downloads'
        ? mockFiles.downloads
        : options.target === 'folder'
          ? mockFiles.folder
          : mockFiles.internal
    const files: BackupFileItem[] = Object.values(bucket).map((f) => ({
      name: f.name,
      size: new TextEncoder().encode(f.content).length,
      modified: f.modified,
      isOwn: f.isOwn,
      uri: `mock://uri/${options.target}/${f.name}`,
      target: options.target,
    }))
    return { files }
  },
  async delete(options) {
    const bucket =
      options.target === 'downloads'
        ? mockFiles.downloads
        : options.target === 'folder'
          ? mockFiles.folder
          : mockFiles.internal
    if (options.name && bucket[options.name]) {
      delete bucket[options.name]
      return { success: true }
    }
    return { success: false }
  },
  async shareFile() {
    return { success: true }
  },
  async pickFolder() {
    return {
      uri: 'mock://tree/content/storage/MaganisBackup',
      displayName: 'MaganisBackup (Mock)',
    }
  },
  async folderStatus() {
    return {
      permissionHeld: true,
      exists: true,
      writable: true,
      displayName: 'MaganisBackup (Mock)',
    }
  },
  async releaseFolder() {
    return { success: true }
  },
  async saveAs() {
    return { success: true, bytes: 1024, uri: 'mock://saved/doc.json' }
  },

  // Task N4 Mocks
  async openSettings() {
    return { success: true }
  },
  async getPowerStatus() {
    return { ignoringBatteryOptimizations: mockPowerIgnoring }
  },
  async getChannelStatus(options: { channelId: string }) {
    if (mockChannelStatuses[options.channelId]) {
      return mockChannelStatuses[options.channelId]
    }
    return { exists: true, enabled: true, importance: 3 }
  },
  async keepScreenOn(options: { enabled: boolean }) {
    mockScreenKeepOn = options.enabled
    return { success: true, enabled: options.enabled }
  },

  // Task N5 Mocks
  async appendLog(options: { line: string }) {
    mockLogBuffer.push(options.line)
    if (mockLogBuffer.length > 500) {
      mockLogBuffer.shift()
    }
  },
  async getLogs(options?: { limit?: number }) {
    const limit = options?.limit ?? 200
    const start = Math.max(0, mockLogBuffer.length - limit)
    return {
      lines: mockLogBuffer.slice(start),
      totalLines: mockLogBuffer.length,
    }
  },
  async clearLogs() {
    mockLogBuffer = []
    mockNativeCrashes = []
    return { success: true }
  },
  async getNativeCrashLogs() {
    return { crashes: [...mockNativeCrashes] }
  },
  async getExitReasons() {
    return {
      reasons: [...mockExitReasons],
      supported: true,
    }
  },
  async isSafeMode() {
    return {
      safeMode: mockSafeModeState,
      launchCount: mockLaunchCount,
    }
  },
  async resetCrashLoop() {
    mockSafeModeState = false
    mockLaunchCount = 0
    return { success: true }
  },
  async clearWebViewCache() {
    return { success: true }
  },
  async exportRawSnapshot() {
    return {
      success: true,
      filePath: '/mock/snapshots/maganis-raw-export.json',
      fileName: 'maganis-raw-export.json',
      fileSizeBytes: 4096,
    }
  },
}

let mockLogBuffer: string[] = []
let mockNativeCrashes: Array<{
  filename: string
  timestamp: number
  content: string
}> = []
let mockExitReasons: Array<{
  reasonCode: number
  reasonAr: string
  timestamp: number
  importance: number
  pssKb: number
  rssKb: number
  description: string
}> = []
let mockSafeModeState = false
let mockLaunchCount = 0

export function setMockSafeModeForTesting(
  safeMode: boolean,
  launchCount = 3,
): void {
  mockSafeModeState = safeMode
  mockLaunchCount = launchCount
}

export function setMockCrashLogsForTesting(
  crashes: Array<{ filename: string; timestamp: number; content: string }>,
): void {
  mockNativeCrashes = crashes
}

export function setMockExitReasonsForTesting(
  reasons: Array<{
    reasonCode: number
    reasonAr: string
    timestamp: number
    importance: number
    pssKb: number
    rssKb: number
    description: string
  }>,
): void {
  mockExitReasons = reasons
}

let mockPowerIgnoring = false
let mockScreenKeepOn = false
const mockChannelStatuses: Record<
  string,
  { exists: boolean; enabled: boolean; importance: number }
> = {}

export function setMockPowerStatusForTesting(ignoring: boolean): void {
  mockPowerIgnoring = ignoring
}

export function setMockChannelStatusForTesting(
  channelId: string,
  status: { exists: boolean; enabled: boolean; importance: number },
): void {
  mockChannelStatuses[channelId] = status
}

export function getMockScreenKeepOnForTesting(): boolean {
  return mockScreenKeepOn
}

export const MaganisNative = registerPlugin<MaganisNativePlugin>(
  'MaganisNative',
  {
    web: () => webMockImplementation,
  },
)

Object.assign(MaganisNative, webMockImplementation)
