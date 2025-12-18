# werp_backend
[werp frontend github](https://github.com/JeongHui-seong/werp)
## nodejs typescript prisma
### 로그인 기능
- 사용자가 입력한 이메일을 기반으로 인증 절차 진행, 백엔드에서는 SendGrid를 이용해 해당 이메일로 일회용 인증 코드를 발급하며, 사용자는 전달받은 코드를 입력해 본인 여부 검증

## API 명세서

### 인증 API

#### 1. 이메일 인증 코드 발송
- **Method**: `POST`
- **URL**: `/auth/find-email`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "인증 코드가 전송되었습니다.",
    "code": "123456"
  }
  ```
- **Error Response** (404):
  ```json
  {
    "success": false,
    "message": "등록되지 않은 이메일입니다. 관리자에게 문의하세요."
  }
  ```

#### 2. 인증 코드 재발송
- **Method**: `POST`
- **URL**: `/auth/resend-code`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "인증 코드가 재전송되었습니다.",
    "code": "123456"
  }
  ```

#### 3. 로그인
- **Method**: `POST`
- **URL**: `/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "로그인 성공",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response** (404):
  ```json
  {
    "success": false,
    "message": "등록되지 않은 이메일입니다."
  }
  ```

### 출퇴근 API

모든 출퇴근 API는 `Authorization` 헤더에 Bearer 토큰이 필요합니다.
```
Authorization: Bearer {token}
```

#### 1. 출근 등록
- **Method**: `POST`
- **URL**: `/attendance/clockin`
- **Headers**:
  - `Authorization: Bearer {token}`
- **Request Body** (모든 필드 선택사항):
  ```json
  {
    "date": "2025-01-15",      // yyyy-MM-dd 형식 (선택사항, 없으면 오늘 날짜)
    "clockin": "09:00:00"       // HH:mm:ss 형식 (선택사항, 없으면 현재 시간)
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "출근 완료! 오늘도 힘내세요 ☺️",
    "attendance": {
      "id": 1,
      "user_id": "uuid",
      "date": "2025-01-15T00:00:00.000Z",
      "clockin": "1970-01-01T09:00:00.000Z",
      "clockout": null
    }
  }
  ```

#### 2. 퇴근 등록
- **Method**: `POST`
- **URL**: `/attendance/clockout`
- **Headers**:
  - `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "attendanceId": 1,          // 필수
    "clockout": "18:00:00"      // HH:mm:ss 형식 (선택사항, 없으면 현재 시간)
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "퇴근 완료! 오늘 하루 수고하셨습니다 😊",
    "attendance": {
      "id": 1,
      "user_id": "uuid",
      "date": "2025-01-15T00:00:00.000Z",
      "clockin": "1970-01-01T09:00:00.000Z",
      "clockout": "1970-01-01T18:00:00.000Z"
    }
  }
  ```
- **Error Response** (409):
  ```json
  {
    "success": false,
    "message": "이미 퇴근 처리가 완료되었습니다."
  }
  ```

#### 3. 특정 날짜 출퇴근 조회
- **Method**: `GET`
- **URL**: `/attendance/today?date=2025-01-15`
- **Headers**:
  - `Authorization: Bearer {token}`
- **Query Parameters**:
  - `date`: yyyy-MM-dd 형식 (필수)
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "출퇴근 정보를 조회했습니다.",
    "attendance": {
      "id": 1,
      "user_id": "uuid",
      "date": "2025-01-15T00:00:00.000Z",
      "clockin": "1970-01-01T09:00:00.000Z",
      "clockout": "1970-01-01T18:00:00.000Z"
    }
  }
  ```

#### 4. 월별 출퇴근 통계 조회
- **Method**: `GET`
- **URL**: `/attendance/monthly?yearMonth=2025-01&startWorkTime=09:00`
- **Headers**:
  - `Authorization: Bearer {token}`
- **Query Parameters**:
  - `yearMonth`: yyyy-MM 형식 (필수, 예: "2025-01")
  - `startWorkTime`: HH:mm 형식 (필수, 예: "09:00")
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "월별 출퇴근 정보를 조회했습니다.",
    "summary": {
      "totalWorkMinutes": 10800,
      "avgWorkMinutes": 540,
      "overtimeMinutes": 120,
      "lateMinutes": 30
    },
    "records": [
      {
        "date": "2025-01-15T00:00:00.000Z",
        "clockIn": "1970-01-01T09:00:00.000Z",
        "clockOut": "1970-01-01T18:00:00.000Z",
        "worktime": 540,
        "lateTime": 0,
        "leave": null,
        "note": null
      }
    ]
  }
  ```
- **Response 설명**:
  - `totalWorkMinutes`: 해당 월의 총 근무 시간 (분)
  - `avgWorkMinutes`: 평균 근무 시간 (분)
  - `overtimeMinutes`: 9시간(540분) 초과한 시간의 합계 (분)
  - `lateMinutes`: 지각 시간의 합계 (분)
  - `records`: 일별 출퇴근 기록 배열
    - `lateTime`: 지각 시간 (분, 근무시작시간보다 늦으면 계산)
    - `leave`: 휴가 타입 (status가 approved인 경우만 표시)
