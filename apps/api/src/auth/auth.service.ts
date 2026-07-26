import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
 
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(
      payload,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }



  async register(registerDto: RegisterDto) {

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
  } = registerDto;

  const existingEmail = await this.prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingEmail) {
    throw new ConflictException('Email already exists');
  }

  const existingPhone = await this.prisma.user.findUnique({
    where: {
      phone,
    },
  });

  if (existingPhone) {
    throw new ConflictException('Phone number already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await this.prisma.user.create({
   data: {
     firstName,
     lastName,
     email,
     phone,
     passwordHash,
     role,
   },
 });

  return {
   message: 'User registered successfully',
   user: {
     id: user.id,
     firstName: user.firstName,
     lastName: user.lastName,
     email: user.email,
     phone: user.phone,
     role: user.role,
     createdAt: user.createdAt,
  },
 };
}
async login(loginDto: LoginDto) {
  const { email, password } = loginDto;

  const user = await this.prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const {
    accessToken,
    refreshToken,
  } = await this.generateTokens(
    user.id,
    user.email,
    user.role,
  );


  const refreshTokenHash = await bcrypt.hash(
    refreshToken,
    10,
  );

  await this.prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshTokenHash,
    },
  });


  return {
    message: 'Login successful',

    accessToken,

    refreshToken,

    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
 }

async refresh(refreshTokenDto: RefreshTokenDto) {
  const { refreshToken } = refreshTokenDto;

  let payload: any;

  try {
    payload = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );
  } catch {
    throw new UnauthorizedException(
      'Invalid refresh token',
    );
  }

  const user = await this.prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
  });

  if (
    !user ||
    !user.refreshTokenHash
  ) {
    throw new UnauthorizedException(
      'Refresh token invalid',
    );
  }

  const matches = await bcrypt.compare(
    refreshToken,
    user.refreshTokenHash,
  );

  if (!matches) {
    throw new UnauthorizedException(
      'Refresh token invalid',
    );
  }

  const tokens = await this.generateTokens(
    user.id,
    user.email,
    user.role,
  );

  const refreshTokenHash = await bcrypt.hash(
    tokens.refreshToken,
    10,
  );

  await this.prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshTokenHash,
    },
  });

  return {
    message: 'Tokens refreshed',
    ...tokens,
  };
}

async logout(userId: string) {
  await this.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshTokenHash: null,
    },
  });

  return {
    message: 'Logged out successfully',
  };
}

async me(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}
}

