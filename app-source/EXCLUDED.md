# Excluded files

`app-source/` holds the unpacked `vendor/clawdbot-2026.1.21-1.tgz` (under `clawdbot-2026.1.21-1/`) and `vendor/openclaw-source-v2026.1.21.tar.gz` (under `openclaw-2026.1.21/`). Every file matches its archive member byte for byte, except the files below. They stay available inside the archives in `vendor/`.

| Path | Reason |
| --- | --- |
| `clawdbot-2026.1.21-1/dist/commands/antigravity-oauth.js` | Upstream embeds a base64 encoded Google OAuth client ID and secret, which GitHub push protection blocks. Not part of the vulnerability. |
| `clawdbot-2026.1.21-1/extensions/google-antigravity-auth/index.ts` | Same upstream Google OAuth client ID and secret. Not part of the vulnerability. |
| `openclaw-2026.1.21/extensions/google-antigravity-auth/index.ts` | Same upstream Google OAuth client ID and secret. Not part of the vulnerability. |
