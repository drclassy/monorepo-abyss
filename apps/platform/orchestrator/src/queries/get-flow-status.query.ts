export class GetFlowStatusQuery {
  constructor(
    public readonly executionId: string,
    public readonly organizationId?: string,
  ) {}
}
