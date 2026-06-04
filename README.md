# Terrinhas Poster Generator

This project was developed for the **"Computational Creativity for Design"** course unit of the **Master's in Design and Multimedia** at the **Faculty of Sciences and Technology of the University of Coimbra (FCTUC)**.

**Authors:**

* Estêvão Abreu
* João Luiz Castanheira

---

## Screenshots

---

## Tech Stack

---

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

Ensure you have the following installed:

* **Node.js**
* **Git**

### 2. Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/NETERNOT/ProjetoDW

# Go into the project folder
cd ProjetoDW

# Install dependencies
npm install
```

### 3. Running the Application

```bash
node server.js
```

### Image generation API

This project now uses the Hugging Face Inference API for image generation. You need a (free) Hugging Face account to obtain an API token.

1. Create a free account at https://huggingface.co/
2. Go to your settings -> Access Tokens and create a new token (read access is enough).
3. Create a `.env` file in the project root and add:

```
HUGGINGFACE_API_TOKEN=your_token_here
```

The server will read `HUGGINGFACE_API_TOKEN` and call the `runwayml/stable-diffusion-v1-5` model. If you want to use a different model, change the `hfUrl` in `server.js`.

Note: Hugging Face provides a free tier for API tokens. Usage limits and quotas may apply.
