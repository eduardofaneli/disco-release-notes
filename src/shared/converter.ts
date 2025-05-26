import { DiscordMessage, DiscordEmbed, ConversionResult } from './types';

export class MarkdownToDiscordConverter {
  private static readonly DISCORD_CHAR_LIMIT = 2000;
  private static readonly EMBED_DESCRIPTION_LIMIT = 4096;
  private static readonly EMBED_FIELD_VALUE_LIMIT = 1024;
  private static readonly EMBED_FIELD_NAME_LIMIT = 256;

  /**
   * Converte texto Markdown para mensagens Discord
   */
  public static convertMarkdown(markdown: string): ConversionResult {
    // Pré-processamento para lidar com blocos de código e caracteres de escape
    const processedMarkdown = this.preprocessMarkdown(markdown);
    
    const sections = this.parseMarkdown(processedMarkdown);
    const messages: DiscordMessage[] = [];
    let totalCharacters = 0;
    let embedCount = 0;
    let fieldCount = 0;

    for (const section of sections) {
      if (section.type === 'embed' && section.embed) {
        messages.push({
          embeds: [section.embed]
        });
        embedCount++;
        if (section.embed.fields) {
          fieldCount += section.embed.fields.length;
        }
        totalCharacters += this.calculateEmbedCharacters(section.embed);
      } else if (section.content) {
        // Divide mensagens longas
        const chunks = this.splitContent(section.content, this.DISCORD_CHAR_LIMIT);
        for (const chunk of chunks) {
          messages.push({
            content: chunk
          });
          totalCharacters += chunk.length;
        }
      }
    }

    return {
      messages,
      metadata: {
        messageCount: messages.length,
        totalCharacters,
        embedCount,
        fieldCount
      }
    };
  }

  private static calculateEmbedCharacters(embed: DiscordEmbed): number {
    let total = 0;
    if (embed.title) total += embed.title.length;
    if (embed.description) total += embed.description.length;
    if (embed.fields) {
      embed.fields.forEach(field => {
        total += field.name.length + field.value.length;
      });
    }
    if (embed.footer) total += embed.footer.text.length;
    return total;
  }

  private static parseMarkdown(markdown: string): ParsedSection[] {
    const lines = markdown.split('\n');
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;
    let currentContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (typeof line === 'undefined') {
        continue;
      }
      const trimmedLine = typeof line === 'string' ? line.trim() : '';

      // Detecta títulos principais (H1, H2)
      if (trimmedLine.startsWith('# ') || trimmedLine.startsWith('## ')) {
        // Salva seção anterior se existir
        if (currentSection) {
          this.finalizeSection(currentSection, currentContent, sections);
        }

        // Inicia nova seção embed
        const title = this.convertMarkdownToDiscord(trimmedLine.replace(/^#+\s*/, ''));
        currentSection = {
          type: 'embed',
          embed: {
            title: this.truncateText(title, 256),
            color: this.getColorFromTitle(title),
            fields: [],
            timestamp: new Date().toISOString()
          }
        };
        currentContent = '';
      }
      // Detecta subtítulos (H3, H4)
      else if (trimmedLine.startsWith('### ') || trimmedLine.startsWith('#### ')) {
        if (currentSection && currentSection.type === 'embed' && currentSection.embed) {
          const fieldName = this.convertMarkdownToDiscord(trimmedLine.replace(/^#+\s*/, ''));
          const fieldContent = this.extractFieldContent(lines, i + 1);
          
          if (fieldContent.trim()) {
            if (!currentSection.embed.fields) {
              currentSection.embed.fields = [];
            }
            currentSection.embed.fields.push({
              name: this.truncateText(fieldName, this.EMBED_FIELD_NAME_LIMIT),
              value: this.truncateText(this.convertMarkdownToDiscord(fieldContent), this.EMBED_FIELD_VALUE_LIMIT),
              inline: false
            });
          }
          
          // Pula as linhas já processadas
          const linesToSkip = fieldContent.split('\n').length;
          i += linesToSkip;
        }
      }
      // Detecta separadores
      else if (trimmedLine === '---') {
        continue; // Ignora separadores
      }
      // Conteúdo regular
      else {
        currentContent += line + '\n';
      }
    }

    // Adiciona última seção
    if (currentSection) {
      this.finalizeSection(currentSection, currentContent, sections);
    }

    return sections;
  }

  private static finalizeSection(section: ParsedSection, content: string, sections: ParsedSection[]) {
    if (section.type === 'embed' && section.embed) {
      // Se não há fields e tem conteúdo, adiciona como description
      if ((!section.embed.fields || section.embed.fields.length === 0) && content.trim()) {
        section.embed.description = this.truncateText(
          this.convertMarkdownToDiscord(content.trim()), 
          this.EMBED_DESCRIPTION_LIMIT
        );
      }
    } else {
      section.content = content.trim();
    }
    sections.push(section);
  }

  private static extractFieldContent(lines: string[], startIndex: number): string {
    let content = '';
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i];
      if (line) {
      const trimmedLine = line.trim();
      // Para quando encontra outro título ou separador
      if (trimmedLine.startsWith('#') || trimmedLine === '---') {
        break;
      }
    }
      

      content += line + '\n';
      i++;
    }

    return content.trim();
  }

  private static convertMarkdownToDiscord(text: string): string {
    // Substituimos temporariamente blocos de código para não interferirem em outras regras
    const codeBlocks: string[] = [];
    
    // Primeiro capturamos todos os blocos de código e os substituímos por placeholders
    const withPlaceholders = text.replace(/```([\w]*)\n([\s\S]*?)```/g, (_match, language, content) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`\`\`\`${language}\n${content}\`\`\``);
      return placeholder;
    });

    // Normaliza caracteres de escape
    let cleaned = withPlaceholders.replace(/\\n/g, '\n');
    
    // Aplica as transformações de formatação
    cleaned = cleaned
      // Mantém emojis Unicode
      .replace(/📢/g, '📢')
      .replace(/🔌/g, '🔌')
      .replace(/🔁/g, '🔁')
      .replace(/🕒/g, '🕒')
      .replace(/⚙️/g, '⚙️')
      .replace(/🧼/g, '🧼')
      .replace(/📌/g, '📌')
      // Mantém formatação Discord
      .replace(/\*\*(.+?)\*\*/g, '**$1**') // Bold
      .replace(/\*(.+?)\*/g, '*$1*') // Italic
      .replace(/`(.+?)`/g, '`$1`') // Code inline
      .replace(/~~(.+?)~~/g, '~~$1~~') // Strikethrough
      // Remove links markdown mas mantém texto
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Converte listas
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/^\* (.+)$/gm, '• $1');
      
    // Restaura os blocos de código
    codeBlocks.forEach((block, index) => {
      cleaned = cleaned.replace(`__CODE_BLOCK_${index}__`, block);
    });
    
    return cleaned;
  }

  private static getColorFromTitle(title: string): number {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('release') || titleLower.includes('notas')) {
      return 0x57F287; // Discord Green
    } else if (titleLower.includes('integração') || titleLower.includes('integration')) {
      return 0x5865F2; // Discord Blurple
    } else if (titleLower.includes('erro') || titleLower.includes('error')) {
      return 0xED4245; // Discord Red
    } else if (titleLower.includes('melhoria') || titleLower.includes('improvement')) {
      return 0xFEE75C; // Discord Yellow
    } else if (titleLower.includes('feature') || titleLower.includes('novo')) {
      return 0xEB459E; // Discord Fuchsia
    }
    
    return 0x5865F2; // Discord Blurple padrão
  }

  private static splitContent(content: string, limit: number): string[] {
    if (content.length <= limit) {
      return [content];
    }

    const chunks: string[] = [];
    const lines = content.split('\n');
    let currentChunk = '';

    for (const line of lines) {
      if ((currentChunk + line + '\n').length > limit) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private static truncateText(text: string, limit: number): string {
    if (text.length <= limit) {
      return text;
    }
    return text.substring(0, limit - 3) + '...';
  }

  /**
   * Pré-processa o markdown para remover delimitadores de blocos de código
   * e normalizar caracteres de escape antes da conversão principal
   */
  private static preprocessMarkdown(markdown: string): string {
    let processed = markdown;
    
    // Normaliza caracteres de escape
    processed = processed.replace(/\\n/g, '\n');
    
    return processed;
  }
}

interface ParsedSection {
  type: 'embed' | 'content';
  embed?: DiscordEmbed;
  content?: string;
}
