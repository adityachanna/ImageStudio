# Mamba RCA Project Context

## Overview
Mamba RCA is a high-performance, automated Root Cause Analysis (RCA) and ticket ingestion pipeline designed for specialized applications like "Image Studio." It leverages a sophisticated multi-agent orchestration layer to transform raw bug reports (text + screenshots) into actionable engineering insights and code fixes.

## Core Architecture
The system operates as a deterministic intelligence layer with the following primary components:

### 1. Master Agent (Mamba Orchestrator)
- **Role**: The central nervous system of the pipeline.
- **Capabilities**:
    - **Multimodal Intake**: Processes both structured data and visual evidence (screenshots) via Gemini Flash.
    - **Semantic Understanding**: Parses user intent and technical context to determine the diagnostic path.
- **Decision Logic**:
    - Orchestrates specialized agents.
    - Routes to Deduplication if a similar issue exists.
    - Routes to Depth Research if the issue is novel.

### 2. Specialized Pipeline
- **Deduplication Agent**: Checks historical cases in MongoDB (Vector Search) to prevent redundant analysis.
- **OpenCode Agent (RCA Engine)**: Performs deep source-code analysis to identify the exact line of failure.
- **Persistence Layer**: Stores final diagnostic plans, context, and automated fixes in the database.

## Technical Stack
- **Frontend**: Next.js 16.2.1, React Flow (@xyflow/react), Framer Motion, Tailwind CSS (v4).
- **Backend/AI**: Gemini 1.5 Flash (Multimodal), OpenCode (RCA Logic), Python-based Orchestrator.
- **Database**: MongoDB with Vector Search capabilities.

## Key Design Principles
- **Engineered Editorial**: A high-end, professional interface designed to look premium and technical.
- **Immersive Visualization**: Floating, non-contained architecture diagrams that blend naturally with the UI grid.
- **Human-in-the-Loop**: Designed to provide detailed engineering reports to minimize manual triage for developers.

## Current Project State
- **Landing Page**: Fully integrated with an interactive terminal console and horizontal architectural map.
- **Sandbox**: A "Bug-Infested Sandbox" environment for testing the RCA engine against intentional faults (e.g., the `inputBUffer` typo in the compression route).
- **Navigation**: Cohesive branding across the main site and the functional sandbox.
