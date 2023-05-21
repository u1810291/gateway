import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'

const options = new DocumentBuilder()
  .setTitle('SLP Logistics')
  .setDescription('The logistics API description')
  .setVersion('1.0')
  .addTag('SLP')
  .addBearerAuth()
  .build()

export const swaggerInit = (app: NestExpressApplication) => {
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document)
}
