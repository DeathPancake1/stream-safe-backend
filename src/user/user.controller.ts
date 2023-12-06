import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    // Added guard for JWT check
    @UseGuards(JWTAuthGuard)
    @Post('findEmail')
    @ApiOperation({ summary: 'Find user by email' })
    @ApiResponse({ status: 201, description: 'The user is found.'})
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiBody({
        type: FindUserDto,
        description: 'Json structure for user object',
    })
    async findUser(
        @Body() userData: FindUserDto,
    ): Promise<UserModel> {
        return this.userService.findByEmail(userData.email)
    }
}
