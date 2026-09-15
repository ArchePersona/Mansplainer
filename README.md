# Mansplainer

**Caveman → MIT. MIT → Caveman.**

Mansplainer is an AI-powered linguistic register translator. It converts blunt, rough, simple language into polished technical language, or takes jargon-heavy academic, corporate, and technical language and turns it into something easier to understand.

The goal is not ordinary summarization. Mansplainer changes **how an idea is expressed while preserving what the idea means**.

## Hackathon Materials

- **Live Demo:** https://mansplainer-fire.web.app/
- **Pitch Deck:** [Mansplainer-Pitch-Deck.pdf](./Mansplainer-Pitch-Deck.pdf)
- **Source Code:** This repository

## What It Does

### CAVEMAN → MIT

Turns this:

> AI do thing. Thing bad sometimes. Need know why.

Into something closer to:

> Autonomous systems can produce undesirable outcomes, requiring mechanisms that provide traceability and explainability for their decisions.

### MIT → SIMPLE

Turns this:

> The architecture implements a distributed epistemic framework for provenance-aware autonomous decision orchestration.

Into something closer to:

> AI knows stuff. AI remembers where stuff came from. AI decides what to do.

The simplified direction also supports an **8th Grade** output level for plain-language translation without the deliberately exaggerated Caveman register.

## User Workflow

1. Configure an OpenRouter API key.
2. Choose a translation direction.
3. Choose an available free model.
4. Paste or enter text.
5. Select the desired output level when translating from MIT/technical language.
6. Click **Translate Now** or press `Ctrl+Enter`.
7. Review or copy the translated result.

Convenience features include:

- Double-click input to paste from the clipboard when browser permissions allow.
- Automatic clipboard copy after successful translation.
- Manual output copy.
- Swap & Invert to make the previous output the next input and reverse direction.
- Live model and latency telemetry.
- Built-in architecture verification tests.

## Architecture

Mansplainer is intentionally small and browser-first. There is no application server in the translation path.

```text
Browser UI
   |
   +-- app.js -------- application state, prompts, and interaction
   +-- clipboard.js -- clipboard boundary
   +-- openrouter.js - AI provider boundary
                         |
                         v
                    OpenRouter API
                         |
                         v
                  Selected AI model
```

The OpenRouter integration is isolated behind a provider boundary so the rest of the application is not coupled to one specific model.

The application discovers available models and presents free text-generation models to the user. A selected-model failure is surfaced to the user rather than silently substituting another model.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- OpenRouter API
- Browser Clipboard API
- Firebase Hosting

No framework, package manager, build system, or local application server is required for normal use.

## Repository Structure

```text
.
├── index.html       Application shell and UI
├── styles.css       Application styling and responsive layout
├── app.js           UI state, translation modes/prompts, interactions, test UI
├── openrouter.js    OpenRouter model discovery and completion provider
├── clipboard.js     Clipboard read/write boundary
├── tests.js         Integrated unit/functional verification tests
├── firebase.json    Firebase Hosting configuration
├── .firebaserc      Firebase project configuration
├── .gitignore       Git exclusions
├── LICENSE          MIT License
├── Mansplainer-Pitch-Deck.pdf  Hackathon presentation deck
└── README.md        Project and reviewer documentation
```

## Requirements

To run Mansplainer you need:

- A modern web browser with JavaScript enabled.
- An internet connection.
- An OpenRouter API key.
- Access to at least one compatible OpenRouter text-generation model.

No Node.js, Python, Docker, database, or dependency installation is required.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/ArchePersona/Mansplainer.git
cd Mansplainer
```

### 2. Open the application

For the simplest review, open `index.html` in a modern browser.

If your browser applies stricter security rules to local `file://` pages, serve the directory with any static HTTP server. For example, if Python is already installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Python is **not** an application dependency; this is only an optional static-file server for local review.

### 3. Configure OpenRouter

1. Click **Set OpenRouter Key**.
2. Enter your OpenRouter API key.
3. Save/connect.
4. Select one of the discovered free models.

No API key is committed to this repository.

## Running the Built-In Tests

Mansplainer includes an integrated browser test suite in `tests.js`.

1. Open the application.
2. Find **Architecture Verification** near the bottom of the interface.
3. Click **Run Self-Tests**.
4. Review the pass/fail results displayed in the application.

The current suite verifies behavior including:

- Translation prompt/register configuration.
- Caveman → MIT prompt behavior.
- MIT → Caveman prompt behavior.
- MIT → 8th Grade plain-language configuration.
- OpenRouter API-key state handling.
- Free-model filtering logic.
- Empty-input validation.
- Missing-model validation without silent fallback.
- Clipboard interface behavior.

The tests are intentionally browser-native so reviewers can inspect and run the verification without installing a test framework.

## Security and Data Handling

Mansplainer is a client-side application. Translation requests are dispatched from the browser to OpenRouter; this repository does not include an intermediary application backend that receives translation text.

Important reviewer/user notes:

- Never commit an OpenRouter API key to the repository.
- Treat API keys as credentials.
- The application provides controls to save and remove the configured key from browser-side state.
- Text submitted for translation is sent to the selected external AI provider/model through OpenRouter and is therefore subject to the applicable provider policies.
- Clipboard access depends on browser permissions and security restrictions.

## Deployment

The repository includes Firebase Hosting configuration and the public demonstration is deployed at:

https://mansplainer-fire.web.app/

For an authorized Firebase project, deployment uses the standard Firebase Hosting workflow after authenticating with the Firebase CLI. The repository's `firebase.json` serves the project root as the static hosting directory.

Deployment credentials are intentionally not stored in the repository.

## Built by HACKASS

Mansplainer was created as a live proof-of-concept for **HACKASS — Hackathon Assassin**, an autonomous software builder.

The experiment was not simply whether an LLM could generate code. The question was:

> **Can a human remain at the level of product intent and have an autonomous system turn that intent into working software?**

For Mansplainer, the development path was:

```text
HUMAN INTENT
     |
     v
HACKATHON ASSASSIN
     |
     v
PLAN / IMPLEMENT / VERIFY
     |
     v
MANSPLAINER
```

The resulting source code is public here so reviewers can inspect the actual artifact rather than relying only on a demonstration or description.

## Reviewer Quick Check

A reviewer can verify the submission quickly:

1. Inspect the source in this repository.
2. Open the live demo or run `index.html` locally.
3. Configure an OpenRouter key and select a free model.
4. Translate text in both directions.
5. Try the 8th Grade simplification option.
6. Run **Architecture Verification** and inspect the test results.
7. Review `openrouter.js`, `app.js`, and `tests.js` for the core implementation.
8. Review [Mansplainer-Pitch-Deck.pdf](./Mansplainer-Pitch-Deck.pdf) for the hackathon presentation.

## Current Status

Hackathon proof-of-concept and functional demonstration.

## License

Mansplainer is released under the [MIT License](./LICENSE).
