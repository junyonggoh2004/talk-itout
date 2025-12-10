# 💬 Talk It Out
## An AI-powered support assistant for young learners

Talk It Out is an integrated AI-powered mental health support system designed to assist students and provide actionable insights for professional counsellors.

---

## ✨ Key Features

* **1. Cognitive Behavioural Therapy (CBT)-Informed Chatbot**
    Offers students a safe, empathetic companion while simultaneously generating counsellor-ready insights. This allows emotional support and professional intervention to operate in one integrated loop.

* **2. Chat Memory**
    Remembers context across conversations for truly personalized support, creating a consistent and trustworthy interaction history.

* **3. Real-Time Risk Detection**
    Instantly alerts counsellors when risk is detected. It tracks trigger words, conversational shifts, and stress trajectories, allowing for early alerts and precise, timely intervention.

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
