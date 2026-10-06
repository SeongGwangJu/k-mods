import type { MaskConfig } from './mask/types'

/**
 * streamer-mode의 plugin.json `userConfig`가 register(on, options)의 `options`로
 * 들어올 때의 모양. 실제 타입은 `claude-code`의 생성된 `PluginOptions`이지만,
 * 순수 함수·테스트에서 가볍게 쓰기 위해 여기서 우리 쪽 모양을 따로 적어 둔다.
 */
export interface StreamerModeOptions {
  readonly start_on?: boolean
  readonly mask_secrets?: boolean
  readonly mask_korean_id?: boolean
  readonly mask_contact?: boolean
  readonly mask_ip?: boolean
  readonly mask_home?: boolean
  readonly custom_words?: readonly string[]
  readonly style?: string
}

/** userConfig 값을 세션 내내 바뀌지 않는 MaskConfig로 바꾼다 */
export function buildMaskConfig(options: StreamerModeOptions): MaskConfig {
  return {
    maskSecrets: options.mask_secrets ?? true,
    maskKoreanId: options.mask_korean_id ?? true,
    maskContact: options.mask_contact ?? true,
    maskIp: options.mask_ip ?? false,
    maskHome: options.mask_home ?? false,
    customWords: options.custom_words ?? [],
    style: options.style === 'dots' ? 'dots' : 'label',
  }
}

/** 설치 시 기본으로 켤지 (userConfig의 start_on 기본값은 true) */
export function initialToggleFrom(options: StreamerModeOptions): boolean {
  return options.start_on ?? true
}
