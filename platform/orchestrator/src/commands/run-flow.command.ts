export class RunFlowCommand {
  constructor(
    public readonly flowId: string,
    public readonly organizationId: string,
    public readonly input: Record<string, unknown>,
    public readonly shadowMode?: boolean
  ) {}
}
