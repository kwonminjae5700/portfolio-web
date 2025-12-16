# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스코드 복사
COPY . .

# 환경변수 설정 (빌드 시점)
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ADMIN_EMAIL=${NEXT_PUBLIC_ADMIN_EMAIL}

# Next.js 빌드
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# 프로덕션에 필요한 패키지만 설치
COPY package*.json ./
RUN npm ci --only=production

# builder 스테이지에서 빌드된 .next 폴더 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 포트 노출
EXPOSE 3000

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 서버 실행
CMD ["npm", "start"]
