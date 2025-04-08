import { CHATBOT_CACHE } from '@/src/modules/chatbot/dto/chatbot.enum'
import { Chatbot } from '@/src/modules/chatbot/schema/chatbot.schema'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cache } from 'cache-manager'
import { Request } from 'express'
import { Model } from 'mongoose'

@Injectable()
export class ChatbotGuard implements CanActivate {
  constructor(
    @InjectModel(Chatbot.name)
    private readonly chatbotModel: Model<Chatbot>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    let chatbotId = await this.cacheManager.get<string>(`${CHATBOT_CACHE.PREFIX}`)

    if (!chatbotId) {
      const chatbot = await this.chatbotModel.findOne({}).lean()
      if (!chatbot) throw new UnauthorizedException('Invalid Chatbot ID')
      chatbotId = chatbot._id?.toString()
      await this.cacheManager.set(`${CHATBOT_CACHE.PREFIX}`, chatbotId, CHATBOT_CACHE.TTL)
    }

    request['chatbotId'] = chatbotId

    return true
  }
}
