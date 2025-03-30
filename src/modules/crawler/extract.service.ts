import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { Document } from '@langchain/core/documents'
import { UploadedFileDetails } from './dto/upload-file.input'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { encodingForModel } from '@langchain/core/utils/tiktoken'
import { modelNameTokens } from '../chatbot/chatbot.config'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { ChunkOverlap, ChunkSize, IngestionType } from './dto/crawler.enum'

export interface splitDocsInterface {
  embeddingTokens: number
  splitDocs: Document[]
}

@Injectable()
export class ExtractService {
  constructor() {}
  private readonly logger = new Logger(ExtractService.name)

  private async initLoader(uploadededFile: UploadedFileDetails) {
    switch (uploadededFile.format) {
      case 'pdf':
        return new PDFLoader(uploadededFile.filepath)
      case 'txt':
        return new TextLoader(uploadededFile.filepath)
      case 'docx':
        return new DocxLoader(uploadededFile.filepath)
      case 'json':
        return new JSONLoader(uploadededFile.filepath)
      case 'csv':
        return new CSVLoader(uploadededFile.filepath)
      default:
        throw new Error(`Cannot extract text from file format: ${uploadededFile.format}`)
    }
  }

  async extractText(uploadededFile: UploadedFileDetails, chatbotId: string): Promise<Document[]> {
    const startTime = Date.now()
    const loader = await this.initLoader(uploadededFile)

    try {
      let docs: Document[]
      try {
        docs = await loader.load()
      } catch (error) {
        this.logger.error('Error when loading loader', error)
        throw new InternalServerErrorException(
          `Unable to process file: The file content is corrupted or in an incorrect ${uploadededFile.format} format`,
        )
      }

      const { embeddingTokens, splitDocs } = await this.splitDocs(
        docs,
        uploadededFile.uploadedFileID.toString(),
        chatbotId,
        IngestionType.File,
      )
      uploadededFile.embeddingTokens = embeddingTokens
      if (!splitDocs || splitDocs.length === 0) {
        throw new NotFoundException('Not found text in this file')
      }
      const endTime = Date.now()
      this.logger.log(`extractText took ${endTime - startTime} ms`)
      return splitDocs
    } catch (error) {
      this.logger.debug(`Failed to extract text from ${uploadededFile.format}`, error.stack)
      const endTime = Date.now()
      this.logger.log(`extractText took ${endTime - startTime} ms`)
      throw error
    }
  }

  async addMetada(docs: Document[], fileID: string, chatbotId: string, fileType: string): Promise<Document[]> {
    const startTime = Date.now()
    for (const _doc of docs) {
      _doc.metadata['uploadedFileID'] = fileID
      _doc.metadata['chatbotId'] = chatbotId
      _doc.metadata['type'] = fileType
    }
    const endTime = Date.now()
    this.logger.log(`addMetada took ${endTime - startTime} ms`)
    return docs
  }

  async countEmbeddingTokens(docs: Document[]): Promise<number> {
    const startTime = Date.now()
    let embeddingTokens = 0

    for (const _doc of docs) {
      const text = _doc.pageContent
      if (!text) {
        continue
      } else {
        // TODO: Move out of loop
        const startTimeEncoding = Date.now()
        const enc = await encodingForModel(modelNameTokens)
        embeddingTokens += enc.encode(text).length
        const endTimeEncoding = Date.now()
        this.logger.log(`encodingForModel took ${endTimeEncoding - startTimeEncoding} ms`)
      }
    }
    const endTime = Date.now()
    this.logger.log(`countEmbeddingTokens took ${endTime - startTime} ms`)
    return embeddingTokens
  }

  async splitDocs(docs: Document[], fileID: string, chatbotId: string, fileType: string): Promise<splitDocsInterface> {
    const startTime = Date.now()
    const docsWithMetadata = await this.addMetada(docs, fileID, chatbotId, fileType)
    const embeddingTokens = await this.countEmbeddingTokens(docs)

    const textSplitter = new RecursiveCharacterTextSplitter({
      separators: ['\n\n', '\n', ' '], // removed the empty string if not needed
      chunkSize: ChunkSize,
      chunkOverlap: ChunkOverlap,
    })

    let splitDocs: Document[]
    try {
      splitDocs = await textSplitter.splitDocuments(docsWithMetadata)
    } catch (error) {
      const endTime = Date.now()
      this.logger.log(`splitDocs took ${endTime - startTime} ms`)
      throw new InternalServerErrorException(error)
    }
    const endTime = Date.now()
    this.logger.log(`splitDocs took ${endTime - startTime} ms`)
    return {
      embeddingTokens,
      splitDocs,
    }
  }
}
