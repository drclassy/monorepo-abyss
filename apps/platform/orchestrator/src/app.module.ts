import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FlowsModule } from './flows/flows.module'
import { KafkaModule } from './kafka/kafka.module'
import { HealthModule } from './health/health.module'

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
export class AppModule {}

