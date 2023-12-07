import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/helpers/database/prisma.service';

@Injectable()
export class DeviceService {
    constructor(private prisma: PrismaService) {}

    private async generateRandHex () {
        const randBytes = await crypto.randomBytes(32);
        return randBytes.toString('hex');
    }

    private isMoreThanOneMonthAgo(lastUpdateDate: Date, currentDateTime: Date){
        const timeDifference = currentDateTime.getTime() - lastUpdateDate.getTime();

        // Calculate the number of milliseconds in a month (30 days approximation)
        const millisecondsInMonth = 30 * 24 * 60 * 60 * 1000;

        // Check if the time difference is greater than one month
        return timeDifference > millisecondsInMonth;
    }

    async generateRandId(email: string, publicKey: string): Promise<string>{
        let exists = true
        let randHex
        const currentDateTime = new Date();
        while(exists){
            randHex = await this.generateRandHex()
            const user = await this.prisma.user.findUnique({
                where: {
                    deviceId: randHex
                }
            })
            exists = user? true: false
        }
        const oldUser = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        })
        let shouldUpdate: boolean = true
        if(oldUser.deviceIdLastUpdate){
            shouldUpdate = this.isMoreThanOneMonthAgo(oldUser.deviceIdLastUpdate, currentDateTime)
        }
        if(shouldUpdate){
            const updatedUser = await this.prisma.user.update({
                where: {
                    email: email
                },
                data: {
                    publicKey: publicKey,
                    deviceId: randHex,
                    deviceIdLastUpdate: currentDateTime
                },
            })
            return randHex
        }
        else{
            throw new UnauthorizedException('Device updated less than a month ago');
        }
    }
}
