import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponse, AuthenticatedUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionAuthGuard } from './session-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() input: RegisterDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    const user = await this.authService.register(input);
    await this.startSession(request, user);
    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: LoginDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    const user = await this.authService.login(input);
    await this.startSession(request, user);
    return { user };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async me(@Req() request: Request): Promise<AuthResponse> {
    const user = await this.authService.getById(request.session.userId!);
    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    response.clearCookie('uniswap.sid', {
      httpOnly: true,
      path: '/',
    });
  }

  private async startSession(
    request: Request,
    user: AuthenticatedUser,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      request.session.regenerate((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    request.session.userId = user.id;

    await new Promise<void>((resolve, reject) => {
      request.session.save((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}
