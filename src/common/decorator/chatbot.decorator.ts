import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ObjectId } from 'bson'

export const ChatbotID = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return new ObjectId(`${request['chatbotId']}`)
})
