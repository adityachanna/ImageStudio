# MambaRCA

<p align="center">
  Root Cause Analysis platform with Python backend and web UI.
</p>

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/Python-81.7%25-3776AB?logo=python&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-6.6%25-F7DF1E?logo=javascript&logoColor=black" />
  <img alt="CSS" src="https://img.shields.io/badge/CSS-10.3%25-1572B6?logo=css3&logoColor=white" />
  <img alt="Status" src="https://img.shields.io/badge/status-active-success" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [What MambaRCA Does](#what-mambarca-does)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Backend Notes](#backend-notes)
- [Frontend/UI Notes](#frontendui-notes)
- [Operational Workflow](#operational-workflow)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Maintainer](#maintainer)

---

## Overview

**MambaRCA** is a Root Cause Analysis (RCA) project that combines:
- a **Python-heavy backend**
- a lightweight **web interface** (JS/CSS)
- test scripts and startup checks for reliability

The goal is to help users diagnose issues systematically and generate structured analysis workflows.

---

## What MambaRCA Does

MambaRCA helps teams move from symptom → diagnosis by providing tooling for:

- issue context capture
- backend analysis routines
- reproducible diagnostic execution
- testable startup/import integrity
- UI-driven interaction where needed

This project is suited for debugging support systems, internal ops tooling, and incident analysis workflows.

---

## Key Features

- **Python-first RCA backend**
- **Web UI layer for interaction and presentation**
- **Dependency and startup diagnostic helpers**
- **Automated sanity checks through test scripts**
- **Project context docs for maintainability (`PROJECT_CONTEXT.md`)**
- **Modern Python dependency management (`pyproject.toml`, `uv.lock`)**

---

## Architecture

MambaRCA appears to use a layered architecture:

1. **Backend (`backend/`)**  
   Core RCA/business logic and service processing.

2. **Interface layer (`script.js`, `styles.css`)**  
   Lightweight client-side experience for interaction and output display.

3. **Operational/utility scripts**  
   - `diagnose_deps.py` for dependency diagnostics  
   - `run_opencode_plan.sh` for scripted workflows

4. **Validation/testing**  
   - `test_backend.py`  
   - `test_imports.py`  
   - `test_startup.py`

5. **Project metadata/docs**  
   - `PROJECT_CONTEXT.md`  
   - `pyproject.toml` and lockfile for reproducible environments

---

## Tech Stack

- **Primary language:** Python
- **UI:** JavaScript + CSS
- **Build/deps:** `pyproject.toml` + `uv.lock`
- **Testing:** Python test modules (`test_*.py`)
- **Shell automation:** `.sh` scripts

---

## Repository Structure

```text
MambaRCA/
├── backend/                # Core backend logic for RCA workflows
├── PROJECT_CONTEXT.md      # Deep context and project direction
├── diagnose_deps.py        # Dependency diagnosis script
├── run_opencode_plan.sh    # Scripted run/plan helper
├── script.js               # Frontend interaction logic
├── styles.css              # Frontend styling
├── test_backend.py         # Backend tests
├── test_imports.py         # Import integrity checks
├── test_startup.py         # Startup path checks
├── pyproject.toml          # Python project/dependency config
├── uv.lock                 # Reproducible dependency lock
└── README.md
```

---

## Quick Start

### 1) Prerequisites

- Python 3.10+ (recommended: 3.11+)
- `uv` (recommended) or `pip`
- Git
- (Optional) Node.js if additional frontend tooling is added later

### 2) Clone Repository

```bash
git clone https://github.com/adityachanna/MambaRCA.git
cd MambaRCA
```

### 3) Create Virtual Environment

Using `uv`:
```bash
uv venv
source .venv/bin/activate    # macOS/Linux
# .venv\Scripts\activate     # Windows PowerShell
```

Or with Python:
```bash
python -m venv .venv
source .venv/bin/activate
```

### 4) Install Dependencies

Using `uv`:
```bash
uv sync
```

Or pip fallback:
```bash
pip install -e .
```

---

## Environment Setup

If your backend requires env vars, create:

```bash
cp .env.example .env
```

If `.env.example` is not present, define required settings in your run command or shell profile.

Suggested categories:
- API credentials
- model/provider configuration
- debug/logging level
- service endpoint URLs

---

## Running the Project

### Run backend/module entrypoint
(Adjust command to your actual backend entry script/module)

```bash
python -m backend
```

or

```bash
python backend/main.py
```

### Run workflow helper script

```bash
bash run_opencode_plan.sh
```

### Run dependency diagnostics

```bash
python diagnose_deps.py
```

---

## Testing

Run all tests:

```bash
pytest -q
```

Run specific checks:

```bash
pytest -q test_imports.py
pytest -q test_startup.py
pytest -q test_backend.py
```

These tests help verify:
- import graph integrity
- startup viability
- backend behavior correctness

---

## Backend Notes

- Keep RCA logic deterministic and auditable.
- Separate ingestion/parsing from reasoning logic.
- Add structured logging for each diagnostic stage.
- Use typed data models where possible (e.g., `pydantic`/dataclasses).
- Prefer pure functions in core analysis pipeline for easier testing.

---

## Frontend
