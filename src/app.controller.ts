import { AppService } from './app.service'
import { Controller, Get, Logger } from '@nestjs/common'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger(AppController.name)

  @Get()
  getHello(): string {
    this.logger.log('GET /hello')
    return this.appService.getHello()
  }
}
