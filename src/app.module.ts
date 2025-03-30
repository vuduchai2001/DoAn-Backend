import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from '@nestjs/cache-manager'
import { BullModule, BullModuleOptions } from '@nestjs/bull'
import { LoggerModule } from 'nestjs-pino'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('LOG_LEVEL') || 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: true,
              singleLine: true,
              ignore: 'req.headers',
            },
          },
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService): Promise<BullModuleOptions> => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
        limiter: {
          max: configService.get<number>('REDIS_QUEUE_LIMITER_MAX'),
          duration: configService.get<number>('REDIS_QUEUE_LIMITER_DURATION'),
        },
        settings: {
          maxStalledCount: configService.get<number>('REDIS_QUEUE_MAX_STALLED_COUNT'),
          lockDuration: configService.get<number>('REDIS_QUEUE_LOCK_DURATION'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
        dbName: configService.get<string>('DATABASE_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
