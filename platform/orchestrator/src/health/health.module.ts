import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { HealthController } from './health.controller'

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
// NestJS modules are intentionally declarative and do not need instance members.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HealthModule {}
