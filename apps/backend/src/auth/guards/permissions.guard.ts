import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';
import { AclModule } from '../entities/role-permission.entity';
import { PermissionsService } from '../permissions.service';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Usage: @RequirePermission(AclModule.PRODUCTS, 'canEdit')
 */
export const RequirePermission = (
  module: AclModule,
  action: 'canRead' | 'canCreate' | 'canEdit' | 'canDelete',
) => SetMetadata(PERMISSIONS_KEY, { module, action });

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<{
      module: AclModule;
      action: string;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // No permission requirement = allow
    if (!requirement) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Not authenticated');

    // ADMIN bypass
    if (user.role === UserRole.ADMIN) return true;

    const allowed = await this.permissionsService.checkPermission(
      user.role,
      requirement.module,
      requirement.action as any,
    );

    if (!allowed) {
      throw new ForbiddenException(
        `Bạn không có quyền ${requirement.action} cho module ${requirement.module}`,
      );
    }

    return true;
  }
}
