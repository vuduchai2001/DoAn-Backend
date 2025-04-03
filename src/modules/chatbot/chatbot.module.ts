import { Module } from '@nestjs/common'
import { Chatbot, ChatbotSchema } from './schema/chatbot.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatbotController } from './chatbot.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: Chatbot.name, schema: ChatbotSchema }])],
  controllers: [ChatbotController],
  providers: [],
  exports: [MongooseModule],
})
export class ChatbotModule {}
