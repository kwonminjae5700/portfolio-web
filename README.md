## 📌 프로젝트 소개

Next.js와 TypeScript로 구현한 Naver D2 스타일의 개발 블로그입니다. 커서 기반 무한 스크롤, 마크다운 지원, SEO 최적화 등의 기능을 포함하고 있습니다.

- **개발 기간**: 2024.12.XX ~ 2024.12.18
- **개발 인원**: 1인 (개인 프로젝트)

---

## 🔍 개선 사항

### 기존 코드의 문제점

| 문제점                         | 개선 방법                             |
| ------------------------------ | ------------------------------------- |
| 페이지 기반 페이징의 성능 저하 | 커서 기반 무한 스크롤로 개선          |
| 단순 콘텐츠 렌더링             | 마크다운 지원으로 풍부한 콘텐츠 표현  |
| SEO 미지원                     | Next.js SSR을 활용한 메타 태그 최적화 |

### 개선 결과

**[개선 1: 커서 기반 무한 스크롤]**

- **개선 전**: 페이지 기반 페이징으로 인한 성능 저하
- **개선 후**: 커서 기반 무한 스크롤로 필요한 데이터만 로드, UX 향상

**[개선 2: 마크다운 지원]**

- **개선 전**: 평문 콘텐츠만 제공
- **개선 후**: react-markdown과 remark-gfm을 활용한 풍부한 콘텐츠 렌더링 및 구문 강조

**[개선 3: SEO 최적화]**

- **개선 전**: CSR으로 인한 SEO 미지원
- **개선 후**: Next.js SSR과 메타 태그를 활용한 검색 엔진 최적화

---

## ✨ 주요 기능

### 1. 게시글 관리

- 게시글 목록 조회 (커서 기반 무한 스크롤)
- 게시글 작성 / 수정 / 삭제 (마크다운 에디터)
- 마크다운 렌더링 (코드 구문 강조 포함)

### 2. 검색 및 필터

- 제목, 내용, 태그 기반 검색
- 카테고리별 필터링
- 최신순, 인기순, 트렌딩순 정렬

### 3. 댓글 기능

- 댓글 CRUD
- 계층형 댓글 구조

### 4. 사용자 인증

- 회원가입 / 로그인 / 로그아웃
- JWT 토큰 기반 인증

---

## 🛠️ 기술 스택

### Frontend

- **프레임워크**: Next.js 16 (App Router, TypeScript)
- **스타일**: Tailwind CSS 4
- **마크다운**: react-markdown, remark-gfm, react-syntax-highlighter
- **아이콘**: @tabler/icons-react
- **타입**: TypeScript 5

### Deployment

- **Frontend**: Vercel / Netlify

---

## 📂 프로젝트 구조

```
src/
├── app/
│   ├── globals.css                     # 글로벌 스타일
│   ├── layout.tsx                      # Root 레이아웃
│   ├── page.tsx                        # 메인 홈페이지
│   ├── categories/                     # 카테고리 페이지
│   ├── post/
│   │   └── [id]/page.tsx               # 게시글 상세 페이지
│   ├── write/                          # 게시글 작성 페이지
│   ├── edit/                           # 게시글 수정 페이지
│   ├── login/                          # 로그인 페이지
│   ├── register/                       # 회원가입 페이지
│   └── profile/                        # 프로필 페이지
├── components/
│   ├── ArticleList.tsx                 # 게시글 목록
│   ├── CategoryList.tsx                # 카테고리 필터
│   ├── TopContent.tsx                  # 상단 콘텐츠
│   ├── post/                           # 게시글 관련 컴포넌트
│   │   ├── PostEditor.tsx              # 마크다운 에디터
│   │   ├── PostContent.tsx             # 게시글 내용
│   │   ├── PostHeader.tsx              # 게시글 헤더
│   │   ├── PostComments.tsx            # 게시글 댓글
│   │   ├── ViewCounter.tsx             # 조회수 카운터
│   │   └── markdownComponents.tsx      # 마크다운 커스텀 컴포넌트
│   ├── comments/                       # 댓글 관련 컴포넌트
│   │   ├── CommentForm.tsx
│   │   ├── CommentItem.tsx
│   │   └── CommentSection.tsx
│   ├── ui/                             # UI 공용 컴포넌트
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── EmptyState.tsx
│   └── shared/                         # 공용 레이아웃
│       ├── Header.tsx
│       └── Footer.tsx
├── hooks/
│   ├── useArticles.ts                  # 게시글 fetch 훅
│   ├── useInfiniteScroll.ts            # 무한 스크롤 훅
│   └── index.ts
├── lib/
│   ├── api.ts                          # API 요청 함수
│   ├── utils.ts                        # 유틸리티 함수
│   └── constants.ts                    # 상수 정의
├── contexts/
│   └── AuthContext.tsx                 # 인증 컨텍스트
├── types/
│   └── api.ts                          # TypeScript 타입 정의
└── data/
    └── posts.json                      # 샘플 데이터
```

---

## 💻 로컬 실행 방법

### 1. 레포지토리 클론

```bash
git clone https://github.com/your-username/portfolio-web.git
cd portfolio-web
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 설정 (.env.local 파일 생성)

```bash
# API 서버 URL 설정
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어보세요.

### 5. 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## 🔗 API 명세

### 게시글

| Method | Endpoint                                | Description                  |
| ------ | --------------------------------------- | ---------------------------- |
| GET    | `/api/articles?lastId={id}&size={size}` | 게시글 목록 조회 (커서 기반) |
| GET    | `/api/articles/{id}`                    | 게시글 상세 조회             |
| POST   | `/api/articles`                         | 게시글 작성                  |
| PUT    | `/api/articles/{id}`                    | 게시글 수정                  |
| DELETE | `/api/articles/{id}`                    | 게시글 삭제                  |

### 댓글

| Method | Endpoint                             | Description    |
| ------ | ------------------------------------ | -------------- |
| GET    | `/api/articles/{articleId}/comments` | 댓글 목록 조회 |
| POST   | `/api/comments`                      | 댓글 작성      |
| DELETE | `/api/comments/{id}`                 | 댓글 삭제      |

### 사용자 인증

| Method | Endpoint           | Description |
| ------ | ------------------ | ----------- |
| POST   | `/api/auth/signup` | 회원가입    |
| POST   | `/api/auth/login`  | 로그인      |
| POST   | `/api/auth/logout` | 로그아웃    |

---

## 📦 주요 의존성

| 패키지                   | 버전    | 용도                 |
| ------------------------ | ------- | -------------------- |
| next                     | 16.0.10 | React 프레임워크     |
| react                    | 19.2.0  | UI 라이브러리        |
| tailwindcss              | 4       | 스타일링             |
| react-markdown           | 10.1.0  | 마크다운 렌더링      |
| remark-gfm               | 4.0.1   | GitHub 마크다운 확장 |
| react-syntax-highlighter | 16.1.0  | 코드 구문 강조       |

### 게시글 생성 (POST /api/posts)

요청:

```json
{
  "title": "새 게시글",
  "content": "# 마크다운 내용",
  "category": "Technology",
  "tags": "react,typescript",
  "summary": "요약 (선택사항)"
}
```

## 🎨 주요 페이지

### 홈페이지 (/)

- 게시글 카드 그리드 레이아웃
- 무한 스크롤 기능

### 게시글 상세 (/blog/[id])

- 마크다운 렌더링
- 조회수, 좋아요, 태그 표시
- SEO 메타데이터

### 글 작성 (/write)

- 마크다운 에디터
- 카테고리, 태그 선택
- 서버에 저장

## 🔧 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📦 주요 라이브러리

| 라이브러리                  | 버전   | 용도              |
| --------------------------- | ------ | ----------------- |
| Next.js                     | 16.0.6 | 풀스택 프레임워크 |
| React                       | 19     | UI 라이브러리     |
| TypeScript                  | 5      | 타입 안정성       |
| Tailwind CSS                | 3      | 스타일링          |
| Prisma                      | 7.0.1  | ORM               |
| react-markdown              | 9      | 마크다운 렌더링   |
| react-intersection-observer | 9      | 무한 스크롤 감지  |

## 📄 라이센스

MIT

## 🤝 기여

버그 리포트 및 기능 제안은 Issues를 통해 부탁드립니다.
