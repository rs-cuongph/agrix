import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { RolePermission } from './entities/role-permission.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminUsersController } from './admin-users.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RolePermission]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '24h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, AdminUsersController],
  providers: [AuthService, PermissionsService, JwtStrategy, RolesGuard, PermissionsGuard],
  exports: [AuthService, PermissionsService, JwtStrategy, RolesGuard, PermissionsGuard, JwtModule],
})
export class AuthModule {}

