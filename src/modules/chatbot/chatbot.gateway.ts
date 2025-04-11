import { Logger } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatbotService } from './chatbot.service'
import { HistoryService } from '../history/history.service'

@WebSocketGateway({
  namespace: 'chatbot',
})
export class ChatbotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly historyService: HistoryService,
  ) {}
  private readonly logger = new Logger(ChatbotGateway.name)

  @WebSocketServer() server: Server

  handleConnection = async (socket: Socket) => {
    const clientId = socket.id
    const sessionId = socket.handshake.query.sessionId as string
    const chatbotId = socket.handshake.query.chatbotId as string

    try {
      this.server.in(clientId).socketsJoin(sessionId)

      this.logger.log(
        `Client id: ${clientId} connected to chatbot with session id: ${sessionId} and chatbot id: ${chatbotId}`,
      )
    } catch (error) {
      socket.emit('error', error)
      socket.disconnect()
      this.logger.error(`Handle connection error: ${error}`)
    }
  }

  handleDisconnect = async (socket: Socket) => {
    try {
      // For voice connection
      const clientId = socket.id
      this.logger.log(`Cliend id: ${clientId} disconnected to chatbot gateway`)

      const sessionID = socket.handshake.query.sessionID as string
      const chatbotID = socket.handshake.query.chatbotID as string
      this.logger.log(
        `Client id:${socket.id} disconnected to chatbot gateway with session id: ${sessionID} and chatbot id: ${chatbotID}`,
      )
    } catch (e) {
      this.logger.error(`Error while disconnecting: ${e.message}`)
    }
  }

  @SubscribeMessage('streamingServer')
  async handleMessage(socket: Socket, payload: any) {
    // const chatbotId = socket.handshake.query.chatbotId as string
    const socketPayload = {
      message: payload,
      chatbotId: socket.handshake.query.chatbotId,
      sessionId: socket.handshake.query.sessionId,
    }
    const streamConfig = await this.chatbotService.initializeChatbotStreamConfig(socketPayload)

    // const totalMessageTokens = await this.chatbotService.countTokenUsage(payload.message)

    const llmChain = await this.chatbotService.createLLMChain(streamConfig)
    const stream = llmChain.stream({
      question: streamConfig.revisedQuestion,
    })
    let fullMessage = ''
    for await (const chunk of await stream) {
      const messageChunk = chunk

      this.server.to(streamConfig.sessionId).emit('streamingClient', { type: 'chat.message', message: messageChunk })
      fullMessage += messageChunk
    }

    await this.historyService.createHistory({
      question: streamConfig.question,
      answer: fullMessage,
      chatbotId: streamConfig.chatbotId,
      sessionId: streamConfig.sessionId,
      promptTokens: streamConfig.promptTokens,
      completionTokens: streamConfig.completionTokens,
    })
  }
}
