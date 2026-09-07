export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export const ROLES = [UserRole.ADMIN, UserRole.USER] as const;
