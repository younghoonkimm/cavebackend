import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
import { CategoryEntitiy } from './entities/category.entities';
import { UserEntity } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { userProviders } from 'src/user/user.providers';
import { CategoryController } from './category.controller';
import { categoryProviders } from './category.provider';
import { conferenceProviders } from 'src/conference/conference.provider';
import { ConferenceEntity } from 'src/conference/entities/conference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CategoryEntitiy, ConferenceEntity]),
    DatabaseModule,
  ],
  providers: [
    JwtService,
    ...userProviders,
    ...categoryProviders,
    ...conferenceProviders,
  ],
  controllers: [CategoryController],
})
export class CategoryModule {}
