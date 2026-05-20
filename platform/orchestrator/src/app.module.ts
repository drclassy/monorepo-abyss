import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { FlowsModule } from './flows/flows.module'
import { HealthModule } from './health/health.module'
import { KafkaModule } from './kafka/kafka.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KafkaModule,
    FlowsModule,
    HealthModule,
  ],
})
// NestJS modules are intentionally declarative and do not need instance members.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
