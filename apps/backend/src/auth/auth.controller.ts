import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, IsNotEmpty, Length } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsService } from './permissions.service';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class PosLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 6)
  pin: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Get('pos-users')
  async getPosUsers() {
    return this.authService.getPosUsers();
  }

  @Post('pos-login')
  async posLogin(@Body() dto: PosLoginDto) {
    return this.authService.posLogin(dto.username, dto.pin);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: any) {
    const permissions = await this.permissionsService.getForRole(req.user.role);
    return {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      permissions,
    };
  }
}
