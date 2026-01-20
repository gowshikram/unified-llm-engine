"""
LLM Engine - Base LLM Provider
=========================================

Abstract base class for all LLM providers (Ollama, AWS Bedrock, Azure OpenAI, etc.)
Provides unified interface for provider abstraction and fallback mechanisms.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, Optional

import logging


class LLMProviderType(Enum):
    """Types of LLM providers supported by LLM Engine"""
    
    OLLAMA = "ollama"
    MISTRAL = "mistral"
    GEMINI = "gemini"
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    AWS_BEDROCK = "aws_bedrock"
    AZURE_OPENAI = "azure_openai"
    VERTEX_AI = "vertex_ai"


@dataclass
class LLMRequest:
    """Unified request format for all LLM providers"""
    
    prompt: str
    system_message: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 2048
    top_p: float = 0.9
    stream: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Provider-specific overrides
    model_override: Optional[str] = None
    timeout: Optional[int] = None


@dataclass
class LLMResponse:
    """Unified response format from all LLM providers"""
    
    content: str
    model: str
    provider: str
    tokens_used: int
    cost: float
    latency_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Optional fields
    finish_reason: Optional[str] = None
    error: Optional[str] = None


class BaseLLMProvider(ABC):
    """
    Abstract base class for all LLM providers.
    
    All providers (Ollama, AWS Bedrock, Azure, etc.) inherit from this class
    to ensure consistent interface and enable seamless fallback.
    """
    
    def __init__(self, config: Dict[str, Any], provider_name: Optional[str] = None):
        """
        Initialize provider with configuration.
        
        Args:
            config: Provider-specific configuration dictionary
            provider_name: Optional custom name for logging
        """
        self.config = config
        self.provider_type = self._get_provider_type()
        self.provider_name = provider_name or self.provider_type.value
        self.logger = logging.getLogger(f"llm.{self.provider_name}")
        
        self.logger.info(
            f"Initialized {self.provider_name} provider",
        )
    
    @abstractmethod
    def _get_provider_type(self) -> LLMProviderType:
        """Return the provider type enum value"""
        pass
    
    @abstractmethod
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """
        Generate completion from LLM.
        
        Args:
            request: Unified LLMRequest object
            
        Returns:
            LLMResponse with generated content
            
        Raises:
            Exception: If generation fails
        """
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if provider is available and healthy.
        
        Returns:
            True if provider is operational, False otherwise
        """
        pass
    
    @abstractmethod
    def get_cost_per_token(self, model: str) -> Dict[str, float]:
        """
        Get cost per token for the specified model.
        
        Args:
            model: Model identifier
            
        Returns:
            Dictionary with 'input' and 'output' costs per token
            Example: {"input": 0.003/1000, "output": 0.015/1000}
        """
        pass
    
    def calculate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """
        Calculate total cost for token usage.
        
        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model identifier
            
        Returns:
            Total cost in dollars
        """
        costs = self.get_cost_per_token(model)
        total = (input_tokens * costs["input"]) + (output_tokens * costs["output"])
        return round(total, 6)
    
    async def validate_request(self, request: LLMRequest) -> bool:
        """
        Validate request before sending to provider.
        
        Args:
            request: LLMRequest to validate
            
        Returns:
            True if valid, raises exception otherwise
        """
        if not request.prompt:
            raise ValueError("Prompt cannot be empty")
        
        if request.temperature < 0 or request.temperature > 2:
            raise ValueError("Temperature must be between 0 and 2")
        
        if request.max_tokens < 1:
            raise ValueError("Max tokens must be at least 1")
        
        return True
    
    def __repr__(self) -> str:
        """String representation"""
        return f"<{self.__class__.__name__}(provider={self.provider_name})>"
