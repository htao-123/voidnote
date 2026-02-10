#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 读取当前版本
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'))
const currentVersion = packageJson.version

// 自动叠加版本号
function incrementVersion(version, type = 'patch') {
  const parts = version.split('.').map(Number)

  switch (type) {
    case 'major':
      return `${parts[0] + 1}.0.0`
    case 'minor':
      return `${parts[0]}.${parts[1] + 1}.0`
    case 'patch':
    default:
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
  }
}

const nextVersion = incrementVersion(currentVersion, 'patch')

console.log(`\n当前版本: v${currentVersion}`)
console.log(`新版本: v${nextVersion} (自动叠加)\n`)

// 更新 package.json 中的版本号
packageJson.version = nextVersion
fs.writeFileSync(
  path.join(__dirname, '../package.json'),
  JSON.stringify(packageJson, null, 2) + '\n'
)

console.log(`准备发布 v${nextVersion}...`)

try {
  // 提交版本更新
  execSync(`git add -A`, { stdio: 'inherit' })
  execSync(`git commit -m "版本更新 v${nextVersion}"`, { stdio: 'inherit' })

  // 创建标签
  execSync(`git tag -a v${nextVersion} -m "v${nextVersion}"`, { stdio: 'inherit' })

  // 推送代码和标签
  console.log('\n推送到远程仓库...')
  execSync(`git push origin master`, { stdio: 'inherit' })
  execSync(`git push origin v${nextVersion}`, { stdio: 'inherit' })

  console.log(`\n✅ v${nextVersion} 已发布!`)
  console.log(`📦 GitHub Actions 正在构建...`)
  console.log(`🔗 查看进度: https://github.com/htao-123/voidnote/actions\n`)
} catch (error) {
  console.error('❌ 发布失败:', error.message)
  process.exit(1)
}
