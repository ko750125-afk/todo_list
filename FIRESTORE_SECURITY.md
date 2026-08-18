# Firestore 보안 안내

이 앱은 로그인/회원가입이 없는 개인용 단일 사용자 앱입니다.
Firebase Authentication을 사용하지 않으므로, Firestore 보안 규칙(Security Rules)에서
"인증된 사용자만 허용" 방식의 일반적인 규칙을 그대로 쓸 수 없습니다.

`NEXT_PUBLIC_FIREBASE_*` 환경변수는 클라이언트 번들에 그대로 노출됩니다.
Firestore 보안 규칙을 완전히 공개(`allow read, write: if true;`)로 두면,
이 값들을 알아낸 외부인이 누구나 데이터를 읽고 쓸 수 있습니다.

## 최소 권장 사항

1. **완전 공개 규칙을 절대 배포하지 않는다.**
   기본 상태(모든 요청 거부)를 유지하거나, 최소한 아래와 같이 컬렉션과 필드 형태를 검증하는 규칙을 사용하세요.

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /todos/{todoId} {
         allow read, write: if request.resource.data.keys().hasAll(['title', 'completed', 'type']);
       }
       match /recurringPayments/{paymentId} {
         allow read, write: if request.resource.data.keys().hasAll(['recipient', 'amount', 'bank', 'accountNumber', 'paymentDay', 'active']);
       }
     }
   }
   ```

   이는 완전한 보안 대책이 아니라 최소한의 형식 검증일 뿐입니다.

2. **Firebase 프로젝트를 비공개로 유지한다.**
   Firebase 콘솔에서 프로젝트 공유 설정, API 키 제한(HTTP 리퍼러 제한 등)을 확인하세요.

3. **더 강한 보호가 필요해지면 그때 App Check 또는 간단한 인증 도입을 검토한다.**
   지금은 개인용 앱이므로 도입하지 않지만, 외부 공유 계획이 생기면 재검토가 필요합니다.

4. 실제 Firestore 보안 규칙 배포는 이번 개발 범위에 포함되지 않았습니다.
   Firebase 콘솔 → Firestore Database → 규칙(Rules) 탭에서 대표님이 직접 확인/배포해주세요.
