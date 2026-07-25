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

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = await this.jwtService.signAsync(payload);

  return {
    message: 'Login successful',
    accessToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
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

