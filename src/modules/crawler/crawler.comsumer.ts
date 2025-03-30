import { Processor } from '@nestjs/bull'
import { CRAWLER_QUEUE } from './dto/crawler.enum'
import { Logger } from '@nestjs/common'

@Processor(CRAWLER_QUEUE)
export class CrawlerConsumer {
  constructor() {}

  private readonly logger = new Logger(CrawlerConsumer.name)
}
