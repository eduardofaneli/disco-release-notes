import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Download, Loader2, MessageSquare, Hash, Copy, CheckCircle2, Sparkles, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConversionResult, DiscordMessage, DiscordEmbed } from '../../shared/types';

interface MessagePreviewProps {
  result: ConversionResult | null;
  isLoading: boolean;
}

export const MessagePreview: React.FC<MessagePreviewProps> = ({ result, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  // Load webhook from localStorage when component mounts
  useEffect(() => {
    try {
      const savedWebhook = localStorage.getItem('discord_webhook_url');
      if (savedWebhook) {
        setWebhookUrl(savedWebhook);
      }
    } catch (error) {
      console.error('Error loading webhook from cache:', error);
    }

    // Define a custom event handler for webhook updates
    const handleWebhookSaved = (event: CustomEvent) => {
      if (event.detail && event.detail.url) {
        setWebhookUrl(event.detail.url);
      }
    };

    // Add event listener for custom webhook-saved event
    window.addEventListener('webhook-saved', handleWebhookSaved as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('webhook-saved', handleWebhookSaved as EventListener);
    };
  }, []);

  const downloadJson = () => {
    if (!result) return;

    const dataStr = JSON.stringify(result.messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `discord-messages-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('📥 JSON file downloaded!', {
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  };

  const copyToClipboard = async () => {
    if (!result) return;

    try {
      const jsonString = JSON.stringify(result.messages, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success('📋 JSON copied to clipboard!', {
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
      toast.error('Failed to copy to clipboard', {
        style: {
          background: '#FF6B6B',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    }
  };

  const sendToDiscord = async () => {
    if (!result || !webhookUrl.trim()) {
      if (!webhookUrl.trim()) {
        toast.error('Webhook URL não configurada', {
          style: {
            background: '#FF6B6B',
            color: 'white',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
      return;
    }

    setIsSending(true);
    try {
      // Send messages one by one (Discord has rate limits)
      let successCount = 0;
      
      for (const message of result.messages) {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          successCount++;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error sending to Discord:', response.status, errorData);
          throw new Error(`Error ${response.status}: ${errorData.message || 'Unknown error'}`);
        }

        // Add a small delay between messages to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success(`✅ ${successCount} mensagem(ns) enviada(s) para Discord!`, {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error sending to Discord:', error);
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, {
        style: {
          background: '#FF6B6B',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatColor = (color?: number) => {
    if (!color) return '#5865F2';
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  const formatDiscordContent = (content: string): React.ReactNode => {
    // First, let's extract code blocks and replace them with placeholders
    const codeBlocks: {language: string, code: string}[] = [];
    const contentWithPlaceholders = content.replace(/```([\w]*)\n([\s\S]*?)```/g, (_match, language, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push({ language, code });
      return placeholder;
    });
    
    // Now split by the placeholders
    const parts = contentWithPlaceholders.split(/(__(CODE_BLOCK_\d+)__)/g);
    
    // Format and return the content with properly rendered code blocks
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('__CODE_BLOCK_')) {
            const blockIndex = parseInt(part.replace('__CODE_BLOCK_', '').replace('__', ''));
            const block = codeBlocks[blockIndex];
            if (!block) return null;
            const { language, code } = block;
            
            return (
              <div key={index} className="my-2 rounded-md overflow-hidden">
                {language && (
                  <div className="bg-gray-700 text-gray-300 px-4 py-1 text-xs">
                    {language}
                  </div>
                )}
                <pre className="bg-gray-800 p-4 overflow-x-auto">
                  <code className="text-gray-300 text-sm font-mono">
                    {code}
                  </code>
                </pre>
              </div>
            );
          }
          
          // Return regular text with line breaks preserved
          return (
            <span key={index}>
              {part.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < part.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          );
        })}
      </>
    );
  };

  const renderEmbed = (embed: DiscordEmbed, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm"
      style={{ 
        borderLeft: `4px solid ${formatColor(embed.color)}`,
        background: `linear-gradient(135deg, ${formatColor(embed.color)}10 0%, rgba(31, 41, 55, 0.5) 100%)`
      }}
    >
      {embed.title && (
        <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: formatColor(embed.color) }} />
          {embed.title}
        </h3>
      )}
      
      {embed.description && (
        <div className="text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
          {formatDiscordContent(embed.description)}
        </div>
      )}
      
      {embed.fields && embed.fields.length > 0 && (
        <div className="space-y-3">
          {embed.fields.map((field, fieldIndex) => (
            <div key={fieldIndex} className="bg-black/20 rounded-lg p-3 border border-white/5">
              <div className="font-semibold text-white text-sm mb-1">{field.name}</div>
              <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {formatDiscordContent(field.value)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {embed.footer && (
        <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-gray-500"></div>
          {embed.footer.text}
        </div>
      )}
      
      {/* Accent line */}
      <div 
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        style={{ backgroundColor: formatColor(embed.color) }}
      />
    </motion.div>
  );

  const renderMessage = (message: DiscordMessage, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-6 border border-white/10 backdrop-blur-sm shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl">
          <MessageSquare className="w-4 h-4 text-blue-400" />
        </div>
        <span className="font-medium text-white">
          Message {index + 1}
        </span>
        <div className="ml-auto text-xs text-gray-500 bg-gray-800/60 px-2 py-1 rounded-md">
          {message.embeds?.length ? `${message.embeds.length} embed${message.embeds.length > 1 ? 's' : ''}` : 'Text only'}
        </div>
      </div>
      
      {message.content && (
        <div className="text-gray-200 text-sm mb-4 bg-black/30 rounded-xl p-4 leading-relaxed whitespace-pre-wrap border border-white/5">
          {formatDiscordContent(message.content)}
        </div>
      )}
      
      {message.embeds && message.embeds.length > 0 && (
        <div className="space-y-4">
          {message.embeds.map((embed, embedIndex) => renderEmbed(embed, embedIndex))}
        </div>
      )}
    </motion.div>
  );

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
      className="space-y-6 sticky top-4"
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
          <div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Eye className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Message Preview</h2>
            <p className="text-sm text-gray-400">See how your content will look in Discord</p>
          </div>
        </div>
        
        {result && (
          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <motion.button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-sm text-gray-300 transition-all duration-200"
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

            {/* Download Button */}
            <motion.button
              onClick={downloadJson}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium text-sm rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200"
              title="Download JSON"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </motion.button>

            {/* Send to Discord Button */}
            <motion.button
              onClick={sendToDiscord}
              disabled={!webhookUrl.trim() || isSending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                !webhookUrl.trim() || isSending
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25'
              }`}
              title={!webhookUrl.trim() ? "Configure o Webhook Discord primeiro" : "Enviar para Discord"}
              variants={buttonVariants}
              {...(webhookUrl.trim() && !isSending ? { whileHover: "hover", whileTap: "tap" } : {})}
            >
              <AnimatePresence mode="wait">
                {isSending ? (
                  <motion.div
                    key="sending"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Sending...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Content Area */}
      <motion.div
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl"
        variants={itemVariants}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-gray-300"
            >
              <div className="relative">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-purple-400/20 rounded-full animate-pulse" />
              </div>
              <span className="mt-4 text-lg font-medium">Converting markdown...</span>
              <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {result.metadata.messageCount}
                  </div>
                  <div className="text-sm text-gray-400">Messages</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {result.metadata.embedCount}
                  </div>
                  <div className="text-sm text-gray-400">Embeds</div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Discord Messages</h3>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-gray-600/50 hover:scrollbar-thumb-gray-500/50">
                  {result.messages.map((message, index) => renderMessage(message, index))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <motion.div 
                className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-700/20 to-gray-600/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Hash className="w-10 h-10 text-gray-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">
                No conversion yet
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Type or upload a Markdown file to see how it will look as Discord messages with embeds and formatting
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tips Section */}
      {!result && !isLoading && (
        <motion.div
          className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl backdrop-blur-sm"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-yellow-400 font-semibold">🎯 How the preview works</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
            <div className="space-y-2">
              <p>• See exactly how it will look in Discord</p>
              <p>• Colors and formatting are preserved</p>
            </div>
            <div className="space-y-2">
              <p>• Embeds and fields are rendered correctly</p>
              <p>• Download JSON for use in other tools</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
