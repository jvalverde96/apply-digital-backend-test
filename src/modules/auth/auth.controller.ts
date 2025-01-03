import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({
    description: 'User login credentials.',
    type: Object,
  })
  async login(@Body() user: { email: string; password: string }) {
    return this.authService.login(user);
  }
}
