import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { env } from '../../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export class AuthController {
  public register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);

    return ApiResponse.created(res, result, 'User registered successfully');
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);

    return ApiResponse.success(res, result, 'Logged in successfully');
  });

  public logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return ApiResponse.success(res, null, 'Logged out successfully');
  });

  public getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    return ApiResponse.success(res, user, 'Current user retrieved');
  });
}

export const authController = new AuthController();
