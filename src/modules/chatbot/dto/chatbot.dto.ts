export interface ChatbotStreamConfig {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  question?: string
  revisedQuestion?: string
  chatbotId?: string
  sessionId?: string
}
