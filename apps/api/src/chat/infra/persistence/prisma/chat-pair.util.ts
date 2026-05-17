export function sortChatUserIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function previewMessageText(content: string, maxLen = 512): string {
  if (content.length <= maxLen) return content;
  return content.slice(0, maxLen);
}

export function threadPreviewFromSend(
  content: string,
  attachment?: { fileName?: string | null } | null,
): string {
  const t = content.trim();
  if (t) return previewMessageText(t);
  if (attachment?.fileName) return previewMessageText(attachment.fileName);
  return previewMessageText('Attachment');
}
