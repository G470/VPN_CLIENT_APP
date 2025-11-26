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
  const content = fs.readFileSync(filePath, 'utf8');
  const prompt = `You are a code quality manager. Summarize the changes in this file and suggest improvements.\n\nFile: ${filePath}\n\nContent:\n${content}`;
  const response = await queryLLM(prompt);
  console.log(`\n[${filePath}]\n${response}\n`);
}

// Watch for file changes
function startWatcher() {
  const watcher = chokidar.watch(PROJECT_DIR, {
    ignored: /node_modules|\.git|\.DS_Store/,
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('change', filePath => {
    analyzeFile(filePath);
  });

  console.log('Quality Manager is watching for file changes...');
}

// Full project scan
async function scanProject() {
  let files = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        if (!/node_modules|\.git/.test(p)) walk(p);
      } else {
        files.push(p);
      }
    });
  }
  walk(PROJECT_DIR);
  const allContent = files.map(f => `File: ${f}\n${fs.readFileSync(f, 'utf8')}`).join('\n\n');
  const prompt = `You are a code quality manager. Review the following project files and suggest overall improvements.\n\n${allContent}`;
  const response = await queryLLM(prompt);
  console.log('\n[Project-wide Review]\n' + response + '\n');
}

// CLI usage
if (require.main === module) {
  const arg = process.argv[2];
  if (arg === 'scan') {
    scanProject();
  } else {
    startWatcher();
  }
}
