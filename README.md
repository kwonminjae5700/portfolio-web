# D2 Blog - Naver D2 스타일 블로그

Next.js 풀스택으로 구현한 Naver D2 스타일의 개발 블로그입니다. 커서 기반 무한 스크롤, 마크다운 지원, SEO 최적화 등의 기능을 포함하고 있습니다.

## 🚀 주요 기능

- **Naver D2 스타일 UI**: 헤더 검색, 카테고리 필터, 카드 레이아웃
- **커서 기반 무한 스크롤**: 페이지 기반에서 무한 스크롤로 변경
- **검색 및 필터링**: 게시글 제목, 내용, 태그 검색 및 카테고리 필터
- **정렬 기능**: 최신순, 인기순, 트렌딩순 정렬
- **마크다운 지원**: 게시글 작성/읽기 시 마크다운 렌더링
- **SEO 최적화**: Server-Side Rendering (SSR) 지원
- **반응형 디자인**: 모바일/태블릿/데스크톱 대응

## 📋 기술 스택

- **프레임워크**: Next.js 16 (App Router, TypeScript)
- **스타일**: Tailwind CSS
- **데이터베이스**: MySQL + Prisma ORM
- **마크다운**: react-markdown, remark-gfm
- **마크다운 에디터**: @uiw/react-markdown-editor
- **무한 스크롤**: react-intersection-observer

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── (main)/
│   │   └── blog/[id]/page.tsx          # 게시글 상세 페이지
│   ├── api/posts/route.ts              # POST API (CRUD, 검색, 정렬)
│   ├── layout.tsx                      # Root 레이아웃
│   ├── page.tsx                        # 메인 홈페이지
│   └── globals.css                     # 글로벌 스타일
├── components/
│   ├── blog/
│   │   ├── PostCard.tsx                # 게시글 카드 컴포넌트
│   │   └── PostList.tsx                # 무한 스크롤 로직
│   └── common/
│       └── Header.tsx                  # 헤더 (검색, 카테고리, 글쓰기)
├── lib/
│   └── prisma.ts                       # Prisma 클라이언트 싱글톤
└── types/
    └── post.ts                         # TypeScript 타입 정의
```

## 🛠️ 설치 및 실행

### 1. 환경 설정

```bash
# MySQL 설정
# .env 파일 생성
DATABASE_URL="mysql://root:password@localhost:3306/portfolio_blog"
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Prisma 마이그레이션

```bash
# 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어보세요.

## 📝 API 엔드포인트

### POST 조회 (GET /api/posts)

쿼리 파라미터:
- `cursor`: 마지막 post id (커서 기반 페이징)
- `category`: 카테고리 필터 (예: 'Technology', 'Design')
- `search`: 검색어 (제목, 내용, 태그 검색)
- `sort`: 정렬 기준 ('latest', 'popular', 'trending')

응답:
```json
{
  "posts": [
    {
      "id": 1,
      "title": "게시글 제목",
      "content": "마크다운 내용",
      "category": "Technology",
      "tags": "react,typescript",
      "viewCount": 100,
      "likes": 10,
      "createdAt": "2025-12-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    }
  ],
  "nextCursor": 2,
  "hasMore": true
}
```

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
- Naver D2 스타일의 헤더, 검색, 카테고리 네비게이션
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

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Next.js | 16.0.6 | 풀스택 프레임워크 |
| React | 19 | UI 라이브러리 |
| TypeScript | 5 | 타입 안정성 |
| Tailwind CSS | 3 | 스타일링 |
| Prisma | 7.0.1 | ORM |
| react-markdown | 9 | 마크다운 렌더링 |
| react-intersection-observer | 9 | 무한 스크롤 감지 |

## 📄 라이센스

MIT

## 🤝 기여

버그 리포트 및 기능 제안은 Issues를 통해 부탁드립니다.
