# Blocks edits/writes to AGENTS.md Protected Areas before the write happens.
# Canonical companion to pre-tool-use.ps1 (which guards destructive *commands*).
# This guard covers file *writes*: Claude passes PreToolUse JSON on stdin with
# tool_input.file_path (Edit/Write/MultiEdit) or tool_input.notebook_path
# (NotebookEdit). Fail-open on unparseable input so a malformed payload never
# blocks all edits; fail-closed only on a confirmed protected-path match.

$rawInput = ""
if ([Console]::IsInputRedirected) {
    $rawInput = [Console]::In.ReadToEnd()
}
if (-not $rawInput.Trim()) { exit 0 }

try {
    $payload = $rawInput | ConvertFrom-Json -ErrorAction Stop
} catch {
    [Console]::Error.WriteLine("PROTECT GUARD: unparseable hook payload — allowing (fail-open).")
    exit 0
}

$toolInput = $payload.tool_input
if (-not $toolInput) { exit 0 }

# Resolve the target path from whichever write-style tool fired.
$filePath = $null
foreach ($prop in @("file_path", "notebook_path", "path")) {
    if ($toolInput.PSObject.Properties.Name -contains $prop -and $toolInput.$prop) {
        $filePath = [string]$toolInput.$prop
        break
    }
}
if (-not $filePath) { exit 0 }

# Normalize to a repo-relative, forward-slash, lowercase path for matching.
$project = $env:CLAUDE_PROJECT_DIR
if (-not $project) { $project = (Get-Location).Path }
$repoRoot = git -C $project rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or -not $repoRoot) { $repoRoot = $project }

$normalized = $filePath -replace '\\', '/'
$repoRootNorm = ([string]$repoRoot) -replace '\\', '/'
if ($repoRootNorm -and $normalized.ToLowerInvariant().StartsWith($repoRootNorm.ToLowerInvariant())) {
    $normalized = $normalized.Substring($repoRootNorm.Length).TrimStart('/')
}
$leaf = ($normalized -split '/')[-1]
$match = $normalized.ToLowerInvariant()
$leafLower = $leaf.ToLowerInvariant()

function Deny-Write([string]$reason) {
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

# Allow-list first: example/template files are safe even if they look protected.
$allowedSuffixes = @('.example', '.example.json', '.example.md', '.sample', '.template')
foreach ($s in $allowedSuffixes) {
    if ($leafLower.EndsWith($s)) { exit 0 }
}
if ($leafLower -eq '.env.example' -or $match -like '*.env.*.example') { exit 0 }

# Protected-area rules (AGENTS.md §Protected Areas + nested AGENTS.md scopes).
$rules = @(
    @{ Test = { param($m, $l) $l -eq '.env' -or $l -like '.env.*' };
       Reason = "Secret/env file edit blocked. Never write .env values (AGENTS.md Protected Areas)." },
    @{ Test = { param($m, $l) $m -like 'packages/sentra/*' };
       Reason = "Crown-jewel edit blocked. packages/sentra/** is review-first; diagnose first and edit only with explicit Chief GO (AGENTS.md Protected Areas)." },
    @{ Test = { param($m, $l) $l -eq 'wxt.config.ts' };
       Reason = "wxt.config.ts controls extension permissions — do not modify without Chief approval (sentra-assist AGENTS.md)." },
    @{ Test = { param($m, $l) $m -like '*prisma/migrations/*' -or $l -eq 'schema.prisma' };
       Reason = "Database schema/migration edit blocked — requires explicit Chief approval (AGENTS.md Protected Areas)." },
    @{ Test = { param($m, $l) $l.EndsWith('.tf') -or $l.EndsWith('.tfvars') -or $m -like 'infrastructure/*' };
       Reason = "Infrastructure/Terraform edit blocked — Chief-only (AGENTS.md Protected Areas)." },
    @{ Test = { param($m, $l) $l -in @('secrets.json','secrets.yaml','secrets.yml','credentials.json') -or $l.EndsWith('.pem') -or $l.EndsWith('.key') -or $l.EndsWith('.p12') -or $l.EndsWith('.pfx') };
       Reason = "Secret-material file edit blocked (AGENTS.md Protected Areas / .gitignore secret rules)." }
)

foreach ($rule in $rules) {
    if (& $rule.Test $match $leafLower) {
        Deny-Write $rule.Reason
    }
}

exit 0
