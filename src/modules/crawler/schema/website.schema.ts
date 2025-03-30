import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { TrainingStatus } from '../dto/crawler.enum'
import { Document } from 'mongoose'

@Schema({ collection: 'websites', timestamps: true })
export class Website extends Document {
  @Prop({ required: true })
  rootUrl: string

  @Prop({ type: ObjectId, ref: 'Chatbot', required: true })
  chatbotId: ObjectId

  @Prop({ enum: TrainingStatus, default: TrainingStatus.Pending })
  status: string

  @Prop()
  totalURL: number

  @Prop({ default: 0 })
  completedURL: number

  @Prop({ default: 0 })
  failedURL: number

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop()
  deletedAt: Date
}

export const WebsiteSchema = SchemaFactory.createForClass(Website)

@Schema({ collection: 'website_documents', timestamps: true })
export class WebsiteDocument extends Document {
  @Prop({ required: true })
  pageUrl: string

  @Prop({ required: true })
  rootUrl: string

  @Prop({ required: false })
  pageTitle: string

  @Prop({ type: ObjectId, ref: 'Chatbot', required: true })
  chatbotId: ObjectId

  @Prop({ type: ObjectId, ref: 'Website' })
  websiteId: ObjectId

  @Prop()
  embeddingTokens: string

  @Prop({ required: true, default: TrainingStatus.Scraping, enum: TrainingStatus })
  status: string

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop()
  deletedAt: Date
}

export const WebsiteDocumentSchema = SchemaFactory.createForClass(WebsiteDocument)
