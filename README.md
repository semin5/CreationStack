# 💬 멋쟁이사자처럼 프로젝트 - CreationStack

## 프로젝트 소개

<img width="1900" height="980" alt="image" src="https://github.com/user-attachments/assets/7e4b4f7f-eac3-4a29-aa80-814d29e6ba1d" />

### 실무자들이 자신의 경험과 지식을 담은 콘텐츠를 업로드하고, 취업준비생과 같은 사용자들이 이를 구독하여 실질적인 도움을 받을 수 있습니다

<br><br><br><br><br><br>

## 조원 소개

| <img src="https://avatars.githubusercontent.com/u/62700196?v=4" width="120px"> | <img src="https://avatars.githubusercontent.com/u/62907792?v=4" width="120px"> | <img src="https://avatars.githubusercontent.com/u/201211576?v=4" width="120px"> | <img src="https://avatars.githubusercontent.com/u/91832324?v=4" width="120px"> | <img src="https://avatars.githubusercontent.com/u/156408029?v=4" width="120px"> | <img src="https://avatars.githubusercontent.com/u/202621381?v=4" width="120px"> | <img src="https://avatars.githubusercontent.com/u/169969437?v=4" width="120px"> |
| :----------------------------------------------------------------------------: | :----------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :----------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: |
|                  [**김희연**](https://github.com/Happy-Lotus)                  |                [**김진아**](https://github.com/catapillar0505)                 |                     [**김채연**](https://github.com/yeon47)                     |                   [**윤혜진**](https://github.com/lold2424)                    |                  [**이예은**](https://github.com/petite-coder)                  |                     [**오세민**](https://github.com/semin5)                     |                   [**전효진**](https://github.com/hyojin0911)                   |
|                       `프로젝트 총괄, 결제 서비스 구현`                        |                              `콘텐츠 서비스 구현`                              |                                `SNS 서비스 구현`                                |              `JWT 이용한 이메일&카카오 로그인 및 지도 화면 구현`               |                    `구독 서비스 구현`                     |                           `검색 서비스 구현`                           |                           `공지 서비스 구현`                           |

<br><br><br><br><br><br>

## 기술 스택

<img src="https://img.shields.io/badge/JAVA-437291?style=for-the-badge&logo=OpenJDK&logoColor=white"/><img src="https://img.shields.io/badge/Spring Boot-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white"/><img src="https://img.shields.io/badge/Spring Security-6DB33F?style=for-the-badge&logo=SpringSecurity&logoColor=white"/><img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/><br>
<img src="https://img.shields.io/badge/amazon aws-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white">
<img src="https://img.shields.io/badge/.ENV-ECD53F?style=for-the-badge&logo=.ENV&logoColor=white"> <br>
<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white"/><br>
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=white"/> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white"/> <br>
<img src="https://img.shields.io/badge/figma-F24E1E?style=for-the-badge&logo=Figma&logoColor=white"/><img src="https://img.shields.io/badge/Intellij IDEA-000000?style=for-the-badge&logo=IntellijIDEA&logoColor=white"/><img src="https://img.shields.io/badge/VS CODE-61DAFB?style=for-the-badge&logo=VSCODE&logoColor=white"/> <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=GitHub&logoColor=white"/> <img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=Notion&logoColor=white"/><img src="https://img.shields.io/badge/KAKAO-FFCD00?style=for-the-badge&logo=KAKAO&logoColor=white"/><img src="https://img.shields.io/badge/PortOne-F24E1E?style=for-the-badge&logo=&logoColor=white"/><br>

<br><br><br><br><br><br>

## 기능

### 1. 회원 관리 및 인증

### 📧 이메일 로그인

- Spring Security 기반으로 사용자 인증을 처리합니다.
- 로그인 시 사용자 인증 정보로 Access Token / Refresh Token 생성합니다.
  - Access Token: 클라이언트에서 요청 시 Authorization 헤더에 Bearer 방식으로 전달
  - Refresh Token: 서버 DB에 저장 및 만료 시 토큰 재발급 요청 처리
- JWT 유효성 검사는 JwtAuthenticationFilter에서 처리합니다. -인증된 사용자 정보는 SecurityContextHolder에 저장되어 전역 인증 처리 가능

### 🟡 카카오 로그인

- 카카오 OAuth 2.0 인가 코드를 통해 Access Token 발급 (RestTemplate 또는 WebClient 사용)받습니다.
- 발급받은 카카오 Access Token으로 사용자 프로필 요청 (카카오 API)합니다.
- 이메일 기준으로 기존 회원 여부 판단합니다.
- 이후 JWT 토큰 발급 방식은 이메일 로그인과 동일하게 적용합니다.

### 🖊️ 회원 정보 조회 및 수정 <br>

- 회원 정보를 조회하고 수정할 수 있습니다.
- 회원의 역할이 창작자인지 일반 회원인지 구분해 제공되는 서비스를 다르게 하엿습니다.

<br><br>

---

### 2. 콘텐츠 관리

### 💬 Toast UI Editor 이용한 콘텐츠 작성 <br>

- Toast UI Editor을 이용해 콘텐츠 본문을 작성합니다.
- 마크다운 형식으로 작성할 수 있고 일반 텍스트 형식으로도 작성할 수 있습니다.
- 사진이 포함된 게시물을 생성할 수 있습니다.

### 🖼️ AWS S3 이용한 이미지 업로드 <br>

- AWS S3 스토리지 서비스를 이용하여 이미지 업로드를 구현하였습니다.
- S3에 이미지를 저장하고 URL을 반환받아 DB에 저장합니다.
- 이미지가 포함된 콘텐츠를 조회할 경우 DB에 저장된 URL을 통해 S3 스토리지에 저장된 이미지를 불러올 수 있습니다.

### 💎 구독자 전용 콘텐츠 접근 제어 <br>

- 특정 콘텐츠는 창작자가 구독자 전용으로 설정할 수 있습니다.
- 창작자를 구독한 일반 회원만 열람할 수 있습니다.
- 구독 전용 콘텐츠일 경우 다이아몬드 표시를 추가하여 사용자가 구분할 수 있도록 하였습니다.

<br><br>

---

### 3. 구독 및 결제

### 🧾 구독 서비스

- 회원의 구독 요청에 따른 적절한 결제 요청을 보냅니다.
- 창작자 구독 여부에 따라 공지 기능을 활용할 수 있습니다.
- 창작자에 대한 구독 여부에 따라 열람할 수 있는 콘텐츠에 제한을 둡니다.
- 구독을 해지한 후 일주일 이내 재구독할 수 있습니다.

### 💳 PortOne SDK 결제 수단 등록

- PortOne SDK를 이용해 결제 수단을 등록할 수 있습니다.
- 발급된 BillingKey를 이용해 DB에 결제수단을 등록합니다.
- 등록된 결제수단은 구독 시 결제 수단을 선택할 때 사용됩니다.

### ⏱️ PortOne REST API V2와 Spring Scheduler 이용한 정기 결제

- API 요청을 통해 결제를 요청할 수 있습니다.
- 결제가 완료되면 결제 내역과 구독 내역을 업데이트 해 다음 결제일을 설정합니다.
- 구독 내역에 저장된 다음 결제일 정보를 이용해 매월 00시에 자동 결제가 진행됩니다.
- 다음 구독 상태에 따라 결제가 진행됩니다.
  - ACTIVE : 결제 요청
  - CANCELLED : 상태를 EXPIRED로 변경
  - EXPIRED : 일주일이 지난 구독 내역일 경우 구독 내역 DB에서 삭제

<br><br>

---

### 4. 댓글 및 좋아요 관리

### 🗨️ 댓글 관리

- 모든 사람들은 게시물에 대해 댓글을 입력할 수 있습니다.
- 한 댓글에 대해 추가로 댓글을 작성할 수 있습니다.
- 댓글을 삭제할 경우 "삭제된 댓글입니다" 라고 표시됩니다.

### ❤️ 좋아요 관리

- 댓글에 하트 버튼을 클릭해 좋아요 반응을 보낼 수 있습니다.
- 마이페이지에서 자신이 좋아요 누른 콘텐츠 목록을 확인할 수 있습니다.

<br><br>

---

### 5. 검색 관리

### 👤 크리에이터별 검색

- 회원은 크리에이터에 한정해 검색할 수 있습니다.
- 필터를 선택해 자신이 원하는 크리에이터 정보를 찾을 수 있습니다.

### 📚 콘텐츠 검색

- 회원은 콘텐츠에 한정해 검색할 수 있습니다.
- 회원은 카테고리를 선택해 원하는 콘텐츠를 검색할 수 있습니다.

### ➡️ 페이지네이션

- 페이지네이션을 통해 검색 과정에서 서버 부하를 막을 수 있습니다.
- 페이지 로딩 속도를 향상시킬 수 있습니다.

<br><br><br><br><br><br>

## 프로젝트 설정

### ✅ 1. React + Spring Boot 빌드 구조

```
creationstack/
├── backend/           ← Spring Boot 프로젝트
│   └── target    ← .jar 파일 생성 위치
├── frontend/          ← React 프로젝트
│   └── dist/         ← 정적 리소스(build된 React)

```

<br>

### ✅ 2. React + Spring Boot 빌드 구조

1. React 앱을 build해서 정적 파일로 만듬

2. Spring Boot 프로젝트의 resources/static에 React build 결과물을 넣음

3. Spring Boot 프로젝트를 빌드해서 .jar 생성

4. .jar 파일 실행

<br>

### ✅ 3. 단계별 실행

**[1] React 프로젝트 build**

```
cd frontend
npm run build
```

→ frontend/dist 폴더가 생성됨

<br>

**[2] React 빌드 결과물을 Spring에 넣기**
아래 명령으로 React 결과물을 Spring Boot 프로젝트에 복사하세요:

```
# frontend/build를 backend의 static 폴더로 복사
rm -rf ../backend/src/main/resources/static/*
cp -r dist/* ../backend/src/main/resources/static/
```

<br>

**[3] Spring Boot 프로젝트 빌드 (JAR 만들기)**

```
cd ../backend
./mvn clean package
→ target/ 아래에 .jar 생성됨

```

예시: target/backend-0.0.1-SNAPSHOT.jar

<br>

**[4] JAR 파일 실행**

```
cd target
java -jar backend-0.0.1-SNAPSHOT.jar
```

실행 후 브라우저에서 http://localhost:8080 접속하면 React가 렌더링됩니다.
