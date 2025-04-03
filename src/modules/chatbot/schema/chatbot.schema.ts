import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({
  collection: 'chatbots',
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class Chatbot {
  @Prop({ required: true })
  name: string

  @Prop({ default: null })
  lastTrained: Date

  @Prop({
    type: String,
    default: '#34D399',
    maxlength: 7,
  })
  themeColor: string

  @Prop({ type: String, maxlength: 250, required: false })
  connectedResponse: string

  @Prop({ type: String, maxlength: 250, required: false })
  questionInputPrompt: string

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot)
