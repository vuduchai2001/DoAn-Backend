import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { VersioningType } from '@nestjs/common'
import compression from 'compression'

const PORT = parseInt(process.env.PORT, 10) || 3000

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.enableCors(true)
  app.enableVersioning({ type: VersioningType.URI })
  app.use(compression())

  await app.listen(PORT, () => {
    console.info(`🚀 Application running at ${PORT}, node version: ${process.version}`)
  })
}

bootstrap()
