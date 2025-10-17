# VAPI Integration — README

This document describes how the project integrates with **VAPI** (`@vapi-ai/web`) to create and configure real-time
voice assistants. It explains the helper available in `lib/utils.ts` (`configureAssistant`), required dependencies,
usage patterns, security considerations, and examples to help you get started quickly.

> **Goal:** provide a compact, reusable way to build the assistant DTO (CreateAssistantDTO) and keep VAPI-related
> types/logic centralized and server-only.

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Install](#install)
3. [Design & conventions](#design--conventions)
4. [Usage example](#usage-example)
5. [API shape & important fields](#api-shape--important-fields)
6. [Server vs client considerations](#server-vs-client-considerations)
7. [Environment & secrets](#environment--secrets)
8. [Testing & local dev tips](#testing--local-dev-tips)
9. [Troubleshooting](#troubleshooting)
10. [FAQ & notes](#faq--notes)

---

## Prerequisites

* Node 18+ recommended (some transitive deps indicate Node >= 18).
* `@vapi-ai/web` added to `package.json`.
* Project already uses TypeScript.
* A VAPI account / API key if you intend to call VAPI endpoints.

---

## Install

```bash
npm install @vapi-ai/web
# or
# pnpm add @vapi-ai/web
```

Make sure to commit the lockfile (`package-lock.json` / `pnpm-lock.yaml`) after installation.

---

## Design & conventions

* The helper `configureAssistant(voice, style)` returns a `CreateAssistantDTO` object (typed by
  `@vapi-ai/web/dist/api`).
* Keep VAPI interactions on the **server** (server components / API routes) to avoid leaking API keys and to reduce
  client bundle size.
* Centralize voice, transcriber and model defaults in one place so it’s easy to tune behavior for all assistants.
* Do **not** import `@vapi-ai/web` in client-side bundles unless you explicitly need it there.

---

## Usage example

Below is an example showing how to use the helper from `lib/utils.ts` and how to pass the DTO to the VAPI client. Adjust
to your actual VAPI client method names.

```ts
// lib/utils.ts (already present)
import {CreateAssistantDTO} from "@vapi-ai/web/dist/api";

export const configureAssistant = (voice: string, style: string): CreateAssistantDTO => {
  // ...build vapiAssistant as in lib/utils.ts
};
```

```ts
// pages/api/create-assistant.ts (server-side example)
import type {NextApiRequest, NextApiResponse} from "next";
import {configureAssistant} from "@/lib/utils";
import {vapiClient} from "@/lib/vapi-client"; // your wrapper around @vapi-api

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {voice = "sarah", style = "default"} = req.body;

    const payload = configureAssistant(voice, style);

    // Example — replace with your actual VAPI client call
    const assistant = await vapiClient.createAssistant(payload);

    return res.status(201).json(assistant);
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: "failed to create assistant"});
  }
}
```

> **Note:** `vapiClient.createAssistant()` is a placeholder — check your VAPI client for exact method names.

---

## API shape & important fields

Key sections of the `CreateAssistantDTO` used in the code:

* `name`: Friendly label for the assistant.
* `firstMessage`: Short greeting / first response template.
* `transcriber`: `{ provider, model, language }` — defines speech-to-text provider and model.
* `voice`: `{ provider, voiceId, stability, similarityBoost, speed, style, useSpeakerBoost }` — voice tuning params.
* `model`: `{ provider, model, messages }` — model provider and initial system messages.
* `clientMessages` / `serverMessages`: Arrays for message logs or message routing depending on VAPI usage.

Tune `speed`, `style` and `stability` to find the right tradeoff between naturalness and latency.

---

## Server vs client considerations

* **Server-only**: building the DTO and calling VAPI should happen server-side to protect secrets. Keep the
  `configureAssistant` helper importable on server code paths only.
* **Client**: send minimal identifiers to the client (assistant id, session tokens) and let the client connect to
  real-time sessions with short-lived tokens.
* **Bundle size**: avoid importing `@vapi-ai/web` in client code; it may pull heavy transitive deps.

---

## Environment & secrets

Store sensitive variables in your environment (e.g. `.env` or your platform secrets):

```
VAPI_API_KEY=sk_...
VAPI_BASE_URL=https://api.vapi.example
```

* Use server-side wrappers to inject the key in requests and rotate keys regularly.
* Never expose these keys to the browser.

---

## Testing & local dev tips

* Mock VAPI responses during unit tests. Don’t rely on the live API in CI unless explicitly testing integration.
* Use a small local script to `console.log(configureAssistant("sarah", "calm"))` so you can inspect the DTO shape
  quickly.
* If developing locally and interacting with VAPI, use a staging API key and limit usage.

---

## Troubleshooting

* **Type errors**: ensure `@vapi-ai/web` types are installed and your TS config includes `node_modules` types.
* **Bundle leaking**: import `@vapi-ai/web` only in server modules; use dynamic imports or wrapper modules if unsure.
* **Runtime errors**: check that transcriber / model names match providers supported by your VAPI plan.
* **Voice not found**: verify `voiceId` exists in your provider (e.g., 11labs) and the mapping in `voices` constant is
  correct.

---

*End of VAPI integration README.*
