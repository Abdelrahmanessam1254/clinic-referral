// CommonJS format (.js not .mjs) — this avoids the Windows ESM loader bug
// where absolute paths with 'c:' protocol crash the ESM URL scheme handler.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};