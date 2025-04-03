import { BadRequestException, Logger } from '@nestjs/common'
import { Types } from 'mongoose'
import { Express } from 'express'

// import { FASTIFY_MULTIPART_MAX_FILE_SIZE } from '../../../common/constants'

const INGESTION_FILE_SUPPORTED_FORMATS = ['pdf', 'txt', 'docx', 'json', 'csv', 'xlsx']
// const INGESTION_FILE_MAX_SIZE_MB = FASTIFY_MULTIPART_MAX_FILE_SIZE
// 100MB

// interface IngestionFile extends Express.Multer.File {}

export class UploadedFileDetails {
  filepath: string
  fieldname: string
  filename: string
  uploadFilepath: string
  format: string
  encoding: string
  mimetype: string
  uploadedFileID: Types.ObjectId
  embeddingTokens: number
  private readonly logger = new Logger(UploadedFileDetails.name)

  constructor(file: Express.Multer.File) {
    const fileFormat = file.originalname.split('.').pop().toLowerCase()
    const isFileFormatSupported = INGESTION_FILE_SUPPORTED_FORMATS.includes(fileFormat)

    if (!isFileFormatSupported) {
      throw new BadRequestException(`Unsupported file format: ${fileFormat}`)
    }

    this.fieldname = file.fieldname
    this.filepath = '/home/ha1/Desktop/test.txt'
    this.filename = file.filename
    // this.uploadFilepath = file.uploadFilepath
    this.format = fileFormat
    this.encoding = file.encoding
    this.mimetype = file.mimetype

    // init variable for counting embedding tokens
    this.embeddingTokens = 0
  }

  async setUploadedFileID(fileID: Types.ObjectId) {
    this.uploadedFileID = fileID
  }

  async getUploadedFileID(): Promise<Types.ObjectId> {
    return this.uploadedFileID
  }

  async getEmbeddingTokens(): Promise<number> {
    return this.embeddingTokens
  }

  toString() {
    return `Fieldname: ${this.fieldname}, Filename: ${this.filename}, Encoding: ${this.encoding}, Mimetype: ${this.mimetype}`
  }
}
