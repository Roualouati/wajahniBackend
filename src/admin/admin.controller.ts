import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards ,Request} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorators';
import { Roles } from 'src/auth/decorators/roles.decorators';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('users')
  @Roles('ADMIN') // Make sure only an admin can access this
  async getUsers(@Request() req) {
    return this.adminService.getAllUsers(); // This should return a list of users
  }
  
//use @UseGuards(JwtAuthGuard) to protect the route
//usegurad(role)
 @Roles('ADMIN')
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }
}
