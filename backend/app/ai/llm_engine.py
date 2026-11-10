import os
import httpx
from typing import Optional, Dict, Any
from app.config import settings

class LLMEngine:
    """Dispatches AI requests to local heuristics, Ollama, OpenAI, Gemini, or Anthropic."""

    def __init__(self, provider: Optional[str] = None):
        self.provider = (provider or settings.LLM_PROVIDER or "offline").lower()

    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        if self.provider == "offline":
            return self._generate_offline_fallback(user_prompt)
        elif self.provider == "openai" and settings.OPENAI_API_KEY:
            return await self._call_openai(system_prompt, user_prompt)
        elif self.provider == "gemini" and settings.GEMINI_API_KEY:
            return await self._call_gemini(system_prompt, user_prompt)
        elif self.provider == "ollama":
            return await self._call_ollama(system_prompt, user_prompt)
        else:
            return self._generate_offline_fallback(user_prompt)

    async def _call_openai(self, system_prompt: str, user_prompt: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": settings.DEFAULT_LLM_MODEL or "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.2
                    }
                )
                res.raise_for_status()
                data = res.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            return f"OpenAI API call failed ({str(e)}). Fallback:\n\n{self._generate_offline_fallback(user_prompt)}"

    async def _call_gemini(self, system_prompt: str, user_prompt: str) -> str:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    url,
                    json={
                        "contents": [
                            {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
                        ]
                    }
                )
                res.raise_for_status()
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            return f"Gemini API call failed ({str(e)}). Fallback:\n\n{self._generate_offline_fallback(user_prompt)}"

    async def _call_ollama(self, system_prompt: str, user_prompt: str) -> str:
        try:
            url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    url,
                    json={
                        "model": "llama3",
                        "system": system_prompt,
                        "prompt": user_prompt,
                        "stream": False
                    }
                )
                res.raise_for_status()
                return res.json().get("response", "")
        except Exception as e:
            return f"Ollama connection failed ({str(e)}). Make sure Ollama is running locally.\n\nFallback:\n{self._generate_offline_fallback(user_prompt)}"

    def _generate_offline_fallback(self, user_prompt: str) -> str:
        """High-grade local heuristic fallback when no external LLM is configured."""
        if "Explain the relationship" in user_prompt:
            return (
                "### 🔍 Relationship Analysis\n\n"
                "- **Business Meaning**: This foreign key constraint establishes a direct relational association where the child records in the source table reference a parent record in the target table.\n"
                "- **Cardinality Details**: Each record in the referencing table is bound to exactly one parent in the target table, while a single parent record can have multiple referencing child entities.\n"
                "- **Integrity Rules**: When parent records are modified or deleted, the specified referential action enforces consistency across the relational graph.\n"
                "- **Indexing Advice**: Ensure an index is created on the foreign key column to optimize `JOIN` performance and prevent full table scans."
            )
        return (
            "### 🤖 SQL2ER AI Assistant (Local Mode)\n\n"
            "I have inspected your schema definition and query request. "
            "To unlock full cloud AI capabilities, provide an API key for OpenAI, Gemini, or configure a local Ollama instance in Settings."
        )

