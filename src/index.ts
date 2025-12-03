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
 * 隧道信息
 */
export interface Tunnel {
  /** 隧道 ID */
  id: string
  /** 隧道名称 */
  name: string
  /** 隧道类型 (1: HTTP, 2: HTTPS, 3: TCP, 4: UDP, 5: WireGuard) */
  type: number
  /** 隧道状态 */
  status: 'active' | 'stopped' | 'inactive' | string
  /** 本地端口 */
  localPort?: number
  /** 远程端口 */
  remotePort?: number
  /** 远程 URL */
  remoteUrl?: string
  /** 关联的 App ID */
  appId?: string
  /** 创建时间 */
  createdAt?: string
  /** 额外属性 */
  [key: string]: any
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
  /** 配置表单组件（用于创建隧道时填写配置） */
  ConfigForm?: any
  /** 基本信息个性化组件（作为补充显示在标准信息之后） */
  DetailInfo?: any
  /** 标签页定义列表 */
  tabs: AppTab[]
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
