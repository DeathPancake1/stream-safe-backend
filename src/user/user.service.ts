import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { ExchangedKeys, User } from '@prisma/client'
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from './dto/find-user.dto';

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
        delete user.deviceId;
        delete user.deviceIdLastUpdate
        delete user.photoId
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
        delete user.deviceId;
        delete user.deviceIdLastUpdate
        delete user.photoId
        return user;
    }

    async searchByEmail(
        email: string,
        userEmailFromToken: string
    ): Promise<User[] | null> {
        const users = await this.prisma.user.findMany({
            where: {
                AND:[
                    {
                        email:{
                            contains: email,
                        },
                    },
                    {
                        email:{
                            not:userEmailFromToken
                        }
                    }
                ]
                
            }
        })
        if (users.length==0) {
            throw new UnauthorizedException('User not found');
        }
        for(let i = 0; i < users.length;i++){
            // it doesnt output these properties
            delete users[i].password;
            delete users[i].deviceId;
            delete users[i].deviceIdLastUpdate
            delete users[i].photoId
        } 
        return users;
    }

    async createUser(data: CreateUserDto): Promise<string> {
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
        const newUser = await this.prisma.user.create({
            data: {
                ...data,
                password: newPassword
            }
        });
        const email = newUser.email
        return email
    }
    async exchangeSymmetricKey(user1Email: string, user2Email: string, key: string): Promise<Boolean>{
        const user1 = await this.prisma.user.findUnique({
            where: {
                email: user1Email
            }
        })
        const user2 = await this.prisma.user.findUnique({
            where: {
                email: user2Email
            }
        })
        if (!user1 || !user2) {
            throw new UnauthorizedException('User not found');
        }
        await this.prisma.exchangedKeys.create({
            data: {
                user1Email: user1Email,
                user2Email: user2Email,
                key: key,
                seen: false
            }
        })
        return true;
    }
    async receiverSeen(
            userEmail: string
        ): Promise<ExchangedKeys[]>{
        const keys = await this.prisma.exchangedKeys.findMany({
            where:{
                user2Email: userEmail,
                seen:false
            }
        })
        await this.prisma.exchangedKeys.updateMany({
            where:{
                user2Email: userEmail,
                seen:false
            },
            data:{
                seen:true
            }
        })
        if(keys.length==0){
            throw new UnauthorizedException('No new keys found');
        }
        return keys
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
