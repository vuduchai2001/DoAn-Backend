export enum TrainingStatus {
  Pending = 'Pending',
  Failed = 'Failed',
  Scraping = 'Scraping',
  Training = 'Training',
  Trained = 'Trained',
  Parsing = 'Parsing',
}

//Queue config
export const WEBSITE_CRAWLER_QUEUE = 'website-crawler-queue'
export const WEBSITE_EXTRACT_JOB = 'website-extract-job'
export const FILE_EXTRACT_JOB = 'file-extract-job'
export const WEBSITE_TRAINING_JOB = 'website-training-job'

// AI config to process document
export const ChunkSize = 1000
export const ChunkOverlap = 100

export enum IngestionType {
  File = 'file',
  Website = 'website',
}
