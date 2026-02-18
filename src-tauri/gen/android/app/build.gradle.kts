import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("rust")
}

val tauriProperties = Properties().apply {
    val propFile = file("tauri.properties")
    if (propFile.exists()) {
        propFile.inputStream().use { load(it) }
    }
}

// Load keystore properties (project root: ../../../../keystore.properties)
val keystoreProperties = Properties().apply {
    val ksFile = file("../../../../keystore.properties")
    if (ksFile.exists()) {
        ksFile.inputStream().use { load(it) }
    }
}

android {
    compileSdk = 36
    namespace = "com.prayer.madni"
    // Configure signing config for release builds using keystore.properties
    signingConfigs {
        create("release") {
            val storeFilePath = keystoreProperties.getProperty("storeFile")
            if (storeFilePath != null && storeFilePath.isNotBlank()) {
                storeFile = file(storeFilePath)
            } else {
                // default to repo-provided upload-keystore-new.jks if present
                val defaultKs = file("../../../../src-tauri/upload-keystore-new.jks")
                if (defaultKs.exists()) storeFile = defaultKs
            }
            storePassword = keystoreProperties.getProperty("password", "")
            keyAlias = keystoreProperties.getProperty("keyAlias", "")
            keyPassword = keystoreProperties.getProperty("keyPassword", keystoreProperties.getProperty("password", ""))
        }
    }
    defaultConfig {
        manifestPlaceholders["usesCleartextTraffic"] = "false"
        applicationId = "com.prayer.madni"
        minSdk = 24
        targetSdk = 36
        versionCode = tauriProperties.getProperty("tauri.android.versionCode", "1").toInt()
        versionName = tauriProperties.getProperty("tauri.android.versionName", "1.0")
    }
    buildTypes {
        getByName("debug") {
            manifestPlaceholders["usesCleartextTraffic"] = "true"
            isDebuggable = true
            isJniDebuggable = true
            isMinifyEnabled = false
            packaging {                jniLibs.keepDebugSymbols.add("*/arm64-v8a/*.so")
                jniLibs.keepDebugSymbols.add("*/armeabi-v7a/*.so")
                jniLibs.keepDebugSymbols.add("*/x86/*.so")
                jniLibs.keepDebugSymbols.add("*/x86_64/*.so")
            }
        }
        getByName("release") {
            isMinifyEnabled = true
            proguardFiles(
                *fileTree(".") { include("**/*.pro") }
                    .plus(getDefaultProguardFile("proguard-android-optimize.txt"))
                    .toList().toTypedArray()
            )
            // Attach signing config if available
            try {
                signingConfig = signingConfigs.getByName("release")
            } catch (e: Exception) {
                // no-op: leave unsigned if signing config missing
            }
        }
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        buildConfig = true
    }
}

rust {
    rootDirRel = "../../../"
}

dependencies {
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("com.google.android.material:material:1.12.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")
}

apply(from = "tauri.build.gradle.kts")

// Copy project's custom icon into generated Android mipmap resources
val customIcon = file("../../../../out/mosqueLogo.png")
val resDir = file("src/main/res")
val densities = listOf("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi", "mipmap-anydpi-v26")
val iconNames = listOf("ic_launcher.png", "ic_launcher_foreground.png", "ic_launcher_round.png")

tasks.register("injectCustomIcons") {
    doLast {
        if (!customIcon.exists()) {
            logger.warn("Custom icon not found at: ${customIcon.absolutePath}. Skipping icon injection.")
            return@doLast
        }
        densities.forEach { density ->
            iconNames.forEach { name ->
                val target = File(resDir, "$density/$name")
                if (target.exists()) {
                    copy {
                        from(customIcon)
                        into(target.parentFile)
                        rename { name }
                    }
                    logger.lifecycle("Injected custom icon -> ${target.absolutePath}")
                } else {
                    logger.debug("Target icon not present, skipping: ${target.absolutePath}")
                }
            }
        }
    }
}

// Ensure icons are injected before the build/resource merge runs
tasks.matching { it.name == "preBuild" }.configureEach { dependsOn("injectCustomIcons") }