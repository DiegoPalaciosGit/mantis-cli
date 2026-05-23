import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import * as readline from 'readline';
import { runPropagule } from './propagule';
import { runTide } from './tide';
import { logEvent } from './heron';
import { generateText } from '../utils/llm';

function askUser(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const findFailedFiles = (logs: string, cwd: string): string[] => {
  const files = new Set<string>();
  const allSourceFiles: string[] = [];
  
  const scanDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry);
      const rel = path.relative(cwd, full);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (entry !== 'node_modules' && entry !== '.git' && entry !== 'dist' && entry !== 'build' && !entry.startsWith('.')) {
          scanDir(full);
        }
      } else {
        if (['.ts', '.js', '.py', '.go', '.dart', '.rs'].includes(path.extname(entry))) {
          allSourceFiles.push(rel);
        }
      }
    }
  };
  
  scanDir(cwd);

  for (const file of allSourceFiles) {
    const normFile = file.replace(/\\/g, '/');
    if (logs.includes(normFile) || logs.includes(file)) {
      files.add(file);
    }
  }
  return Array.from(files);
};

export async function runHarness(
  cwd: string,
  provider: 'gemini' | 'anthropic',
  model: string
): Promise<boolean> {
  console.log(chalk.bold.green('\n🛠️  Mantis Harness: Starting code review & correction loop...'));

  // 1. Scan/verify context
  try {
    await runPropagule(cwd);
  } catch (error: any) {
    console.error(chalk.red(`Harness: Propagule scan failed: ${error.message}`));
    return false;
  }

  let iteration = 0;
  const maxIterations = 3;

  while (iteration < maxIterations) {
    iteration++;
    console.log(chalk.bold.yellow(`\n--- Iteration ${iteration}/${maxIterations} ---`));

    // 2. Validate using Tide
    const { passed, logs } = await runTide(cwd);

    if (passed) {
      console.log(chalk.bold.green('\n🎉 Mantis Harness: Code review PASSED successfully!'));
      await logEvent(cwd, 'verify', `Harness code review passed on iteration ${iteration}.`);
      return true;
    }

    if (iteration === maxIterations) {
      console.log(chalk.bold.red('\n🚨 Mantis Harness: Max correction iterations reached. Exiting.'));
      await logEvent(cwd, 'verify', `Harness code review failed after ${maxIterations} iterations.`);
      return false;
    }

    // 3. Resolve failed files
    const failedFiles = findFailedFiles(logs, cwd);
    if (failedFiles.length === 0) {
      console.log(chalk.yellow('\nHarness: No specific failed files parsed from logs. Cannot auto-correct.'));
      await logEvent(cwd, 'verify', `Harness review failed: could not parse failed files.`);
      return false;
    }

    console.log(chalk.cyan(`\nFailed files identified for correction:\n${failedFiles.map(f => `  - ${f}`).join('\n')}`));

    // 4. Read file content for LLM context
    let filesContext = 'Source Files with Errors:\n';
    for (const file of failedFiles) {
      const content = fs.readFileSync(path.join(cwd, file), 'utf8');
      filesContext += `--- File: ${file} ---\n${content}\n`;
    }

    const prompt = `
You are the Mantis code correction agent.
A linter or test suite run failed. Below are the error logs and the contents of the relevant files.
Propose fixes to correct these errors.

${filesContext}

Error Logs:
${logs}

Output your response ONLY as a JSON array of objects, with no extra explanation or markdown block wrappers.
Format:
[
  {
    "filePath": "relative/path/to/file",
    "content": "the complete new content of the file"
  }
]
`;

    console.log(chalk.blue(`Querying LLM (${provider}/${model}) for code correction...`));
    
    let response = '';
    try {
      response = await generateText(provider, model, prompt, "You are an expert software engineering bot. You only return raw JSON.");
    } catch (error: any) {
      console.error(chalk.red(`LLM query failed: ${error.message}`));
      return false;
    }

    // Parse modifications
    let modifications: { filePath: string; content: string }[] = [];
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith('```')) {
        const firstNL = cleaned.indexOf('\n');
        const lastTick = cleaned.lastIndexOf('```');
        cleaned = cleaned.substring(firstNL + 1, lastTick).trim();
      }
      modifications = JSON.parse(cleaned);
    } catch (e: any) {
      console.error(chalk.red(`Failed to parse LLM modifications: ${e.message}`));
      console.log(chalk.gray(`LLM Response was: ${response}`));
      return false;
    }

    console.log(chalk.yellow(`\nProposed changes:`));
    for (const mod of modifications) {
      console.log(chalk.white(`  - Modify [${mod.filePath}] (${mod.content.length} bytes)`));
    }

    // Ask user permission
    const answer = await askUser(chalk.bold.cyan('\nApply these corrections? (y/n): '));
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log(chalk.gray('Corrections skipped by user. Exiting.'));
      await logEvent(cwd, 'verify', 'Harness corrections skipped by user.');
      return false;
    }

    // Apply modifications
    console.log(chalk.blue('\nApplying fixes...'));
    for (const mod of modifications) {
      const fullPath = path.join(cwd, mod.filePath);
      fs.writeFileSync(fullPath, mod.content, 'utf8');
      console.log(chalk.green(`✓ Updated ${mod.filePath}`));
    }

    await logEvent(cwd, 'verify', `Harness applied auto-corrections to: ${modifications.map(m => m.filePath).join(', ')}`);
  }

  return false;
}
