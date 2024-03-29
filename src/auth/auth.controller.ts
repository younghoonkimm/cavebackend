import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GoogleUser } from 'src/types/auth';
import { SocialPlatforms } from 'src/user/entities/user.entity';
import { AccessTokenGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Token } from './decorator/auth.decorator';
import { AuthTokenOutput } from './dto/auth.dto';
import { UserInputDto } from 'src/user/dto/user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/google') // 1
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req, @Res() res) {}

  @Get('/google/callback') // 2
  @UseGuards(AuthGuard('google'))
  @Header('Cache-Control', 'none')
  async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { user } = req;
    const { email, picture, name } = user;

    const newUser = {
      socialPlatform: 'google' as SocialPlatforms,
      email: email,
      profileImg: picture,
      name,
    };

    return await this.authService.logInUser(newUser, res);
  }

  @Get('/getToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '유저 정보',
    description: '유저 정보',
  })
  async createFreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenOutput> {
    const oldRefreshToken = req?.cookies['CAV_RFS'];

    return await this.authService.createfreshToken(oldRefreshToken, res);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  @Header('Cache-Control', 'none')
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  @ApiOperation({
    summary: '유저 로그아웃',
    description: '유저 로그아웃',
  })
  async logOutUser(
    @Res({ passthrough: true }) res,
    @Token() user: UserInputDto,
  ): Promise<void> {
    return await this.authService.logOutUser(res, user);
  }

  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '유저 정보',
    description: '유저 정보',
  })
  @Get('/me')
  async getUser(@Token() user: UserInputDto) {
    return await this.authService.getUser(user);
  }

  @Get('/users')
  async users() {
    return await this.authService.AllgetUser();
  }
}
