# 造价考场 · TWA Android APK

把「一级造价工程师·全科考场」PWA 打包成的 **Trusted Web Activity（TWA）** 原生安装包。安装后，从桌面图标打开即获得**全屏、无地址栏、像原生 App 一样**的体验，内核仍是已上线的 PWA。

## 产物

| 文件 | 说明 |
|------|------|
| `造价考场-1.0.0-release.apk` | 已签名 APK（直接安装用），证书指纹与 `assetlinks.json` 一致 |
| `造价考场-1.0.0-release.aab` | 已签名 AAB（上架 Google Play 用） |
| `TWA-APK说明.md` | 本说明 |

> 在线下载（部署后）：`https://QXX8965.github.io/zaojiakao-kaochang/zaojiakao-twa-1.0.0.apk`

## 关键参数

- **包名**：`com.zaojiakao.twa`
- **版本**：`1.0.0`（versionCode 1）
- **最低系统**：Android 5.0（API 21）
- **目标打开地址**：`https://QXX8965.github.io/zaojiakao-kaochang/index.html`
- **签名指纹 SHA-256**：`2F:75:44:D3:CF:59:57:B6:54:0E:C9:01:1E:E4:0A:D1:6F:F4:53:33:8D:31:95:92:1C:4B:92:E8:9F:79:DB:6D`

该指纹与站点根目录的 `https://QXX8965.github.io/.well-known/assetlinks.json` 完全一致，因此 Chrome 会信任本应用、以**独立 TWA 模式**而非「自定义标签页」打开站点。

## 工作原理

1. 用户点击桌面图标 → `LauncherActivity` 启动 TWA。
2. Chrome 读取 `https://QXX8965.github.io/.well-known/assetlinks.json`，校验其中的包名 + 签名指纹是否匹配本 APK。
3. 校验通过 → 全屏独立打开 `QXX8965.github.io/zaojiakao-kaochang/`；校验失败或站点不可达 → 回退到「自定义标签页 / WebView」。

> 因此：**必须保证 PWA 站点长期在线且 `assetlinks.json` 不被改动**，否则会退回普通浏览器模式。

## 安装步骤（Android）

1. 把 `造价考场-1.0.0-release.apk` 传到手机（下载 / 微信文件 / USB 均可）。
2. 首次安装需允许「未知来源应用」：
   - Android 8–11：设置 → 应用和通知 → 特殊应用权限 → 安装未知应用 → 允许对应来源。
   - Android 12+：直接从文件管理器点击 APK，按提示「允许此次安装」即可。
3. 点击 APK → 安装 → 打开。桌面会生成「造价考场」图标。
4. 用 Chrome 打开一次站点并登录/缓存后，离线也能进入（PWA 已启用 Service Worker）。

## 重新构建（如需改版）

工程位于 `/workspace/twa-project/`（由 bubblewrap 的 `TwaGenerator` 生成，已配置本地 Gradle 与腾讯 Maven 镜像）。签名用 `/workspace/twa.keystore`（别名 `zaojiakao`，密钥库/密钥口令均为 `zaojiakao`）。

```bash
cd /workspace/twa-project
export JAVA_HOME=/root/.sdkman/candidates/java/current
export ANDROID_HOME=/opt/android-sdk
./gradlew assembleRelease --no-daemon
# 对齐 + 签名
/opt/android-sdk/build-tools/34.0.0/zipalign -p 4 \
  app/build/outputs/apk/release/app-release-unsigned.apk app-release-aligned.apk
/opt/android-sdk/build-tools/34.0.0/apksigner sign \
  --ks /workspace/twa.keystore --ks-key-alias zaojiakao \
  --ks-pass pass:zaojiakao --key-pass pass:zaojiakao \
  --out 造价考场-1.0.0-release.apk app-release-aligned.apk
```

> 改版后包名/签名保持不变即可沿用同一 `assetlinks.json`；若更换签名密钥，必须同步更新站点根目录的 `assetlinks.json`。

## 注意事项

- TWA 依赖设备已安装 **Chrome 73+**（国内设备多为 Chromium 内核浏览器，通常可用）。
- 上架 Google Play 请用 `.aab`；直接分发/内测请用 `.apk`。
- 本机编译环境已预置：JDK 17、Android SDK（build-tools 34、platforms 36）、Gradle 8.11.1（本地分发）。
