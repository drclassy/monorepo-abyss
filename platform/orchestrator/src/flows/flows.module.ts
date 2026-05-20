import { Module } from '@nestjs/common'

import { KafkaModule } from '../kafka/kafka.module'
import { DiagnosisFlowSaga } from '../sagas/diagnosis-flow.saga'
import { ReferralFlowSaga } from '../sagas/referral-flow.saga'
import { SagasModule } from '../sagas/sagas.module'

import { FlowsController } from './flows.controller'
import { FlowsGateway } from './flows.gateway'
import { FlowsService } from './flows.service'

@Module({
  imports: [KafkaModule, SagasModule],
  controllers: [FlowsController],
  providers: [FlowsService, FlowsGateway, DiagnosisFlowSaga, ReferralFlowSaga],
  exports: [FlowsService],
})
// NestJS modules are intentionally declarative and do not need instance members.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FlowsModule {}
