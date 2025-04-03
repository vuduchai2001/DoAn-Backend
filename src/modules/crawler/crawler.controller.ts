import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadedFileDetails } from './dto/upload-file.input'
import { ExtractService } from './extract.service'
import { QdrantVectorStore } from '@langchain/qdrant'
import { OpenAIEmbeddings } from '@langchain/openai'
import { ConfigService } from '@nestjs/config'
import { embeddingModel } from '../chatbot/chatbot.config'

@Controller('crawler')
export class CrawlerController {
  private openAIEmbedding: OpenAIEmbeddings

  constructor(
    private readonly extractService: ExtractService,
    private readonly configService: ConfigService,
  ) {
    this.openAIEmbedding = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get<string>('OPEN_AI_KEY'),
      modelName: embeddingModel,
    })
  }

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async test(@UploadedFile() file: Express.Multer.File) {
    const uploadedFileDetails = new UploadedFileDetails(file)
    const extractedDocs = await this.extractService.extractText(uploadedFileDetails, '67ee8491e8511082621c1217')
    await QdrantVectorStore.fromDocuments(extractedDocs, this.openAIEmbedding, {
      url: this.configService.get<string>('QDRANT'),
      collectionName: 'ingestion',
      metadataPayloadKey: 'mongo_metadata',
    })
  }
}
