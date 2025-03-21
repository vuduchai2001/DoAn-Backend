import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000, () => {
    console.info(`🚀 Application running at port 3000, node version: ${process.version}`)
  })
}

bootstrap()
