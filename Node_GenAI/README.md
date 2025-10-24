# 🧠 Gen AI Chatbot with RAG, LangChain & LangSmith (Node.js)

A **context-aware AI chatbot** built with **Node.js**, **LangChain**, **LangSmith**, and **Retrieval-Augmented Generation (RAG)**.  
This project integrates **memory** for persistent conversation history and a **RAG pipeline** to retrieve and ground responses in relevant external knowledge.

---

## 🚀 Features

- 💬 **Conversational Memory** — The chatbot stores and recalls previous messages for contextual continuity.  
- 📚 **Retrieval-Augmented Generation (RAG)** — Fetches relevant documents or data chunks before generating answers.  
- ⚙️ **LangChain Integration** — Modular chain and agent orchestration for natural language processing.  
- 🧩 **LangSmith Integration** — Tracing, debugging, and monitoring of LLM pipelines.  
- 🧠 **Custom Knowledge Base** — Upload your own data (PDFs, text files, or structured data) for domain-specific chat.  
- 🌐 **REST API Support** — Easy to integrate with frontends or other applications.  
- 🔐 **Secure Environment Variables** — API keys and configuration managed via `.env`.

---

## 🏗️ Architecture Overview

```plaintext
User
 │
 ▼
Chat Interface / API
 │
 ▼
LangChain Pipeline
 │ ├── Conversational Memory (BufferMemory / Redis)
 │ ├── Retriever (e.g., Chroma, Pinecone, or FAISS)
 │ └── LLM (OpenAI / Anthropic / Gemini / Llama)
 │
 ▼
LangSmith (Tracing & Evaluation)
 │
 ▼
Response to User
```

---

## 🧩 Tech Stack

| Component | Description |
|------------|--------------|
| **Node.js** | Backend runtime environment |
| **LangChain.js** | Orchestrates the LLM, retriever, and memory |
| **LangSmith** | Debugs, monitors, and traces LLM chains |
| **Vector Store (e.g., Chroma / Pinecone)** | Stores embeddings for RAG |
| **OpenAI / Anthropic API** | Large Language Model provider |
| **Express.js** | RESTful API framework |

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/genai-chatbot.git
cd genai-chatbot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key
LANGCHAIN_API_KEY=your_langchain_api_key
LANGSMITH_API_KEY=your_langsmith_api_key
VECTOR_DB_URL=your_vector_db_endpoint
PORT=3000
```

### 4. Run the App
```bash
npm run dev
```

The chatbot will be available at **http://localhost:3000**

---

## 💬 Example API Usage

**Endpoint:** `POST /chat`

**Request:**
```json
{
  "userId": "user_001",
  "message": "What did we discuss about project deadlines?"
}
```

**Response:**
```json
{
  "reply": "We discussed that the project deadline is October 31st and the review phase starts next week."
}
```

---

## 🧠 How It Works

1. **User sends a query** → The system retrieves recent chat history for context.  
2. **Retriever fetches relevant documents** → Uses vector embeddings (via FAISS/Chroma/Pinecone).  
3. **LLM generates an answer** → The model combines retrieved info + memory context.  
4. **Response stored in conversation history** → Future queries build upon it.  
5. **LangSmith logs & traces** → Enables debugging, evaluation, and chain optimization.

---

## 🧪 Example Workflow

```bash
# Step 1: Embed your knowledge base
npm run embed:data

# Step 2: Start chatbot API
npm start

# Step 3: Send queries via API or frontend
curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{"userId":"u123","message":"Summarize the latest sales report."}'
```

---

## 🧰 Folder Structure

```plaintext
├── src/
│   ├── index.js           # App entry point
│   ├── routes/
│   │   └── chat.js        # Chat API route
│   ├── chains/
│   │   └── ragChain.js    # LangChain RAG setup
│   ├── memory/
│   │   └── memoryManager.js
│   ├── retriever/
│   │   └── vectorStore.js
│   └── utils/
│       └── logger.js
├── data/                  # Your documents or dataset
├── .env
├── package.json
└── README.md
```

---

## 📈 Future Enhancements

- 🧩 Integrate WebSocket for real-time chat  
- 💾 Use Redis / Postgres for persistent memory  
- 🔍 Add semantic search to improve RAG accuracy  
- 🌍 Deploy on Vercel / Render / AWS Lambda  

---

## 🤝 Contributing

Contributions are welcome!  
Fork the repo, create a new branch, and submit a pull request.

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

---

## 🌟 Acknowledgements

- [LangChain.js](https://js.langchain.com/)
- [LangSmith](https://smith.langchain.com/)
- [OpenAI API](https://platform.openai.com/)
- [Chroma / Pinecone](https://www.pinecone.io/)
- [Node.js](https://nodejs.org/)

---

_This README was generated on October 17, 2025_
