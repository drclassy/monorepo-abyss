# Blocks destructive commands before Bash tool execution
$cmd = $env:CLAUDE_BASH_COMMAND
$blocked = @(
    "rm -rf",
    "git reset --hard",
    "git clean -fd",
    "git clean -f",
    "DROP TABLE",
    "DROP DATABASE",
    "terraform apply",
    "terraform destroy",
    "del /f /s /q"
)

foreach ($b in $blocked) {
    if ($cmd -like "*$b*") {
        [Console]::Error.WriteLine("BLOCKED: Destructive command detected — $b. Requires explicit Chief approval.")
        exit 2
    }
}

# === J9 TRAILER VALIDATION ===
# Intercept git commit dan blok jika tidak ada Agent/Phase/Handoff trailer.
# $cmd sudah tersedia dari $env:CLAUDE_BASH_COMMAND di baris 2.

if ($cmd -match 'git\s+commit') {
    if ($cmd -match '-m\s+"([^"]*)"' -or $cmd -match "-m\s+'([^']*)'") {
        $commitMsg = $Matches[1]
        $trailerPattern = 'Agent:\s+.+\s+·\s+Phase:\s+.+\s+·\s+Handoff:\s+.+'
        if ($commitMsg -notmatch $trailerPattern) {
            $block = @{
                hookSpecificOutput = @{
                    hookEventName            = "PreToolUse"
                    permissionDecision       = "deny"
                    permissionDecisionReason = "J9 VIOLATION: Commit message missing required trailer.`nFormat: Agent: [name] · Phase: [phase] · Handoff: [session-id]`nContoh: Agent: Claude · Phase: Execution · Handoff: 2026-05-15-task-name"
                }
                continue = $true
            } | ConvertTo-Json -Compress -Depth 5
            [Console]::Out.WriteLine($block)
            exit 0
        }
    }
    # Commit via heredoc ($(...) atau <<'EOF') — tidak di-intercept (accepted trade-off)
    # karena multi-line string tidak ada dalam $cmd env var.
}
