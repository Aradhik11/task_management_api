import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
  body: any;
  params: any;
  query: any;
  headers: any;
}

export interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export interface TaskAttributes {
  id?: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  userId: number;
  timeSpent?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
}