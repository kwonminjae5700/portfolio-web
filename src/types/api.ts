// API 응답 및 요청 타입 정의

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_name: string;
  view_count: number;
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface ArticleListResponse {
  articles: Article[];
  has_more: boolean;
  last_id: number | null;
}

// Auth 관련 요청/응답
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// Article 관련 요청
export interface CreateArticleRequest {
  title: string;
  content: string;
  category_ids?: number[];
}

export interface UpdateArticleRequest {
  title: string;
  content: string;
  category_ids?: number[];
}

// Category 관련 요청
export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

// API 에러 응답
export interface ApiError {
  message: string;
  status: number;
}
