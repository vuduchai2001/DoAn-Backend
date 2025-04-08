import { ExceptionFilter, Catch, ArgumentsHost, UnprocessableEntityException } from '@nestjs/common'
import { Request, Response } from 'express'
import * as fs from 'fs'

@Catch(UnprocessableEntityException)
export class FileValidationExceptionFilter implements ExceptionFilter {
  catch(exception: UnprocessableEntityException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const files = request.files as Express.Multer.File[] | undefined
    if (files) {
      for (const file of files) {
        fs.unlink(file.path, () => {})
      }
    }

    response.status(422).json({
      statusCode: 422,
      message: exception.message,
      error: exception.getResponse()?.['error'] || 'Unprocessable Entity',
    })
  }
}
