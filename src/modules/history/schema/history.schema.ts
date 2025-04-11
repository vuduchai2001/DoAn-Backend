import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ObjectId } from 'bson'
import { Document } from 'mongoose'

@Schema({
  collection: 'histories',
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class History {
  @Prop()
  question: string

  @Prop()
  answer: string

  @Prop({ type: ObjectId, ref: 'Chatbot' })
  chatbotId: ObjectId

  @Prop()
  sessionId: string

  @Prop()
  promptTokens: number

  @Prop()
  completionTokens: number

  @Prop()
  createdAt?: Date

  @Prop()
  updatedAt?: Date
}
export const HistorySchema = SchemaFactory.createForClass(History)

HistorySchema.virtual('totalTokens').get(function (this: any) {
  return (this.promptTokens || 0) + (this.completionTokens || 0)
})
