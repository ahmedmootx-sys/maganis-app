#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { execSync } from 'node:child_process'

function run() {
  const isDebug = process.argv.includes('--debug')
  const modeName = isDebug ? 'DEBUG' : 'RELEASE'
  console.log(`=== MAGANIS ${modeName} KEYSTORE GENERATOR ===\n`)

  const gitRoot = path.resolve('.')
  const defaultBaseDir = isDebug ? 'maganis-debug-keystore' : 'maganis-keystore'
  const targetDir =
    process.env.TEST_KEYSTORE_DIR || path.join(os.homedir(), defaultBaseDir)

  // 1. Refuse to write inside the git work tree
  const relativeToGit = path.relative(gitRoot, targetDir)
  if (!relativeToGit.startsWith('..') && !path.isAbsolute(relativeToGit)) {
    console.error(
      '❌ خطأ أمني: ممنوع إنشاء ملف الكي ستور داخل مجلد المشروع (Git repository)!',
    )
    console.error(
      'الملف يجب أن ينشأ في مجلد منفصل تماماً في مجلد المستخدم لحمايته من الرفع بالخطأ.',
    )
    process.exit(1)
  }

  // 2. Check for keytool on PATH
  let hasKeytool = false
  try {
    execSync('keytool -help', { stdio: 'ignore' })
    hasKeytool = true
  } catch {
    hasKeytool = false
  }

  if (!hasKeytool) {
    console.error(
      '❌ أداة keytool الخاصة بجافا غير مثبتة أو مش موجودة في مسار النظام (PATH).',
    )
    console.error('\nخطوات التثبيت السريعة في سطرين:')
    console.error('1. حمل وثبت JDK 21 من موقع Adoptium Temurin:')
    console.error('   https://adoptium.net/temurin/releases/?version=21')
    console.error(
      '2. أثناء التثبيت على ويندوز، اتأكد من تفعيل خيار "Set JAVA_HOME" و "Add to PATH".',
    )
    console.error(
      'بعد التثبيت، اقفل شاشة الأوامر وافتحها تاني وشغل: npm run android:keystore\n',
    )
    process.exit(1)
  }

  // 3. Generate strong random passwords and parameters
  const keystorePass = crypto
    .randomBytes(24)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, 'x')
  const keyPass = crypto
    .randomBytes(24)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, 'x')
  const alias = isDebug ? 'maganis-debug' : 'maganis-release'
  const validityDays = 10950 // 30 years

  fs.mkdirSync(targetDir, { recursive: true })
  const keystoreFileName = isDebug
    ? 'maganis-debug.keystore'
    : 'maganis-release.keystore'
  const secretsFileName = isDebug
    ? 'maganis-debug-secrets.txt'
    : 'maganis-keystore-secrets.txt'
  const base64FileName = isDebug
    ? 'maganis-debug-base64.txt'
    : 'maganis-keystore-base64.txt'

  const keystoreFile = path.join(targetDir, keystoreFileName)
  const secretsFile = path.join(targetDir, secretsFileName)
  const base64File = path.join(targetDir, base64FileName)

  if (fs.existsSync(keystoreFile)) {
    console.error(`⚠️ تحذير: ملف الكي ستور موجود بالفعل في: ${keystoreFile}`)
    console.error(
      'لتجنب إتلاف الكي ستور القديم، لن يتم الكتابة فوقه تلقائياً. لو عايز تبدأ من جديد احذف المجلد يدوياً.',
    )
    process.exit(1)
  }

  // 4. Run keytool
  console.log(`جاري توليد الكي ستور في: ${targetDir}...`)
  const dname = isDebug
    ? 'CN=Maganis Debug, OU=Mobile, O=Maganis, C=EG'
    : 'CN=Maganis Coach, OU=Mobile, O=Maganis, C=EG'
  const keytoolCmd = [
    'keytool',
    '-genkeypair',
    '-v',
    `-keystore "${keystoreFile}"`,
    `-alias "${alias}"`,
    '-keyalg RSA',
    '-keysize 2048',
    `-validity ${validityDays}`,
    `-storepass "${keystorePass}"`,
    `-keypass "${keyPass}"`,
    `-dname "${dname}"`,
  ].join(' ')

  try {
    execSync(keytoolCmd, { stdio: 'pipe' })
  } catch (err) {
    console.error('❌ فشل توليد الكي ستور بواسطة keytool:', err.message)
    process.exit(1)
  }

  // 5. Extract SHA-256 fingerprint
  let sha256 = 'UNKNOWN'
  try {
    const listOut = execSync(
      `keytool -list -v -keystore "${keystoreFile}" -alias "${alias}" -storepass "${keystorePass}"`,
      { encoding: 'utf8' },
    )
    const match = listOut.match(/SHA256:\s*([A-Fa-f0-9:]+)/)
    if (match && match[1]) {
      sha256 = match[1].replace(/:/g, '').toUpperCase()
    }
  } catch (err) {
    console.warn('تعذر استخراج بصمة SHA256 تلقائياً:', err.message)
  }

  // 6. Base64 encode the keystore file
  const keystoreBuffer = fs.readFileSync(keystoreFile)
  const keystoreBase64 = keystoreBuffer.toString('base64')

  // 7. Write secrets file
  let secretsContent = ''
  if (isDebug) {
    secretsContent = [
      '=== MAGANIS STABLE DEBUG KEYSTORE SECRETS ===',
      `Created At: ${new Date().toISOString()}`,
      `Keystore Path: ${keystoreFile}`,
      `Alias: ${alias}`,
      `Keystore Password: ${keystorePass}`,
      `Key Password: ${keyPass}`,
      `SHA-256 Fingerprint: ${sha256}`,
      '',
      '=== GITHUB ACTIONS CONFIGURATION (DEBUG) ===',
      'Repository Secrets (Secrets tab):',
      `ANDROID_DEBUG_KEYSTORE_PASSWORD = ${keystorePass}`,
      `ANDROID_DEBUG_KEY_ALIAS = ${alias}`,
      `ANDROID_DEBUG_KEY_PASSWORD = ${keyPass}`,
      'ANDROID_DEBUG_KEYSTORE_BASE64 = (see maganis-debug-base64.txt or copy from below)',
    ].join('\n')
  } else {
    secretsContent = [
      '=== MAGANIS RELEASE KEYSTORE SECRETS ===',
      `Created At: ${new Date().toISOString()}`,
      `Keystore Path: ${keystoreFile}`,
      `Alias: ${alias}`,
      `Keystore Password: ${keystorePass}`,
      `Key Password: ${keyPass}`,
      `SHA-256 Fingerprint: ${sha256}`,
      '',
      '=== GITHUB ACTIONS CONFIGURATION ===',
      'Repository Variables (Variables tab):',
      `ANDROID_CERT_SHA256 = ${sha256}`,
      '',
      'Repository Secrets (Secrets tab):',
      `ANDROID_KEYSTORE_PASSWORD = ${keystorePass}`,
      `ANDROID_KEY_ALIAS = ${alias}`,
      `ANDROID_KEY_PASSWORD = ${keyPass}`,
      'ANDROID_KEYSTORE_BASE64 = (see maganis-keystore-base64.txt or copy from below)',
    ].join('\n')
  }

  fs.writeFileSync(secretsFile, secretsContent, 'utf8')
  fs.writeFileSync(base64File, keystoreBase64, 'utf8')

  // 8. Output instructions and warnings
  console.log('\n============================================================')
  console.log('✅ تم إنشاء الكي ستور بنجاح!')
  console.log('============================================================')
  console.log(`📁 المسار المحلي: ${targetDir}`)
  console.log(`📄 ملف الأسرار: ${secretsFile}`)
  console.log(`🔑 بصمة الشهادة (SHA-256): ${sha256}`)
  console.log('============================================================\n')

  if (isDebug) {
    console.log('--- خطوات ربط مفتاح الديباج الثابت مع GitHub Actions ---')
    console.log('الخطوات البسيطة لإضافة الأسرار في GitHub:')
    console.log('افتح مستودع مشروعك على GitHub ثم:')
    console.log('Settings ➔ Secrets and variables ➔ Actions ➔ تبويب Secrets\n')
    console.log(
      'اضغط "New repository secret" وأضف الأسرار الأربعة التالية بالنسخ واللصق:',
    )
    console.log('1. الاسم: ANDROID_DEBUG_KEYSTORE_BASE64')
    console.log(`   القيمة: انسخ كل محتويات الملف ده: ${base64File}\n`)
    console.log('2. الاسم: ANDROID_DEBUG_KEYSTORE_PASSWORD')
    console.log(`   القيمة: ${keystorePass}\n`)
    console.log('3. الاسم: ANDROID_DEBUG_KEY_ALIAS')
    console.log(`   القيمة: ${alias}\n`)
    console.log('4. الاسم: ANDROID_DEBUG_KEY_PASSWORD')
    console.log(`   القيمة: ${keyPass}\n`)
    console.log(
      '💡 فائدة المفتاح ده: كل ملف APK تجريبي هيتوقع بنفس المفتاح وتقدر تحدث التطبيق علطول من غير ما تمسحه!',
    )
  } else {
    console.log('⚠️⚠️⚠️ تحذير أمني واستقرار حرج جداً:')
    console.log(
      '1. لو ملف الكي ستور ده ضاع، مش هتقدر تحدث تطبيق مجانص على تليفونك نهائياً!',
    )
    console.log(
      '2. تغيير مفتاح التوقيع بيجبرك على مسح التطبيق وتثبيته من جديد، وده هيمسح كل بياناتك المخزنة محلياً!',
    )
    console.log(
      '3. انسخ مجلد ~/maganis-keystore/ حالاً وضعه في مكانين مختلفين وآمنين (فلاشة مشفرة، هارد خارجي).\n',
    )

    console.log('--- خطوات الربط مع GitHub Actions ---')
    console.log('الخطوات لإضافة أسرار الإصدار النهائي:')
    console.log('افتح المتصفح على مستودع مشروعك على GitHub ثم:')
    console.log('Settings ➔ Secrets and variables ➔ Actions\n')

    console.log('1. في تبويب "Variables" أضف المتغير التالي:')
    console.log(`   الاسم: ANDROID_CERT_SHA256`)
    console.log(`   القيمة: ${sha256}\n`)

    console.log('2. في تبويب "Secrets" أضف الأسرار التالية:')
    console.log(`   - ANDROID_KEYSTORE_BASE64: انسخ المحتوى الكامل من ملف:`)
    console.log(`     ${base64File}`)
    console.log(`   - ANDROID_KEYSTORE_PASSWORD: (موجود داخل ${secretsFile})`)
    console.log(`   - ANDROID_KEY_ALIAS: ${alias}`)
    console.log(`   - ANDROID_KEY_PASSWORD: (موجود داخل ${secretsFile})\n`)
  }

  // Check if gh is installed
  try {
    execSync('gh --version', { stdio: 'ignore' })
    console.log('--- أو باستخدام GitHub CLI مباشرة (سطر واحد): ---')
    if (isDebug) {
      console.log(
        `gh secret set ANDROID_DEBUG_KEYSTORE_BASE64 < "${base64File}"`,
      )
      console.log(
        `gh secret set ANDROID_DEBUG_KEYSTORE_PASSWORD -b "${keystorePass}"`,
      )
      console.log(`gh secret set ANDROID_DEBUG_KEY_ALIAS -b "${alias}"`)
      console.log(`gh secret set ANDROID_DEBUG_KEY_PASSWORD -b "${keyPass}"\n`)
    } else {
      console.log(`gh variable set ANDROID_CERT_SHA256 -b "${sha256}"`)
      console.log(`gh secret set ANDROID_KEYSTORE_BASE64 < "${base64File}"`)
      console.log(
        `gh secret set ANDROID_KEYSTORE_PASSWORD -b "${keystorePass}"`,
      )
      console.log(`gh secret set ANDROID_KEY_ALIAS -b "${alias}"`)
      console.log(`gh secret set ANDROID_KEY_PASSWORD -b "${keyPass}"\n`)
    }
  } catch {
    // gh not available, manual copy-paste instructions already provided
  }
}

run()
