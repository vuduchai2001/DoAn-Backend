import { BaseListChatMessageHistory } from '@langchain/core/chat_history'
import {
  BaseMessage,
  StoredMessage,
  StoredMessageData,
  mapStoredMessagesToChatMessages,
} from '@langchain/core/messages'
import type { Collection, Document as MongoDBDocument } from 'mongodb'
import { Types } from 'mongoose'

export const messageHistoryLimit = 10

interface HistoryDocument {
  _id: Types.ObjectId
  question: string
  answer: string
  chatbotId: string
  sessionId: string
  promptTokens: number
  completionTokens: number
  rate: number
  totalTokens: number
  createdAt: Date
  updatedAt: Date
}

export interface MongoDBChatMessageHistoryInput {
  collection: Collection<MongoDBDocument>
  sessionId: string
}

export class CatbotMongoChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ['langchain', 'stores', 'message', 'mongodb']

  private collection: Collection<MongoDBDocument>

  private sessionId: string

  constructor({ collection, sessionId }: MongoDBChatMessageHistoryInput) {
    super()
    this.collection = collection
    this.sessionId = sessionId
  }

  async transformToStoredMessage(history: HistoryDocument): Promise<StoredMessage[]> {
    const userData: StoredMessageData = {
      content: history.question,
      role: 'user',
      name: undefined,
      tool_call_id: undefined,
      additional_kwargs: undefined,
    }
    const systemData: StoredMessageData = {
      content: history.answer,
      role: 'system',
      name: undefined,
      tool_call_id: undefined,
      additional_kwargs: undefined,
    }
    return [
      { type: 'human', data: userData },
      { type: 'ai', data: systemData },
    ]
  }

  async getMessages() {
    const historiesCursor = this.collection
      .find({
        sessionId: this.sessionId,
      })
      .sort({ createdAt: 'desc' })
      .limit(messageHistoryLimit)

    const histories = (await historiesCursor.toArray()) as HistoryDocument[]

    const storedMessages: StoredMessage[] = []
    for (const history of histories) {
      const storedMessageArray = await this.transformToStoredMessage(history)
      storedMessages.push(...storedMessageArray)
    }
    return mapStoredMessagesToChatMessages(storedMessages)
  }

  async transformToString(history: HistoryDocument): Promise<string> {
    const qna = `USER: ${history.question}\n ANSWER: ${history.answer}\n\n`
    return qna
  }

  async getHistories(): Promise<string> {
    const historiesCursor = this.collection.find(
      {
        sessionId: this.sessionId,
      },
      {
        projection: {
          question: 1,
          answer: 1,
        },
      },
    )

    const historyDocuments = (await historiesCursor.toArray()) as HistoryDocument[]

    let histories = ''
    let lastMessage = ''
    for (const historyDocument of historyDocuments) {
      lastMessage = (await this.transformToString(historyDocument)).replace('ANSWER:', 'CHATBOT:')
      histories += lastMessage
    }
    lastMessage = lastMessage.split('CHATBOT: ')[1]
    return histories
  }

  // Pass the addMessage method since we will save later along with question
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addMessage(_message: BaseMessage): Promise<void> {}
  async clear(): Promise<void> {}
}
