import { Module } from '@nestjs/common'

import { KafkaService } from './kafka.service'

@Module({
  providers: [KafkaService],
  exports: [KafkaService],
})
// NestJS modules are intentionally declarative and do not need instance members.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class KafkaModule {}
