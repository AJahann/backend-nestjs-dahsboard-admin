// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { SetMetadata } from '@nestjs/common';

// export const SUPER_ADMIN = 'super_admin';
// export const SuperAdmin = () => SetMetadata(SUPER_ADMIN, true);

// @Injectable()
// export class SuperAdminGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const isSuperAdmin = this.reflector.get<boolean>('super_admin', context.getHandler());

//     if (!isSuperAdmin) return true;

//     const request = context.switchToHttp().getRequest();
//     return request.user?.role === 'SUPER_ADMIN';
//   }
// }

import {
  CanActivate,
  ExecutionContext,
  Global,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Global()
@Injectable()
export class SuperAdminJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.admin.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user?.isActive || user.role !== 'SUPER_ADMIN') {
        throw new UnauthorizedException('Invalid or expired token');
      }

      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
