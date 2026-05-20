import { Controller, Get, Post, Body, Param, UseInterceptors, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger'

import { type FlowExecutionDto } from '../common/dto/flow-execution.dto'
import { ApiKeyGuard } from '../common/guards/api-key.guard'
import { ShadowModeInterceptor } from '../common/interceptors/shadow-mode.interceptor'

import { type FlowsService } from './flows.service'

@ApiTags('flows')
@ApiBearerAuth()
@UseGuards(ApiKeyGuard)
@Controller('flows')
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

  @Post(':flowId/run')
  @ApiOperation({ summary: 'Execute an AI flow using the Saga Orchestrator' })
  @ApiParam({ name: 'flowId', description: 'The unique identifier of the AI flow' })
  @ApiResponse({ status: 201, description: 'Flow execution started successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing API key.' })
  @UseInterceptors(ShadowModeInterceptor)
  async runFlow(@Param('flowId') flowId: string, @Body() executionDto: FlowExecutionDto) {
    return this.flowsService.runFlow(flowId, executionDto)
  }

  @Get(':executionId/status')
  @ApiOperation({ summary: 'Get the status of a saga execution' })
  @ApiParam({ name: 'executionId', description: 'The unique identifier of the execution' })
  @ApiResponse({ status: 200, description: 'Execution status retrieved.' })
  @ApiResponse({ status: 404, description: 'Execution not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing API key.' })
  async getExecutionStatus(@Param('executionId') executionId: string) {
    return this.flowsService.getExecutionStatus(executionId)
  }
}
