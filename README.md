# Mansplainer

**Caveman → MIT. MIT → Caveman.**

Mansplainer is a small AI translator that converts blunt, rough, simple language into polished technical language — or takes jargon-heavy academic, corporate, and technical language and turns it into something a caveman could understand.

It preserves the meaning. It just changes how many syllables are involved.

## What it does

### CAVEMAN → MIT

Turns this:

> AI do thing. Thing bad sometimes. Need know why.

Into something closer to this:

> Autonomous systems can produce undesirable outcomes, requiring mechanisms that provide traceability and explainability for their decisions.

### MIT → CAVEMAN

Turns this:

> The architecture implements a distributed epistemic framework for provenance-aware autonomous decision orchestration.

Into something closer to this:

> AI knows stuff. AI remembers where stuff came from. AI decides what to do.

## The workflow

**Double-click to paste → Translate → automatic copy → paste somewhere else.**

Mansplainer is designed to get out of the way:

- Large text input
- CAVEMAN → MIT and MIT → CAVEMAN modes
- Selectable free AI models
- One-click translation
- Successful outputs are immediately copied to the clipboard
- Double-click the input to pull text from the clipboard when browser permissions allow
- Clear and go again

## AI

Mansplainer uses **OpenRouter** as its AI provider and is not tied to one model.

The app retrieves available models and lets the user choose from free text-generation models. If a selected model fails, Mansplainer reports the failure instead of silently swapping models behind the user's back.

The OpenRouter integration sits behind a small provider boundary so the application's translation behavior is not coupled directly to a single external AI service.

## Why?

Because sometimes:

**smart people need to sound normal.**

And sometimes:

**normal people need to sound expensive.**

## Built by HACKASS

Mansplainer was created as a live proof-of-concept for **HACKASS — Hackathon Assassin**, an autonomous software builder.

The point of the experiment is not just the application. The repository is evidence of the output: describe a product, let HACKASS build it, run the result, and inspect the generated source.

## Status

Proof of concept.

## License

Open source. License terms will be defined in the repository license file.
