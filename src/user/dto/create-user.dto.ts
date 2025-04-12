import {IsString,IsEmail} from 'class-validator';
export class CreateUserDto{
    @IsString() firstName:string;
    @IsString() lastName:string;
    @IsEmail()
     @IsString() email: string;
     @IsString () password: string;
     
}