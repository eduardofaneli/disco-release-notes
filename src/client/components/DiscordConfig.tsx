import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Webhook, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export interface DiscordSendConfig {
  webhookUrl: string;
}

export interface DiscordConfigProps {
  onWebhookChange?: (url: string) => void;
  onWebhookSaved?: (url: string, success: boolean) => void;
}

export const DiscordConfig: React.FC<DiscordConfigProps> = ({ 
  onWebhookChange,
  onWebhookSaved
}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Carregar webhook salvo do localStorage ao inicializar
  useEffect(() => {
    try {
      const savedWebhook = localStorage.getItem('discord_webhook_url');
      if (savedWebhook) {
        setWebhookUrl(savedWebhook);
        if (onWebhookChange) onWebhookChange(savedWebhook);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Erro ao carregar webhook do cache:', error);
    }
  }, [onWebhookChange]);

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error('URL do webhook é obrigatória para salvar');
      return;
    }

    try {
      // Adiciona indicação de carregamento
      const loadingToast = toast.loading('Verificando webhook...');
      
      // Verificar se o webhook é válido fazendo uma requisição GET
      try {
        const response = await fetch(webhookUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          toast.dismiss(loadingToast);
          toast.error('Webhook inválido. Verifique a URL e tente novamente.');
          return;
        }
        
        // Tenta converter a resposta para JSON
        const webhookData = await response.json();
        
        // Verifica se o webhook tem channel_id válido
        if (!webhookData.channel_id) {
          toast.dismiss(loadingToast);
          toast.error('Webhook inválido. Não foi possível confirmar o canal.');
          return;
        }
        
        toast.dismiss(loadingToast);
      } catch (fetchError) {
        console.error('Erro ao verificar webhook:', fetchError);
        toast.dismiss(loadingToast);
        toast.error('Não foi possível verificar o webhook. Verifique a URL e tente novamente.');
        return;
      }
      
      // Se chegou até aqui, o webhook é válido
      localStorage.setItem('discord_webhook_url', webhookUrl);
      setIsSaved(true);
      toast.success('Webhook verificado e salvo com sucesso!');
      
      // Notificar componentes que o webhook foi salvo usando um evento customizado
      const webhookEvent = new CustomEvent('webhook-saved', { 
        detail: { url: webhookUrl, success: true } 
      });
      window.dispatchEvent(webhookEvent);
      
      // Notificar via props se estiver configurado
      if (onWebhookSaved) onWebhookSaved(webhookUrl, true);
      if (onWebhookChange) onWebhookChange(webhookUrl);
    } catch (error) {
      console.error('Erro ao salvar webhook:', error);
      toast.error('Não foi possível salvar o webhook');
      
      // Notificar que houve erro ao salvar
      if (onWebhookSaved) onWebhookSaved('', false);
    }
  };

  // Função para atualizar o webhook no componente
  const updateWebhookUrl = (url: string) => {
    setWebhookUrl(url);
    if (isSaved && url !== localStorage.getItem('discord_webhook_url')) {
      setIsSaved(false);
    }
    if (onWebhookChange) onWebhookChange(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  return (
    <div className="space-y-6">
      <motion.div
        key="webhook"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* Webhook Configuration */}
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold text-white">Configuração Webhook</h4>
            </div>
            {isSaved && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Salvo
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL do Webhook
              </label>
              <div className="flex-1 relative">
                <input
                  type={showWebhookUrl ? "text" : "password"}
                  value={webhookUrl}
                  onChange={(e) => {
                    updateWebhookUrl(e.target.value);
                  }}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg px-4 py-3 pr-24 text-white placeholder-white placeholder-opacity-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    onClick={() => setShowWebhookUrl(!showWebhookUrl)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white hover:bg-opacity-10"
                    title={showWebhookUrl ? "Ocultar" : "Mostrar"}
                  >
                    {showWebhookUrl ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    disabled={!webhookUrl}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Copiar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-400">
                  Obtenha um webhook em: Configurações do Servidor → Integrações → Webhooks
                </p>
                <button
                  onClick={handleSaveWebhook}
                  disabled={!webhookUrl || isSaved}
                  className={`text-xs px-3 py-1 rounded-md flex items-center gap-1 ${
                    !webhookUrl || isSaved 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSaved ? 'Salvo' : 'Salvar Webhook'}
                </button>
              </div>
            </div>

            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">Como criar um webhook:</p>
                  <ol className="text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Vá para as configurações do seu servidor Discord</li>
                    <li>Clique em "Integrações" no menu lateral</li>
                    <li>Clique em "Webhooks" e depois "Novo Webhook"</li>
                    <li>Configure o canal e copie a URL</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>


    </div>
  );
};
