import httpx
from backend.app.providers.llm.base import BaseLLMProvider
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import ProviderUnavailableError

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", model: str = "gpt-4o-mini"):
        self.api_key = api_key or settings.LLM_API_KEY
        self.model = model or "gpt-4o-mini"
        self.url = "https://api.openai.com/v1/chat/completions"

    def get_provider_name(self) -> str:
        return f"OpenAI ({self.model})"

    async def generate_response(self, prompt: str, system_prompt: str = "", temperature: float = 0.3) -> str:
        if not self.api_key:
            raise ProviderUnavailableError("OpenAI API key is not configured.")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(self.url, headers=headers, json=payload)
                if res.status_code != 200:
                    logger.error(f"OpenAI API returned {res.status_code}: {res.text}")
                    raise ProviderUnavailableError(f"OpenAI API error: {res.status_code}")
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.error(f"Error calling OpenAI: {e}")
            raise ProviderUnavailableError(f"Unable to reach OpenAI API: {str(e)}")
