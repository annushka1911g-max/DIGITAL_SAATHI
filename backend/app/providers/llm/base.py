from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, system_prompt: str = "", temperature: float = 0.3) -> str:
        """Generate response from language model"""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        pass
