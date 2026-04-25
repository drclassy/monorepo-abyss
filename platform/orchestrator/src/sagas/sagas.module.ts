import { Module } from '@nestjs/common';
import { SagaRepository } from './saga.repository';

@Module({
  providers: [SagaRepository],
  exports: [SagaRepository],
})
export class SagasModule {}
