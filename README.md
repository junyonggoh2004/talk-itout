# 💬 Talk It Out
## An AI-powered support assistant for young learners

Talk It Out is an integrated AI-powered mental health support system designed to assist **Singaporean students and youths** and provide actionable insights for professional counsellors.

---

## 🚀 How It Works

### For Students:

* **💭 Daily Mood Check-ins:** Reflect on emotional wellbeing and track progress.
* **🤖 Chat with Lumi:** Interact with an empathetic AI counsellor featuring voice responses and an animated avatar.
* **🧘 Calm Zone:** Access guided breathing exercises for immediate relief.

### For Counsellors:

* **📊 Dashboard:** View real-time student wellness metrics and overall sentiment.
* **🚨 Automated Risk Alerts:** Receive instant notifications when students show signs of distress.
* **💬 Direct Intervention:** Capability to privately approach and support at-risk students.

---

## ✨ Key Features

* **Risk Detection:** Automatically flags concerning messages and low mood entries for immediate attention.
* **Voice Interaction:** Includes text-to-speech responses for accessible, conversational support.
* **Privacy-First:** Offers anonymous chat functionality; alerts are only generated for logged-in users to protect privacy while ensuring safety.
* **Culturally Aware:** Specifically designed for Singaporean students with understanding of the local context and pressures.

---

## 🛠️ Quick Start

Follow these steps to get Talk It Out running locally.

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/junyonggoh2004/talk-itout.git](https://github.com/junyonggoh2004/talk-itout.git)
    cd talk-itout
    ```

2.  **Install Dependencies** (Adjust per service)
    * **JavaScript / Node:**
        ```bash
        npm install
        ```
    * **Python:**
        ```bash
        pip install -r requirements.txt
        ```

3.  **Run Locally** (Pick the command matching your service)
    ```bash
    npm run dev           # frontend or fullstack (JS)
    # or
    python -m uvicorn app.main:app --reload  # FastAPI example
    ```

4.  **Access the Application**
    Open your web browser and navigate to `http://localhost:3000` (or the port the project uses).

---

## ⚙️ Environment Setup

Create a `.env` file in the project root (or service folders) with the required keys:
DATABASE_URL= 
JWT_SECRET= 
PORT=3000 
AI_API_KEY= # if applicable (e.g., for Gemini, OpenAI)

💻 Technologies Used

This project is built with a modern and robust stack:

* **Frontend:** React, TypeScript, Vite, shadcn-ui, Tailwind CSS
* **Backend & Data:** Supabase
* **AI/Services:** Lovable AI (Gemini), ElevenLabs TTS

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

* Use feature branches: `feature/short-desc`
* Open a Pull Request (PR) with a clear summary and tests for new behavior.
* Keep changes focused and follow the existing code style.

---

## ⚠️ Troubleshooting

* Check service logs for detailed errors.
* Verify all values in your `.env` file and confirm DB migrations are up to date.
* If using Docker: Use `docker compose up --build` to ensure a clean build.

---

## 📜 License

This project is licensed under the MIT License — see the `LICENSE` file for details.
