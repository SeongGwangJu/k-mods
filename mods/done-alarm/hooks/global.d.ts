// scripts/dev/typecheck.sh가 쓰는 tsc 설정은 lib: ["es2023"]이라 아직 Uint8Array.toBase64
// 선언이 없다. 실제로는 공식 문서(plugins/mods/interface.md의 Raster 예제)가 그대로 쓰는,
// 런타임에 있는 메서드라서 타입만 이렇게 보강해 둔다. .claude-plugin/types/는 매번 새로
// 받아 쓰므로 거기 말고 여기(hooks/)에 둔다.
export {}

declare global {
  interface Uint8Array {
    toBase64(): string
  }
}
