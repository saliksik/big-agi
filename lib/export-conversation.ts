// noinspection ExceptionCaughtLocallyJS

import { ApiExportBody, ApiExportResponse } from '../pages/api/export';
import { DConversation } from '@/lib/store-chats';
import { SystemPurposes } from '@/lib/data';


/**
 * Primitive rendering of a Conversation to Markdown
 */
function conversationToMarkdown(conversation: DConversation) {

  // const title =
  //   `# ${conversation.name || 'Conversation'}\n` +
  //   (new Date(conversation.created)).toLocaleString() + '\n\n';

  return conversation.messages.map(message => {
    let sender: string = message.sender;
    switch (message.role) {
      case 'system':
        sender = '✨ System message';
        break;
      case 'assistant':
        sender = `Assistant ${prettyBaseModel(message.modelId)}`.trim();
        const purpose = conversation.systemPurposeId || null;
        if (purpose && purpose in SystemPurposes)
          sender = `${SystemPurposes[purpose]?.symbol || ''} ${sender}`.trim();
        break;
      case 'user':
        sender = '👤 You';
        break;
    }
    return `### ${sender}\n\n${message.text}\n\n`;
  }).join('---\n\n');

}

/**
 * Returns the origin of the current page
 */
function getOrigin() {
  let origin = (typeof window !== 'undefined') ? window.location.href : '';
  if (!origin || origin.includes('//localhost'))
    origin = 'https://github.com/enricoros/nextjs-chatgpt-app';
  origin = origin.replace('https://', '');
  if (origin.endsWith('/'))
    origin = origin.slice(0, -1);
  return origin;
}

/**
 * Exports a markdown rendering of the conversation to a service of choice
 *
 * **Called by the UI to render the data and post it to the API**
 *
 * NOTE: we are calling our own API here, which in turn calls the paste.gg API. We do this
 *       because the browser wouldn't otherwise allow us to perform a CORS to paste.gg
 *
 * @param gg Only one service for now
 * @param conversation The conversation to export
 */
export async function exportConversation(gg: 'paste.gg', conversation: DConversation): Promise<ApiExportResponse | null> {

  const body: ApiExportBody = {
    to: gg,
    title: '🤖💬 Chat Conversation',
    fileContent: conversationToMarkdown(conversation),
    fileName: 'my-chat.md',
    origin: getOrigin(),
  };

  try {

    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const paste: ApiExportResponse = await response.json();

      if (paste.type === 'success') {
        // we log this to the console for extra safety
        console.log('Data from your export to \'paste.gg\'', paste);
        return paste;
      }

      if (paste.type === 'error')
        throw new Error(`Failed to send the paste: ${paste.error}`);
    }

    throw new Error(`Failed to export conversation: ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Export issue', error);
    alert(`Export issue: ${error}`);
  }

  return null;
}


export function prettyBaseModel(model: string | undefined): string {
  if (!model) return '';
  if (model.startsWith('gpt-4')) return 'gpt-4';
  if (model.startsWith('gpt-3.5-turbo')) return '3.5 Turbo';
  return model;
}


/**
 * Post a paste to paste.gg
 * [called by the API]
 *  - API description: https://github.com/ascclemens/paste/blob/master/api.md
 *
 * @param title Title of the paste
 * @param fileName File with extension, e.g. 'conversation.md'
 * @param fileContent Textual content (e.g. markdown text)
 * @param origin the URL of the page that generated the paste
 * @param expireDays Number of days after which the paste will expire (0 = never expires, default = 30)
 */
export async function postToPasteGG(title: string, fileName: string, fileContent: string, origin: string, expireDays: number = 30): Promise<PasteGGAPI.PasteResponse> {

  // Default: expire in 30 days
  let expires = null;
  if (expireDays && expireDays >= 1) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expireDays);
    expires = expirationDate.toISOString();
  }

  const pasteData: PasteGGAPI.Paste = {
    name: title,
    description: `Generated by ${origin} 🚀`,
    visibility: 'unlisted',
    ...(expires && { expires }),
    files: [{
      name: fileName,
      content: {
        format: 'text',
        value: fileContent,
      },
    }],
  };

  const response = await fetch('https://api.paste.gg/v1/pastes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pasteData),
  });

  if (response.ok)
    return await response.json() as PasteGGAPI.PasteResponse;

  console.error(`Failed to create paste: ${response.status}`, response);
  throw new Error(`Failed to create paste: ${response.statusText}`);

}


export namespace PasteGGAPI {
  export interface Paste {
    name?: string;
    description?: string;
    visibility?: 'public' | 'unlisted' | 'private';
    expires?: string;
    files: File[];
  }

  interface File {
    name?: string;
    content: Content;
  }

  interface Content {
    format: 'text' | 'base64' | 'gzip' | 'xz';
    highlight_language?: string | null;
    value: string;
  }

  export type PasteResponse = {
    status: 'success'
    result: Paste & {
      id: string;
      created_at: string;
      updated_at: string;
      files: {
        id: string;
        name: string;
        highlight_language?: string | null;
      }[];
      deletion_key?: string;
    };
  } | {
    status: 'error';
    error: string;
    message?: string;
  }

}