$indexPath = 'c:\Users\stand\Desktop\JIRSTAN DISPECINK V 64.5\index.html'
$html = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

# Find renderCompetition in index.html
$lines = $html -split "`n"
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "function renderCompetition\(" -or $lines[$i] -match "const COMPETITORS_DB") {
        Write-Output ("Line " + $i + " : " + $lines[$i].Trim())
        for ($j = [Math]::Max(0, $i); $j -lt [Math]::Min($lines.Length, $i + 35); $j++) {
            Write-Output ("  " + $j + " | " + $lines[$j])
        }
    }
}
