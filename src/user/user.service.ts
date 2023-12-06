import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { User, Prisma} from '@prisma/client'
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

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

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        //hashing the passwords using bcrypt
        const salt = await bcrypt.genSalt();
        data.password = await bcrypt.hash(data.password, salt);
        return this.prisma.user.create({
          data,
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
