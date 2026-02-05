This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [Tauri](https://tauri.app/) for mobile development.

## Getting Started

### Web Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Mobile Development

> 📱 **For detailed mobile setup instructions, see [MOBILE_SETUP.md](MOBILE_SETUP.md)**

#### 🤖 Android

**🔥 Development with Hot Reload (Recommended for Tauri):**

1. **Start emulator** in Android Studio (Device Manager → Play button)
2. **Run with hot reload:**
    ```bash
    npm run android:dev
    ```

Tauri automatically:

- Starts Next.js dev server on port 3000
- Connects Android app to dev server
- Enables hot module replacement (HMR)
- **Your changes appear instantly!** ✨

**Just edit code and save - no rebuild needed!**

**Other Commands:**

```bash
# Build production APK
npm run android:build

# Automated setup (starts emulator + app)
npm run android
```

**Prerequisites:**

- Android Studio installed
- Android SDK and NDK configured
- At least one Android Virtual Device (AVD) created
- `ANDROID_HOME` environment variable set

#### 🍎 iOS

```bash
# Build iOS app
npm run ios:build

# Open in Xcode and run
npm run ios:dev
```

__NOTE:__ If build fails please go through this workflow to successfully build the app

```bash
cd src-tauri

# Build for simulator (x86_64 for Intel Mac, or aarch64-apple-ios-sim for M1/M2)
cargo build --target x86_64-apple-ios --lib
cargo build --release --target x86_64-apple-ios --lib

# Build for device
cargo build --target aarch64-apple-ios --lib
cargo build --release --target aarch64-apple-ios --lib

# Create directories and copy libraries
mkdir -p gen/apple/Externals/x86_64/{debug,release}
mkdir -p gen/apple/Externals/arm64/{debug,release}

cp target/x86_64-apple-ios/debug/libapp_lib.a gen/apple/Externals/x86_64/debug/libapp.a
cp target/x86_64-apple-ios/release/libapp_lib.a gen/apple/Externals/x86_64/release/libapp.a
cp target/aarch64-apple-ios/debug/libapp_lib.a gen/apple/Externals/arm64/debug/libapp.a
cp target/aarch64-apple-ios/release/libapp_lib.a gen/apple/Externals/arm64/release/libapp.a
```

**Prerequisites:**

- macOS required
- Xcode installed
- iOS Simulator or physical device

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
