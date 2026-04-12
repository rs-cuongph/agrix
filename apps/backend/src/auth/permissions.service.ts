import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission, AclModule } from './entities/role-permission.entity';
import { UserRole } from './entities/user.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly permRepo: Repository<RolePermission>,
  ) {}

  async getForRole(role: UserRole): Promise<RolePermission[]> {
    return this.permRepo.find({ where: { role } });
  }

  async getAllPermissions(): Promise<RolePermission[]> {
    return this.permRepo.find({ order: { role: 'ASC', module: 'ASC' } });
  }

  async checkPermission(
    role: UserRole,
    module: AclModule,
    action: 'canRead' | 'canCreate' | 'canEdit' | 'canDelete',
  ): Promise<boolean> {
    // ADMIN always has full access
    if (role === UserRole.ADMIN) return true;

    const perm = await this.permRepo.findOne({ where: { role, module } });
    return perm ? perm[action] : false;
  }

  async updatePermissions(
    role: UserRole,
    module: AclModule,
    permissions: {
      canRead?: boolean;
      canCreate?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
    },
  ): Promise<RolePermission> {
    let perm = await this.permRepo.findOne({ where: { role, module } });
    if (!perm) {
      perm = this.permRepo.create({ role, module, ...permissions });
    } else {
      Object.assign(perm, permissions);
    }
    return this.permRepo.save(perm);
  }
}
