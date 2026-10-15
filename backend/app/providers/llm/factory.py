from backend.app.core.config import settings
from backend.app.providers.llm.base import BaseLLMProvider
from backend.app.providers.llm.demo_provider import DemoLLMProvider
from backend.app.providers.llm.gemini_provider import GeminiProvider
from backend.app.providers.llm.openai_provider import OpenAIProvider
from backend.app.core.logging import logger

def get_llm_provider() -> BaseLLMProvider:
    provider = settings.LLM_PROVIDER.lower().strip()
    
    if provider == "gemini" and settings.LLM_API_KEY:
        try:
            return GeminiProvider()
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini provider: {e}. Falling back to demo mode.")
            return DemoLLMProvider()

    if provider == "openai" and settings.LLM_API_KEY:
        try:
            return OpenAIProvider()
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI provider: {e}. Falling back to demo mode.")
            return DemoLLMProvider()

    # Default to DemoLLMProvider for offline reliability and demo evaluation
    return DemoLLMProvider()
