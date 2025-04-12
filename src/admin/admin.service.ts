import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminService {

 constructor(
   private readonly userService: UserService,
   private readonly prisma: PrismaService, 

  ){}

  async deleteUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      return 'User not found';
    } else {
      console.log(`Deleting user with ID ${userId}`);
      return await this.prisma.users.delete({
        where: {
          id: userId,
        },
      });
    }
  }
  async getAllUsers() {
    return await this.prisma.users.findMany({
      where: {
        role: 'USER',
      },
    });
  }
  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

 

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  async updateUser(userId:number, data:any){
    const user = await this.userService.findOne(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      return 'User not found';
    } else {
      console.log(`Updating user with ID ${userId}`);
      const hashedPassword = await hash(data.password);
      return await this.prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          ...data,
          password: hashedPassword,
        },
      });
    }
  }
}
