import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Zap, Loader2, X, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConversionResult } from '../../shared/types';

interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
  onConvert: (result: ConversionResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onConvert,
  isLoading,
  setIsLoading
}) => {
  const [uploadedFile, setUploadedFile] = React.useState<{
    name: string;
    content: string;
  } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('📁 File too large. Maximum allowed: 5MB', {
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

    try {
      const content = await file.text();
      setUploadedFile({ name: file.name, content });
      onFileUpload(content, file.name);
      toast.success(`✅ File ${file.name} loaded successfully!`, {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } catch (error) {
      toast.error('❌ Error reading file', {
        style: {
          background: '#FF6B6B',
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      console.error('File reading error:', error);
    }
  }, [onFileUpload]);

  const handleConvertFile = useCallback(async () => {
    if (!uploadedFile) {
      toast.error('📄 No file loaded', {
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

    setIsLoading(true);

    try {
      // Importação dinâmica do conversor para evitar dependência cíclica
      const { MarkdownToDiscordConverter } = await import('../../shared/converter');
      const result = MarkdownToDiscordConverter.convertMarkdown(uploadedFile.content);
      
      // Passa o resultado diretamente para o componente pai
      onConvert(result);
      
      toast.success('✨ File converted successfully!', {
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
      toast.error(`❌ ${error instanceof Error ? error.message : 'File conversion error'}`, {
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
      setIsLoading(false);
    }
  }, [uploadedFile, onConvert, setIsLoading]);

  const clearFile = useCallback(() => {
    setUploadedFile(null);
    onFileUpload('', '');
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/plain': ['.txt', '.md']
    },
    multiple: false,
    disabled: isLoading
  });

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
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Upload className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">File Upload</h2>
            <p className="text-sm text-gray-400">Upload your Markdown files for conversion</p>
          </div>
        </div>

        {uploadedFile && (
          <motion.button
            onClick={handleConvertFile}
            disabled={isLoading}
            className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting...</span>
                </motion.div>
              ) : (
                <motion.div
                  key="convert"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Convert File</span>
                  <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </motion.div>

      {/* Dropzone or File Display */}
      <motion.div variants={itemVariants}>
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 backdrop-blur-sm ${
              isDragActive
                ? 'border-purple-400 bg-purple-500/10 scale-[1.02] shadow-2xl shadow-purple-500/20'
                : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              background: isDragActive 
                ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(31, 41, 55, 0.5) 100%)',
            }}
          >
            <input {...getInputProps()} />
            
            <motion.div
              animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
              className="space-y-6"
            >
              <motion.div 
                className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-white/10"
                animate={isDragActive ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
              >
                <Upload className={`w-10 h-10 text-purple-400 ${isDragActive ? 'animate-bounce' : ''}`} />
              </motion.div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? '🎯 Drop your file here!' : '📁 Drag your Markdown file here'}
                </h3>
                <p className="text-gray-400 mb-4">
                  or <span className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">click to browse</span>
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">.md</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">.txt</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Max 5MB</span>
                </div>
              </div>
            </motion.div>

            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {isDragActive && (
                <>
                  <motion.div
                    className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="absolute top-8 right-8 w-1 h-1 bg-pink-400 rounded-full"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Uploaded File Display */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{uploadedFile.name}</h3>
                    <p className="text-green-300 text-sm">
                      📊 {uploadedFile.content.length.toLocaleString()} characters • Ready to convert
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={clearFile}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Remove file"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content Preview */}
            <motion.div 
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Content Preview</h4>
              </div>
              <div className="bg-black/20 rounded-xl p-4 max-h-48 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {uploadedFile.content.substring(0, 800)}
                  {uploadedFile.content.length > 800 && (
                    <span className="text-purple-400">
                      {'\n\n... and {0} more characters'.replace('{0}', (uploadedFile.content.length - 800).toLocaleString())}
                    </span>
                  )}
                </pre>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={clearFile}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Upload className="w-4 h-4" />
                Upload Another File
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Info Section */}
      <motion.div
        className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl backdrop-blur-sm"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
            <FileText className="w-5 h-5 text-yellow-400" />
          </div>
          <h3 className="text-yellow-400 font-semibold">📋 Supported Files</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="space-y-2">
            <p>• <strong className="text-white">.md</strong> - Markdown files</p>
            <p>• <strong className="text-white">.txt</strong> - Text files with Markdown formatting</p>
          </div>
          <div className="space-y-2">
            <p>• Maximum size: <strong className="text-white">5MB</strong></p>
            <p>• Encoding: <strong className="text-white">UTF-8</strong></p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
