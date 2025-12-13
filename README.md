# werp_backend
[werp frontend github](https://github.com/JeongHui-seong/werp)
## nodejs typescript prisma
### 로그인 기능
- 사용자가 입력한 이메일을 기반으로 인증 절차 진행, 백엔드에서는 SendGrid를 이용해 해당 이메일로 일회용 인증 코드를 발급하며, 사용자는 전달받은 코드를 입력해 본인 여부 검증
