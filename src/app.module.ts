import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from './modules/token/token.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfiguration } from 'config/configuration';
import { envSchema } from 'config/validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from 'config/database';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionModule } from './modules/permission/permission.module';
import { SectionModule } from './modules/section/section.module';
import { RoleModule } from './modules/role/role.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingModule } from '@modules/booking/booking.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ limit: 0, ttl: 0 }]),
    ConfigModule.forRoot({
      envFilePath: `${__dirname}/../../config/env/${process.env.NODE_ENV}.env`,
      load: [envConfiguration],
      isGlobal: true,
      validationSchema: envSchema,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => database(configService),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    TokenModule,
    AuthModule,
    UserModule,
    PermissionModule,
    SectionModule,
    RoleModule,
    AvailabilityModule,
    BookingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
