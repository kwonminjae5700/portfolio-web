import {
  Article,
  ArticleListResponse,
  Category,
  Comment,
  CommentListResponse,
  CreateArticleRequest,
  CreateCategoryRequest,
  CreateCommentRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateArticleRequest,
  UpdateCategoryRequest,
  UpdateCommentRequest,
  User,
} from "@/types/api";
import { API_BASE_URL, PAGINATION } from "./constants";

const TOKEN_KEY = "token";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "요청 실패" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth API
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/auth/profile");
  }

  // Articles API
  async getArticles(
    lastId?: number,
    limit: number = PAGINATION.DEFAULT_LIMIT
  ): Promise<ArticleListResponse> {
    const params = new URLSearchParams();
    if (lastId) params.append("last_id", lastId.toString());
    params.append("limit", limit.toString());

    return this.request<ArticleListResponse>(`/articles?${params.toString()}`);
  }

  async getArticle(id: number): Promise<Article> {
    return this.request<Article>(`/articles/${id}`);
  }

  async createArticle(data: CreateArticleRequest): Promise<Article> {
    return this.request<Article>("/articles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: number, data: UpdateArticleRequest): Promise<Article> {
    return this.request<Article>(`/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: number): Promise<void> {
    return this.request<void>(`/articles/${id}`, {
      method: "DELETE",
    });
  }

  // Categories API
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/categories");
  }

  async getCategory(id: number): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // Comments API
  async getComments(
    articleId: number,
    lastId?: number,
    limit: number = PAGINATION.DEFAULT_LIMIT
  ): Promise<CommentListResponse> {
    const params = new URLSearchParams();
    if (lastId) params.append("last_id", lastId.toString());
    params.append("limit", limit.toString());

    return this.request<CommentListResponse>(
      `/articles/${articleId}/comments?${params.toString()}`
    );
  }

  async createComment(
    articleId: number,
    data: CreateCommentRequest
  ): Promise<Comment> {
    return this.request<Comment>(`/articles/${articleId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateComment(
    articleId: number,
    commentId: number,
    data: UpdateCommentRequest
  ): Promise<Comment> {
    return this.request<Comment>(
      `/articles/${articleId}/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteComment(articleId: number, commentId: number): Promise<void> {
    return this.request<void>(`/articles/${articleId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
