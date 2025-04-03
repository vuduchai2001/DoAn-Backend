import { OpenAIEmbeddings } from '@langchain/openai'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { embeddingModel } from '../chatbot/chatbot.config'

@Injectable()
export class CrawlerService {
  private openAIEmbedding: OpenAIEmbeddings
  constructor(private configService: ConfigService) {
    this.openAIEmbedding = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get<string>('OPEN_AI_KEY'),
      modelName: embeddingModel,
    })
  }
}
