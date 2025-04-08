import { ObjectId } from 'bson'
export class UploadedFileDetails {
  fieldname: string
  filename: string
  filepath: string
  format: string
  mimetype: string
  uploadedFileId: ObjectId
  embeddingTokens: number
  originalname: string

  constructor(file: Express.Multer.File) {
    const fileFormat = file.originalname.split('.').pop().toLowerCase()

    this.fieldname = file.fieldname
    this.filename = file.filename
    this.format = fileFormat
    this.mimetype = file.mimetype
    this.originalname = file.originalname
    this.filepath = file.path

    // init variable for counting embedding tokens
    this.embeddingTokens = 0
  }

  async setUploadedFileID(fileID: ObjectId) {
    this.uploadedFileId = fileID
  }

  async getUploadedFileID(): Promise<ObjectId> {
    return this.uploadedFileId
  }

  async getEmbeddingTokens(): Promise<number> {
    return this.embeddingTokens
  }
}
