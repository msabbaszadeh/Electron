# Electron - User Guide

Welcome to Electron! This guide will walk you through setting up and using the application step-by-step. No technical experience is needed!

---

## What You Need

All you need is a modern web browser like Google Chrome, Firefox, or Microsoft Edge.

---

## Choosing Your AI Engine

Electron can be powered by two different types of AI:

1.  **Google Gemini (Recommended for ease of use)**: A powerful AI from Google that runs in the cloud. This is the easiest way to get started. You will need an "API Key" from Google, which is like a password for the AI.
2.  **Ollama (For privacy and offline use)**: This lets you run powerful AI models on your own computer. It's completely free and private but requires a small installation.

Follow the guide for the engine you want to use.

---

### Part 1: Setup with Google Gemini

**Step 1: Get Your Free Google Gemini API Key**

1.  Go to the Google AI Studio website: [https://aistudio.google.com/](https://aistudio.google.com/)
2.  Log in with your Google account.
3.  Click on **"Get API key"** and then **"Create API key"**.
4.  Copy the long string of letters and numbers. This is your key. Keep it safe!

**Step 2: Connect the App to Gemini**

This application is designed to automatically use an API key provided in its environment. If you are running a local copy of this project, you will need to:

1.  Find a file named `.env` or create one if it doesn't exist.
2.  Add the following line to the file, pasting your key after the `=` sign:
    ```
    API_KEY=PASTE_YOUR_API_KEY_HERE
    ```
3.  Save the file and restart the application.

---

### Part 2: Setup with Ollama (Local AI)

**Step 1: Install Ollama**

1.  Go to the Ollama website: [https://ollama.com/](https://ollama.com/)
2.  Click the "Download" button and install the application for your operating system (Mac, Windows, or Linux).

**Step 2: Download an AI Model**

1.  Open your computer's command line tool (Terminal on Mac, PowerShell or Command Prompt on Windows).
2.  Type the following command and press Enter. This will download a popular, powerful model.
    ```
    ollama run llama3
    ```
3.  Wait for the download to complete. You can close the terminal when it's done.

**Step 3: Connect the App to Ollama**

1.  In the Electron app, go to the **"Explore"** tab.
2.  Click the **"Settings"** button in the bottom-left corner.
3.  Under "AI Provider," select **"Ollama (Local)"**.
4.  The default URL (`http://localhost:11434`) should work automatically if Ollama is running on your computer. The app will test the connection and show you the models it finds.

---

## How to Use Electron

### Step 1: Create Your First Profile

1.  In the sidebar, select the **"Create"** tab.
2.  A new chat will start. Simply answer the AI's questions about your name and your tastes in movies and music.
3.  When the AI has enough information, it will automatically create and save your profile.

### Step 2: Get Recommendations

1.  **Upload a Dataset (Your Knowledge Source)**
    *   First, you need a list of items to get recommendations from (e.g., a list of movies, songs, or books). This should be a **CSV** or **Excel** file.
    *   Go to the **"Explore"** tab, click **"Settings"**, and find the **"Reference Dataset"** section.
    *   Click **"Upload Dataset"** and select your file.

2.  **Start a Conversation**
    *   After your profile is created, the app will automatically ask if you want recommendations (if you have a dataset loaded).
    *   Simply say "yes" or ask your own questions like, "What should I watch this weekend?"
    *   The AI will analyze your profile and give you personalized recommendations from the file you uploaded!

Enjoy exploring your new personalized recommendations!
