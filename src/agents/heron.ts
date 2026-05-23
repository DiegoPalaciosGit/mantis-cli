import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Logs a Mantis event to the user's Obsidian daily note.
 * @param cwd Current working directory
 * @param eventType Type of Mantis event ('init' | 'verify')
 * @param detail Detail description of the event
 */
export async function logEvent(
  cwd: string,
  eventType: 'init' | 'verify' | 'deploy',
  detail: string
): Promise<void> {
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (!vaultPath || vaultPath.trim() === '') {
    console.log(chalk.gray('[Heron] OBSIDIAN_VAULT_PATH not set. Skipping sync.'));
    return;
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    const dailyDir = path.resolve(vaultPath, 'Daily');
    const dailyNotePath = path.join(dailyDir, `${dateStr}.md`);

    // Ensure the Daily directory exists
    if (!fs.existsSync(dailyDir)) {
      fs.mkdirSync(dailyDir, { recursive: true });
    }

    const eventLine = `- **[${timeStr}] Mantis ${eventType}**: ${detail}`;

    if (!fs.existsSync(dailyNotePath)) {
      // Create new daily note with header and append the event
      const initialContent = `# ${dateStr} Daily Note\n\n## Mantis Activities\n${eventLine}\n`;
      fs.writeFileSync(dailyNotePath, initialContent, 'utf8');
    } else {
      // Append the logged event to existing note
      const existingContent = fs.readFileSync(dailyNotePath, 'utf8');
      const needsNewline = existingContent.length > 0 && !existingContent.endsWith('\n');
      const toAppend = `${needsNewline ? '\n' : ''}${eventLine}\n`;
      fs.appendFileSync(dailyNotePath, toAppend, 'utf8');
    }

    console.log(chalk.green('[Heron] Synced event to Obsidian.'));
  } catch (error: any) {
    console.error(chalk.red(`[Heron] Failed to log event: ${error.message}`));
  }
}
