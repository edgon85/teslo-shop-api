import { AuthGuard } from '@nestjs/passport';
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { RawHeader, GetUser, Auth } from './decorators';
import { User } from './entities';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeader() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'Hello private world',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  PrivateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hello private world',
      user,
    };
  }
}
