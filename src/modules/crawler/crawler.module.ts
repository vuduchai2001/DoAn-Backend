import { Module, UploadedFile } from '@nestjs/common'
import { CrawlerController } from './crawler.controller'
import { ExtractService } from './extract.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UploadedFileSchema } from './schema/upload.schema'
import { Website, WebsiteDocument, WebsiteDocumentSchema, WebsiteSchema } from './schema/website.schema'
import { CrawlerService } from './crawler.service'
import { MulterModule } from '@nestjs/platform-express'
import path from 'path'
import { diskStorage } from 'multer'
import { BullModule } from '@nestjs/bull'
import { FILE_TRAINING_QUEUE, WEBSITE_CRAWLER_QUEUE } from './dto/crawler.enum'
import { FileTrainingConsumer } from './consumer/file.consumer'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UploadedFile.name, schema: UploadedFileSchema },
      { name: Website.name, schema: WebsiteSchema },
      { name: WebsiteDocument.name, schema: WebsiteDocumentSchema },
    ]),
    BullModule.registerQueueAsync({ name: WEBSITE_CRAWLER_QUEUE }),
    BullModule.registerQueueAsync({ name: FILE_TRAINING_QUEUE }),
    MulterModule.register({
      storage: diskStorage({
        destination: path.join(process.cwd(), 'uploads'),
        filename(_req, file, callback) {
          const originalname = file.originalname.split('.')
          const filePath = originalname.pop()
          const filename = `${originalname.join('.')}-${Date.now()}.${filePath}`
          callback(null, filename)
        },
      }),
    }),
  ],
  controllers: [CrawlerController],
  providers: [ExtractService, CrawlerService, FileTrainingConsumer],
})
export class CrawlerModule {}
