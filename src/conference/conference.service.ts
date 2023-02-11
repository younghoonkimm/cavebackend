import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { AuthService } from 'src/auth/auth.service';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ConferenceInput } from './dto/conference.dto';
import { ConferenceEntity } from './entities/conference.entity';

@Injectable()
export class ConferenceService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userInfo: Repository<UserEntity>,
    @Inject('CONFERENCE_REPOSITORY')
    private conferenceInfo: Repository<ConferenceEntity>,
    private readonly authService: AuthService,

    @Inject('DATASOURCE') private dataSource: DataSource,
  ) {}

  // async createConference(user, conference) {
  //   // const owner = await this.authService.getUser(user);

  //   const dummyData = {
  //     title: '테스트용',
  //     status: 'P',
  //     agenda: '김기린',
  //   };

  //   const userId = [
  //     '45ff23dc-de4b-4a45-9c69-964153db7119',
  //     '55ff23dc-de4b-4a45-9c69-964153db7119',
  //   ];
  //   const owners = await this.authService.getAllUSer(userId);
  //   console;
  //   const newConf = await this.conferenceInfo.save(
  //     this.conferenceInfo.create({
  //       ...dummyData,
  //       status: dummyData.status as ConferenceStatus,
  //       users: owners,
  //     }),
  //   );
  // }

  async createConference(conference: ConferenceInput) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invitedUsers = await this.authService.getAllUSer(conference.users);

      await this.conferenceInfo.save(
        this.conferenceInfo.create({
          ...conference,
          status: conference.status,
          users: invitedUsers,
        }),
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.errorMessage, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getConference(user: UserInputDto) {
    const { id } = user;
    try {
      const userConference = await this.userInfo.findOne({
        where: { id },
        relations: ['conferences'],
        select: ['id', 'conferences'],
      });

      return userConference;
    } catch (e) {
      throw new HttpException('nodata', HttpStatus.NOT_FOUND);
    }
  }

  async deleteConferenceUser(userId: string) {
    const newConf = await this.conferenceInfo.findOne({
      where: {
        id: userId,
      },
      relations: ['users'],
    });

    await this.conferenceInfo.save({
      ...newConf,
      users: newConf.users.filter(
        (user) => user.id !== '45ff23dc-de4b-4a45-9c69-964153db7119',
      ),
    });

    // const user = await this.userInfo.findOne({
    //   where: { id: '55ff23dc-de4b-4a45-9c69-964153db7119' },
    //   relations: ['conferences'],
    // });
  }
}
