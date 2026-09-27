const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')
const { test } = require('node:test')
const { runInThisContext } = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const expoPath = require.resolve('@uploadthing/expo')
const expoRequire = createRequire(expoPath)
const polyfillRequire = createRequire(require.resolve('react-native-url-polyfill'))
const polyfill = polyfillRequire('whatwg-url-without-unicode')

function evaluate(source, requireModule) {
  const module = { exports: {} }
  runInThisContext(`(function(require, module, exports) {\n${source}\n})`)(
    requireModule, module, module.exports,
  )
  return module.exports
}

for (const order of ['upload first', 'realtime first']) {
  test(`uploads work without window.location: ${order}`, async () => {
    const saved = {
      URL: globalThis.URL,
      URLSearchParams: globalThis.URLSearchParams,
      fetch: globalThis.fetch,
      window: Object.getOwnPropertyDescriptor(globalThis, 'window'),
    }
    let polyfillLoaded = false
    const loadPolyfill = () => {
      // Match the native auto import's constructor replacement and module caching.
      if (!polyfillLoaded) {
        globalThis.URL = polyfill.URL
        globalThis.URLSearchParams = polyfill.URLSearchParams
        polyfillLoaded = true
      }
      return {}
    }
    const requests = []

    try {
      globalThis.window = globalThis
      assert.equal(window.location, undefined)
      globalThis.fetch = async (url, options) => {
        requests.push({ url: String(url), options })
        // Exercise presigning without sending any files over the network.
        return new Response('[]', { headers: { 'Content-Type': 'application/json' } })
      }
      if (order === 'realtime first') loadPolyfill()

      // Run the installed Expo helper and UploadThing client; stub only native modules.
      const expo = evaluate(readFileSync(expoPath, 'utf8'), (id) => {
        if (id === 'expo-constants') return { expoConfig: { hostUri: 'localhost:8081' } }
        if (id === 'expo-document-picker' || id === 'expo-image-picker') return {}
        return expoRequire(id)
      })
      const source = ts.transpileModule(
        readFileSync(path.join(root, 'src/lib/uploadthing.ts'), 'utf8'),
        { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
      ).outputText
      const uploader = evaluate(source, (id) => {
        if (id === 'react-native-url-polyfill/auto') return loadPolyfill()
        if (id === '@uploadthing/expo') return expo
        if (id === '@/constants/api') return { BASE_URL: 'https://uploads.example.test/' }
        if (id === '@/lib/logger') {
          return { logApiRequest() {}, logApiResponse() {}, logApiError() {} }
        }
        throw new Error(`Unexpected import: ${id}`)
      })

      // A later Supabase/realtime import must not invalidate the uploader's saved URL.
      loadPolyfill()
      for (const endpoint of ['fileUploader', 'requestUploader', 'avatarUploader']) {
        assert.deepEqual(await uploader.uploadFiles(endpoint, { files: [] }), [])
        const request = requests.at(-1)
        const url = new saved.URL(request.url)
        assert.equal(url.origin, 'https://uploads.example.test')
        assert.equal(url.pathname, '/api/uploadthing')
        assert.equal(url.searchParams.get('slug'), endpoint)
        assert.equal(url.searchParams.get('actionType'), 'upload')
        assert.equal(request.options.method, 'POST')
      }
      assert.equal(requests.length, 3)
    } finally {
      globalThis.URL = saved.URL
      globalThis.URLSearchParams = saved.URLSearchParams
      globalThis.fetch = saved.fetch
      if (saved.window) Object.defineProperty(globalThis, 'window', saved.window)
      else delete globalThis.window
    }
  })
}
