#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

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

// 询问发布说明
rl.question('请输入发布说明 (留空跳过): ', (notes) => {
  notes = notes.trim()

  // 更新 package.json 中的版本号
  packageJson.version = nextVersion
  fs.writeFileSync(
    path.join(__dirname, '../package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  )

  // 保存发布说明到文件
  if (notes) {
    fs.writeFileSync(
      path.join(__dirname, '../RELEASE_NOTES.md'),
      notes + '\n'
    )
    execSync(`git add RELEASE_NOTES.md`, { stdio: 'inherit' })
  }

  console.log(`\n准备发布 v${nextVersion}...`)

  try {
    // 提交版本更新
    execSync(`git add -A`, { stdio: 'inherit' })
    const commitMessage = notes
      ? `版本更新 v${nextVersion}\n\n${notes}`
      : `版本更新 v${nextVersion}`
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' })

    // 创建标签（带发布说明）
    const tagMessage = notes || `v${nextVersion}`
    execSync(`git tag -a v${nextVersion} -m "${tagMessage}"`, { stdio: 'inherit' })

    // 推送代码和标签
    console.log('\n推送到远程仓库...')
    execSync(`git push origin master`, { stdio: 'inherit' })
    execSync(`git push origin v${nextVersion}`, { stdio: 'inherit' })

    console.log(`\n✅ v${nextVersion} 已发布!`)
    console.log(`📦 GitHub Actions 正在构建...`)
    console.log(`🔗 查看进度: https://github.com/htao-123/voidnote/actions\n`)

    // 清理发布说明文件
    if (fs.existsSync(path.join(__dirname, '../RELEASE_NOTES.md'))) {
      fs.unlinkSync(path.join(__dirname, '../RELEASE_NOTES.md'))
      execSync(`git add -u RELEASE_NOTES.md`, { stdio: 'silent' })
    }

    rl.close()
  } catch (error) {
    console.error('❌ 发布失败:', error.message)
    rl.close()
    process.exit(1)
  }
})
