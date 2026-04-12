import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { UserRole } from './user.entity';

export enum AclModule {
  PRODUCTS = 'products',
  ORDERS = 'orders',
  CUSTOMERS = 'customers',
  BLOG = 'blog',
  SETTINGS = 'settings',
  UNITS = 'units',
}

@Entity('role_permissions')
@Unique(['role', 'module'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: AclModule })
  module: AclModule;

  @Column({ name: 'can_read', default: true })
  canRead: boolean;

  @Column({ name: 'can_create', default: false })
  canCreate: boolean;

  @Column({ name: 'can_edit', default: false })
  canEdit: boolean;

  @Column({ name: 'can_delete', default: false })
  canDelete: boolean;
}
