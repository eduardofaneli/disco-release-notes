# Converter o arquivo markdown para JSON
function Convert-MarkdownToDiscord {
    param(
        [Parameter(Mandatory = $true)]
        [string]$InputFile,

        [Parameter(Mandatory = $false)]
        [string]$OutputFile = "$InputFile.json"
    )

    try {
        Write-Host "🔄 Convertendo $InputFile para formato Discord..." -ForegroundColor Cyan

        # Executar o script de conversão
        npx tsx src/main.ts $InputFile $OutputFile

        # Se a conversão foi bem-sucedida e o arquivo existe
        if ($?) {
            Write-Host "✅ Arquivo convertido com sucesso!" -ForegroundColor Green
            Write-Host "📄 Output: $OutputFile" -ForegroundColor Yellow
        }

    } catch {
        Write-Host "❌ Erro ao converter arquivo: $_" -ForegroundColor Red
    }
}

# Exemplo de uso
# Convert-MarkdownToDiscord -InputFile "release_notes.md" -OutputFile "release_notes.discord.json"
