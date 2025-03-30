import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { TrainingStatus } from '../dto/crawler.enum'
import { ObjectId } from 'mongodb'

@Schema({ collection: 'uploaded_files', timestamps: true })
export class UploadedFile extends Document {
  @Prop({ required: true })
  fileName: string

  @Prop({ required: true, default: '' })
  path: string

  @Prop({ required: true })
  mimetype: string

  @Prop({ type: Types.ObjectId, ref: 'Chatbot', required: true })
  chatbotId: ObjectId

  @Prop({ required: true, default: TrainingStatus.Pending, enum: TrainingStatus })
  status: string

  @Prop({ required: true, default: 0 })
  embeddingTokens: number

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop()
  deletedAt: Date
}

export const UploadedFileSchema = SchemaFactory.createForClass(UploadedFile)
