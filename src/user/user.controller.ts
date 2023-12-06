import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiBearerAuth()
    @Post('create')
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiBody({
        type: CreateUserDto,
        description: 'Json structure for user object',
    })
    async signupUser(
        @Body() userData: UserModel,
    ): Promise<UserModel> {
        return this.userService.createUser(userData)
    }

    @ApiBearerAuth()
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 201, description: 'The user record has successfully returned.'})
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiBody({
        type: LoginUserDto,
        description: 'Json structure for user login object',
    })
    async login(
        @Body() userData: LoginUserDto,
    ): Promise<UserModel> {
        try{
            const user = this.userService.user(userData)
            return user 
        }
        catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
            }
            throw error
        }
        
    }
}
