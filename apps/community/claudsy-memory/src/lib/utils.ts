import { spawn } from "child_process";
import { PYTHON, ENGINE, ENGINE_CWD, SERVER_BASE_DIR } from "./config";

export interface RunResult {
  stdout: string;
  stderr: string;
  code: number;
}

async function run(args: string[]): Promise<RunResult> {
  return new Promise((resolve) => {
    const proc = spawn(PYTHON, [ENGINE, ...args], {
      shell: false,
      cwd: ENGINE_CWD,
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    proc.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    proc.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 }));
    proc.on("error", (err) => {
      stderr += err.message;
      resolve({ stdout, stderr, code: 1 });
    });
  });
}

function agentArgs(agent: string): string[] {
  return ["--agent", agent, "--base-dir", SERVER_BASE_DIR];
}

/**
 * Runs a command for the given agent.
 * @param agent - The agent name
 * @param command - The command to run
 * @param extra - Extra arguments
 * @returns The run result
 */
export async function runCommand(
  agent: string,
  command: string,
  extra: string[] = [],
): Promise<RunResult> {
  return run([...agentArgs(agent), command, ...extra]);
}

export { run, agentArgs };
