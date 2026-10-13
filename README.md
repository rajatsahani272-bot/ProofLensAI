# ProofLens AI

**Verify Images. Verify Claims. See the Truth with Evidence.**

ProofLens AI is an AI-assisted image and claim verification platform
designed to help users inspect suspicious images, extract visible text,
analyze image signals, and review claims against available evidence.

> **Important:** ProofLens AI provides decision support, not a
> definitive verdict. AI-generated-image detection can be uncertain, OCR
> can make mistakes, and claim results depend on the quality and
> reliability of available evidence.

## The Problem

Images and claims can spread online without enough context. People may
struggle to determine what an image contains, what text it shows, or
whether a related statement is supported by credible evidence.

## Our Solution

ProofLens AI combines image processing, OCR, AI-assisted analysis, and
claim verification in one workflow. It presents analysis outputs to help
users investigate content rather than relying on a single unexplained
score.

## Key Features

-   **Image analysis:** Submit an image for analysis through the web
    interface.
-   **OCR text extraction:** Extract text detected inside an uploaded
    image.
-   **AI-image detection signals:** Estimate whether an image may
    contain AI-generated content. This is experimental and is not proof.
-   **Claim verification:** Evaluate a user-provided claim and summarize
    whether available evidence supports it.
-   **Evidence-aware results:** Present analysis output and context for
    further investigation.
-   **Web dashboard:** Review the verification workflow through a
    React-based interface.

## How It Works

1.  **Upload:** The user submits an image and, where applicable, a claim
    to check.
2.  **Process:** The backend receives the request and coordinates the
    analysis workflow.
3.  **Extract:** The OCR engine attempts to identify text present in the
    image.
4.  **Analyze:** Image-analysis and AI-assisted components produce
    signals and a claim assessment.
5.  **Review:** The result is returned to the web interface for the user
    to inspect.

## Technology Stack

  Layer                     Technologies
  ------------------------- ----------------------------------------------------
  Frontend                  React, Vite, JavaScript, CSS
  Backend API               Node.js, Express, ES Modules
  AI service                Python, FastAPI
  Image and text analysis   Python image-processing and OCR pipeline
  Claim analysis            AI-assisted claim verification and evidence review
  Database                  MongoDB Atlas
  AI integration            Groq-based analysis components

## Architecture

``` text
React + Vite Frontend
        |
        v
Node.js + Express API
        |
        +------> MongoDB Atlas
        |
        v
Python FastAPI AI Service
        |
        v
AIML Pipeline
  ├── Image Processing
  ├── OCR
  ├── AI-Image Detection Signals
  └── Claim Verification
        |
        v
Analysis Result -> Frontend
```

## Repository Structure

``` text
ProofLensAI/
├── AIML/         # Image analysis, OCR, detection and claim-verification logic
├── Backend/      # Express API and application backend
├── Frontend/     # React + Vite user interface
├── ai-service/   # FastAPI adapter for AI/ML processing
└── .gitignore
```

## Getting Started

### Prerequisites

-   Node.js and npm
-   Python 3
-   MongoDB Atlas account or a compatible MongoDB deployment
-   API credentials required by enabled AI integrations

### 1. Clone the repository

``` bash
git clone https://github.com/rajatsahani272-bot/ProofLensAI.git
cd ProofLensAI
```

### 2. Configure environment variables

Create local `.env` files in the relevant service directories using the
variable names expected by each service. Do not commit real secrets.

Configuration may include:

-   MongoDB connection URI
-   API port and service URLs
-   Frontend origin for CORS
-   AI provider API key
-   Frontend API base URL

Check each service's configuration code for the exact variable names
before setting them.

### 3. Install dependencies

Install frontend and backend dependencies in separate terminals:

``` bash
cd Frontend
npm install
```

``` bash
cd Backend
npm install
```

Set up Python environments and install the dependencies required by
`AIML/` and `ai-service/` using the dependency files available in those
directories.

### 4. Run the services

Start each service in a separate terminal using the scripts and entry
points defined in its directory. The development ports configured during
development are:

-   Backend API: `http://localhost:5000`
-   AI service: `http://localhost:8001`
-   Frontend: Vite's configured development port

Exact start commands depend on the current project configuration.

## API

The backend verification workflow has been tested through:

``` http
POST /api/verification/analyze
```

The endpoint accepts a multipart analysis request. Confirm the current
route and required form fields in the source code before integrating a
client, as request fields and claim-forwarding behavior may change
during development.

## Responsible Use and Limitations

-   A model score is not proof that an image is authentic or
    AI-generated.
-   OCR may misread text, especially in low-resolution, distorted, or
    stylized images.
-   A claim marked as supported is only as reliable as the evidence
    evaluated.
-   Third-party sources are not equivalent to primary or official
    sources.
-   Users should inspect evidence and seek authoritative sources before
    consequential decisions.
-   Do not use the system as the sole basis for legal, medical,
    financial, or safety-critical decisions.

## Hackathon Project

-   **Project:** ProofLens AI
-   **Tagline:** Verify Images. Verify Claims. See the Truth with
    Evidence.
-   **Team:** AegisAI
-   **Track:** Open Innovation --- AI-Powered Image & Claim Verification

ProofLens AI aims to make digital-content investigation more accessible
by bringing image signals, extracted text, and claim-focused evidence
review into one workflow.

## Current Status

This is an active hackathon project. Some analysis components are
experimental. Service integration, evidence quality, performance, and
end-to-end flows should be validated in the target deployment before
relying on results.

## Contributing

1.  Create a branch for your change.
2.  Keep commits focused and descriptive.
3.  Never commit `.env` files, credentials, virtual environments,
    dependency folders, or generated secrets.
4.  Test the affected service before opening a pull request.

## License

No license has been specified yet. All rights remain with the respective
copyright holders unless a license is added to this repository.
