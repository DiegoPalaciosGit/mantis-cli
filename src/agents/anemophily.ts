import * as fs from 'fs';
import * as path from 'path';
import execa from 'execa';
import chalk from 'chalk';
import { logEvent } from './heron';

export async function runAnemophily(cwd: string): Promise<boolean> {
  const contextPath = path.join(cwd, '.mantis', 'context.json');

  if (!fs.existsSync(contextPath)) {
    console.error(chalk.red('\n[Anemophily] Error: .mantis/context.json not found.'));
    console.error(chalk.yellow('Please run "mantis propagule" first to initialize the project context.\n'));
    return false;
  }

  let context: any;
  try {
    const rawContext = fs.readFileSync(contextPath, 'utf8');
    context = JSON.parse(rawContext);
  } catch (error: any) {
    console.error(chalk.red(`[Anemophily] Failed to parse .mantis/context.json: ${error.message}`));
    return false;
  }

  let deployCommand = context.deployCommand || null;

  if (!deployCommand) {
    // Run auto-detection
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
        if (packageJson.scripts && packageJson.scripts.deploy) {
          deployCommand = 'npm run deploy';
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    if (!deployCommand && fs.existsSync(path.join(cwd, 'vercel.json'))) {
      deployCommand = 'vercel --prod';
    }
  }

  if (!deployCommand) {
    console.warn(chalk.yellow('[Anemophily] No deploy command configured or auto-detected. Skipping deployment.'));
    return false;
  }

  console.log(chalk.bold.cyan(`\n🌬️ Mantis Anemophily Agent: Deploying using "${deployCommand}"...`));

  try {
    await execa(deployCommand, { shell: true, stdio: 'inherit', cwd });
    console.log(chalk.green('✓ Anemophily deployment succeeded.'));
    await logEvent(cwd, 'deploy', 'Anemophily deployment succeeded.');
    return true;
  } catch (error: any) {
    console.error(chalk.red(`✗ Anemophily deployment failed: ${error.message}`));
    await logEvent(cwd, 'deploy', 'Anemophily deployment failed.');
    return false;
  }
}
