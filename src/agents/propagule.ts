import * as fs from 'fs';
import * as path from 'path';
import execa from 'execa';
import chalk from 'chalk';

export interface ProjectContext {
  languages: string[];
  frameworks: string[];
  testCommand: string | null;
  gitCommitConvention: string;
}

export async function detectContext(cwd: string): Promise<ProjectContext> {
  const languages: Set<string> = new Set();
  const frameworks: Set<string> = new Set();
  let testCommand: string | null = null;
  let gitCommitConvention = 'unknown';

  // Helper to check file existence
  const hasFile = (file: string) => fs.existsSync(path.join(cwd, file));

  // Check file extensions in CWD recursively (depth 2) to help detect languages if markers don't exist
  try {
    const files = fs.readdirSync(cwd);
    for (const file of files) {
      const fullPath = path.join(cwd, file);
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        const ext = path.extname(file);
        if (ext === '.go') languages.add('Go');
        if (ext === '.py') languages.add('Python');
        if (ext === '.ts') languages.add('TypeScript');
        if (ext === '.js') languages.add('JavaScript');
        if (ext === '.rs') languages.add('Rust');
        if (ext === '.dart') languages.add('Dart');
      } else if (stat.isDirectory() && file !== 'node_modules' && !file.startsWith('.')) {
        try {
          const subFiles = fs.readdirSync(fullPath);
          for (const subFile of subFiles) {
            const subExt = path.extname(subFile);
            if (subExt === '.go') languages.add('Go');
            if (subExt === '.py') languages.add('Python');
            if (subExt === '.ts') languages.add('TypeScript');
            if (subExt === '.js') languages.add('JavaScript');
            if (subExt === '.rs') languages.add('Rust');
            if (subExt === '.dart') languages.add('Dart');
          }
        } catch (e) {
          // ignore subdirectory read errors
        }
      }
    }
  } catch (e) {
    // ignore readdir errors
  }

  // 1. Language & Framework & Test detection based on markers
  
  // Go
  if (hasFile('go.mod')) {
    languages.add('Go');
    testCommand = 'go test ./...';
    try {
      const goMod = fs.readFileSync(path.join(cwd, 'go.mod'), 'utf8');
      if (goMod.includes('github.com/charmbracelet/bubbletea')) {
        frameworks.add('Bubbletea');
      }
      if (goMod.includes('github.com/gin-gonic/gin')) {
        frameworks.add('Gin');
      }
      if (goMod.includes('github.com/labstack/echo')) {
        frameworks.add('Echo');
      }
    } catch (e) {}
  }

  // JavaScript / TypeScript
  if (hasFile('package.json')) {
    languages.add(hasFile('tsconfig.json') ? 'TypeScript' : 'JavaScript');
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Frameworks
      if (deps['@nestjs/core']) frameworks.add('Nest.js');
      if (deps['react']) frameworks.add('React');
      if (deps['next']) frameworks.add('Next.js');
      if (deps['express']) frameworks.add('Express');
      if (deps['vue']) frameworks.add('Vue');
      if (deps['@angular/core']) frameworks.add('Angular');

      // Test scripts/tools
      if (packageJson.scripts && packageJson.scripts.test) {
        testCommand = 'npm test';
      } else {
        if (deps['jest']) testCommand = 'npx jest';
        else if (deps['vitest']) testCommand = 'npx vitest';
        else if (deps['mocha']) testCommand = 'npx mocha';
      }
    } catch (e) {}
  }

  // Python
  if (hasFile('requirements.txt') || hasFile('Pipfile') || hasFile('pyproject.toml') || hasFile('setup.py')) {
    languages.add('Python');
    testCommand = 'pytest'; // default fallback for python
    
    // Check files for framework references
    try {
      if (hasFile('requirements.txt')) {
        const reqs = fs.readFileSync(path.join(cwd, 'requirements.txt'), 'utf8');
        if (reqs.includes('django')) frameworks.add('Django');
        if (reqs.includes('flask')) frameworks.add('Flask');
        if (reqs.includes('fastapi')) frameworks.add('FastAPI');
      }
      if (hasFile('pyproject.toml')) {
        const pyproject = fs.readFileSync(path.join(cwd, 'pyproject.toml'), 'utf8');
        if (pyproject.includes('django')) frameworks.add('Django');
        if (pyproject.includes('flask')) frameworks.add('Flask');
        if (pyproject.includes('fastapi')) frameworks.add('FastAPI');
      }
    } catch (e) {}
  }

  // Dart / Flutter
  if (hasFile('pubspec.yaml')) {
    languages.add('Dart');
    try {
      const pubspec = fs.readFileSync(path.join(cwd, 'pubspec.yaml'), 'utf8');
      if (pubspec.includes('flutter:')) {
        languages.add('Flutter'); // Treat as language/framework
        frameworks.add('Flutter');
        testCommand = 'flutter test';
      } else {
        testCommand = 'dart test';
      }
    } catch (e) {
      testCommand = 'dart test';
    }
  }

  // Rust
  if (hasFile('Cargo.toml')) {
    languages.add('Rust');
    testCommand = 'cargo test';
  }

  // 2. Git Commit Conventions Detection
  if (hasFile('.git')) {
    try {
      const { stdout } = await execa('git', ['log', '-n', '10', '--format=%s'], { cwd });
      const commits = stdout.split('\n').filter(Boolean);
      
      const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|wip)(\(.+\))?: ./i;
      let conventionalCount = 0;

      for (const commit of commits) {
        if (conventionalPattern.test(commit)) {
          conventionalCount++;
        }
      }

      if (conventionalCount >= 3 || (commits.length > 0 && conventionalCount / commits.length >= 0.5)) {
        gitCommitConvention = 'Conventional Commits';
      } else {
        gitCommitConvention = 'Standard / Freeform';
      }
    } catch (e) {
      // Git command failed or no commits
      gitCommitConvention = 'unknown';
    }
  }

  return {
    languages: Array.from(languages),
    frameworks: Array.from(frameworks),
    testCommand,
    gitCommitConvention
  };
}

export async function runPropagule(cwd: string): Promise<void> {
  console.log(chalk.blue('Mantis Propagule: Detecting project context...'));
  try {
    const context = await detectContext(cwd);
    
    const mantisDir = path.join(cwd, '.mantis');
    if (!fs.existsSync(mantisDir)) {
      fs.mkdirSync(mantisDir, { recursive: true });
    }

    const outputPath = path.join(mantisDir, 'context.json');
    fs.writeFileSync(outputPath, JSON.stringify(context, null, 2), 'utf8');

    console.log(chalk.green(`\nSuccess! Context detected and saved to ${outputPath}`));
    console.log(chalk.white(`- Languages: ${context.languages.join(', ') || 'None detected'}`));
    console.log(chalk.white(`- Frameworks: ${context.frameworks.join(', ') || 'None detected'}`));
    console.log(chalk.white(`- Test command: ${context.testCommand || 'None'}`));
    console.log(chalk.white(`- Git commits: ${context.gitCommitConvention}`));
  } catch (err: any) {
    console.error(chalk.red(`Error during Mantis Propagule execution: ${err.message}`));
    throw err;
  }
}
