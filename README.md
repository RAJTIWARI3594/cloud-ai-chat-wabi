# Cloud AI Chat

ChatGPT-inspired chat interface built as a Wabi mini app. It includes saved conversation threads, a message composer, retry/error states, and a responsive chat-history panel.

## Runtime and limits

This is an export of the app-level source, not a standalone chatbot or a complete independently buildable web project. It imports Wabi-provided `$sdk` and `$wabi-web-components` packages, relies on Wabi's app host and Store for persistence, and calls the documented `aiClient.llm` path to generate replies. The tested reply path works inside Wabi without a separate API key. This repository does not include Wabi's SDK, host, model service, credentials, or user conversation data; outside Wabi it should not be assumed to run or generate replies. No public endpoint or independent cloud runtime is provided here.

The app is inspired by the chat experience; it is not an exact ChatGPT clone and does not claim OpenAI affiliation or capabilities that are not implemented.

## Source map

- `web/screens/HomeScreen.tsx` — chat interface and controls
- `web/screens/index.tsx` — Wabi screen registry
- `web/styles/index.css` — responsive app styles
- `web/fonts.ts` — font-family references supplied by the Wabi host
- `store/index.ts` — Wabi Store persistence and `aiClient.llm` reply flow
- `store/migrations/index.ts` — persisted-state schema version
- `types/index.ts` — reply and conversation types
- `types/entity-config.yaml` — Wabi AI reply-generation prompt

This repository contains only those app source files and this README. It intentionally excludes the app's live Store, conversation history, test prompts/replies,  credentials, generated build output, and deployment configuration. No deployment is configured.
