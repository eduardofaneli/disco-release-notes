import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Zap, Loader2, Sparkles, Eye, Code2, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConversionResult } from '../../shared/types';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onConvert: (result: ConversionResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  content,
  onChange,
  onConvert,  
  setIsLoading
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(async () => {
    if (!content.trim()) {
      toast.error('✍️ Please enter some content to convert', {
        style: {
          background: '#FF6B6B',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return;
    }

    setIsConverting(true);
    setIsLoading(true);

    try {
      // Processa o conteúdo para remover blocos de código e caracteres de escape
      const processedContent = processCodeBlocks(content);
      
      // Importação dinâmica do conversor para evitar dependência cíclica
      const { MarkdownToDiscordConverter } = await import('../../shared/converter');
      const result = MarkdownToDiscordConverter.convertMarkdown(processedContent);
      
      // Passa o resultado diretamente para o componente pai
      onConvert(result);
      
      toast.success('✨ Successfully converted to Discord format!', {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
        duration: 3000,
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        style: {
          background: '#FF6B6B',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
        duration: 4000,
      });
    } finally {
      setIsConverting(false);
      setIsLoading(false);
    }
  }, [content, onConvert, setIsLoading]);

  const handleCopyContent = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('📋 Content copied to clipboard!', {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content', {
        style: {
          background: '#FF6B6B',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    }
  }, [content]);

  // Função para tratar corretamente blocos de código ao colar texto
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Verifica se o texto colado parece ser um bloco de código
    if (pastedText.includes('```markdown') || pastedText.includes('```')) {
      e.preventDefault();
      
      // Processa o texto para remover delimitadores de blocos de código
      const processedText = processCodeBlocks(pastedText);
      
      // Insere o texto processado na posição atual do cursor
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = 
        content.substring(0, start) + 
        processedText + 
        content.substring(end);
      
      onChange(newContent);
    }
  };
  
  // Função para processar texto e preparar para conversão
  const processCodeBlocks = (text: string): string => {
    // Normaliza quebras de linha mas preserva blocos de código
    return text.replace(/\\n/g, '\n');
  };

  // Função para formatar markdown para visualização no preview
  const formatMarkdownPreview = (text: string): string => {
    // Processa blocos de código com backticks triplos
    let processedHtml = text;
    
    // Primeiro, substituímos os blocos de código por placeholders temporários
    const codeBlocks: {language: string, code: string}[] = [];
    processedHtml = processedHtml.replace(/```([\w]*)\s*\n([\s\S]*?)```/g, (_match, language, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push({ language, code });
      return placeholder;
    });
    
    // Agora aplicamos as transformações regulares de Markdown para HTML
    processedHtml = processedHtml
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-blue-400 mb-3 mt-6">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-purple-400 mb-4 mt-8">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mb-6 mt-8">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-300 italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-700/60 text-blue-300 px-2 py-1 rounded font-mono text-sm">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="text-gray-200 mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l|p])(.+)$/gm, '<p class="mb-4">$1</p>');
    
    // Por fim, substituímos os placeholders pelos blocos de código formatados em HTML
    codeBlocks.forEach((block, index) => {
      const languageClass = block.language ? `language-${block.language}` : '';
      const languageHeader = block.language ? 
        `<div class="bg-gray-700 text-gray-300 px-4 py-1 text-xs rounded-t-md">${block.language}</div>` : '';
      
      const formattedCodeBlock = `
        <div class="my-4 rounded-md overflow-hidden">
          ${languageHeader}
          <pre class="bg-gray-800 p-4 overflow-x-auto rounded-b-md ${!block.language ? 'rounded-t-md' : ''}">
            <code class="text-gray-300 text-sm font-mono ${languageClass}">${escapeHtml(block.code.trim())}</code>
          </pre>
        </div>
      `;
      
      processedHtml = processedHtml.replace(`__CODE_BLOCK_${index}__`, formattedCodeBlock);
    });
    
    return processedHtml;
  };
  
  // Função auxiliar para escapar caracteres HTML
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  
  // Função para carregar o exemplo de markdown com bloco de código
  const loadExampleMarkdown = () => {
    const example = `# 🚀 Release Notes v1.0.0

Bem-vindos ao **Discord Release Notes Generator**! 
Esta ferramenta permite converter facilmente seu markdown em mensagens formatadas para Discord.

## ✨ Novos Recursos
- Suporte completo para blocos de código
- Preview em tempo real
- Formatação Discord nativa

## 🐛 Correções
- Blocos de código agora são preservados corretamente
- Performance melhorada

## 📝 Exemplos de Código

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

## 📋 Como Usar
1. Escreva seu markdown
2. Clique em "Converter para Discord"
3. Veja o preview formatado
4. Envie para o Discord`;
    
    onChange(example);
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      y: -2,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm border border-white/10">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Markdown Editor</h2>
            <p className="text-sm text-gray-400">Write your release notes in Markdown</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Toggle */}
          <motion.button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              isPreviewMode
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {isPreviewMode ? <Code2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreviewMode ? 'Edit' : 'Preview'}
          </motion.button>

          {/* Copy Button */}
          <motion.button
            type="button"
            onClick={handleCopyContent}
            disabled={!content.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-sm text-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Sample Button */}
          <motion.button
            type="button"
            onClick={loadExampleMarkdown}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-sm text-gray-300 transition-all duration-200"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sample</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Editor/Preview Section */}
      <motion.div
        className="relative"
        variants={itemVariants}
      >
        <AnimatePresence mode="wait">
          {isPreviewMode ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px] p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl"
            >
              <div className="prose prose-invert max-w-none">
                {content.trim() ? (
                  <div
                    className="text-gray-200 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdownPreview(content)
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Start typing to see the preview...</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <textarea
                value={content}
                onChange={(e) => onChange(processCodeBlocks(e.target.value))}
                onPaste={handlePaste}
                placeholder="# Release Notes v1.0.0

## 🚀 New Features
- **Amazing Feature**: Description of the new feature
- **Another Feature**: More details about improvements

## 🐛 Bug Fixes
- Fixed issue with login
- Resolved performance problems

## 💫 Improvements
- Enhanced user interface
- Better error handling

---
*Ready to convert to Discord format!*"
                className="w-full min-h-[400px] p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 font-mono text-sm leading-relaxed"
                style={{
                  background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                }}
              />
              
              {/* Character Count */}
              <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-gray-800/80 px-2 py-1 rounded-md backdrop-blur-sm">
                {content.length} characters
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Convert Button */}
      <motion.div
        className="flex justify-center"
        variants={itemVariants}
      >
        <motion.button
          type="button"
          onClick={handleConvert}
          disabled={isConverting || !content.trim()}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="flex items-center justify-center gap-3">
            <AnimatePresence mode="wait">
              {isConverting ? (
                <motion.div
                  key="loading"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-3"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </motion.div>
              ) : (
                <motion.div
                  key="convert"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-3"
                >
                  <Zap className="w-5 h-5" />
                  <span>Convert to Discord</span>
                  <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
