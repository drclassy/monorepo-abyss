import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FlowExecutionDto {
  @ApiProperty({ description: 'The input data for the AI flow' })
  @IsObject()
  input!: Record<string, unknown>;

  @ApiProperty({ description: 'The organization ID triggering the execution' })
  @IsString()
  organizationId!: string;

  @ApiProperty({ description: 'Optional session ID to track long-running flows', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: 'Enable shadow mode for A/B testing comparison', default: false })
  @IsOptional()
  @IsBoolean()
  shadowMode?: boolean;
}
