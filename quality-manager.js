// Quality Manager Script for Ollama LLM integration
// Watches for file changes, summarizes, and suggests improvements
// Acts as a lead developer to maintain quality and track improvements

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration - can be overridden via environment variables
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://192.168.178.55:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen3-coder:latest';
const PROJECT_DIR = path.resolve(__dirname);
const IMPROVEMENTS_FILE = path.join(PROJECT_DIR, 'IMPROVEMENTS.md');

// Helper: Send prompt to Ollama LLM with retry logic
async function queryLLM(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.post(`${OLLAMA_HOST}/api/chat`, {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      }, { timeout: 30000 });
      return res.data.message.content;
    } catch (e) {
      if (i === retries - 1) return `LLM error after ${retries} attempts: ${e.message}`;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000)); // Exponential backoff
    }
  }
}

// Summarize and suggest improvements for a file
async function analyzeFile(filePath) {
  const stats = fs.statSync(filePath);
  // Skip large files (>500KB)
  if (stats.size > 500000) {
    console.log(`\n[${filePath}] Skipped (file too large: ${Math.round(stats.size / 1024)}KB)\n`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const prompt = `You are a lead developer conducting code review. Analyze this file and provide:
1. Brief summary of changes/functionality
2. Specific improvement suggestions
3. Any potential bugs or security issues
4. Code quality assessment

File: ${filePath}

Content:
${content}

Be concise and actionable.`;
  
  const response = await queryLLM(prompt);
  console.log(`\n[${filePath}]\n${response}\n`);
  
  // Append to improvements file if significant issues found
  if (response.toLowerCase().includes('issue') || response.toLowerCase().includes('improve')) {
    appendToImprovements(filePath, response);
  }
}

// Append analysis to IMPROVEMENTS.md
function appendToImprovements(filePath, analysis) {
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `\n### Review: ${path.basename(filePath)} (${timestamp})\n**Path**: ${filePath}\n\n${analysis}\n\n---\n`;
  
  try {
    let content = fs.readFileSync(IMPROVEMENTS_FILE, 'utf8');
    // Insert before "## Completed Improvements" section
    const marker = '## Completed Improvements';
    if (content.includes(marker)) {
      content = content.replace(marker, `## Recent Code Reviews\n${entry}\n${marker}`);
    } else {
      content += entry;
    }
    fs.writeFileSync(IMPROVEMENTS_FILE, content);
    console.log(`✓ Added review to ${IMPROVEMENTS_FILE}`);
  } catch (e) {
    console.error(`Failed to update improvements file: ${e.message}`);
  }
}

// Watch for file changes (filtered to relevant file types)
function startWatcher() {
  const watchPatterns = [
    '**/*.js',
    '**/*.ts',
    '**/*.tsx',
    '**/*.go',
    '**/*.md',
    '**/*.json'
  ];
  
  const watcher = chokidar.watch(watchPatterns, {
    cwd: PROJECT_DIR,
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.DS_Store',
      '**/dist/**',
      '**/build/**',
      '**/.vscode/**',
      '**/.cursor/**'
    ],
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('change', filePath => {
    const fullPath = path.join(PROJECT_DIR, filePath);
    console.log(`\n📝 File changed: ${filePath}`);
    analyzeFile(fullPath);
  });

  watcher.on('add', filePath => {
    const fullPath = path.join(PROJECT_DIR, filePath);
    console.log(`\n✨ New file: ${filePath}`);
    analyzeFile(fullPath);
  });

  console.log('🚀 Quality Manager is running in background...');
  console.log('📊 Watching for code changes and maintaining improvement suggestions');
  console.log(`📁 Tracking improvements in: ${path.relative(PROJECT_DIR, IMPROVEMENTS_FILE)}`);
  console.log('Press Ctrl+C to stop\n');
}

// Full project scan with improvement suggestions
async function scanProject() {
  console.log('🔍 Scanning entire project for quality review...\n');
  
  let files = [];
  const relevantExtensions = ['.js', '.ts', '.tsx', '.go', '.md'];
  
  function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        if (!/node_modules|\.git|dist|build|\.vscode|\.cursor/.test(p)) walk(p);
      } else {
        const ext = path.extname(p);
        if (relevantExtensions.includes(ext) && fs.statSync(p).size < 100000) {
          files.push(p);
        }
      }
    });
  }
  
  walk(PROJECT_DIR);
  console.log(`Found ${files.length} files to analyze\n`);
  
  // Create summary of project structure
  const structure = files.map(f => path.relative(PROJECT_DIR, f)).join('\n');
  
  const prompt = `You are a lead software architect reviewing a VPN client application. 

Project Structure:
${structure}

Based on this structure, provide:
1. Overall architecture assessment
2. Missing critical components
3. Priority improvements for production readiness
4. Security concerns
5. Development workflow suggestions

Be specific and prioritize actionable recommendations.`;

  const response = await queryLLM(prompt);
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📋 PROJECT-WIDE ARCHITECTURE REVIEW');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(response);
  console.log('\n═══════════════════════════════════════════════════\n');
  
  // Update IMPROVEMENTS.md with project-wide review
  updateProjectReview(response);
}

// Update project-wide review in IMPROVEMENTS.md
function updateProjectReview(review) {
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `\n## Project-Wide Review (${timestamp})\n\n${review}\n\n---\n`;
  
  try {
    let content = fs.readFileSync(IMPROVEMENTS_FILE, 'utf8');
    // Insert after overview section
    const marker = '## High Priority Improvements';
    if (content.includes(marker)) {
      content = content.replace(marker, `${entry}\n${marker}`);
    } else {
      content += entry;
    }
    fs.writeFileSync(IMPROVEMENTS_FILE, content);
    console.log(`✓ Updated project review in ${IMPROVEMENTS_FILE}`);
  } catch (e) {
    console.error(`Failed to update improvements file: ${e.message}`);
  }
}

// CLI usage
if (require.main === module) {
  const arg = process.argv[2];
  
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   VPN Client App - Quality Manager (Lead Dev)     ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  if (arg === 'scan') {
    scanProject().catch(err => {
      console.error('Error during project scan:', err.message);
      process.exit(1);
    });
  } else if (arg === '--help' || arg === '-h') {
    console.log('Usage:');
    console.log('  node quality-manager.js          - Start file watcher (runs in background)');
    console.log('  node quality-manager.js scan     - Perform full project scan\n');
    console.log('Environment Variables:');
    console.log('  OLLAMA_HOST   - Ollama API endpoint (default: http://192.168.178.55:11434)');
    console.log('  OLLAMA_MODEL  - Model to use (default: qwen3-coder:latest)\n');
    process.exit(0);
  } else {
    startWatcher();
  }
}

module.exports = { queryLLM, analyzeFile, scanProject };
