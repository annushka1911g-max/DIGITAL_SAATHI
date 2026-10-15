import httpx
from backend.app.providers.llm.base import BaseLLMProvider
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import ProviderUnavailableError

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", model: str = "gemini-1.5-flash"):
        self.api_key = api_key or settings.LLM_API_KEY
        self.model = model or settings.LLM_MODEL
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def get_provider_name(self) -> str:
        return f"Gemini ({self.model})"

    async def generate_response(self, prompt: str, system_prompt: str = "", temperature: float = 0.3) -> str:
        if not self.api_key:
            raise ProviderUnavailableError("Gemini API key is not configured.")

        url = f"{self.base_url}?key={self.api_key}"
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER PROMPT:\n{prompt}"}]})
        else:
            contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 2048,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code != 200:
                    logger.error(f"Gemini API returned {res.status_code}: {res.text}")
                    raise ProviderUnavailableError(f"Gemini API error: {res.status_code}")
                
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text.strip()
        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            raise ProviderUnavailableError(f"Unable to reach Gemini API: {str(e)}")
