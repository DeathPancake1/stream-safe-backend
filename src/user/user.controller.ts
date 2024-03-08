import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards,Req, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ExchangedKey as ExchangedKeysModel, User as UserModel } from '@prisma/client';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { SearchUserDto } from './dto/search-user.dto';
import { receiveOTPDTO } from './dto/receive-otp.dto';

// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    // Added guard for JWT check
    @Post('findEmail')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(ApiKeyAuthGruard)
    @UseGuards(JWTAuthGuard)    
    @ApiOperation({ summary: 'Find user by email' })
    @ApiResponse({ status: 201, description: 'The user is found.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: FindUserDto,
        description: 'Json structure for user object',
    })
    async findUser(
        @Body() userData: FindUserDto,
    ): Promise<UserModel> {
        return this.userService.findByEmail(userData.email)
    }


    @Post('searchUser')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(ApiKeyAuthGruard)
    @UseGuards(JWTAuthGuard)
    @ApiOperation({ summary: 'search for another user by email excluding his self email' })
    @ApiResponse({ status: 201, description: 'The user is found.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: SearchUserDto,
        description: 'Json structure for user object',
    })
    async searchUser(
        @Body() userData: SearchUserDto,
        @Req() req:any,
    ): Promise<UserModel[]> {
        const userEmailFromToken = req['userEmail'];
        return this.userService.searchByEmail(userData.email,userEmailFromToken)
    }


    @Post('sendVerMail')
    @UseGuards(ApiKeyAuthGruard)
    @ApiOperation({ summary: 'Send verification mail. Take the email,checks if it is present then send him verification code on the email' })
    @ApiResponse({ status: 201, description: 'The user is found.'})
    @ApiResponse({ status: 401, description: 'User not found.' })
    @ApiBody({
        // msh m7tagin new dto
        type: SearchUserDto,
        description: 'Json structure for user object',
    })
    async sendVerMail(
        @Body() userData: SearchUserDto,
    ){
        try{
            this.userService.findByEmail(userData.email)
        }
        catch(error){
            throw new HttpException(error.message , HttpStatus.FORBIDDEN);
        }
        try{
            this.userService.sendVerMail(userData.email)
        }
        catch(error){
            throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
        }
    }


    @Post('receiveOTP')
    @UseGuards(ApiKeyAuthGruard)
    @ApiOperation({ summary: 'receieve the otp from the user and check if the otp is right and not expired' })
    @ApiResponse({ status: 201, description: 'The user is found.'})
    @ApiResponse({ status: 401, description: 'User not found.' })
    @ApiBody({
        // msh m7tagin new dto
        type: receiveOTPDTO,
        description: 'email and OTP',
    })
    async receiveOTP(
        @Body() data: receiveOTPDTO,
    ){
        try{
            return this.userService.receiveOTP(data)
        }
        catch(error){
            throw new HttpException(error.message , HttpStatus.FORBIDDEN);
        }
    }
}
