import { Controller, Get } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Chatbot } from './schema/chatbot.schema'
import { Model } from 'mongoose'

@Controller('chatbot')
export class ChatbotController {
  constructor(@InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>) {}

  @Get()
  async createTestChatbot() {
    await this.chatbotModel.insertOne({
      name: 'Javis',
    })
  }
}
