import { Body, Controller, HttpException, HttpStatus, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from '@prisma/client';
import { ApiKeyAuthGruard } from './guard/apikey-auth.guard';

@UseGuards(ApiKeyAuthGruard)
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 201, description: 'The user record has successfully returned.'})
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiBody({
      type: LoginUserDto,
      description: 'Json structure for user login object',
  })
  @Post('login')
  async login(@Body() userData: LoginUserDto,): Promise<{user: {email: string}, token: {accessToken: string}}> {
    try{
      const email = userData.email.toLowerCase()
      const user = await this.authService.validateUser({...userData, email})
      const token = await this.authService.login(user);
      return { 
        user:{
          email: user.email
        },
        token 
      };
    }
    catch(error){
      if(error instanceof UnauthorizedException){
          throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      throw error
    }
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiBody({
      type: CreateUserDto,
      description: 'Json structure for user object',
  })
  @Post('register')
  async register(
    @Body() userData: CreateUserDto,): Promise<string> {
      try{
        const email = userData.email.toLowerCase()
        const user = await this.userService.createUser({...userData, email});
        return user;
      }catch(error){
        if(error instanceof UnauthorizedException){
            throw new HttpException('Invalid inputs', HttpStatus.UNAUTHORIZED);
        }
        throw error
      }
  }
}