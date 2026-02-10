#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 读取当前版本
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'))
const currentVersion = packageJson.version

console.log(`\n当前版本: v${currentVersion}`)
console.log('请输入新版本号 (如: 0.2.0, 0.2.1, 1.0.0):')

process.stdin.resume()
process.stdin.setEncoding('utf-8')
process.stdin.on('data', (version) => {
  version = version.trim()
  if (!version) {
    console.log('已取消')
    process.exit(0)
  }

  // 更新 package.json 中的版本号
  packageJson.version = version
  fs.writeFileSync(
    path.join(__dirname, '../package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  )

  console.log(`\n准备发布 v${version}...`)

  try {
    // 提交版本更新
    execSync(`git add package.json`, { stdio: 'inherit' })
    execSync(`git commit -m "版本更新 v${version}"`, { stdio: 'inherit' })

    // 创建标签
    execSync(`git tag -a v${version} -m "v${version}"`, { stdio: 'inherit' })

    // 推送代码和标签
    console.log('\n推送到远程仓库...')
    execSync(`git push origin master`, { stdio: 'inherit' })
    execSync(`git push origin v${version}`, { stdio: 'inherit' })

    console.log(`\n✅ v${version} 已发布! GitHub Actions 将自动构建并创建 Release。`)
    console.log(`📦 查看构建进度: https://github.com/htao-123/voidnote/actions\n`)
  } catch (error) {
    console.error('❌ 发布失败:', error.message)
    process.exit(1)
  }

  process.exit(0)
})
