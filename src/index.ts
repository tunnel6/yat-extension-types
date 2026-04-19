/**
 * YAT Extension Types
 * 
 * 共享类型定义，用于 YAT 宿主应用和扩展开发
 * @packageDocumentation
 */

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 通道协议
 */
export type ChannelProtocol = 'tcp' | 'udp' | 'http' | 'https'

/**
 * 通道底层传输实现（当前固定为 mTLS over TCP）
 */
export type TunnelChannelTransport = 'mtls-tcp'

/**
 * Tunnel 参与设备角色
 */
export type TunnelParticipantRole = 'publisher' | 'consumer' | 'controller'

/**
 * Tunnel 参与设备状态
 */
export type TunnelParticipantState = 'online' | 'offline' | 'idle' | string

/**
 * Tunnel 链路传输类型
 */
export type TunnelTransport = 'p2p' | 'relay' | 'wireguard'

/**
 * Tunnel 通道状态
 */
export type TunnelChannelState = 'active' | 'inactive' | 'stopped' | 'failed' | 'negotiating' | string

/**
 * Tunnel 端点定义
 */
export interface TunnelEndpoint {
  host?: string
  port?: number
  address?: string
}

/**
 * Tunnel 运行链路定义
 */
export interface TunnelRoute {
  id: string
  transport: TunnelTransport
  state?: TunnelChannelState
  local?: TunnelEndpoint
  remote?: TunnelEndpoint
  remoteUrl?: string
  metadata?: Record<string, any>
}

/**
 * Tunnel 通道绑定定义（业务意图）
 */
export interface TunnelChannelBinding {
  localHost?: string
  localPort: number
  remotePort?: number
}

/**
 * Tunnel 转发规则定义（协议与端口绑定）
 */
export interface TunnelForwardRule {
  key: string
  protocol: ChannelProtocol
  binding: TunnelChannelBinding
  channelId?: string
  metadata?: Record<string, any>
}

/**
 * Tunnel 通道定义
 */
export interface TunnelChannelDefinition {
  key: string
  transport?: TunnelChannelTransport
  rules: TunnelForwardRule[]
  /**
   * 兼容投影视图字段（一般取主规则）
   */
  protocol?: ChannelProtocol
  channelId?: string
  status?: TunnelChannelState
  /**
   * 兼容投影视图字段（一般取主规则绑定）
   */
  binding?: TunnelChannelBinding
  selectedRouteId?: string
  routes: TunnelRoute[]
  metadata?: Record<string, any>
}

/**
 * Tunnel 参与者定义
 */
export interface TunnelParticipant {
  deviceId: string
  role: TunnelParticipantRole
  state?: TunnelParticipantState
  capabilities?: string[]
  lastSeenAt?: string
  metadata?: Record<string, any>
}

/**
 * Tunnel 会话定义
 */
export interface TunnelSession {
  id: string
  state?: TunnelChannelState
  channelKeys?: string[]
  transport?: TunnelTransport
  publisherDeviceId?: string
  consumerDeviceId?: string
  controllerDeviceId?: string
  startedAt?: string
  updatedAt?: string
  metadata?: Record<string, any>
}

/**
 * Tunnel 传输策略
 */
export interface TunnelTransportPolicy {
  preferred?: TunnelTransport[]
  allowRelayFallback?: boolean
  requireDirect?: boolean
}

/**
 * Tunnel 意图定义
 */
export interface TunnelIntent {
  protocol?: ChannelProtocol | string
  config?: Record<string, any>
  transportPolicy?: TunnelTransportPolicy
  metadata?: Record<string, any>
}

/**
 * 隧道信息（意图 + 参与者 + 运行态）
 */
export interface Tunnel {
  id: string
  name: string
  status: TunnelChannelState
  appId?: string
  intent: TunnelIntent
  participants: TunnelParticipant[]
  channels: TunnelChannelDefinition[]
  sessions?: TunnelSession[]
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, any>
  [key: string]: any
}

// ============================================================================
// 扩展运行时通道 SDK 契约（Host API v1）
// ============================================================================

/**
 * 扩展运行时 API 统一返回结构
 */
export interface HostResult<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 通道启动规则（扩展侧输入）
 */
export interface ChannelForwardSpec {
  key: string
  protocol: ChannelProtocol
  localHost?: string
  localPort: number
  remotePort?: number
  subdomain?: string
  aliasDomain?: string
  bufferSize?: number
  transport?: TunnelTransport
  metadata?: Record<string, any>
}

/**
 * 通道启动规格（扩展侧输入）
 * key 表示逻辑 channel，rules 表示该 channel 下的多协议/多端口转发规则。
 */
export interface ChannelSpec {
  key: string
  rules: ChannelForwardSpec[]
  metadata?: Record<string, any>
}

/**
 * 启动多通道输入参数
 */
export interface StartChannelsInput {
  channels: ChannelSpec[]
  reconnect?: boolean
  mode?: 'all-or-nothing' | 'best-effort'
  actorDeviceId?: string
  actorRole?: TunnelParticipantRole
  sessionId?: string
}

/**
 * 停止通道输入参数
 */
export interface StopChannelsInput {
  keys?: string[]
  reason?: string
  actorDeviceId?: string
  sessionId?: string
}

/**
 * 通道运行时 SDK（扩展可调用）
 * 注意：这里不暴露 edge online/offline 等管理能力。
 */
export interface ExtensionChannelRuntimeApi {
  startChannels(input: StartChannelsInput): Promise<HostResult<Tunnel>>
  stopChannels(input?: StopChannelsInput): Promise<HostResult<Tunnel>>
  getTunnel(): Promise<HostResult<Tunnel>>
  isEdgeConnected(): Promise<HostResult<boolean>>
}

/**
 * 宿主注入给扩展的 API 入口
 */
export interface ExtensionHostApi {
  version: '1'
  channel: ExtensionChannelRuntimeApi
}

// ============================================================================
// 组件适配器（框架无关）
// ============================================================================

/**
 * 扩展组件适配器接口（框架无关）
 * 
 * 扩展可以通过实现此接口来提供任意框架的组件（React、Vue、Svelte 等）
 * 
 * @example
 * ```typescript
 * const MyReactAdapter: ExtensionComponentAdapter = {
 *   mount(container, props) {
 *     this.root = ReactDOM.createRoot(container)
 *     this.root.render(React.createElement(MyComponent, props))
 *   },
 *   update(props) {
 *     this.root?.render(React.createElement(MyComponent, props))
 *   },
 *   unmount() {
 *     this.root?.unmount()
 *   }
 * }
 * ```
 */
export interface ExtensionComponentAdapter {
  /** 挂载组件到容器 */
  mount(container: HTMLElement, props: Record<string, any>): void
  /** 更新组件 props */
  update(props: Record<string, any>): void
  /** 卸载组件 */
  unmount(): void
}

// ============================================================================
// App 定义相关
// ============================================================================

/**
 * App 钩子函数上下文
 */
export interface AppHookContext {
  /** 隧道信息 */
  tunnel: Tunnel
  /** 宿主提供的受限 API（可选，为兼容旧扩展） */
  host?: ExtensionHostApi
  /** 触发事件（可选，用于通知宿主） */
  emit?: (event: string, ...args: any[]) => void
  /** 宿主应用提供的 i18n 翻译函数 */
  t?: (key: string, fallback?: string) => string
  /** 当前语言环境 */
  locale?: string
  /** 当前主题模式 (true = dark, false = light) */
  isDark?: boolean
  /** 主题模式设置 */
  themeMode?: 'light' | 'dark' | 'system'
}

/**
 * App i18n 文案映射
 */
export type AppI18nMessages = Record<string, any>

/**
 * App i18n 资源包
 * 说明：宿主安装器要求必须包含 `zh-CN` 与 `en` 两套文案。
 */
export interface AppI18nBundle {
  'zh-CN': AppI18nMessages
  en: AppI18nMessages
}

/**
 * 操作执行结果
 */
export interface AppActionResult {
  /** 是否成功 */
  success: boolean
  /** 结果消息 */
  message?: string
  /** 额外数据 */
  data?: any
}

/**
 * 标签页定义
 */
export interface AppTab {
  /** 唯一标识 */
  key: string
  /** 显示标签 */
  label: string
  /** 图标类名 (如 'pi pi-chart-line') */
  icon: string
  /** Vue 组件（可选，Vue 扩展使用） */
  component?: any
  /** 组件适配器（可选，框架无关方式） */
  adapter?: ExtensionComponentAdapter
  /** 标签页显示条件 */
  visible?: (tunnel: Tunnel) => boolean
}

/**
 * 操作按钮定义
 */
export interface AppAction {
  /** 唯一标识 */
  key: string
  /** 显示标签 */
  label: string
  /** 图标类名 */
  icon: string
  /** 按钮样式变体 */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary'
  /** 按钮显示条件 */
  visible?: (tunnel: Tunnel) => boolean
  /** 按钮禁用条件 */
  disabled?: (tunnel: Tunnel) => boolean
}

/**
 * App 生命周期钩子
 */
export interface AppHooks {
  /** 启动隧道前的钩子 */
  onBeforeStart?: (context: AppHookContext) => void | Promise<void>
  /** 启动隧道的钩子 */
  onStart?: (context: AppHookContext) => AppActionResult | Promise<AppActionResult>
  /** 启动隧道后的钩子 */
  onAfterStart?: (context: AppHookContext, result: AppActionResult) => void | Promise<void>
  
  /** 停止隧道前的钩子 */
  onBeforeStop?: (context: AppHookContext) => void | Promise<void>
  /** 停止隧道的钩子 */
  onStop?: (context: AppHookContext) => AppActionResult | Promise<AppActionResult>
  /** 停止隧道后的钩子 */
  onAfterStop?: (context: AppHookContext, result: AppActionResult) => void | Promise<void>
  
  /** 重启隧道的钩子 */
  onRestart?: (context: AppHookContext) => AppActionResult | Promise<AppActionResult>
  
  /** 删除隧道前的钩子 */
  onBeforeDelete?: (context: AppHookContext) => boolean | Promise<boolean>
  
  /** 语言切换钩子 */
  onLocaleChange?: (locale: string, context: AppHookContext) => void | Promise<void>
  
  /** 主题切换钩子 */
  onThemeChange?: (isDark: boolean, themeMode: 'light' | 'dark' | 'system', context: AppHookContext) => void | Promise<void>
  
  /** 自定义操作钩子（可扩展） */
  [key: string]: ((...args: any[]) => any) | undefined
}

/**
 * App 定义
 */
export interface AppDefinition {
  /** App ID，对应 tunnel.appId */
  id: string
  /** App 名称 */
  name: string
  short: string
  /** App i18n 文案资源（必填：zh-CN / en） */
  i18n: AppI18nBundle
  /** 配置表单组件（用于创建隧道时填写配置） */
  ConfigForm?: any
  /** 基本信息个性化组件（作为补充显示在标准信息之后） */
  DetailInfo?: any
  /** 标签页定义列表 */
  detailTabs?: AppTab[]
  /** 操作按钮定义列表 */
  actions: AppAction[]
  /** App 生命周期钩子 */
  hooks?: AppHooks
}

// ============================================================================
// 扩展包相关
// ============================================================================

/**
 * 扩展元数据
 */
export interface ExtensionMetadata {
  /** 扩展 ID */
  id: string
  /** 扩展名称 */
  name: string
  /** 简称 */
  short: string
  /** 扩展版本 */
  version: string
  /** 扩展描述 */
  description: string
  /** 作者 */
  author: string
  /** 主页 URL */
  homepage?: string
  /** 图标 URL */
  icon?: string
  /** 最小支持的宿主版本 */
  minHostVersion?: string
  /** 依赖的其他扩展 */
  dependencies?: Record<string, string>
  /** 扩展使用的 Host API 版本，默认可视为 v1 */
  hostApiVersion?: '1'
}

/**
 * 扩展包结构
 * 
 * @example
 * ```typescript
 * export const extension: AppExtensionPackage = {
 *   metadata: {
 *     id: 'my-extension',
 *     name: 'My Extension',
 *     version: '1.0.0',
 *     description: 'A sample extension',
 *     author: 'Developer'
 *   },
 *   appDefinition: {
 *     id: 'my-app',
 *     name: 'My App',
 *     tabs: [...],
 *     actions: [...]
 *   }
 * }
 * ```
 */
export interface AppExtensionPackage {
  /** 扩展元数据 */
  metadata: ExtensionMetadata
  /** App 定义 */
  appDefinition: AppDefinition
  /** 可选：安装脚本 */
  onInstall?: () => void | Promise<void>
  /** 可选：卸载脚本 */
  onUninstall?: () => void | Promise<void>
  /** 可选：激活脚本 */
  onActivate?: () => void | Promise<void>
  /** 可选：停用脚本 */
  onDeactivate?: () => void | Promise<void>
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 扩展安装来源类型
 */
export type ExtensionSource = 'local' | 'remote' | 'marketplace'

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'system'
