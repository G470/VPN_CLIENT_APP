// Quality Manager Script for Ollama LLM integration
// Watches for file changes, summarizes, and suggests improvements

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Ollama LLM endpoint from your .cursor/mcp.json
const OLLAMA_HOST = 'http://192.168.178.55:11434';
const MODEL = 'qwen3-coder:latest';
const PROJECT_DIR = path.resolve(__dirname);

// Helper: Send prompt to Ollama LLM
async function queryLLM(prompt) {
  try {
    const res = await axios.post(`${OLLAMA_HOST}/api/chat`, {
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });
    return res.data.message.content;
  } catch (e) {
    return `LLM error: ${e.message}`;
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
