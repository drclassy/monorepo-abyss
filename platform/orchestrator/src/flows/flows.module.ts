import { Module } from '@nestjs/common';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { FlowsGateway } from './flows.gateway';
import { KafkaModule } from '../kafka/kafka.module';
import { SagasModule } from '../sagas/sagas.module';
import { DiagnosisFlowSaga } from '../sagas/diagnosis-flow.saga';
import { ReferralFlowSaga } from '../sagas/referral-flow.saga';

@Module({
  imports: [KafkaModule, SagasModule],
  controllers: [FlowsController],
  providers: [FlowsService, FlowsGateway, DiagnosisFlowSaga, ReferralFlowSaga],
  exports: [FlowsService],
})
export class FlowsModule {}
