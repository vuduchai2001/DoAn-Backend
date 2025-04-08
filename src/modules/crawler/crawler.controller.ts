import { ChatbotID } from '@/src/common/decorator/chatbot.decorator'
import { FileValidationExceptionFilter } from '@/src/common/exception/file.exception'
import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ObjectId } from 'bson'
import { CrawlerService } from './crawler.service'
import { ACCESS_FILE, FILE_EXTRACT_JOB, FILE_TRAINING_QUEUE } from './dto/crawler.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

@Controller('crawler')
export class CrawlerController {
  constructor(
    private readonly configService: ConfigService,
    private readonly crawlerService: CrawlerService,
    @InjectQueue(FILE_TRAINING_QUEUE) private readonly fileTrainingConsumer: Queue,
  ) {}

  @Post('upload-files')
  @UseInterceptors(FilesInterceptor('files'))
  @UseFilters(FileValidationExceptionFilter)
  async test(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: ACCESS_FILE,
        })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 100 }) //100MB
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, fileIsRequired: false }),
    )
    files: Express.Multer.File[],
    @ChatbotID() chatbotId: ObjectId,
  ) {
    for (const file of files) {
      const uploadedFile = await this.crawlerService.saveUploadedFile(file, chatbotId)
      await this.fileTrainingConsumer.add(
        FILE_EXTRACT_JOB,
        { fileDetails: uploadedFile, chatbotId: chatbotId.toString() },
        { removeOnFail: true },
      )
    }

    return { message: 'Training Successfully' }
  }
}
