$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipPath = "smr_deploy_${timestamp}.zip"
$distDir = Resolve-Path "client\dist"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($distDir, $zipPath)

$file = Get-Item $zipPath
Write-Output "CREATED_ZIP: $($file.FullName) | SIZE: $($file.Length) bytes"

# Verify zip entries
$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
Write-Output "ENTRIES_COUNT: $($zip.Entries.Count)"
foreach ($entry in $zip.Entries) {
    Write-Output " - $($entry.FullName) ($($entry.Length) bytes)"
}
$zip.Dispose()
