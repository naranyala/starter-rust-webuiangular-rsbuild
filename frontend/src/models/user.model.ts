/**
 * User model - domain types for User entity
 * This should be framework-agnostic data structures
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  role?: string;
  status?: string;
}

export interface UserUpdatePayload {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}
