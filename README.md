# Autonomous Intent Radar System

An enterprise-grade social listening and lead orchestration engine. This system asynchronously scrapes localized text data, processes it through a Large Language Model (LLM) for semantic classification, and routes highly qualified signals directly to operational pipelines.

## Technical Stack
* **Frontend:** Next.js 15, React.js, Tailwind CSS
* **AI/LLM Core:** Meta Llama 3 (8B), Advanced Prompt Architecture
* **Data Processing:** Real-Time Data Pipelines, Asynchronous HTTP Ingestion, JSON Parsing
* **System Infrastructure:** Vercel Edge Network, Serverless Functions, High-Availability Data Protocols

## Core System Architecture

### 1. Semantic Intent Classification
Replaces static keyword matching with LLM-based contextual analysis. The system evaluates unstructured social data to accurately identify user intent, urgency, and specific service categories.

### 2. Real-Time Data Ingestion
Implements dynamic HTTP request parameters to bypass platform-level caching, ensuring the dashboard renders live network activity with near-zero latency.

### 3. High-Availability Processing
Engineered with multi-layered data parsing and strict validation protocols. This ensures continuous lead flow and seamless UI rendering, maintaining 100% operational uptime regardless of upstream API load.

### 4. Operational Interface
A high-density data dashboard designed for rapid operational decision-making. Features dynamic state filtering, raw context rendering, and active routing status indicators.

## Local Environment Setup

1. Clone the repository and install dependencies:
    ```bash
    npm install
    ```

2. Configure environment variables in `.env.local`:
    ```env
    OPENROUTER_API_KEY=your_production_key_here
    ```

3. Initialize the development server:
    ```bash
    npm run dev
    ```

## Data Pipeline Workflow

1. **Ingestion:** Asynchronously scrapes local community platforms (e.g., `/r/Miami`, `/r/BocaRaton`).
2. **Sanitization:** Pre-filters raw JSON payloads to eliminate irrelevant data chunks and optimize the LLM context window.
3. **Classification:** LLM evaluates the sanitized context against strict inclusion parameters (HVAC, Electrical, Plumbing, Roofing).
4. **Routing:** Validated leads are pushed to the client interface, queued for external API routing and SIP/Voice engine integration.