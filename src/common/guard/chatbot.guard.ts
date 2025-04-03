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

    const chatbotId = await this.cacheManager.get<string>(`${CHATBOT_CACHE.PREFIX}`)

    if (!chatbotId) {
      const chatbot = await this.chatbotModel.findOne({}).lean()

      await this.cacheManager.set(`${CHATBOT_CACHE.PREFIX}`, chatbot._id.toString(), CHATBOT_CACHE.TTL)
    }

    if (!chatbotId) {
      throw new UnauthorizedException('Invalid Chatbot ID')
    }

    request['chatbotId'] = chatbotId

    return true
  }
}
