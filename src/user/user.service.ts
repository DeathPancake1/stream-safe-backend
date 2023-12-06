import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { User } from '@prisma/client'
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async user(
        userWhereUniqueInput: LoginUserDto
    ): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: userWhereUniqueInput.email
            }
        })
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        //  check using hashed passwords
        const passwordMatches = await bcrypt.compare(userWhereUniqueInput.password,user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid password');
        }
        delete user.password;
        return user;
    }

    async findByEmail(
        email: string
    ): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        delete user.password;
        return user;
    }

    async createUser(data: CreateUserDto): Promise<User> {
        const userCheck = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        })
        if(userCheck){
            throw new UnauthorizedException('User email found');
        }
        //hashing the passwords using bcrypt
        const salt = await bcrypt.genSalt();
        const newPassword = await bcrypt.hash(data.password, salt);
        return this.prisma.user.create({
            data: {
                ...data,
                password: newPassword
            }
        });
    }

    // async updateUser(params: {
    //     where: Prisma.UserWhereUniqueInput;
    //     data: Prisma.UserUpdateInput;
    // }): Promise<User> {
    //     const { where, data } = params;
    //     return this.prisma.user.update({
    //       data,
    //       where,
    //     });
    // }

    // async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    //     return this.prisma.user.delete({
    //       where,
    //     });
    // }
}
