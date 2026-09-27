# Android OTA startup crash

The September 28, 2026 production OTA failed on Android build 3 with:

```text
java.net.MalformedURLException: no protocol: /data/user/0/com.novodip.docuflashmobile/files/.expo-internal/...
NativeWorklets
```

Worklets 0.10.1's Bundle Mode loader recognizes `assets://` and `file://`, but Expo Updates supplies downloaded bundles as absolute filesystem paths. The loader attempts to download that path as a network URL and crashes during startup.

`patches/react-native-worklets+0.10.1.patch` backports the absolute-path handling from the [upstream fix](https://github.com/software-mansion/react-native-reanimated/pull/9881). It preserves the Expo-pinned Worklets version and the existing Bundle Mode configuration. `npm install` / `npm ci` applies it through the existing `patch-package` postinstall script.

## Recovery for existing installations

An Android-only rollback was published on September 28, 2026 (Bangladesh time), update group `5e9eafb0-05c3-481f-b351-f5645a393338`. On the connected Samsung SM-M356B running build 3, the first launch still crashed while receiving recovery; the second launch remained running in the foreground without new React Native or Android runtime errors.

The affected production Android runtime is `557f8a76f27097f4c627225768edb7e78fbaa29f`. To restore its embedded bundle, publish an Android-only rollback:

```sh
eas update:roll-back-to-embedded --branch production --platform android --runtime-version 557f8a76f27097f4c627225768edb7e78fbaa29f --message "Restore embedded Android build after Worklets OTA startup crash" --non-interactive
```

This is a production operation. It restores the JavaScript bundled in the installed app, including its previous upload behavior. It does not install the native fix. Keep the phone online and relaunch after the rollback is received; verify startup using its crash log.

## Release the native fix

This patch changes Kotlin code and requires a new Android build. It cannot repair build 3 through another JavaScript OTA. Expo's fingerprint policy includes the `patches` directory, so the rebuilt app must use the newly computed runtime. Do not override it with the old runtime.

1. Build and install an Android preview release containing the patch and the upload URL fix.
2. Confirm that the embedded bundle starts and uploads work.
3. Publish a preview OTA for that same runtime, apply it, and confirm startup and uploads again. Testing only the embedded bundle misses this bug.
4. Build and release the production Android app. Leave the rollback in place for the old runtime.

The patch can be removed when upgrading to a compatible Worklets release containing the upstream fix (0.10.2 or later); that upgrade also requires a new native build.
