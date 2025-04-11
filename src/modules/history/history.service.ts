import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { History } from './schema/history.schema'

@Injectable()
export class HistoryService {
  constructor(@InjectModel(History.name) private historyModel: Model<History>) {}

  async createHistory(payload: History) {
    const history = await this.historyModel.insertOne(payload)
    return history
  }
}
