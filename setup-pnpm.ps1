#!/usr/bin/env pwsh

# Script para garantir o uso do pnpm
# Verifica se pnpm está instalado e força seu uso

Write-Host "🔍 Verificando se pnpm está instalado..." -ForegroundColor Cyan

try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm v$pnpmVersion encontrado!" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm não encontrado. Instalando..." -ForegroundColor Red
    Write-Host "📦 Instalando pnpm globalmente..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✅ pnpm instalado com sucesso!" -ForegroundColor Green
}

# Verifica se existe package-lock.json e remove
if (Test-Path "package-lock.json") {
    Write-Host "🧹 Removendo package-lock.json (npm)..." -ForegroundColor Yellow
    Remove-Item "package-lock.json" -Force
}

# Verifica se existe yarn.lock e remove
if (Test-Path "yarn.lock") {
    Write-Host "🧹 Removendo yarn.lock (yarn)..." -ForegroundColor Yellow
    Remove-Item "yarn.lock" -Force
}

# Verifica se existe node_modules e limpa se necessário
if (Test-Path "node_modules") {
    Write-Host "🧹 Limpando node_modules existente..." -ForegroundColor Yellow
    Remove-Item "node_modules" -Recurse -Force
}

Write-Host "📦 Instalando dependências com pnpm..." -ForegroundColor Cyan
pnpm install

Write-Host "🎉 Projeto configurado para usar pnpm!" -ForegroundColor Green
Write-Host "📋 Comandos disponíveis:" -ForegroundColor Cyan
Write-Host "  • pnpm dev         - Iniciar desenvolvimento" -ForegroundColor White
Write-Host "  • pnpm build       - Fazer build de produção" -ForegroundColor White
Write-Host "  • pnpm start       - Iniciar servidor produção" -ForegroundColor White
Write-Host "  • pnpm lint        - Verificar código" -ForegroundColor White
