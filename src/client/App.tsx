import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { TextEditor } from './components/TextEditor';
import { MessagePreview } from './components/MessagePreview';
import { DiscordConfig } from './components/DiscordConfig';
import { ConversionResult } from '../shared/types';

function App() {
  
  const [markdownContent, setMarkdownContent] = useState(`# 🚀 Release Notes v1.0.0 🚀

Bem-vindos ao **Discord Release Notes Generator**! 

Esta ferramenta permite converter facilmente seus arquivos Markdown em mensagens formatadas para Discord.

---

## ✨ Como Usar

### 📝 Opção 1: Editor
1. Digite ou cole seu conteúdo Markdown no editor à esquerda
2. Clique em "Converter para Discord" 
3. Veja o preview formatado à direita
4. Copie o resultado para usar no Discord

### 📁 Opção 2: Upload de Arquivo
1. Clique na aba "Upload"
2. Arraste seu arquivo .md ou clique para selecionar
3. O conteúdo será carregado automaticamente
4. Clique em "Converter para Discord"

---

## 🎯 Exemplo de Uso

### JavaScript
\`\`\`js
function exemploJS() {
  console.log("Este é um exemplo de código JavaScript");
  return true;
}
\`\`\`

### JSON
\`\`\`json
{
  "nome": "Discord Release Notes",
  "versao": "1.0.0",
  "recursos": ["Markdown", "Blocos de código", "Webhooks"]
}
\`\`\`

Experimente editar este texto e veja a mágica acontecer! ✨`);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'upload'>('editor');
  const [showConfig, setShowConfig] = useState(false);

  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content);
    setConversionResult(null);
  }, []);

  const handleFileUpload = useCallback((content: string, filename: string) => {
    setMarkdownContent(content);
    setConversionResult(null);
    console.log(`Arquivo carregado: ${filename}`);
  }, []);

  const loadExampleTemplate = useCallback(async () => {
    try {
      const response = await fetch('/templates/release-notes-example.md');
      const content = await response.text();
      setMarkdownContent(content);
      setConversionResult(null);
    } catch (error) {
      console.error('Erro ao carregar template:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            Discord Release Notes
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Converta seus arquivos Markdown em mensagens formatadas para Discord
          </p>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-6 rounded-xl">
              <div className="text-3xl font-bold text-blue-400 mb-2">✨</div>
              <div className="text-xl font-semibold text-white">Fácil de Usar</div>
              <div className="text-gray-400">Interface intuitiva</div>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-6 rounded-xl">
              <div className="text-3xl font-bold text-purple-400 mb-2">⚡</div>
              <div className="text-xl font-semibold text-white">Conversão Rápida</div>
              <div className="text-gray-400">Resultados instantâneos</div>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-6 rounded-xl">
              <div className="text-3xl font-bold text-green-400 mb-2">🎯</div>
              <div className="text-xl font-semibold text-white">100% Compatível</div>
              <div className="text-gray-400">Formato Discord</div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={loadExampleTemplate}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 transform shadow-lg"
            >
              📋 Carregar Template Completo
            </button>
            <button
              onClick={() => setMarkdownContent('')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 transform"
            >
              🗑️ Limpar Editor
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-xl p-1 inline-flex">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setActiveTab('editor')}
            >
              ✏️ Editor
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              📁 Upload
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            {activeTab === 'editor' ? (
              <TextEditor
                content={markdownContent}
                onChange={handleContentChange}
                onConvert={setConversionResult}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            ) : (
              <FileUpload
                onFileUpload={handleFileUpload}
                onConvert={setConversionResult}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            
            {/* Discord Configuration */}
            <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">⚙️ Configurações Discord</h3>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showConfig ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {showConfig && (
                <DiscordConfig 
                  onWebhookChange={(url) => {
                    // Just to sync the webhook across components
                    console.log('Webhook configurado:', url);
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <MessagePreview
              result={conversionResult}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-gray-400 mb-4">
              Desenvolvido com ❤️ para facilitar a criação de release notes no Discord
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/eduardofaneli/disco-release-notes#readme"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                GitHub
              </a>
              <span className="text-gray-600">•</span>
              <a
                href="https://discord.gg/Hhp7TE5U"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
        </footer>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </div>
  );
}

export default App;
