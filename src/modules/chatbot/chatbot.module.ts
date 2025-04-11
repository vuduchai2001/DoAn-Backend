import { forwardRef, Module } from '@nestjs/common'
import { Chatbot, ChatbotSchema } from './schema/chatbot.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatbotController } from './chatbot.controller'
import { ChatbotService } from './chatbot.service'
import { ChatbotGateway } from './chatbot.gateway'
import { HistoryModule } from '../history/history.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chatbot.name, schema: ChatbotSchema }]),
    forwardRef(() => HistoryModule),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotGateway],
  exports: [MongooseModule],
})
export class ChatbotModule {}
