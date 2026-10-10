# shoot: size=1400x760 type=png crop=0,561,1400,702 pad=18 model=claude-haiku-4-5
# 요즘 모델은 컨텍스트 창이 100만 토큰이라 막대가 거의 비어 보인다. 20만 토큰 창인 Haiku 4.5로 큰 파일을
# 읽혀 40% 안팎을 만든 뒤, 세션을 다시 열어(--continue) 증가량 표시 없이 찍는다. 약 3분 걸린다.
Hide
Type@20ms "src/data의 jsonl 파일 두 개를 끝까지 다 읽고, 카테고리별 9월 판매 수량과 남은 재고를 표 하나로 정리해줘. 집계 스크립트는 만들지 말고 읽은 내용으로 직접 세어줘"
Enter
Wait+Screen@400s /done \d/
Sleep 2s
Ctrl+C
Sleep 0.5s
Ctrl+C
Sleep 2s
Type "clear && K_CONTINUE=1 $K_CMD"
Enter
Sleep 9s
Show
Sleep 1s
Screenshot "/tmp/k-demo/shots/ctx-strip.png"
Sleep 1s
