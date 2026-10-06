// memo-pad의 순수 함수. $를 받지 않아 테스트하기 쉽다.

/** 작업 디렉터리별 저장 키. 폴더마다 메모가 따로 쌓인다. */
export function storeKeyFor(cwd: string): string {
  return `notes:${cwd}`
}

/** 프롬프트 힌트 줄 끝에 붙는 꼬리 문구. */
export function hintTail(count: number): string {
  return `✎ 메모 ${count} (/m)`
}
