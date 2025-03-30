import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({
  collection: 'chatbots',
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class Chatbot extends Document {
  @Prop({ required: true })
  name: string

  @Prop()
  lastTrained: Date

  @Prop({
    type: String,
    default: '#34D399',
    maxlength: 7,
  })
  themeColor: string

  @Prop({ type: String, maxlength: 250 })
  connectedResponse: string

  @Prop({ type: String, maxlength: 250 })
  questionInputPrompt: string

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot)
