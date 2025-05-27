import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { UserAttributes } from '../types';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: { id: number; email: string; role: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  
  return jwt.sign(payload, secret, options);
}

  static async createUser(userData: Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    return User.create({
      ...userData,
      password: hashedPassword,
    });
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    if (!user) return null;

    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) return null;

    return user;
  }
}