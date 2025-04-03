// import { Process, Processor } from '@nestjs/bull'
// import { WEBSITE_CRAWLER_QUEUE, WEBSITE_EXTRACT_JOB } from '../dto/crawler.enum'
// import { Logger } from '@nestjs/common'
// import { Job } from 'bull'

// @Processor(WEBSITE_CRAWLER_QUEUE)
// export class WebstieConsumer {
//   constructor() {}

//   private readonly logger = new Logger(WebstieConsumer.name)

//   @Process(WEBSITE_EXTRACT_JOB)
//   async handleExtracting(job: Job) {
//     const { rootURL, chatbotId, websiteId, userEmail, websiteType } = job.data
//   }
// }
