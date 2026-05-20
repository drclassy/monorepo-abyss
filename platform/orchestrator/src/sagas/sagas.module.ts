import { Module } from '@nestjs/common'

import { SagaRepository } from './saga.repository'

@Module({
  providers: [SagaRepository],
  exports: [SagaRepository],
})
// NestJS modules are intentionally declarative and do not need instance members.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SagasModule {}
