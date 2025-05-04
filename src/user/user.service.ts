import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { Baccalaureate, BaccalaureateType, PersonalityTest } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.createAdminIfNotExists();
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;
    const hashedPassword = await hash(password);
    return await this.prisma.users.create({
      data: {
        password: hashedPassword,
        ...user,
      },
    });
  }

  async updateUser(
    id: number,
    userData: Partial<CreateUserDto>, // Using Partial to make all fields optional
    image?: Express.Multer.File
  ) {
    const existingUser = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updateData: any = {};

    // Only include fields that are provided
    if (userData.firstName) updateData.firstName = userData.firstName;
    if (userData.lastName) updateData.lastName = userData.lastName;
    if (userData.email) updateData.email = userData.email;

    // Handle password separately to hash it
    if (userData.password) {
      updateData.password = await hash(userData.password);
    }

    // Handle image
    if (image) {
      updateData.image = `uploads/profile/${image.filename}`;
    }

    return await this.prisma.users.update({
      where: { id },
      data: updateData,
    });
  }
  async findByEmail(email: string) {
    return await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findOne(userId: number) {
    return await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async updateHashedRefreshToken(userId: number, hashedRT: string | null) {
    return await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedRT,
      },
    });
  }

  async createAdminIfNotExists() {
    const admin = await this.prisma.users.findFirst({
      where: {
        role: 'ADMIN',
      },
    });
    const hashedPassword = await hash('Admin123*');

    if (!admin) {
      return await this.prisma.users.create({
        data: {
          email: 'admin@wajahni.com',
          password: hashedPassword,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'Admin',
        },
      });
    }
  }

  async forgetPassword(email: string, hashedPassword: string) {
    return await this.prisma.users.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });
  }
  async findBaccalaureateType(userId: number): Promise<{ exists: boolean; type: BaccalaureateType | null }> {
    try {
      const baccalaureate = await this.prisma.baccalaureate.findUnique({
        where: { userId },
        select: { type: true },
      });
  
      return {
        exists: !!baccalaureate,
        type: baccalaureate?.type ?? null
      };
    } catch (error) {
      console.error('Error finding baccalaureate type:', error);
      throw new Error('Failed to fetch baccalaureate type');
    }
  }
  
  async editBaccalaureateType(userId: number, baccalaureateType: BaccalaureateType) {
    const baccalaureate = await this.prisma.baccalaureate.findUnique({
      where: { userId },
    });
  
    if (!baccalaureate) {
      // Create the record if it doesn't exist
      return this.prisma.baccalaureate.create({
        data: {
          userId,
          type: baccalaureateType,
        },
      });
    }
  
    // Otherwise update
    return this.prisma.baccalaureate.update({
      where: { userId },
      data: { type: baccalaureateType },
    });
  }
  
  async getPersonalityTestWithDetails(userId: number): Promise<PersonalityTest | null> {
    return this.prisma.personalityTest.findFirst({
      where: { userId },
      include: {
        critiques: {
          include: {
            questions: {
              select: {
                id: true,
                text: true,
                options: true,
                selectedOption: true,
                position: true,
                critique: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    score: true
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          },
          orderBy: {
            id: 'asc'
          }
        }
      }
    });
  }
  async getBaccalaureateWithDetails(userId: number): Promise<Baccalaureate | null> {
    return this.prisma.baccalaureate.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            
          }
        },
        experimentalSciences: true,
        computerScience: true,
        literature: true,
        sports: true,
        economicsAndManagement: true,
        technical: true,
        mathematics: true
      }
    });
  }
}