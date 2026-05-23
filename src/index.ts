#!/usr/bin/env node
import { Command } from 'commander';
import { runPropagule } from './agents/propagule';
import { runTide } from './agents/tide';
import { runAnemophily } from './agents/anemophily';
import { logEvent } from './agents/heron';
import { generateText } from './utils/llm';
import { getMantisLogo } from './utils/logo';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import chalk from 'chalk';

// Load environment variables with fallbacks
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(os.homedir(), '.mantis', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const program = new Command();

program
  .name('mantis')
  .description('Mantis CLI tool suite for agent-driven engineering')
  .version('1.0.0');

program
  .command('propagule')
  .description('Detect current project context (language, frameworks, testing, etc.) and initialize .mantis/')
  .action(async () => {
    try {
      await runPropagule(process.cwd());
      await logEvent(process.cwd(), 'init', 'Propagule initialized project context.');
    } catch (error) {
      console.error('Failed to run propagule command:', error);
      process.exit(1);
    }
  });

program
  .command('tide')
  .description('Run validation checks (linter, tests) for the current project context')
  .action(async () => {
    try {
      const { passed } = await runTide(process.cwd());
      await logEvent(process.cwd(), 'verify', passed ? 'Tide verification passed.' : 'Tide verification failed.');
      process.exit(passed ? 0 : 1);
    } catch (error) {
      console.error('Failed to run tide command:', error);
      process.exit(1);
    }
  });

program
  .command('anemophily')
  .description('Run the deployment command for the current project context')
  .action(async () => {
    try {
      const passed = await runAnemophily(process.cwd());
      process.exit(passed ? 0 : 1);
    } catch (error) {
      console.error('Failed to run anemophily command:', error);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

function startRepl() {
  console.clear();
  console.log(getMantisLogo());
  console.log('Available commands:');
  console.log('  propagule             - code review, an expert sentinel that scans the codebase');
  console.log('  tide                  - an adversarial code quality reviewer running tests and linting');
  console.log('  anemophily            - wind-driven agent that deploys the verified codebase');
  console.log('  model <gemini|claude|opus> [model_name] - Switch the active LLM provider and model');
  console.log('  ask <query>           - Call the active LLM wrapper and print response');
  console.log('  exit / quit           - Exit interactive REPL');
  console.log('  help                  - Show this help menu\n');

  let activeProvider: 'gemini' | 'anthropic' = 'gemini';
  let activeModel = 'gemini-2.5-flash';

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'mantis > ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      rl.prompt();
      return;
    }

    const firstSpaceIndex = trimmed.indexOf(' ');
    const cmd = firstSpaceIndex === -1 ? trimmed : trimmed.substring(0, firstSpaceIndex);
    const argsString = firstSpaceIndex === -1 ? '' : trimmed.substring(firstSpaceIndex + 1).trim();

    switch (cmd.toLowerCase()) {
      case 'exit':
      case 'quit':
        rl.close();
        break;

      case 'help':
        console.log('\nAvailable commands:');
        console.log('  propagule             - code review, an expert sentinel that scans the codebase');
        console.log('  tide                  - an adversarial code quality reviewer running tests and linting');
        console.log('  anemophily            - wind-driven agent that deploys the verified codebase');
        console.log('  model <gemini|claude|opus> [model_name] - Switch the active LLM provider and model');
        console.log('  ask <query>           - Call the active LLM wrapper and print response');
        console.log('  exit / quit           - Exit interactive REPL');
        console.log('  help                  - Show this help menu\n');
        break;

      case 'propagule':
        console.log(chalk.blue('Starting Propagule agent...'));
        try {
          await runPropagule(process.cwd());
          await logEvent(process.cwd(), 'init', 'Propagule initialized project context.');
        } catch (error: any) {
          console.error(chalk.red(`Error running propagule: ${error.message}`));
        }
        break;

      case 'tide':
        console.log(chalk.blue('Starting Tide agent...'));
        try {
          const { passed } = await runTide(process.cwd());
          await logEvent(process.cwd(), 'verify', passed ? 'Tide verification passed.' : 'Tide verification failed.');
        } catch (error: any) {
          console.error(chalk.red(`Error running tide: ${error.message}`));
        }
        break;

      case 'anemophily':
        console.log(chalk.blue('Starting Anemophily agent...'));
        try {
          await runAnemophily(process.cwd());
        } catch (error: any) {
          console.error(chalk.red(`Error running anemophily: ${error.message}`));
        }
        break;

      case 'model': {
        if (!argsString) {
          console.log(chalk.yellow('Usage: model <gemini|claude|opus> [model_name]'));
          console.log(`Current model: ${activeProvider} (${activeModel})`);
          break;
        }
        const parts = argsString.split(/\s+/);
        const providerInput = parts[0].toLowerCase();
        const modelInput = parts[1];

        if (providerInput.startsWith('gemini')) {
          activeProvider = 'gemini';
          activeModel = modelInput || 'gemini-2.5-flash';
          console.log(chalk.green(`Switched LLM provider to Gemini (model: ${activeModel})`));
        } else if (providerInput === 'opus') {
          activeProvider = 'anthropic';
          activeModel = 'claude-3-opus-20240229';
          console.log(chalk.green(`Switched LLM provider to Anthropic (model: ${activeModel})`));
        } else if (providerInput.startsWith('claude') || providerInput.startsWith('anthropic')) {
          activeProvider = 'anthropic';
          activeModel = modelInput || 'claude-3-5-sonnet-20240620';
          console.log(chalk.green(`Switched LLM provider to Anthropic (model: ${activeModel})`));
        } else {
          console.log(chalk.yellow('Unsupported provider. Supported: gemini, claude, opus'));
        }
        break;
      }

      case 'ask': {
        if (!argsString) {
          console.log(chalk.yellow('Error: Please provide a query. Usage: ask <query>'));
          break;
        }
        console.log(chalk.blue(`Querying ${activeProvider} (${activeModel})...`));
        try {
          const sysInstruction = buildSystemInstruction(process.cwd());
          const response = await generateText(activeProvider, activeModel, argsString, sysInstruction);
          console.log(chalk.bold.green('\nResponse:'));
          console.log(chalk.white(response));
          console.log();
        } catch (error: any) {
          console.error(chalk.red(`\nGeneration failed: ${error.message}`));
        }
        break;
      }

      default:
        console.log(chalk.yellow(`Unknown command: "${cmd}". Type "help" for instructions.`));
        break;
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.cyan('\nGoodbye!'));
    process.exit(0);
  });
}

function buildSystemInstruction(cwd: string): string {
  let contextInfo = 'No project context initialized yet. Run "propagule" inside the project to scan.';
  const contextPath = path.join(cwd, '.mantis', 'context.json');
  if (fs.existsSync(contextPath)) {
    try {
      const raw = fs.readFileSync(contextPath, 'utf8');
      const context = JSON.parse(raw);
      contextInfo = `
Active Project Context:
- Languages: ${context.languages?.join(', ') || 'unknown'}
- Frameworks: ${context.frameworks?.join(', ') || 'unknown'}
- Test Command: ${context.testCommand || 'none'}
- Git Convention: ${context.gitCommitConvention || 'unknown'}
`;
    } catch (e) {
      // ignore
    }
  }

  let dailyNoteContent = 'No recent daily notes found.';
  if (process.env.OBSIDIAN_VAULT_PATH) {
    try {
      const dailyDir = path.join(process.env.OBSIDIAN_VAULT_PATH, 'Daily');
      if (fs.existsSync(dailyDir)) {
        const files = fs.readdirSync(dailyDir)
          .filter(f => f.endsWith('.md'))
          .sort()
          .reverse(); // Newest first
        if (files.length > 0) {
          const newestFile = path.join(dailyDir, files[0]);
          const content = fs.readFileSync(newestFile, 'utf8');
          dailyNoteContent = `Recent activities from Obsidian daily note (${files[0]}):\n${content}`;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const vaultPath = process.env.OBSIDIAN_VAULT_PATH || 'Not configured';

  return `You are Mantis, an AI-powered agentic developer assistant integrated as a CLI.
You are running locally in the terminal.

${contextInfo}
Obsidian Vault Path: ${vaultPath}
Current directory: ${cwd}

${dailyNoteContent}

Provide answers tailored to the active project context, languages, frameworks, recent notes, and workflows. Be highly technical, precise, and concise. Avoid conversational filler.`;
}

if (process.argv.length > 2) {
  program.parse(process.argv);
} else {
  startRepl();
}
