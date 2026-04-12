import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async getPosUsers() {
    const users = await this.userRepository.find({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.CASHIER }],
      select: ['id', 'username', 'fullName', 'role', 'isActive'],
    });
    return users.filter((u) => u.isActive);
  }

  async posLogin(username: string, pin: string) {
    const now = new Date();

    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (
      !user ||
      ![UserRole.ADMIN, UserRole.CASHIER].includes(user.role) ||
      !user.isActive
    ) {
      throw new UnauthorizedException('Tài khoản không hợp lệ');
    }

    if (user.pinLockedUntil && user.pinLockedUntil > now) {
      const minutesLeft = Math.ceil(
        (user.pinLockedUntil.getTime() - now.getTime()) / 60000,
      );
      throw new ForbiddenException(
        `Tài khoản bị khoá tạm thời. Thử lại sau ${minutesLeft} phút.`,
      );
    }

    if (user.posPin !== pin) {
      const attempts = (user.pinFailedAttempts || 0) + 1;
      const update: Partial<User> = { pinFailedAttempts: attempts };
      if (attempts >= 5) {
        update.pinLockedUntil = new Date(Date.now() + 5 * 60 * 1000); // lock 5 mins
        update.pinFailedAttempts = 0;
      }
      await this.userRepository.update(user.id, update);
      throw new UnauthorizedException('Mã PIN không đúng');
    }

    // Reset failed attempts on success
    await this.userRepository.update(user.id, {
      pinFailedAttempts: 0,
      pinLockedUntil: null,
    });

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      isPosSession: true,
    };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '16h' }),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async createUser(
    username: string,
    password: string,
    fullName: string,
    role: string,
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      passwordHash,
      fullName,
      role: role as any,
    });
    return this.userRepository.save(user);
  }
}
