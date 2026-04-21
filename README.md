# Autonomous Intent Radar

An enterprise-grade social listening and intent-classification engine. Built to eliminate lead latency by scraping localized text data, passing it through a Large Language Model for semantic classification, and routing high-intent signals directly to outbound operational pipelines.

## Architecture Overview

This system operates on a serverless Edge architecture, ensuring zero-latency data processing and high availability.

* **Frontend Framework:** Next.js 15 (React)
* **Styling & Interface:** Tailwind CSS, Framer Motion (Glassmorphic UX)
* **LLM Core:** Meta Llama 3.1 (8B) via OpenRouter API
* **Data Ingestion:** Asynchronous scraping of localized community feeds
* **Deployment Environment:** Vercel

## Core Capabilities

### 1. Semantic Intent Classification
Bypasses traditional, error-prone keyword matching. The system feeds raw, unstructured social data into an LLM to understand context, urgency, and specific service needs before classifying a lead.

### 2. Real-Time Data Pipeline
Utilizes timestamp-busted HTTP requests to bypass platform-level caching, ensuring the dashboard reflects live network activity within seconds of a post going live.

### 3. Failsafe Redundancy
Engineered with strict API boundary limits. If the LLM provider experiences downtime or rate limits, the system triggers a localized fallback sequence, parsing raw data directly to the interface to ensure uninterrupted operational visibility.

### 4. Executive Dashboard
A high-density, dark-mode user interface designed for non-technical operational leaders. Features dynamic category filtering, raw context viewing, and active routing status indicators.

## Local Environment Setup

1. Clone the repository and install dependencies:
```bash
npm install