import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import {  OTPType, User } from '@prisma/client'
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import * as nodemailer from 'nodemailer';
import {randomInt} from "crypto";
import {HTMLMaker} from "../helpers/email/email-template"
import { receiveOTPDTO } from './dto/receive-otp.dto';

@Injectable()
export class UserService {

    private transporter
    constructor(private prisma: PrismaService) {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: 'stream6safe9@gmail.com',
              pass: 'jnbu fojf opne fepo',
            },
          });
    }
    
    async user(
        userWhereUniqueInput: LoginUserDto
    ): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: userWhereUniqueInput.email
            }
        })
        if (!user || !user.verified) {
            throw new UnauthorizedException('User not found or not verified');
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
            throw new HttpException("USER NOT FOUND" , HttpStatus.FORBIDDEN);
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
                    },
                    {
                        publicKey: {
                            not: null
                        }
                    }
                ]
                
            }
        })
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
        if(userCheck && userCheck.verified){
            throw new UnauthorizedException('User email found');
        }
        else if(userCheck && !userCheck.verified){
            await this.prisma.user.delete({
                where: {
                    email: data.email
                }
            })
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
    async sendVerMail(email:string, type:string){
        try{
            const found = await this.findByEmail(email)
        }catch(error){
            throw new HttpException(error.message , HttpStatus.FORBIDDEN);
        }
        const user = await this.prisma.oTP.findUnique({
            where:{
                email: email
            }
        })
        if(user){
            await this.prisma.oTP.delete({
                where:{
                    email: email
                }
            })
        }
        const code = randomInt(999999)
        var codeStr = code.toString();
        while (codeStr.length<6){
            codeStr = "0"+ codeStr
        }

        const subject = 'Email verification'
        const text = HTMLMaker(codeStr)
        const mailOptions = {
            from: 'stream6safe9@gmail.com',
            to: email,
            subject,
            html:text
          };
        await this.transporter.sendMail(mailOptions);
        if(type == "VERIFYEMAIL"){
            await this.prisma.oTP.create({
                data:{
                    email: email,
                    otp: codeStr,
                    type: OTPType.VERIFYEMAIL,
                }
            })
        }
        else if(type =="FORGETPASSWORD"){
            await this.prisma.oTP.create({
                data:{
                    email: email,
                    otp: codeStr,
                    type: OTPType.FORGETPASSWORD,
                }
            })
        }
    }
    async receiveOTP(data: receiveOTPDTO){
        var typeOfOTP :  OTPType
        if (data.type == "VERIFYEMAIL"){
            typeOfOTP = OTPType.VERIFYEMAIL
        }
        else if(data.type == "FORGETPASSWORD"){
            typeOfOTP = OTPType.FORGETPASSWORD
        }
        const oTPInfo = await this.prisma.oTP.findFirst({
            where:{
                email: data.email,
                type: typeOfOTP,
            }
        })
        if(oTPInfo == null){
            throw new HttpException("couldn't find OTP" , HttpStatus.NOT_FOUND);
        }
        //check the time is 2 minutes
        var diff =(Date.now() - oTPInfo.CreatedAt.getTime()) / 1000;
        diff /= 60;
        if(data.otp != oTPInfo.otp ||  diff > 2){
            return false
        }
        else if(diff<2){
            if(data.type == "FORGETPASSWORD"){
                await this.prisma.user.update({
                    data:{
                        changingPassword: true
                    },
                    where:{
                        email:data.email
                    }
                })
            }
            else if (data.type== "VERIFYEMAIL"){
                await this.prisma.user.update({
                    data:{
                        verified: true
                    },
                    where:{
                        email:data.email
                    }
                })
            }
            return true
        }
    }
    async changePassword(email: string, password: string){
        const salt = await bcrypt.genSalt();
        const newPassword = await bcrypt.hash(password, salt);
        const user = await this.prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(!user.changingPassword){
            throw new HttpException("User didn't verify the email" , HttpStatus.UNAUTHORIZED); 
        }
        const updatedUser = await this.prisma.user.update({
            data: {
                password: newPassword,
                changingPassword: false
            },
            where: {
                email: email,
            }
        })
    }

    async getUserInfoById(id: number) {
        const user = await this.prisma.user.findUnique({
            where:{
                id:id
            },
            select: {
                firstname: true,
                lastname: true,
                photoId: true
              }
        })
        if(user){
            return user
        }
        else{
          throw new HttpException("didnt find this id" , HttpStatus.NOT_FOUND); 
        }
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
