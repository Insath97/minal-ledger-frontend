import api, { setAccessToken as _setAccessToken } from "./axios-client";

export const setAccessToken = _setAccessToken;

export interface LoginPayload {
  login: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    auth_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone?: string;
  profile_image?: string;
  user_type: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

/**
 * Login - POST /api/v1/login
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/login", payload);

  if (data.status === "success" && data.data.auth_token) {
    setAccessToken(data.data.auth_token);
  }

  return data;
}

/**
 * Logout - POST /api/v1/logout
 */
export async function logout(): Promise<void> {
  try {
    await api.post("/logout");
  } finally {
    setAccessToken(null);
  }
}

/**
 * Get current user - GET /api/v1/me
 */
export async function getMe(): Promise<ApiResponse<{ user: User }>> {
  const { data } = await api.get<ApiResponse<{ user: User }>>("/me");
  return data;
}

/**
 * Update profile - PUT /api/v1/profile
 */
export async function updateProfile(payload: {
  name?: string;
  email?: string;
  phone?: string;
  current_password?: string;
  password?: string;
  profile_image?: File | null;
}): Promise<ApiResponse<User>> {
  const formData = new FormData();
  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.email !== undefined) formData.append("email", payload.email);
  if (payload.phone !== undefined) formData.append("phone", payload.phone);
  if (payload.current_password !== undefined && payload.current_password !== "") {
    formData.append("current_password", payload.current_password);
  }
  if (payload.password !== undefined && payload.password !== "") {
    formData.append("password", payload.password);
  }
  if (payload.profile_image instanceof File) {
    formData.append("profile_image", payload.profile_image);
  } else if (payload.profile_image === null) {
    formData.append("profile_image", "");
  }

  const { data } = await api.put<ApiResponse<User>>("/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
