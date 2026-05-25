#!/usr/bin/env node
import { Command } from 'commander';
import { runPropagule } from './agents/propagule';
import { runTide } from './agents/tide';
import { runAnemophily } from './agents/anemophily';
import { logEvent } from './agents/heron';

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
  console.log('  exit / quit           - Exit interactive REPL');
  console.log('  help                  - Show this help menu\n');

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



if (process.argv.length > 2) {
  program.parse(process.argv);
} else {
  startRepl();
}
