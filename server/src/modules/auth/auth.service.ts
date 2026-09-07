import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserModel, IUser } from '../users/user.model';
import { RegisterInput, LoginInput, AuthResult } from './auth.types';
import { ConflictError, UnauthorizedError } from '../../common/errors/AppError';
import { JwtPayload } from '../../common/middleware/auth.middleware';

export class AuthService {
  public generateToken(user: IUser): string {
    const payload: JwtPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any
    });
  }

  public async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await UserModel.findOne({ email: input.email });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role
    });

    const accessToken = this.generateToken(user);

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken
    };
  }

  public async login(input: LoginInput): Promise<AuthResult> {
    const user = await UserModel.findOne({ email: input.email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = this.generateToken(user);

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken
    };
  }
}

export const authService = new AuthService();
