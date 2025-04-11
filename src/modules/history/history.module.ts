import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { History, HistorySchema } from './schema/history.schema'
import { HistoryService } from './history.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: History.name, schema: HistorySchema }])],
  controllers: [],
  providers: [HistoryService],
  exports: [MongooseModule, HistoryService],
})
export class HistoryModule {}
