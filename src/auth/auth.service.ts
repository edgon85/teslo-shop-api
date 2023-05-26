import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';

import { User } from './entities';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly authRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /* ······················································ */
  public async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.authRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.authRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getToken({ email: user.email }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  /* ······················································ */
  public async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.authRepository.findOne({
      where: { email },
      select: { email: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException(`Credential are not valid (email)`);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(`Credential are not valid (password)`);
    }

    return {
      ...user,
      token: this.getToken({ email: user.email }),
    };
  }

  /* ······················································ */

  private getToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  /* ······················································ */
  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('please check server errors');
  }

  /* 
  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  } */
}
