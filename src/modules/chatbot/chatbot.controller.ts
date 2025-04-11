import { Controller, Get, Param } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Chatbot } from './schema/chatbot.schema'
import { Model } from 'mongoose'
import { ChatbotService } from './chatbot.service'

@Controller('chatbot')
export class ChatbotController {
  constructor(
    @InjectModel(Chatbot.name) private chatbotModel: Model<Chatbot>,
    private readonly chatbotService: ChatbotService,
  ) {}

  @Get('/:id')
  async chatWithMessage(@Param('id') id: string) {
    return await this.chatbotService.handleMessage(id)
  }
}
