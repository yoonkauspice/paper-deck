# JEO 정독 노트
Jeon et al. (2025) Simulating conversations on social media with generative agent-based models. EPJ Data Science 14:79 (본문 22쪽)
추출본: `01_extract/full.txt` (줄 번호는 아래 `L`로 표기)

## 한 줄 요약
ABM(SISa 확장)이 "누가 누구에게 어떤 유형으로 반응하는가"의 거시 구조를 만들고, 각 상호작용마다 LLM(GPT-4o)이 그 조건(직전 글, 반응 유형, 입장)으로 댓글을 쓴다. 이렇게 만든 대화를 Twitter16 실제 대화와 비교(O1)하고, 진실/거짓 뉴스에 따른 차이를 본다(O2).

## 1 서론·선행연구 (§1, L36-257)
- 동기: LLM은 이자(dyadic) 대화에 강하지만, 한 글이 모든 팔로워에게 가는 멀티캐스트 대화는 덜 연구됨 (L38-53)
- 구조: ABM이 거시 구조(누가·어떤 유형·입장), 프롬프트가 미시 텍스트 (그림 1, L66-117)
- 선행연구: Törnberg 2023[15] 뉴스피드, Chuang[19] 의견 동역학, Ferraro[22] 100명 실제 트윗 이력, Gao[23] S3, Zheng&Tang[24] 15 에이전트 10스텝 (L119-204)
- Gap: 표 1(L213-229). 멀티캐스트+텍스트 시뮬레이션 4편([15,22,24,31])은 진실/거짓 틀을 안 봄. 진실/거짓을 보는 3편([16,19,20]) 중 텍스트는 [19]뿐이고 멀티캐스트가 아님 (L236-246). 표의 체크 표시는 텍스트로 안 읽혀 PDF 쪽 5에서 확인 필요
- 기여 3가지: ①멀티캐스트 구조+텍스트, 진실/거짓 효과 ②실제 대화와 비교 ③오픈소스 (L248-257)

## 2 방법 (§2, L259-462)
- SOIL 기반, FSM 에이전트, 이산 시간, 한 스텝에 에이전트 하나만 전이 (L261-270, L396-401)
- SISa 3가지 전이: prob_neighbor_spread(이웃 전파), prob_tv_spread(자발적/외부), prob_neighbor_cure(참여→청취) (L274-284)
- 확장 4가지: CONNECTED→LISTENING(접속 시각 가우시안 mean/var_time_connection), PARTICIPATING 행동 repost/comment(prob_repost), backsliding(차수 가중 샘플, 이웃 아니어도 됨), DISCONNECTED(prob_disconnected) (L296-322, 표 2 L325-341, 그림 2)
- 에이전트 3유형: NaiveViewer(신뢰, 입장 고정), DubiousViewer(중립, 찬반 전환 가능), InformedViewer(중립 다수, 반대 입장 가능, 유일하게 cure 가능, cure 확률 = prob_neighbor_cure × cured_neighbors / infected_neighbors) (L370-412)
- 상호작용 4종: support, deny, question, comment (L365-368)
- 프롬프트: 전역(언어, min/max_chars, 사용자 설명 예: "average toxic and angry social media user") + 지역(preceding_message, interaction, stance) (L416-435). 상호작용은 트리로 색인해 레벨별 순회
- Informed 에이전트는 기사 전문과 팩트체크 문서를 프롬프트에 받고, 나머지는 헤드라인만 (L437-444)
- 소프트웨어: network_simulator (PyPI), 모듈 6개, sqlite3, 맞춤법 검사 후 재실행 (L446-462)

## 3 실험 (§3, L465-787)
- 목표: O1 실제 대화와 비교(문체·모델 기반 지표), O2 진실/거짓 사례 연구 (L469-475)
- 데이터: Twitter16, 뉴스 이벤트 818개(2014-2015), 진실성 주석. 같은 뉴스 이벤트로 시뮬레이션 (L518-524)
- 네트워크: LFR, n=100, τ1=2.0, τ2=1.5, μ=0.5, 평균 차수 5 (L531-541). 실제 캐스케이드 평균 길이는 수백 상호작용 (L529-531)
- LLM: GPT-4o 2024-05-13, temperature 0.5, 나머지 기본 (L509, L543-545)
- 보정: 시뮬레이션 메시지량 곡선을 Twitter16과 비교 (S2). 적정 범위: neighbor spread > tv spread, backsliding·prob_dead≈0.1, neighbor cure≈0.35 (L547-561). 보정 방식은 곡선 비교로만 서술되고 적합도 지표는 없음
- O1 지표 (L563-671):
  - 문체: 단어 수, 글자 수, 평균 문장 길이, SAT 어휘 비율. 중앙값 차이 유의: words, chars, SAT (α=0.005, p<0.001, n=818). 문장 길이는 중앙값 일치. 시뮬레이션이 더 장황하고 어려운 어휘 (L591-600)
  - GPT-4o 기반(2024-08-06): 내용 품질, 문법, 관련성, 적절성. 4개 모두 유의. 시뮬레이션이 문법·관련성·적절성이 높음 (L619-634)
  - GPTZero: 가독성, perplexity, burstiness, simplicity. 유의한 것은 perplexity와 simplicity. 사람이 덜 예측 가능, 시뮬레이션이 더 쉬움 (L636-671)
- O2 설계 (L673-765): PolitiFact 80건(진실 40, 거짓 40, 2024.5-2025.4), 각 건당 한 번의 시뮬레이션으로 보인다. NELA 어휘(편향어, assertives, factives, hedges, implicatives, report verbs), SO=(P−N)/(P+N)의 평균 SO(B)와 분산 SO(D), Twitter-RoBERTa(B, D), 트리 높이 H·너비 A·LEAVES·NODES, HAS DRIFT(P/N 교차)
- 검정: 정규성→Levene→Welch/표준 t 또는 Mann-Whitney, 이산형 Freeman-Halton, HAS DRIFT는 Fisher exact (L753-765)
- 결과(표 3): 유의한 5개 = BIASED WORDS, B(RoBERTa), SO(B), SO(D), HAS DRIFT. 진실은 평균 긍정, 거짓은 평균 부정, 거짓에서 drift 더 많음 (L767-784). **표 3 수치는 텍스트에 없어 확인 필요**
- 부수: 상호 답글 비율 시뮬레이션 약 6%, Twitter16 약 11% (L696-698). 대안 토폴로지 BA, ER은 S7

## 4-5 논의·한계·결론 (L789-928)
- 저자 한계: 순차 시뮬레이션(동기화·고빈도 불가), 이념·종교·성별 프로필 없음, 맥락이 제한적(장기 기억 없음), Twitter16이 전부 사람 글인지 보장 없음, 지표마다 한계 (L835-873)
- 결론: 시뮬레이션 대화는 사람 대화와 매우 비슷하나 perplexity 등으로 탐지 가능. 거짓 틀이 더 부정적 (L876-887)

## 원문 감사 후보 (5단계에서 원문 대조로 확인할 가설, 아직 결론 아님)
1. 결론의 "negativity intensifies with fact-checks"(L884-885)를 직접 뒷받침하는 실험이 본문에 있는지(팩트체크 유무 비교가 보이지 않음)
2. 진실/거짓 비교에서 팩트체크 접근이 Informed 유형에만 주어져 "내용 진실성"과 "정보 접근" 효과가 섞이는지
3. 표 3의 다중 비교 보정 여부(유의 5개 / 검정 15개)와 n=40 시뮬레이션이 1회 실행인지
4. GPT-4o가 GPT-4o 생성 글을 평가(자기 평가 편향 가능), 두 GPT-4o 버전이 다름(05-13 vs 08-06)
5. 프롬프트의 "toxic and angry user" 지시와 appropriateness 결과(GPT-4o 안전 정책으로 설명, L632-634)의 관계
6. 비교 대상 시기 차이: Twitter16(2014-15) vs PolitiFact(2024-25), O1과 O2의 데이터가 서로 다름
7. 보정이 곡선 육안 비교인지, 정량 지표가 있는지
