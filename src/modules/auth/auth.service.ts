import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(userData: { email: string; password: string }) {
    const { email, password } = userData;

    // In another scenario, we would validate credentials against a database or a user management service such as AWS Cognito.
    // For this example, I'm validating against the default user created in the environment file.

    if (email === process.env.USER_EMAIL && password === process.env.PASSWORD) {
      const payload = { email, sub: 1 }; // 'sub' represents the user ID
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
      });
      return { accessToken: token };
    }
  }
}

// {
//   "email": "user@gmail.com",
//   "password": "hello123"
//   }
