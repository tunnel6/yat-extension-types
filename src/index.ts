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
 * Tunnel 通道类型（与 api/schema/tunnel.fbs 对齐）
 */
export const TunnelChannel = {
  KNOWN: 0,
  HTTP: 1,
  HTTPS: 2,
  TCP: 3,
  UDP: 4,
  WIREGUARD: 5,
} as const

export type TunnelChannel = (typeof TunnelChannel)[keyof typeof TunnelChannel]

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
 * Tunnel 共享状态,是否共享至其他设备，需要与宿主约定共享语义（例如是否允许其他设备加入、是否允许查看/控制等）
 * - `shared`: 允许共享，其他设备可加入并查看/控制（具体权限由宿主定义）需要TunnelParticipantRolele和TunnelParticipantState来描述参与设备的角色和状态
 * - `exclusive`: 不允许共享，仅限当前设备使用
 * - `unknown`: 未知状态，由宿主自行决定是否允许共享
 */
export type TunnelSharedState = 'shared' | 'exclusive' | 'unknown'
/**
 * Tunnel 链路传输类型
 */
export type TunnelTransport = 'p2p' | 'relay' | 'wireguard'

export type RemoteAddressScheme =
  | 'http'
  | 'https'
  | 'tcp'
  | 'udp'
  | 'wireguard'
  | 'vnc'
  | 'rdp'
  | 'ssh'
  | string

/**
 * 远程地址展示格式
 * - `url`: 标准 URL（例如 https://domain:port / vnc://host:port）
 * - `host-port`: 纯端点格式（例如 host:port）
 */
export type RemoteAddressFormat = 'url' | 'host-port'

export type TunnelRemoteAddressSource =
  | 'alias-domain'
  | 'sub-custom-domain'
  | 'sub-assigned-domain'
  | 'legacy-remote'

export type TunnelCustomDomainCnameState = 'none' | 'valid' | 'invalid' | 'unknown'

export interface TunnelRemoteAddressLine {
  key: string
  source: TunnelRemoteAddressSource
  scheme: RemoteAddressScheme
  domain: string
  url: string
}

export interface TunnelRemoteAddressHint {
  level: 'info' | 'warning'
  message: string
}

export interface TunnelRemoteAddressResolution {
  lines: TunnelRemoteAddressLine[]
  bestUrl: string
  cnameState?: TunnelCustomDomainCnameState
  hints?: TunnelRemoteAddressHint[]
  domains?: {
    aliasDomain?: string
    subdomain?: string
    subCustomDomain?: string
    subAssignedDomain?: string
  }
}

export interface AppRemoteAddressResolveContext {
  tunnel: Tunnel
  edge?: Record<string, any> | null
}

export type AppRemoteAddressResolver = (
  context: AppRemoteAddressResolveContext
) => TunnelRemoteAddressResolution

/**
 * App 远程地址声明（由 app 自身定义）
 */
export interface AppRemoteAddressProfile {
  /**
   * 推荐展示的远程地址 scheme，例如 vnc/ssh/tcp
   */
  scheme?: RemoteAddressScheme
  /**
   * 推荐展示的远程地址格式
   * 未指定时默认 `url`
   */
  format?: RemoteAddressFormat
  /**
   * 生成推荐地址时优先匹配的规则 key（例如 ARD 的 ard-vnc-tcp-5900）
   */
  preferredRuleKey?: string
  /**
   * 生成推荐地址时优先匹配的本地端口（例如 VNC 5900）
   */
  preferredLocalPort?: number
  /**
   * 由 App/Extension 自身定义远程地址解析逻辑。
   * Host 仅负责调用与结果校验，不再做统一地址决策。
   */
  resolve?: AppRemoteAddressResolver
}

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
 * DNS 引导信息（用于自定义域名配置提示）
 */
export interface ChannelDNSGuide {
  required: boolean
  recordType: string
  recordName: string
  recordValue: string
  hint: string
  dns01RecordType?: string
  dns01RecordName?: string
  dns01RecordValue?: string
  dns01Hint?: string
  tlsCertStatus?: string
  tlsCertMessage?: string
}

/**
 * 域名状态信息（DNS + 证书）
 */
export interface DomainStatusValue {
  dnsStatus: number
  certStatus: number
  error?: string
  certLastError?: string
  updatedAt?: number
}

/**
 * DNS-01 挑战信息
 */
export interface DNS01Challenge {
  recordName: string
  recordValue: string
  domain: string
  createdAt: number
  updatedAt?: number
  lastError?: string
}

/**
 * Tunnel 域名运行态聚合状态
 */
export interface RuntimeDomainStatusValue {
  edgeId: string
  channelId?: string
  aliasDomainStatus?: DomainStatusValue
  channelDomainStatus?: DomainStatusValue
  customDomainStatus?: DomainStatusValue
  cnameStatus?: number
  dns01ChallengeCount: number
  dns01Challenges: DNS01Challenge[]
  updatedAt: number
}

/**
 * Tunnel 路由元数据（Host/Runtime 扩展字段）
 */
export interface TunnelRouteMetadata extends Record<string, any> {
  assignedDomain?: string
  subdomain?: string
  aliasDomain?: string
  dnsGuide?: ChannelDNSGuide
  ruleKey?: string
  channelKey?: string
  protocol?: ChannelProtocol | string
  channelId?: string
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
  metadata?: TunnelRouteMetadata
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
export interface ChannelForwardMetadata {
  /**
   * 是否在 TCP 连接 accept 后立即触发远端拨号。
   * 用于 VNC/RFB 这类 server-first 协议，避免客户端尚未发包时握手被阻塞。
   */
  eagerConnectRemote?: boolean
  [key: string]: any
}

/**
 * Tunnel 转发规则定义（协议与端口绑定）
 */
export interface TunnelForwardRule {
  key: string
  protocol: ChannelProtocol
  binding: TunnelChannelBinding
  channelId?: string
  metadata?: ChannelForwardMetadata
}

/**
 * Tunnel 通道定义
 */
export interface TunnelChannelDefinition {
  key: string
  transport?: TunnelChannelTransport
  rules: TunnelForwardRule[]
  /**
   * 首选规则的key（用于生成主要的远程访问地址）
   */
  preferredRuleKey?: string
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

export type LocalBridgeProtocol = 'tcp' | 'udp'

export interface TunnelLocalBridgeMapping {
  /**
   * 映射项唯一标识（建议与 rule key 对齐）
   */
  key: string
  /**
   * 本地监听协议
   */
  protocol: LocalBridgeProtocol
  /**
   * 本地监听端口
   */
  localPort: number
  /**
   * 可选：从运行时 rule key 解析 remotePort
   */
  remoteRuleKey?: string
  /**
   * 可选：显式指定 remotePort（高于 remoteRuleKey）
   */
  remotePort?: number
}

export interface TunnelLocalBridgeConfig {
  /**
   * 是否启用本地桥接（仅声明，不代表宿主已实现）
   */
  enabled?: boolean
  /**
   * 本地监听地址（通常为 127.0.0.1）
   */
  localHost?: string
  /**
   * 映射规则集合
   */
  mappings?: TunnelLocalBridgeMapping[]
  /**
   * 预留扩展字段
   */
  metadata?: Record<string, any>
}

/**
 * Tunnel 意图定义
 */
export interface TunnelIntent {
  protocol?: ChannelProtocol | string
  config?: Record<string, any>
  transportPolicy?: TunnelTransportPolicy
  /**
   * 本地桥接声明（可选）
   */
  localBridge?: TunnelLocalBridgeConfig
  
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
  shared: TunnelSharedState
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
  metadata?: ChannelForwardMetadata
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
  /** 当前关联 Edge 信息（可选，供地址/状态推导） */
  edge?: Record<string, any> | null
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
  /** 可选：组件 props（宿主透传） */
  props?: Record<string, any>
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

  /** 重连隧道的钩子（Edge 重连后自动调用） */
  onReconnect?: (context: AppHookContext) => AppActionResult | Promise<AppActionResult>
  
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
 * 创建 Tunnel 时的配置初始化上下文
 */
export interface AppTunnelConfigInitContext {
  appId?: string
  config?: Record<string, any>
  edge?: Record<string, any> | null
  currentDeviceId?: string
}

export type AppTunnelConfigInitializer = (
  context: AppTunnelConfigInitContext
) => Record<string, any>

export interface AppTunnelDefaults {
  /**
   * Tunnel 共享默认状态（创建时生效）。
   */
  shared?: TunnelSharedState | boolean
  /**
   * Tunnel config 默认值（会与客户端配置合并）。
   */
  config?: Record<string, any>
  /**
   * Tunnel intent 默认值（预留扩展，宿主按需消费）。
   */
  intent?: Record<string, any>
}

/**
 * App 定义
 */
export interface AppDefinition {
  /** App ID，对应 tunnel.appId */
  id: string
  /** App 名称 */
  name?: string
  short?: string
  /** App i18n 文案资源（必填：zh-CN / en） */
  i18n: AppI18nBundle
  /** 配置表单组件（用于创建隧道时填写配置） */
  ConfigForm?: any
  /** 基本信息个性化组件（作为补充显示在标准信息之后） */
  DetailInfo?: any
  /** 隧道卡片头部扩展组件（可选，接收 props: { tunnel }） */
  TunnelCardHeaderExtra?: any
  /** 标签页定义列表 */
  detailTabs?: AppTab[]
  /**
   * App 声明式远程地址策略（宿主按该声明生成 Recommended 地址）
   */
  remoteAddress?: AppRemoteAddressProfile
  /**
   * App 声明式本地桥接策略（宿主可按需实现）
   */
  localBridge?: TunnelLocalBridgeConfig
  /** 操作按钮定义列表 */
  actions: AppAction[]
  /** App 生命周期钩子 */
  hooks?: AppHooks
  /**
   * 创建 Tunnel 时的默认值声明。
   */
  tunnelDefaults?: AppTunnelDefaults
  /**
   * 创建 Tunnel 前的配置初始化器。
   * 宿主会将初始化结果与客户端配置合并后，再传给 createTunnel。
   */
  initTunnelConfig?: AppTunnelConfigInitializer
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
