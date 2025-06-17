import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN = 'super_admin';
export const SuperAdmin = () => SetMetadata(SUPER_ADMIN, true);

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSuperAdmin = this.reflector.get<boolean>('super_admin', context.getHandler());

    if (!isSuperAdmin) return true;

    const request = context.switchToHttp().getRequest();
    return request.user?.role === 'SUPER_ADMIN';
  }
}
