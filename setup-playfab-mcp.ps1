<#
.SYNOPSIS
    PlayFab MCP Server - Setup Script
    Configures the PlayFab MCP server for Claude Desktop, Claude Code, VS Code, and/or Cursor.

.DESCRIPTION
    This script prompts for your PlayFab and (optionally) Azure AD credentials,
    then writes the correct MCP configuration for your chosen AI client(s).
    No need to clone the repo - it uses the published npm package.

.EXAMPLE
    # Run from PowerShell:
    irm https://raw.githubusercontent.com/inXile-Entertainment/playfab-mcp-server/main/setup-playfab-mcp.ps1 | iex

    # Or if downloaded locally:
    powershell -ExecutionPolicy Bypass -File setup-playfab-mcp.ps1
#>

param(
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Helpers ──────────────────────────────────────────────────────────────────

function Write-Banner {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║       PlayFab MCP Server - Setup             ║" -ForegroundColor Cyan
    Write-Host "  ║  github.com/inXile-Entertainment/playfab-mcp  ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "  [*] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "  [-] $Message" -ForegroundColor Gray
}

function Write-Warn {
    param([string]$Message)
    Write-Host "  [!] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "  [X] $Message" -ForegroundColor Red
}

function Read-Required {
    param([string]$Prompt)
    do {
        $value = Read-Host "  $Prompt"
        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Warn "This field is required."
        }
    } while ([string]::IsNullOrWhiteSpace($value))
    return $value.Trim()
}

function Read-Optional {
    param([string]$Prompt)
    $value = Read-Host "  $Prompt (press Enter to skip)"
    if ([string]::IsNullOrWhiteSpace($value)) { return $null }
    return $value.Trim()
}

function Write-ConfigFile {
    param(
        [string]$Path,
        [string]$Content,
        [string]$Label
    )

    $dir = Split-Path -Parent $Path
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    if ((Test-Path $Path) -and -not $Force) {
        Write-Warn "$Label config already exists: $Path"
        $overwrite = Read-Host "  Overwrite? (y/N)"
        if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
            Write-Info "Skipped $Label."
            return $false
        }
    }

    $Content | Set-Content -Path $Path -Encoding UTF8
    Write-Step "$Label configured: $Path"
    return $true
}

# ── Check prerequisites ─────────────────────────────────────────────────────

function Test-NodeInstalled {
    try {
        $version = & node --version 2>$null
        if ($version -match '^v(\d+)') {
            $major = [int]$Matches[1]
            if ($major -ge 18) {
                return $true
            }
            Write-Err "Node.js $version found but v18+ is required."
            return $false
        }
    } catch {}
    return $false
}

# ── Build config JSON ────────────────────────────────────────────────────────

function Build-EnvBlock {
    param(
        [string]$TitleId,
        [string]$SecretKey,
        [string]$TenantId,
        [string]$ClientId,
        [string]$ClientSecret
    )

    $env = [ordered]@{
        PLAYFAB_TITLE_ID      = $TitleId
        PLAYFAB_DEV_SECRET_KEY = $SecretKey
    }

    if ($TenantId)     { $env['AZURE_TENANT_ID']     = $TenantId }
    if ($ClientId)     { $env['AZURE_CLIENT_ID']      = $ClientId }
    if ($ClientSecret) { $env['AZURE_CLIENT_SECRET']  = $ClientSecret }

    return $env
}

# ── Merge into existing config ───────────────────────────────────────────────

function Merge-McpConfig {
    param(
        [string]$Path,
        [string]$ServerKey,
        [string]$WrapperKey,
        [System.Collections.Specialized.OrderedDictionary]$Env,
        [string]$Label
    )

    $serverEntry = [ordered]@{
        command = "npx"
        args    = @("-y", "@akiojin/playfab-mcp-server")
        env     = $Env
    }

    if (Test-Path $Path) {
        try {
            $existing = Get-Content -Path $Path -Raw | ConvertFrom-Json
            $hash = @{}

            # Convert existing PSObject to hashtable
            foreach ($prop in $existing.PSObject.Properties) {
                $hash[$prop.Name] = $prop.Value
            }

            # Check if playfab server already exists
            $wrapper = $hash[$WrapperKey]
            if ($wrapper) {
                $servers = @{}
                foreach ($prop in $wrapper.PSObject.Properties) {
                    $servers[$prop.Name] = $prop.Value
                }
                if ($servers.ContainsKey($ServerKey) -and -not $Force) {
                    Write-Warn "$Label already has a '$ServerKey' MCP server configured in: $Path"
                    $overwrite = Read-Host "  Overwrite the playfab entry? (y/N)"
                    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
                        Write-Info "Skipped $Label."
                        return
                    }
                }
                $servers[$ServerKey] = $serverEntry

                # Rebuild the wrapper as ordered dict
                $orderedServers = [ordered]@{}
                foreach ($key in $servers.Keys) {
                    $orderedServers[$key] = $servers[$key]
                }
                $hash[$WrapperKey] = $orderedServers
            } else {
                $hash[$WrapperKey] = [ordered]@{ $ServerKey = $serverEntry }
            }

            $orderedHash = [ordered]@{}
            foreach ($key in $hash.Keys) {
                $orderedHash[$key] = $hash[$key]
            }

            $json = $orderedHash | ConvertTo-Json -Depth 10
            $dir = Split-Path -Parent $Path
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
            }
            $json | Set-Content -Path $Path -Encoding UTF8
            Write-Step "$Label updated (merged): $Path"
            return

        } catch {
            Write-Warn "Could not parse existing $Label config. Will overwrite."
        }
    }

    # No existing file or parse failed — write fresh
    $fresh = [ordered]@{
        $WrapperKey = [ordered]@{ $ServerKey = $serverEntry }
    }
    $json = $fresh | ConvertTo-Json -Depth 10
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $json | Set-Content -Path $Path -Encoding UTF8
    Write-Step "$Label configured: $Path"
}

# ── Main ─────────────────────────────────────────────────────────────────────

function Main {
    Write-Banner

    # Check Node.js
    if (-not (Test-NodeInstalled)) {
        Write-Err "Node.js 18+ is required. Install from https://nodejs.org/"
        Write-Host ""
        exit 1
    }
    $nodeVersion = & node --version
    Write-Step "Node.js $nodeVersion detected"

    # ── Collect credentials ──────────────────────────────────────────────
    Write-Host ""
    Write-Host "  --- PlayFab Credentials (required) ---" -ForegroundColor White
    Write-Info "Find these in PlayFab Game Manager > Settings"
    Write-Host ""

    $titleId   = Read-Required "PlayFab Title ID (e.g. F85D2)"
    $secretKey = Read-Required "PlayFab Developer Secret Key"

    # Validate title ID format
    if ($titleId -notmatch '^[A-Fa-f0-9]{5}$') {
        Write-Warn "Title ID '$titleId' doesn't match the expected 5 hex character format."
        $proceed = Read-Host "  Continue anyway? (y/N)"
        if ($proceed -ne 'y' -and $proceed -ne 'Y') { exit 0 }
    }

    Write-Host ""
    Write-Host "  --- Azure AD Credentials (optional, for analytics/KQL) ---" -ForegroundColor White
    Write-Info "Required only for running KQL queries against PlayFab Insights."
    Write-Info "Skip all three to disable analytics."
    Write-Host ""

    $tenantId     = Read-Optional "Azure Tenant ID"
    $clientId     = Read-Optional "Azure Client ID"
    $clientSecret = Read-Optional "Azure Client Secret"

    if ($tenantId -and $clientId -and $clientSecret) {
        Write-Step "Analytics credentials provided"
    } elseif ($tenantId -or $clientId -or $clientSecret) {
        Write-Warn "Partial Azure credentials. All three (Tenant ID, Client ID, Client Secret) are needed for analytics."
        $proceed = Read-Host "  Continue without analytics? (Y/n)"
        if ($proceed -eq 'n' -or $proceed -eq 'N') { exit 0 }
        $tenantId = $null; $clientId = $null; $clientSecret = $null
    } else {
        Write-Info "Analytics skipped (no Azure credentials)."
    }

    $envBlock = Build-EnvBlock -TitleId $titleId -SecretKey $secretKey `
        -TenantId $tenantId -ClientId $clientId -ClientSecret $clientSecret

    # ── Select clients ───────────────────────────────────────────────────
    Write-Host ""
    Write-Host "  --- Select AI Client(s) to configure ---" -ForegroundColor White
    Write-Host ""
    Write-Host "    1) Claude Desktop"
    Write-Host "    2) Claude Code (CLI)"
    Write-Host "    3) VS Code"
    Write-Host "    4) Cursor"
    Write-Host "    5) All of the above"
    Write-Host ""

    $selection = Read-Host "  Enter choice (1-5, comma-separated for multiple)"
    $choices = $selection -split '[,\s]+' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }

    if ($choices -contains '5') {
        $choices = @('1', '2', '3', '4')
    }

    $configured = @()

    Write-Host ""

    # ── Claude Desktop ───────────────────────────────────────────────────
    if ($choices -contains '1') {
        $claudeDesktopPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
        Merge-McpConfig -Path $claudeDesktopPath `
            -ServerKey "playfab" `
            -WrapperKey "mcpServers" `
            -Env $envBlock `
            -Label "Claude Desktop"
        $configured += "Claude Desktop"
    }

    # ── Claude Code ──────────────────────────────────────────────────────
    if ($choices -contains '2') {
        $claudeCodePath = Join-Path $env:USERPROFILE ".claude\mcp.json"
        Merge-McpConfig -Path $claudeCodePath `
            -ServerKey "playfab" `
            -WrapperKey "mcpServers" `
            -Env $envBlock `
            -Label "Claude Code"
        $configured += "Claude Code"
    }

    # ── VS Code ──────────────────────────────────────────────────────────
    if ($choices -contains '3') {
        Write-Host ""
        $vscodePath = Read-Host "  VS Code project path (where .vscode/ will be created)"
        if ([string]::IsNullOrWhiteSpace($vscodePath)) {
            $vscodePath = Get-Location
            Write-Info "Using current directory: $vscodePath"
        }
        $vscodeConfigPath = Join-Path $vscodePath ".vscode\mcp.json"
        Merge-McpConfig -Path $vscodeConfigPath `
            -ServerKey "PlayFab" `
            -WrapperKey "servers" `
            -Env $envBlock `
            -Label "VS Code"
        $configured += "VS Code"
    }

    # ── Cursor ───────────────────────────────────────────────────────────
    if ($choices -contains '4') {
        Write-Host ""
        $cursorPath = Read-Host "  Cursor project path (where .cursor/ will be created)"
        if ([string]::IsNullOrWhiteSpace($cursorPath)) {
            $cursorPath = Get-Location
            Write-Info "Using current directory: $cursorPath"
        }
        $cursorConfigPath = Join-Path $cursorPath ".cursor\mcp.json"
        Merge-McpConfig -Path $cursorConfigPath `
            -ServerKey "playfab" `
            -WrapperKey "mcpServers" `
            -Env $envBlock `
            -Label "Cursor"
        $configured += "Cursor"
    }

    # ── Summary ──────────────────────────────────────────────────────────
    Write-Host ""
    Write-Host "  ────────────────────────────────────────────────" -ForegroundColor Cyan

    if ($configured.Count -eq 0) {
        Write-Warn "No clients were configured."
    } else {
        Write-Step "Setup complete! Configured: $($configured -join ', ')"
        Write-Host ""
        Write-Info "Next steps:"
        Write-Info "  1. Restart your AI client(s)"
        Write-Info "  2. Try: `"Show me the latest 10 items`""
        if ($tenantId) {
            Write-Info "  3. Try analytics: ['ingested-data'] | take 10"
        }
    }

    Write-Host ""
}

# Run
Main
