/**
 * YAT Extension Types
 *
 * 共享类型定义，用于 YAT 宿主应用和扩展开发
 * @packageDocumentation
 */
/**
 * 后端隧道操作错误码（单一事实来源，对应 api/schema/message.fbs enum ErrorCode）。
 */
export const TunnelErrorCode = {
    UNKNOWN: 0,
    AUTH_FAILED: 1001,
    INVALID_MESSAGE: 1002,
    CHANNEL_NOT_FOUND: 2001,
    TUNNEL_LIMIT_EXCEEDED: 2002,
    /** 隧道未启用可用的主动 P2P 协商（发布端未就绪） */
    P2P_NOT_ENABLED: 2003,
    TIMEOUT: 3001,
    EDGE_OFFLINE: 3002,
    INTERNAL_ERROR: 9999,
};
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
export function createLocaleState(initial = 'zh-CN') {
    let _locale = initial;
    const _subs = [];
    return {
        get: () => _locale,
        set: (l) => {
            _locale = l;
            _subs.forEach(fn => fn(l));
        },
        subscribe: (fn) => {
            _subs.push(fn);
            return () => {
                const i = _subs.indexOf(fn);
                if (i >= 0)
                    _subs.splice(i, 1);
            };
        },
    };
}
//# sourceMappingURL=index.js.map