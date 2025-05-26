import { MarkdownToDiscordConverter } from '../../shared/converter';
import { ConversionResult } from '../../shared/types';

/**
 * Wrapper para converter markdown para formato Discord no lado do cliente
 */
export class ClientMarkdownConverter {
  /**
   * Converte texto markdown para formato Discord
   */
  public static convertMarkdown(markdown: string): ConversionResult {
    return MarkdownToDiscordConverter.convertMarkdown(markdown);
  }
}
