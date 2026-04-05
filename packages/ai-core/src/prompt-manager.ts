import type { PromptTemplate } from './types'

export class PromptManager {
  private prompts: Map<string, PromptTemplate>
  private promptsPath: string

  constructor(promptsPath?: string) {
    this.prompts = new Map()
    this.promptsPath = promptsPath || '.agents/prompts'
  }

  register(template: PromptTemplate): void {
    this.prompts.set(template.id, template)
  }

  get(id: string, variables?: Record<string, string>): string | null {
    const template = this.prompts.get(id)
    if (!template) return null

    if (!variables) return template.template

    return Object.entries(variables).reduce(
      (result, [key, value]) => result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value),
      template.template
    )
  }

  list(): PromptTemplate[] {
    return Array.from(this.prompts.values())
  }

  async loadFromPath(): Promise<void> {
    // TODO: Load prompts from filesystem
    console.log(`Loading prompts from ${this.promptsPath}`)
  }
}
