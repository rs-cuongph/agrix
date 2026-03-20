import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RolesGuard, Roles } from './guards/roles.guard';
import { User, UserRole } from './entities/user.entity';
import { AclModule } from './entities/role-permission.entity';
import { PermissionsService } from './permissions.service';

interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  role: string;
}

@Controller('admin-users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get()
  async findAll() {
    const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
    return users.map(({ passwordHash, ...rest }) => rest);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role as UserRole,
    });
    const saved = await this.userRepo.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { fullName?: string; role?: string; isActive?: boolean; password?: string }) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error(`User ${id} not found`);
    if (body.fullName !== undefined) user.fullName = body.fullName;
    if (body.role !== undefined) user.role = body.role as UserRole;
    if (body.isActive !== undefined) user.isActive = body.isActive;
    if (body.password) user.passwordHash = await bcrypt.hash(body.password, 10);
    await this.userRepo.save(user);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Put(':id/password')
  async resetPassword(@Param('id') id: string, @Body() body: { password: string }) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error(`User ${id} not found`);
    user.passwordHash = await bcrypt.hash(body.password, 10);
    await this.userRepo.save(user);
    return { success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error(`User ${id} not found`);
    user.isActive = false;
    await this.userRepo.save(user);
    return { deactivated: true };
  }

  // --- Permissions ---

  @Get('permissions')
  async getPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Put('permissions/:role')
  async updatePermission(
    @Param('role') role: string,
    @Body() body: { module: string; canRead?: boolean; canCreate?: boolean; canEdit?: boolean; canDelete?: boolean },
  ) {
    return this.permissionsService.updatePermissions(
      role as UserRole,
      body.module as AclModule,
      { canRead: body.canRead, canCreate: body.canCreate, canEdit: body.canEdit, canDelete: body.canDelete },
    );
  }
}
