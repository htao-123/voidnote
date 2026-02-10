#!/usr/bin/env node

/**
 * 图标生成脚本 - 生成 512x512 PNG
 *
 * electron-builder 会自动将 PNG 转换为各平台所需格式
 *
 * 使用方法: node scripts/generate-icons.js
 */

const fs = require('fs')
const path = require('path')

const svgSource = path.join(__dirname, '../build/icon.svg')
const pngOutput = path.join(__dirname, '../build/icon.png')

console.log('\n🎨 VoidNote 图标生成\n')

// 检查 sharp
try {
  require('sharp')
} catch (e) {
  console.log('请安装 sharp: npm install sharp --save-dev')
  process.exit(1)
}

const sharp = require('sharp')

async function generate() {
  await sharp(svgSource)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(pngOutput)

  console.log('✓ build/icon.png (512x512)')
  console.log('\nelectron-builder 将自动转换为:')
  console.log('  Windows: icon.ico')
  console.log('  macOS: icon.icns')
  console.log('  Linux: icon.png\n')
}

generate().catch(err => {
  console.error('❌ 错误:', err.message)
  process.exit(1)
})
