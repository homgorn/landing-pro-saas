# 📐 Universal Landing Pro Wiki: Technical & SEO Specification

Welcome to the official technical Wiki for **Landing Pro SaaS**. This document defines the architectural standards and SEO optimization strategies implemented within the core engine.

---

## 🌐 Language / Язык
**English** | [Русский](WIKI_RU.md)

---

## 🏗 System Architecture

### 1. Multi-Agent Orchestration (MAO)
The engine utilizes a sovereign orchestration layer defined in `PipelineService.ts`. Unlike standard wrappers, it follows a **Linear Evolutionary Pattern**:
- **Design DNA Extraction:** Uses vision models to quantify aesthetic parameters.
- **Contextual Synthesis:** Merges user prompts with niche-specific search data.
- **Artifact Generation:** Generates zero-dependency HTML code.

### 2. Design DNA Specification
The vision agent extracts a `DesignSpec` object:
```json
{
  "palette": { "background": "#...", "primary": "#..." },
  "typography": { "heading": "...", "body": "..." },
  "layout": "Grid/Flexbox centered"
}
```
This ensures a 95%+ visual match to any donor website provided as a screenshot.

---

## 📈 SEO Performance Engineering

### ⚡ Core Web Vitals Optimization
- **Lazy Loading:** All generated images use `loading="lazy"`.
- **Preload Criticals:** Fonts and hero assets are preloaded (LCP optimization).
- **Zero CLS:** Fixed aspect ratios for media containers.

### 🔍 Search Engine Visibility
- **Semantic HTML5:** Strict use of `<main>`, `<article>`, `<section>`, and `<header>`.
- **JSON-LD Schema:** Every generated page includes micro-markup for better Google Snippets.
- **Meta-tags:** Automated generation of `og:image`, `twitter:card`, and `canonical` tags.

---

## 🛠 Advanced API Usage

### One-Click Deployment
Deployments are handled via the `CloudflareService` which interfaces with the Cloudflare Pages API.
**Endpoint:** `POST /api/deploy`
**Payload:** `{ "projectId": "string" }`

### Rate Limiting
A token-bucket rate limiter is implemented in the Next.js Middleware to ensure 99.9% availability during peak traffic by limiting each IP to 100 requests per minute.

---

## 🧪 Testing and QA
Integrity is guaranteed by **Vitest** for unit tests and **Type Check** for structural validation.

- **Config Validation:** Ensures all ENV variables are present via Zod.
- **Refactoring:** Modular extraction of the dashboard tree prevents "God Components".

---

## 🛡 Security Policy
- API keys are 100% server-side.
- HTML Previews use the `iframe sandbox` attribute with restricted permissions.
- Data is persisted via a secure JSON store with daily rotating backups.

---

**Landing Pro SaaS — Engineering the Professional Future of AI Development.**

---

## 🗺 Strategic Roadmap 2026-2027

| Phase | Milestone | Status | Description |
| :--- | :--- | :--- | :--- |
| **Q2 2026** | **Genesis & MAO Alpha** | ✅ Done | Core Multi-Agent Orchestration architecture and Design DNA Extraction engine launched. |
| **Q3 2026** | **Global API Node** | 🚀 Active | Deploying headless generation API for B2B partners and multi-node agent distribution. |
| **Q4 2026** | **E-commerce Core** | ⏳ Planned | Expansion of design extraction into complex transactional layouts and dashboards. |
| **2027** | **Self-Optimization** | 🔮 Vision | Autonomous agents that self-correct UI based on real traffic for maximum conversions. |

