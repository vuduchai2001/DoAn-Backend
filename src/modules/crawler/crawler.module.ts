import { Module, UploadedFile } from '@nestjs/common'
import { CrawlerController } from './crawler.controller'
import { ExtractService } from './extract.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UploadedFileSchema } from './schema/upload.schema'
import { Website, WebsiteDocument, WebsiteDocumentSchema, WebsiteSchema } from './schema/website.schema'
import { CrawlerService } from './crawler.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UploadedFile.name, schema: UploadedFileSchema },
      { name: Website.name, schema: WebsiteSchema },
      { name: WebsiteDocument.name, schema: WebsiteDocumentSchema },
    ]),
  ],
  controllers: [CrawlerController],
  providers: [ExtractService, CrawlerService],
})
export class CrawlerModule {}
