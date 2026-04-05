# CLAUDESY-PR MODULE
if ($global:ClaudesyPRLoaded) { return }
$global:ClaudesyPRLoaded = $true

function Test-GitHubCLI { if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { return $false }; return $true }
function Test-GitRepository { if (-not (git rev-parse --git-dir 2>$null)) { return $false }; return $true }
function Get-CurrentBranch { return git rev-parse --abbrev-ref HEAD 2>$null }
function Test-IsMainBranch { $b = Get-CurrentBranch; return $b -eq 'main' -or $b -eq 'master' }

function Invoke-ClaudesyPRChecklist {
    Write-Host 'PRE-PR CHECKLIST' -ForegroundColor Cyan
    if (-not (Test-GitRepository)) { Write-Host 'FAIL: Not git repo' -ForegroundColor Red; return $false }
    if (-not (Test-GitHubCLI)) { Write-Host 'FAIL: gh not installed' -ForegroundColor Red; return $false }
    $cb = Get-CurrentBranch
    if (Test-IsMainBranch) { Write-Host 'FAIL: On main branch' -ForegroundColor Red; return $false }
    Write-Host 'CHECKLIST PASSED' -ForegroundColor Green
    return $true
}

function New-ClaudesyPR {
    param([Parameter(Mandatory=$true)][string]$Title, [string]$Base = 'main', [switch]$Draft, [string]$Reviewer = '', [switch]$Force)
    if (-not $Force) { if (-not (Invoke-ClaudesyPRChecklist)) { return } }
    $cb = Get-CurrentBranch
    if ($cb -eq $Base) { Write-Host 'ERROR: Cannot PR from main' -ForegroundColor Red; return }
    Write-Host 'Pushing...' -ForegroundColor Cyan; git push -u origin $cb
    $ghargs = 'pr','create','--title',$Title,'--base',$Base,'--head',$cb
    if ($Draft) { $ghargs += '--draft' }
    & gh $ghargs
    if ($Reviewer) { gh pr edit --add-reviewer $Reviewer }
    Write-Host 'PR created' -ForegroundColor Green
}

function Get-ClaudesyPRStatus {
    $pr = gh pr view --json number,title,state,url 2>$null | ConvertFrom-Json
    if ($pr) { Write-Host "PR #$($pr.number): $($pr.title) [$($pr.state)]" -ForegroundColor Green; Write-Host $pr.url -ForegroundColor Blue }
    else { Write-Host 'No PR found' -ForegroundColor Yellow }
}

function Get-ClaudesyPRList {
    param([string]$State = 'open')
    gh pr list --state $State --json number,title,state 2>$null | ConvertFrom-Json | ForEach-Object { Write-Host "#$($_.number) $($_.title) [$($_.state)]" }
}

function Request-ClaudesyPRReview { param([string]$r); gh pr edit --add-reviewer $r; Write-Host 'Review requested' -ForegroundColor Green }
function Set-ClaudesyPRReady { gh pr ready; Write-Host 'PR ready' -ForegroundColor Green }
function Remove-ClaudesyMergedBranch {
    $cb = Get-CurrentBranch
    gh pr list --state merged --json headRefName 2>$null | ConvertFrom-Json | ForEach-Object {
        $bn = $_.headRefName
        if ($bn -ne $cb -and $bn -ne 'main') { git branch -d $bn 2>$null; Write-Host "Deleted: $bn" -ForegroundColor Green }
    }
}

function pr-new { param([string]$t); if($t){New-ClaudesyPR -Title $t}else{$t=Read-Host 'Title';New-ClaudesyPR -Title $t} }
function pr-status { Get-ClaudesyPRStatus }
function pr-list { Get-ClaudesyPRList }
function pr-review { param([string]$r); Request-ClaudesyPRReview -r $r }
function pr-ready { Set-ClaudesyPRReady }
function pr-cleanup { Remove-ClaudesyMergedBranch }
function pr-check { Invoke-ClaudesyPRChecklist }

function pr-help {
    Write-Host 'CLAUDESY-PR: pr-new, pr-status, pr-list, pr-review, pr-ready, pr-cleanup, pr-check' -ForegroundColor Cyan
}

Export-ModuleMember -Function New-ClaudesyPR,Get-ClaudesyPRStatus,Get-ClaudesyPRList,Request-ClaudesyPRReview,Set-ClaudesyPRReady,Remove-ClaudesyMergedBranch,pr-new,pr-status,pr-list,pr-review,pr-ready,pr-cleanup,pr-check,pr-help
