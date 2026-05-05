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
 * Channel 数据面链路类型
 * 描述 channel 实际数据通信所使用的网络路径类型。
 * - `relay`：通过 edge 节点中转（当前默认实现）
 * - `p2p`：设备间 UDP 打洞直连（未来）
 * - `wireguard`：WireGuard 组网后直连（未来）
 *
 * 注意：控制面（tunnel 生命周期管理、edge 指令下发）始终走 mTLS 信道，
 * 与此类型无关，不在业务模型中暴露。
 */
export type ChannelLinkType = 'relay' | 'p2p' | 'wireguard'

/**
 * Tunnel 级 P2P 启用模式（统一命名）
 * - `off`：仅 relay，不尝试 p2p
 * - `preferred`：优先 p2p，失败可回退 relay
 * - `required`：必须 p2p，失败不允许回退 relay
 */
export type TunnelP2PMode = 'off' | 'preferred' | 'required'

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
  /** 关联的 channel key（可选，用于定位地址来自哪个 channel） */
  channelKey?: string
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
  tunnel: Tunnel & Record<string, any>
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
 * 统一域名运行态记录类型
 * 0=UNKNOWN, 1=CNAME, 2=TXT
 */
export type DomainRuntimeRecordType = 0 | 1 | 2

/**
 * 统一域名运行态记录（可直接用于 UI 配置引导）
 */
export interface DomainRuntimeRecordValue {
  recordType: DomainRuntimeRecordType
  recordName: string
  recordValue: string
  ttl: number
  source: string
}

/**
 * 统一域名运行态（权威状态）
 */
export interface DomainRuntimeValue {
  ownerView: boolean
  state: number
  requiredRecords: DomainRuntimeRecordValue[]
  pendingReasonCode: string
  lastError: string
  cnameStatus: number
  certStatus: number
  updatedAt: number
}

/**
 * Tunnel 域名运行态聚合状态
 */
export interface RuntimeDomainStatusValue {
  /**
   * @deprecated 内部关联字段，扩展侧不应依赖该值做业务判断。
   */
  edgeId?: string
  /**
   * @deprecated 内部关联字段，扩展侧不应依赖该值做业务判断。
   */
  channelId?: string
  aliasDomainStatus?: DomainStatusValue
  assignedDomainStatus?: DomainStatusValue
  edgeCustomDomainStatus?: DomainStatusValue
  domainRuntime?: DomainRuntimeValue
  cnameStatus?: number
  dns01ChallengeCount: number
  dns01Challenges: DNS01Challenge[]
  updatedAt: number
}

/**
 * Channel 元数据（Host/Runtime 扩展字段）
 */
export interface TunnelChannelMetadata extends Record<string, any> {
  assignedDomain?: string
  subdomain?: string
  aliasDomain?: string
  dnsGuide?: ChannelDNSGuide
  channelId?: string
}

/**
 * Channel 元数据（用于 ChannelStartSpec）
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
 * Channel 数据面链路状态
 * 描述 channel 当前实际使用的数据面路径及协商状态。
 *
 * - relay 场景：remoteEndpoint 为 edge 分配的公网中转地址，由系统回写
 * - p2p 场景：endpoint 为打洞成功后的直连地址，candidates 为协商中的候选列表
 * - wireguard 场景：endpoint 为 WireGuard 对端地址
 */
export interface ChannelDataPath {
  /** 数据面链路类型 */
  type: ChannelLinkType
  /** 链路协商/连接状态 */
  state: 'negotiating' | 'connected' | 'failed'
  /**
   * relay 专用：edge 分配给此 channel 的远端中转地址（host:port 或 domain）
   * p2p / wireguard 不使用此字段，远端地址由 endpoint 统一表示
   */
  remoteEndpoint?: string
  /**
   * p2p / wireguard 专用：协商成功后的直连端点地址
   */
  endpoint?: string
  /**
   * p2p 专用：ICE/STUN 候选地址列表（协商阶段使用）
   */
  candidates?: string[]
}

/**
 * Tunnel Channel（真实端口链路）
 *
 * Channel 是业务可见的最小连接单元，描述“本地端口 ↔ 远端服务”的绑定关系。
 * - 意图字段（protocol / local）在 tunnel 创建时确定，不随运行态变化
 * - 运行态字段（state / remote / remoteUrl / dataPath）由系统在 channel 建立后回写
 * - remote 仅在 relay 模式下有意义（edge 分配的公网地址）；p2p 模式下远端地址在 dataPath.endpoint
 */
export interface TunnelChannel {
  /**
   * Channel 唯一标识（在同一 Tunnel 内唯一）
   * 例如：'vnc-tcp-5900' / 'http-80' / 'ssh-tcp-22'
   */
  key: string
  /** 通信协议 */
  protocol: ChannelProtocol
  /** 本地监听端点（意图，不变） */
  local: TunnelEndpoint
  /**
   * 远端访问端点（运行态，relay 模式由系统回写）
   * p2p 模式下此字段为空，实际端点在 dataPath.endpoint
   */
  remote?: TunnelEndpoint
  /** 远端访问 URL（运行态，供 UI 展示用） */
  remoteUrl?: string
  /** Channel 连接状态（运行态） */
  state?: TunnelChannelState
  /**
   * 数据面链路状态（运行态，可选）
   * 仅在需要感知链路类型或协商状态时使用
   */
  dataPath?: ChannelDataPath
  /** edge 侧分配的物理 channel ID */
  channelId?: string
  /** 扩展元数据 */
  metadata?: TunnelChannelMetadata
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
 * Session 数据面链路状态
 *
 * 描述某个 consumer 接入时的数据面协商结果。
 * 一个 session 覆盖该 consumer 参与的所有 channel（channelKeys），
 * 这些 channel 共用同一次数据面协商（共进退）。
 *
 * relay 与 p2p 的差异：
 * - relay：各 channel 在 edge 上有独立的中转端口，通过 channelEndpoints 表示
 * - p2p / wireguard：一次打洞/组网后所有 channel 共用同一直连端点 endpoint
 */
export interface SessionDataPath {
  /** 数据面链路类型 */
  type: ChannelLinkType
  /** 链路协商/连接状态 */
  state: 'negotiating' | 'connected' | 'failed'
  /**
   * relay 专用：各 channel 的 edge 中转地址映射
   * key 为 channelKey，value 为 edge 分配的远端地址（host:port 或 domain）
   */
  channelEndpoints?: Record<string, string>
  /**
   * p2p / wireguard 专用：协商成功后的直连端点
   * 所有 channelKeys 共用此端点
   */
  endpoint?: string
  /**
   * p2p 专用：ICE/STUN 候选地址列表（协商阶段使用）
   */
  candidates?: string[]
}

/**
 * Tunnel 会话（consumer 接入实例）
 *
 * Session 描述一个 consumer 设备接入 tunnel 的运行态实例。
 * 一个 tunnel 可同时存在多个 session（多 consumer 并发），每个 session 独立。
 *
 * 语义说明：
 * - session 是 per-consumer 粒度，不是 per-channel 粒度
 * - session.channelKeys 表示此次接入覆盖的 channel 集合（共进退）
 * - session.dataPath 描述此 consumer 与 publisher 之间的数据面链路
 * - 对于 HTTP 代理等无明确 consumer 的场景，sessions 为空数组，
 *   relay 端点信息直接存储在 channel.remote
 */
export interface TunnelSession {
  id: string
  /** 此 session 覆盖的 channel key 列表（这些 channel 共进退） */
  channelKeys: string[]
  /** 数据面链路状态 */
  dataPath: SessionDataPath
  /** publisher 设备 ID */
  publisherDeviceId?: string
  /** consumer 设备 ID（无明确 consumer 时为空） */
  consumerDeviceId?: string
  /** controller 设备 ID（可选，用于远程控制场景） */
  controllerDeviceId?: string
  /** session 整体连接状态（可从 dataPath.state 推导） */
  state?: TunnelChannelState
  startedAt?: string
  updatedAt?: string
  metadata?: Record<string, any>
}

/**
 * Tunnel 数据面链路偏好策略
 * 宿主按此策略选择 channel 数据面链路类型，实际能力由运行时决定。
 */
export interface TunnelLinkPolicy {
  /**
   * 统一的 P2P 模式声明（可选）。
   * 若该字段存在，宿主可据此推导 preferred/allowRelayFallback/requireDirect。
   */
  p2pMode?: TunnelP2PMode
  /** 优先尝试的链路类型顺序 */
  preferred?: ChannelLinkType[]
  /** 是否允许降级到 relay（当 p2p/wireguard 协商失败时）*/
  allowRelayFallback?: boolean
  /** 是否强制要求直连（p2p 或 wireguard），不允许 relay 降级 */
  requireDirect?: boolean
  /**
   * 可选：在 channel 启动期上报“直连不可用 -> relay 回退”占位事件。
   * 默认不建议开启，仅用于联调兼容。
   */
  quicStartupFallbackReport?: boolean
  /**
   * 可选：当 transport 本地 TCP 建连成功时上报 direct-connected 事件。
   * 默认关闭，仅用于 QUIC 数据面联调观测。
   */
  quicConnectedOnLocalOpenReport?: boolean
}

/**
 * @deprecated 请使用 TunnelLinkPolicy
 */
export type TunnelTransportPolicy = TunnelLinkPolicy

/**
 * 通用 Tunnel 配置基类（用于 configForm 统一字段约定）
 */
export interface TunnelConfigBase {
  /**
   * 统一 P2P 开关字段（建议所有 app/ext configForm 使用该命名）
   */
  p2pMode?: TunnelP2PMode
  /**
   * 可选：映射到 tunnel.intent.linkPolicy.quicStartupFallbackReport
   */
  quicStartupFallbackReport?: boolean
  /**
   * 可选：映射到 tunnel.intent.linkPolicy.quicConnectedOnLocalOpenReport
   */
  quicConnectedOnLocalOpenReport?: boolean
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
 * 描述用户希望这个 tunnel 如何运行（业务声明，不含运行态）。
 */
export interface TunnelIntent {
  /** tunnel 的主要通信协议（可选，仅描述意图，实际协议由 channels 决定） */
  protocol?: ChannelProtocol | string
  /** 应用级配置（由 App/Extension 定义结构） */
  config?: Record<string, any> & TunnelConfigBase
  /**
   * 数据面链路偏好策略（可选）
   * 指示宿主优先选择哪种链路类型，以及是否允许 relay 降级
   */
  linkPolicy?: TunnelLinkPolicy
  /**
   * @deprecated 请使用 linkPolicy
   */
  transportPolicy?: TunnelLinkPolicy
  /**
   * 本地桥接声明（可选）
   */
  localBridge?: TunnelLocalBridgeConfig
  metadata?: Record<string, any>
}

/**
 * Tunnel（随道）
 *
 * Tunnel 是最高层业务意图，描述一个代理应用的完整运行模型。
 *
 * 职责分层：
 * - intent：用户的静态业务声明（协议偏好、链路策略、本地桥接等）
 * - channels：端口绑定声明（静态意图，不随连接数量变化）
 * - sessions：consumer 接入实例（动态运行态，per-consumer）
 * - participants：参与设备列表（publisher / consumer / controller）
 *
 * 状态推导规则：
 * - tunnel.status 由 channels[].state 聚合推导
 * - channel.state 由 sessions 中对应 channelKey 的连接状态推导
 * - 无 session 时 channel.state = 'inactive'，tunnel.status = 'inactive'
 */
export interface Tunnel {
  id: string
  name: string
  /** tunnel 整体状态（从 channels 聚合推导） */
  status: TunnelChannelState
  appId?: string
  shared: TunnelSharedState
  intent: TunnelIntent
  participants: TunnelParticipant[]
  /**
   * Channel 列表（端口绑定声明）
   * 每个 channel 代表一个“本地端口 ↔ 远端服务”的绑定，数量固定不随 consumer 数量变化
   */
  channels: TunnelChannel[]
  /**
   * Session 列表（consumer 接入实例，动态）
   * 每个 session 代表一个 consumer 的当前接入，包含数据面链路状态
   * 对于无明确 consumer 的 tunnel（如 HTTP 代理），此列表为空
   */
  sessions: TunnelSession[]
  /**
   * 统一域名运行态快照（由宿主从远端运行态镜像投影，作为 DNS/CERT 的唯一业务判断输入）
   */
  runtimeDomainStatus?: RuntimeDomainStatusValue
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
 * 通道启动声明（扩展侧输入）
 *
 * 每个 ChannelStartSpec 对应一条真实传输链路，与运行态的 TunnelChannel 一一对应。
 * tcp/5900 和 udp/5900 应声明为两个独立的 ChannelStartSpec。
 */
export interface ChannelStartSpec {
  key: string
  protocol: ChannelProtocol
  localHost?: string
  localPort: number
  remotePort?: number
  subdomain?: string
  aliasDomain?: string
  bufferSize?: number
  transport?: ChannelLinkType
  metadata?: ChannelForwardMetadata
}

/**
 * 启动多通道输入参数
 */
export interface StartChannelsInput {
  channels: ChannelStartSpec[]
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
 * 上报 QUIC 连通性结果输入参数（按 channel）
 */
export interface ReportQuicConnectivityInput {
  channelId: string
  directAvailable: boolean
  directError?: string
}

/**
 * 上报 QUIC client-info 输入参数（按 channel）
 */
export interface ReportQuicClientInfoInput {
  channelId: string
  clientId: string
  natType?: number
  publicAddr?: string
}

/**
 * 通道运行时 SDK（扩展可调用）
 */
export interface ExtensionChannelRuntimeApi {
  startChannels(input: StartChannelsInput): Promise<HostResult<Tunnel>>
  stopChannels(input?: StopChannelsInput): Promise<HostResult<Tunnel>>
  getTunnel(): Promise<HostResult<Tunnel>>
  isEdgeConnected(): Promise<HostResult<boolean>>
  reportQuicConnectivityOutcomeByChannel?(input: ReportQuicConnectivityInput): Promise<HostResult<void>>
  reportQuicClientInfoByChannel?(input: ReportQuicClientInfoInput): Promise<HostResult<void>>
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
 * App 角色展示名称映射（展示层可按业务语义覆盖默认角色文案）
 */
export interface AppActorRoleLabels {
  publisher?: string
  consumer?: string
  controller?: string
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
   * 所有 App 必须提供 remoteAddress，以统一地址解析流程。
   */
  remoteAddress: AppRemoteAddressProfile
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
  /**
   * 角色展示名称映射（可选）。
   * 仅影响 UI 文案，不改变协议层角色语义（publisher/consumer/controller）。
   */
  actorRoleLabels?: AppActorRoleLabels
  /**
   * 协议兼容声明（OR 语义）。
   * 用于兼容历史扩展：满足其中任一协议即可展示/可用。
   */
  supportedProtocols?: ChannelProtocol[]
  /**
   * 协议必需声明（AND 语义）。
   * 所有声明协议均需可用，才允许展示/创建。
   *
   * 说明：
   * 当前通过 supportedProtocols(required optional) 组合实现基础语义，
   * 未来可平滑扩展为更复杂的协议表达式（AND/OR 组合）而不破坏兼容性。
   */
  requiredProtocols?: ChannelProtocol[]
  /**
   * 声明 App 配置中承载「自定义域名（alias domain）」的字段 key。
   *
   * 核心设计原则：自定义域名是 Tunnel 实例的运行时属性，不由 App 类型决定是否必填。
   *
   * 语义：
   *   - 未声明 / undefined：App 与 alias domain 无关
   *     → 任何 Edge 的 alias_domain_policy 都不影响该 App 的 Edge 选择
   *   - string：config 中承载域名的字段 key，支持 dot-path（如 'network.domain'）
   *   - string[]：多候选 key（按顺序取首个非空），便于扩展字段改名期的向后兼容
   *
   * 运行时校验规则：
   *   resolveAppAliasDomain(app, tunnel.config) →
   *     undefined   ：App 不声明 → 跳过 alias domain 维度校验
   *     ''          ：声明了但本次未填 → 跳过 Edge.supportsCustomDomain 校验
   *     非空字符串  ：本次使用 alias domain → Edge 必须 supportsCustomDomain
   *
   * 示例：
   *   aliasDomainKey: 'customDomain'
   *   aliasDomainKey: ['customDomain', 'custom_domain']   // 迁移兼容
   *   aliasDomainKey: 'network.alias'                     // dot-path
   */
  aliasDomainKey?: string | string[]
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

/**
 * 扩展本地化状态实例
 */
export interface ExtLocaleState {
  /** 获取当前语言 */
  get: () => string
  /** 设置当前语言并通知所有订阅者 */
  set: (locale: string) => void
  /** 订阅语言变化；返回取消订阅函数 */
  subscribe: (fn: (locale: string) => void) => () => void
}

/**
 * 创建一个轻量的扩展本地化状态，框架无关。
 *
 * 用法示例（Vue 扩展）：
 * ```ts
 * // shared/locale.ts
 * import { ref } from 'vue'
 * import { createLocaleState } from '@hilow/extension-types'
 *
 * const _state = createLocaleState(localStorage?.getItem?.('locale') || 'zh-CN')
 * export const locale = ref(_state.get())
 * _state.subscribe(l => { locale.value = l })
 * export const setLocale = _state.set
 *
 * // index.ts onLocaleChange hook
 * async onLocaleChange(locale) { setLocale(locale) }
 *
 * // 任意组件内
 * const msgs = { 'zh-CN': { ... }, en: { ... } }
 * const t = computed(() => locale.value === 'en' ? msgs.en : msgs['zh-CN'])
 * ```
 */
export function createLocaleState(initial = 'zh-CN'): ExtLocaleState {
  let _locale = initial
  const _subs: ((locale: string) => void)[] = []
  return {
    get: () => _locale,
    set: (l: string) => {
      _locale = l
      _subs.forEach(fn => fn(l))
    },
    subscribe: (fn: (locale: string) => void) => {
      _subs.push(fn)
      return () => {
        const i = _subs.indexOf(fn)
        if (i >= 0) _subs.splice(i, 1)
      }
    },
  }
}
