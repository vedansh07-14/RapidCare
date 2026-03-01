# 🏥 Project Title

**TriageFlow — Offline Symptom Triage System**

**One-line project description:**
Offline-first clinical triage platform for fast, consistent frontline patient assessment.

---

# 1. Problem Statement

## Problem Title

Intelligent Offline Symptom Triage for Frontline Healthcare

## Problem Description

In primary care settings, rural clinics, and field health programs, initial patient assessment is often performed by nurses, paramedics, or community health workers. Existing triage systems rely heavily on static paper flowcharts or rigid digital tools that are difficult to update, slow to navigate, and unsuitable for low-connectivity environments. This leads to inconsistent patient prioritization, delays in emergency identification, and increased cognitive load on healthcare workers.

## Target Users

* Nurses
* Paramedics
* Community health workers
* Rural clinic staff
* Field medical teams

## Existing Gaps

* Paper-based triage is hard to scale and update
* Limited offline decision support tools
* Complex symptom trees are difficult to navigate
* Inconsistent triage decisions
* No easy customization for local protocols
* High cognitive load in emergency situations

---

# 2. Problem Understanding & Approach

## Root Cause Analysis

* Lack of flexible digital triage tools
* Dependence on internet-based systems
* Manual navigation of complex decision trees
* Poor standardization across healthcare workers
* Limited tools designed for low-resource settings

## Solution Strategy

* Build an offline-first triage platform
* Provide visual flowchart builder for protocols
* Enable deterministic rule-based decision engine
* Design for low-connectivity environments
* Optimize UX for non-technical healthcare workers

---

# 3. Proposed Solution

## Solution Overview

TriageFlow is a customizable offline symptom triage system that allows healthcare administrators to create structured decision trees and enables frontline workers to perform fast, guided patient assessments on mobile devices without internet connectivity.

## Core Idea

**Build once → deploy offline → standardize triage everywhere**

## Key Features

* Drag-and-drop triage flow builder
* Conditional branching logic
* Risk scoring at leaf nodes
* Offline mobile triage execution
* Emergency alert system
* Local session logging
* Protocol validation
* Multi-language ready

---

# 4. System Architecture

## High-Level Flow

User → Frontend → Backend (optional) → Decision Engine → Database → Response

Mobile Offline Flow:
Health Worker → Mobile App → Local Decision Engine → SQLite → Result

## Architecture Description

The system follows an offline-first architecture. The web builder allows administrators to create and export triage protocols as JSON. The mobile application loads these protocols locally and executes deterministic rule-based triage without requiring network connectivity. Optional backend services support protocol distribution and analytics.

## Architecture Diagram

*(Add system architecture diagram image here)*

---

# 5. Database Design

## ER Diagram

*(Add ER diagram image here)*

## ER Diagram Description

**Entities:**

* **Protocol**

  * protocol_id
  * version
  * created_at

* **Node**

  * node_id
  * protocol_id
  * type
  * text
  * risk_level

* **Session**

  * session_id
  * timestamp
  * final_risk

* **SessionPath**

  * session_id
  * node_id
  * answer

Relationships:

* Protocol → Nodes (one-to-many)
* Session → SessionPath (one-to-many)
* Node → SessionPath (many-to-many via sessions)

---

# 6. Dataset Selected

## Dataset Name

Clinical Triage Protocol Dataset (Custom Structured Rules)

## Source

* WHO triage guidelines
* Standard clinical flow references
* Custom rule definitions

## Data Type

Structured decision tree rules (JSON-based)

## Selection Reason

Triage requires deterministic medical rules rather than probabilistic datasets. Structured clinical pathways ensure safety and consistency.

## Preprocessing Steps

* Normalize question format
* Standardize risk levels
* Validate branching logic
* Remove orphan nodes
* Version tagging

---

# 7. Model Selected

## Model Name

Rule-Based Deterministic Decision Engine

## Selection Reasoning

Medical triage requires predictable, explainable, and safe decision pathways. A rule-based engine ensures consistency and regulatory safety.

## Alternatives Considered

* LLM-based triage (rejected — safety risk)
* Pure AI classifier (rejected — non-deterministic)
* Cloud-only decision systems (rejected — connectivity issues)

## Evaluation Metrics

* Decision path validity
* Emergency detection accuracy
* Flow completion rate
* Response time
* Offline reliability

---

# 8. Technology Stack

## Frontend

* React (Vite)
* React Flow
* Tailwind CSS

## Backend (Optional)

* Node.js
* Express

## ML/AI (Optional Assistive Only)

* Groq / OpenRouter (future enhancements)
* Ollama (offline AI — optional)

## Database

* SQLite (mobile)
* MongoDB Atlas (optional cloud)

## Deployment

* Web: Vercel / Netlify
* Mobile: Expo / APK build
* Backend: Render / Railway

---

# 9. API Documentation & Testing

## API Endpoints List

### Endpoint 1: Upload Protocol

`POST /api/protocol`

### Endpoint 2: Get Protocol

`GET /api/protocol/:version`

### Endpoint 3: Sync Sessions

`POST /api/sessions`

## API Testing Screenshots

*(Add Postman / Thunder Client screenshots here)*

---

# 10. Module-wise Development & Deliverables

## Checkpoint 1: Research & Planning

**Deliverables:**

* Problem validation
* System design
* UX wireframes
* Architecture plan

## Checkpoint 2: Backend Development

**Deliverables:**

* Protocol APIs
* Session APIs
* Validation logic

## Checkpoint 3: Frontend Development

**Deliverables:**

* Flowchart builder
* Node editor
* JSON export/import
* Responsive UI

## Checkpoint 4: Model Training

**Deliverables:**

* Rule engine implementation
* Flow validator
* Risk mapping

## Checkpoint 5: Model Integration

**Deliverables:**

* Mobile decision engine
* Offline execution
* Emergency trigger

## Checkpoint 6: Deployment

**Deliverables:**

* Web hosting
* APK build
* Documentation
* Demo video

---

# 11. End-to-End Workflow

1. Admin creates triage protocol in web builder
2. Protocol exported as JSON
3. JSON loaded into mobile app
4. Health worker performs guided assessment
5. Decision engine computes risk
6. Emergency cases trigger alert
7. Session stored locally
8. Optional sync to server

---

# 12. Demo & Video

**Live Demo Link:** *(Add here)*
**Demo Video Link:** *(Add here)*
**GitHub Repository:** *(Add here)*

---

# 13. Hackathon Deliverables Summary

* Working flowchart builder
* Offline mobile triage app
* Deterministic decision engine
* Emergency alert system
* Local session storage
* Documentation & demo

---

# 14. Team Roles & Responsibilities

| Member Name | Role     | Responsibilities      |
| ----------- | -------- | --------------------- |
| TBD         | Frontend | Builder UI, Mobile UI |
| TBD         | Backend  | APIs, database        |
| TBD         | AI/Logic | Decision engine       |
| TBD         | DevOps   | Deployment            |

---

# 15. Future Scope & Scalability

## Short-Term

* Multi-language support
* Analytics dashboard
* Protocol version control
* Voice guidance

## Long-Term

* Offline AI assistant
* Hospital system integration
* WhatsApp emergency alerts
* Predictive triage analytics
* National-scale deployment

---

# 16. Known Limitations

* Depends on quality of clinical protocols
* Not a replacement for medical professionals
* Limited real-time hospital integration (MVP)
* Requires periodic protocol updates
* Device storage constraints in low-end phones

---

# 17. Impact

TriageFlow standardizes frontline patient assessment, reduces emergency response delays, lowers cognitive burden on healthcare workers, and enables reliable medical decision support in low-connectivity environments — directly improving patient safety and resource allocation.

---

# 📦 Releases

**v1.0 (MVP)**

* Offline triage engine
* Flow builder
* Emergency alerts
* Local storage

**Planned v2.0**

* Multi-language
* Analytics
* AI assist

---


Apk Link:- https://expo.dev/accounts/07shlokjoshi/projects/triageflow/builds/06441699-6f99-4f6c-9568-85116ba1dfff
Demo Video Link:- https://drive.google.com/file/d/11e_4PHD3Oi7-KvT4GcVvFLdbTd5x4aKD/view?usp=sharing

