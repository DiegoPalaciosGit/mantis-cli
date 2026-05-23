import * as fs from 'fs';
import * as path from 'path';
import execa from 'execa';
import chalk from 'chalk';

export interface MantisContext {
  languages: string[];
  frameworks: string[];
  testCommand: string | null;
  linterCommand?: string | null;
  gitCommitConvention: string;
}

export async function runTide(cwd: string): Promise<{ passed: boolean; logs: string }> {
  const contextPath = path.join(cwd, '.mantis', 'context.json');

  if (!fs.existsSync(contextPath)) {
    console.error(chalk.red('\nError: .mantis/context.json not found.'));
    console.error(chalk.yellow('Please run "mantis propagule" first to initialize the project context.\n'));
    process.exit(1);
  }

  let context: MantisContext;
  try {
    const rawContext = fs.readFileSync(contextPath, 'utf8');
    context = JSON.parse(rawContext);
  } catch (error: any) {
    console.error(chalk.red(`Failed to parse .mantis/context.json: ${error.message}`));
    return { passed: false, logs: `Failed to parse context.json: ${error.message}` };
  }

  // Parse commands
  const testCommand = context.testCommand;
  let linterCommand = context.linterCommand || null;

  // Resolve default linter command if not specified
  if (!linterCommand) {
    const hasFile = (file: string) => fs.existsSync(path.join(cwd, file));
    
    // Node.js defaults
    if (hasFile('package.json')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
        if (packageJson.scripts && packageJson.scripts.lint) {
          linterCommand = 'npm run lint';
        } else if (
          (packageJson.dependencies && packageJson.dependencies.eslint) ||
          (packageJson.devDependencies && packageJson.devDependencies.eslint) ||
          hasFile('.eslintrc') ||
          hasFile('.eslintrc.json') ||
          hasFile('.eslintrc.js') ||
          hasFile('eslint.config.js') ||
          hasFile('eslint.config.mjs') ||
          hasFile('eslint.config.cjs')
        ) {
          linterCommand = 'npx eslint .';
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Go defaults
    if (!linterCommand && hasFile('go.mod')) {
      linterCommand = 'go vet ./...';
    }

    // Rust defaults
    if (!linterCommand && hasFile('Cargo.toml')) {
      linterCommand = 'cargo clippy';
    }

    // Python defaults
    if (!linterCommand && (hasFile('requirements.txt') || hasFile('Pipfile') || hasFile('pyproject.toml') || hasFile('setup.py'))) {
      if (hasFile('pyproject.toml')) {
        try {
          const pyproject = fs.readFileSync(path.join(cwd, 'pyproject.toml'), 'utf8');
          if (pyproject.includes('black')) {
            linterCommand = 'black --check .';
          } else if (pyproject.includes('ruff')) {
            linterCommand = 'ruff check .';
          } else if (pyproject.includes('flake8')) {
            linterCommand = 'flake8';
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      if (!linterCommand) {
        linterCommand = 'flake8';
      }
    }
  }

  console.log(chalk.bold.cyan('\n🌊 Mantis Tide Agent: Starting validation...'));

  let validationPassed = true;
  let logs = '';

  // 1. Run Linter validation
  if (linterCommand) {
    console.log(chalk.blue(`\n[1/2] Running Linter: "${linterCommand}"`));
    try {
      const promise = execa(linterCommand, { shell: true, all: true, cwd });
      promise.all?.pipe(process.stdout);
      const result = await promise;
      logs += `Linter output:\n${result.all}\n\n`;
      console.log(chalk.green('✓ Linter validation passed.'));
    } catch (error: any) {
      logs += `Linter output (FAILED):\n${error.all || error.message}\n\n`;
      console.error(chalk.red(`✗ Linter failed (exit code: ${error.exitCode ?? 1})`));
      validationPassed = false;
    }
  } else {
    console.log(chalk.yellow('\n[1/2] Linter: No linter command configured or detected. Skipping.'));
    logs += 'Linter: skipped.\n\n';
  }

  // 2. Run Test validation
  if (testCommand) {
    console.log(chalk.blue(`\n[2/2] Running Tests: "${testCommand}"`));
    try {
      const promise = execa(testCommand, { shell: true, all: true, cwd });
      promise.all?.pipe(process.stdout);
      const result = await promise;
      logs += `Test output:\n${result.all}\n\n`;
      console.log(chalk.green('✓ Test validation passed.'));
    } catch (error: any) {
      logs += `Test output (FAILED):\n${error.all || error.message}\n\n`;
      console.error(chalk.red(`✗ Tests failed (exit code: ${error.exitCode ?? 1})`));
      validationPassed = false;
    }
  } else {
    console.log(chalk.yellow('\n[2/2] Tests: No test command configured or detected. Skipping.'));
    logs += 'Tests: skipped.\n\n';
  }

  if (validationPassed) {
    console.log(chalk.bold.green('\n🎉 Tide Validation PASSED! Everything is clean.\n'));
  } else {
    console.log(chalk.bold.red('\n🚨 Tide Validation FAILED! Check the errors above.\n'));
  }

  return { passed: validationPassed, logs };
}
