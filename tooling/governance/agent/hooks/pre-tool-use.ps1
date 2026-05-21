# Blocks destructive commands before shell execution.
# Canonical hook for all agents. Claude passes CLAUDE_BASH_COMMAND; Codex passes JSON on stdin.
$rawInput = ""
if ([Console]::IsInputRedirected) {
    $rawInput = [Console]::In.ReadToEnd()
}

$payload = $null
if ($rawInput.Trim()) {
    try { $payload = $rawInput | ConvertFrom-Json -ErrorAction Stop } catch { $payload = $null }
}

$cmd = $env:CLAUDE_BASH_COMMAND
if (-not $cmd -and $payload -and $payload.tool_input -and $payload.tool_input.command) {
    $cmd = [string]$payload.tool_input.command
}
if (-not $cmd) { exit 0 }

$normalized = $cmd.ToLowerInvariant()
$blocked = @(
    @{ Pattern = "rm -rf"; Reason = "Destructive delete requires explicit Chief approval." },
    @{ Pattern = "git reset --hard"; Reason = "History reset requires explicit Chief approval." },
    @{ Pattern = "git clean -fd"; Reason = "Repository cleanup requires explicit Chief approval." },
    @{ Pattern = "git clean -f"; Reason = "Repository cleanup requires explicit Chief approval." },
    @{ Pattern = "git push"; Reason = "Pushing to remote requires explicit Chief approval." },
    @{ Pattern = "drop table"; Reason = "Database destructive command is blocked." },
    @{ Pattern = "drop database"; Reason = "Database destructive command is blocked." },
    @{ Pattern = "terraform apply"; Reason = "Terraform apply is Chief-only." },
    @{ Pattern = "terraform destroy"; Reason = "Terraform destroy is Chief-only." },
    @{ Pattern = "del /f /s /q"; Reason = "Destructive delete requires explicit Chief approval." },
    @{ Pattern = "db:migrate"; Reason = "Database migrations require explicit Chief approval." }
)

function Deny-Command([string]$reason) {
    $block = @{
        hookSpecificOutput = @{
            hookEventName            = "PreToolUse"
            permissionDecision       = "deny"
            permissionDecisionReason = $reason
        }
        continue = $true
    } | ConvertTo-Json -Compress -Depth 5
    [Console]::Out.WriteLine($block)
    exit 0
}

foreach ($b in $blocked) {
    if ($normalized.Contains($b.Pattern)) {
        Deny-Command $b.Reason
    }
}

# === J9 TRAILER VALIDATION ===
# Intercept git commit dan blok jika tidak ada Agent/Phase/Handoff trailer.
# $cmd is resolved above from Claude env or Codex JSON payload.

if ($cmd -match 'git\s+commit') {
    # $Matches[1] holds the capture from whichever branch matched first (-or short-circuits)
    if ($cmd -match '-m\s+"([^"]*)"' -or $cmd -match "-m\s+'([^']*)'") {
        $commitMsg = $Matches[1]
        $trailerPattern = 'Agent:\s+.+\s+·\s+Phase:\s+.+\s+·\s+Handoff:\s+.+'
        if ($commitMsg -notmatch $trailerPattern) {
            Deny-Command "J9 VIOLATION: Commit message missing required trailer.`nFormat: Agent: [name] · Phase: [phase] · Handoff: [session-id]`nContoh: Agent: Claude · Phase: Execution · Handoff: 2026-05-15-task-name"
        }
    }
    # Commit via heredoc ($(...) atau <<'EOF') — tidak di-intercept (accepted trade-off)
    # karena multi-line string tidak ada dalam $cmd env var.
}
