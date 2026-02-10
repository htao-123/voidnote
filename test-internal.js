// 尝试直接从 Electron 内部路径加载
try {
  // 在 Electron 环境中，实际的模块路径可能是不同的
  const path = require('path');
  const electronPath = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');
  
  console.log('Electron path:', electronPath);
  console.log('process.versions:', process.versions);
  
  // 尝试查找实际的 Electron 模块位置
  console.log('module.paths:', module.paths);
} catch (e) {
  console.error('Error:', e);
}
