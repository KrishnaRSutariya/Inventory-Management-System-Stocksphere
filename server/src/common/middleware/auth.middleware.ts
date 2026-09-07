import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { UserRole } from '../constants/roles';
import { UserModel, IUser } from '../../modules/users/user.model';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userToken?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check HTTP-Only Cookie
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // 2. Check Authorization Header Bearer fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please login.');
    }

    // 3. Verify Token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Session expired. Please login again.');
      }
      throw new UnauthorizedError('Invalid authentication token.');
    }

    // 4. Fetch User from DB to ensure account still exists and hasn't been removed
    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user) {
      throw new UnauthorizedError('User account associated with token no longer exists.');
    }

    req.user = user;
    req.userToken = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Access denied. Allowed roles: ${allowedRoles.join(', ')}`)
      );
    }

    next();
  };
};
