import { OpenAIEmbeddings } from '@langchain/openai'
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { embeddingModel } from '../chatbot/chatbot.config'
import { ObjectId } from 'bson'
import { InjectModel } from '@nestjs/mongoose'
import { UploadedFile } from './schema/upload.schema'
import { Model } from 'mongoose'
import { TrainingStatus } from './dto/crawler.enum'

@Injectable()
export class CrawlerService {
  private openAIEmbedding: OpenAIEmbeddings
  constructor(
    private configService: ConfigService,
    @InjectModel(UploadedFile.name) private readonly uploadedFileModel: Model<UploadedFile>,
  ) {
    this.openAIEmbedding = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get<string>('OPEN_AI_KEY'),
      modelName: embeddingModel,
    })
  }

  private readonly logger = new Logger(CrawlerService.name)

  async saveUploadedFile(file: Express.Multer.File, chatbotId: ObjectId) {
    const uploadedFile = await this.uploadedFileModel.create({
      filename: file.filename,
      filepath: file.path,
      mimetype: file.mimetype,
      chatbotId: chatbotId,
    })

    return uploadedFile
  }

  async updateUploadDocument(
    uploadedFileId: ObjectId,
    status: TrainingStatus,
    embeddingTokens?: number,
    statusDescription?: string,
  ): Promise<void> {
    try {
      await this.uploadedFileModel
        .updateOne(
          { _id: uploadedFileId },
          {
            $set: {
              status,
              statusDescription,
              embeddingTokens,
            },
          },
        )
        .exec()
    } catch {
      this.logger.error(`Error update file upload status for uploadedFileId : ${uploadedFileId.toString()}`)
      throw new HttpException(
        'Failed to connect to database for updating file upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
