import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = await this.jwtService.verifyAsync(token) as { sub: string };
        if (decoded?.sub) {
          req['userEmail'] = decoded.sub;
        }
      } catch (error) {
        // Handle token verification failure (e.g., token expired)
        console.error('Token verification failed:', error);
      }
    }
    next();
  }
}