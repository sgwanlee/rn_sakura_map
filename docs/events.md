# Analytics Events

이 문서는 앱에서 추적하는 모든 Analytics 이벤트를 정리합니다.
모든 이벤트는 **Amplitude**와 **Firebase Analytics** 양쪽에 동시에 전송됩니다.

---

## Onboarding Events

| Event Name | Parameters | Description | Screen/Component |
|------------|------------|-------------|------------------|
| `onboarding_step_view` | `stepNumber`, `stepName` | 온보딩 단계 조회 | OnboardingScreen |
| `onboarding_complete` | `completedAt` | 온보딩 완료 | OnboardingScreen |

---

## Paywall Events

| Event Name | Parameters | Description | Screen/Component |
|------------|------------|-------------|------------------|
| `paywall_view` | `source` | 페이월 화면 조회 | PaywallScreen |
| `paywall_purchase_started` | `packageId` | 구매 시작 | PaywallScreen |
| `paywall_purchase_success` | `packageId` | 구매 성공 | PaywallScreen |
| `paywall_purchase_failed` | `packageId`, `error` | 구매 실패 | PaywallScreen |
| `paywall_restore_started` | - | 복원 시작 | PaywallScreen |
| `paywall_restore_success` | - | 복원 성공 | PaywallScreen |
| `paywall_restore_failed` | `error` | 복원 실패 | PaywallScreen |
| `paywall_skipped` | - | 페이월 스킵 | PaywallScreen |

---

## Navigation Events

| Event Name | Parameters | Description | Screen/Component |
|------------|------------|-------------|------------------|
| `screen_view` | `screenName`, `screenClass` | 화면 조회 | Global |
| `tab_visited` | `tabName` | 탭 방문 | MainNavigator |

---

## Feedback Events

| Event Name | Parameters | Description | Screen/Component |
|------------|------------|-------------|------------------|
| `feedback_submit` | `type` (`bug`/`idea`), `nickname` | 피드백 제출 | FeedbackScreen |
| `feedback_list_view` | `totalCount`, `bugCount`, `ideaCount` | 피드백 목록 조회 (개발자) | FeedbackListScreen |

---

## Settings Events

| Event Name | Parameters | Description | Screen/Component |
|------------|------------|-------------|------------------|
| `dev_mode_enabled` | - | 개발자 모드 활성화 | SettingsScreen |
| `dev_mode_disabled` | - | 개발자 모드 비활성화 | SettingsScreen |
| `ads_toggled` | `enabled` | 광고 토글 (개발자) | SettingsScreen |

---

## Event Naming Convention

- **snake_case** 사용
- **action_target** 형식 (예: `add_weight`, `view_screen`)
- 명확하고 간결하게 작성

## Adding New Events

새로운 이벤트를 추가할 때:

1. `utils/analytics.ts`에 이벤트 함수 추가
2. 이 문서(`docs/events.md`)에 이벤트 정보 추가
3. 해당 컴포넌트에서 이벤트 호출
