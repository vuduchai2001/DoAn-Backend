import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { FILE_EXTRACT_JOB, FILE_TRAINING_QUEUE, TrainingStatus } from '../dto/crawler.enum'
import { CrawlerService } from '../crawler.service'
import { ObjectId } from 'bson'
import { UploadedFile } from '../schema/upload.schema'
import { ExtractService } from '../extract.service'
import { OpenAIEmbeddings } from '@langchain/openai'
import { ConfigService } from '@nestjs/config'
import { embeddingModel } from '../../chatbot/chatbot.config'
import { QdrantVectorStore } from '@langchain/qdrant'

@Processor(FILE_TRAINING_QUEUE)
export class FileTrainingConsumer {
  private openAIEmbedding: OpenAIEmbeddings

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly extractService: ExtractService,
    private readonly configService: ConfigService,
  ) {
    this.openAIEmbedding = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get<string>('OPEN_AI_KEY'),
      modelName: embeddingModel,
    })
  }
  private readonly logger = new Logger(FileTrainingConsumer.name)

  @Process(FILE_EXTRACT_JOB)
  async handleExtactFile(job: Job) {
    const { fileDetails, chatbotId }: { fileDetails: UploadedFile; chatbotId: string } = job.data
    const fileId = fileDetails._id as ObjectId
    this.logger.log(`Start training file ${fileId.toString()}`)
    try {
      await this.crawlerService.updateUploadDocument(fileId, TrainingStatus.Parsing)
      const extractedDocs = await this.extractService.extractText(fileDetails, chatbotId)
      await this.crawlerService.updateUploadDocument(fileId, TrainingStatus.Training)
      await QdrantVectorStore.fromDocuments(extractedDocs, this.openAIEmbedding, {
        url: this.configService.get<string>('QDRANT'),
        collectionName: 'ingestion',
        metadataPayloadKey: 'metadata',
      })
      await this.crawlerService.updateUploadDocument(fileId, TrainingStatus.Trained, fileDetails.embeddingTokens)
      this.logger.log(`Training file ${fileId.toString()} Successfully`)
    } catch (error) {
      this.logger.warn(
        `Chatbot ${chatbotId}: Queue job saving ingestion for ${fileDetails.filename} failed. More detail: ${error}`,
      )
      await this.crawlerService.updateUploadDocument(fileId, TrainingStatus.Failed, 0, error.message)
    }
  }
}
