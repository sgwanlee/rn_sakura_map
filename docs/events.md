# Analytics Events

이 문서는 앱에서 추적하는 모든 Analytics 이벤트를 정리합니다.
모든 이벤트는 **Amplitude**와 **Firebase Analytics** 양쪽에 동시에 전송됩니다.
또한 동일 이벤트 payload가 Firestore `analytics_events` 컬렉션에 별도로 저장됩니다.

공통 파라미터: 모든 이벤트에 `app_slug`가 자동 포함됩니다.

Firestore 저장 필드: `event_name`, `params`, `app_slug`, `app_name`, `app_version`, `platform`, `created_at`, `client_timestamp`

---

## Onboarding Events

| Event Name | Parameters | Description | Screen/Component |
|------------|------------|-------------|------------------|
| `onboarding_step_view` | `app_slug`, `step_number`, `step_name` | 온보딩 단계 조회 | OnboardingScreen |
| `onboarding_complete` | `app_slug`, `completed_at` | 온보딩 완료 | OnboardingScreen |

> **Firestore REST API 로깅**: 온보딩 이벤트는 별도 Firebase 프로젝트의 `onboarding_logs` 컬렉션에도 REST API로 저장됩니다.
> 저장 필드: `event`, `stepNumber`/`stepName`/`completedAt`, `appName`, `appSlug`, `appVersion`, `platform`, `deviceModel`, `osVersion`, `createdAt`

---

## Paywall Events

| Event Name | Parameters | Description | Screen/Component |
|------------|------------|-------------|------------------|
| `paywall_view` | `app_slug`, `source` | 페이월 화면 조회 | PaywallScreen |
| `paywall_purchase_started` | `app_slug`, `package` | 구매 시작 | PaywallScreen |
| `paywall_purchase_success` | `app_slug`, `package` | 구매 성공 | PaywallScreen |
| `paywall_purchase_failed` | `app_slug`, `package`, `error` | 구매 실패 | PaywallScreen |
| `paywall_restore_started` | `app_slug` | 복원 시작 | PaywallScreen |
| `paywall_restore_success` | `app_slug` | 복원 성공 | PaywallScreen |
| `paywall_restore_failed` | `app_slug`, `error` | 복원 실패 | PaywallScreen |
| `paywall_skipped` | `app_slug` | 페이월 스킵 | PaywallScreen |

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
| `subscription_override_toggled` | `enabled` | 구독 상태 강제 변경 (개발자) | SettingsScreen |

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
