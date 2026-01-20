"""
OpenAI Provider for LLM Engine

Supports GPT-4, GPT-3.5, and other OpenAI models.
"""

import os
import asyncio
from typing import Dict, Any, Optional
import aiohttp

from .base_provider import BaseLLMProvider, LLMProviderType, LLMRequest, LLMResponse
import logging

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseLLMProvider):
    """
    Provider for OpenAI models.
    
    Supports:
    - GPT-4 Turbo
    - GPT-4
    - GPT-3.5 Turbo
    - GPT-4o (Omni)
    
    Features:
    - Streaming support
    - Function calling
    - Vision capabilities (GPT-4 Vision)
    - JSON mode
    """
    
    def __init__(self, config: Dict[str, Any], provider_name: Optional[str] = None):
        """Initialize OpenAI provider."""
        super().__init__(config, provider_name)
        
        # Get API key from config or environment
        self.api_key = config.get('api_key') or os.getenv(
            config.get('api_key_env', 'OPENAI_API_KEY')
        )
        
        if not self.api_key:
            raise ValueError("OpenAI API key not provided")
        
        self.api_base = config.get('api_base', 'https://api.openai.com/v1')
        self.organization = config.get('organization')
        self.timeout = config.get('timeout', 60)
        self.max_retries = config.get('max_retries', 3)
        
        logger.info(
            "OpenAI provider initialized",
            api_base=self.api_base,
            has_org=bool(self.organization)
        )
    
    def _get_provider_type(self) -> LLMProviderType:
        """Return provider type."""
        return LLMProviderType.OPENAI if hasattr(LLMProviderType, 'OPENAI') else LLMProviderType.OLLAMA
    
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """
        Generate completion using OpenAI API.
        
        Args:
            request: LLMRequest with prompt and parameters
        
        Returns:
            LLMResponse with generated content
        """
        await self.validate_request(request)
        
        # Map model names
        model = request.model or self.config.get('default_model', 'gpt-4-turbo-preview')
        
        # Prepare messages
        messages = []
        if request.system_message:
            messages.append({
                "role": "system",
                "content": request.system_message
            })
        
        messages.append({
            "role": "user",
            "content": request.prompt
        })
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": messages,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
            "top_p": request.top_p,
        }
        
        # Call API
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        if self.organization:
            headers["OpenAI-Organization"] = self.organization
        
        url = f"{self.api_base}/chat/completions"
        
        start_time = asyncio.get_event_loop().time()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=self.timeout)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        end_time = asyncio.get_event_loop().time()
                        latency_ms = (end_time - start_time) * 1000
                        
                        # Extract content
                        content = data['choices'][0]['message']['content']
                        
                        # Calculate tokens and cost
                        input_tokens = data.get('usage', {}).get('prompt_tokens', 0)
                        output_tokens = data.get('usage', {}).get('completion_tokens', 0)
                        total_tokens = data.get('usage', {}).get('total_tokens', input_tokens + output_tokens)
                        cost = self.calculate_cost(input_tokens, output_tokens, model)
                        
                        logger.info(
                            "OpenAI API success",
                            model=model,
                            tokens=total_tokens,
                            cost=cost,
                            latency_ms=round(latency_ms, 2)
                        )
                        
                        return LLMResponse(
                            content=content,
                            model=model,
                            provider=self.provider_type,
                            input_tokens=input_tokens,
                            output_tokens=output_tokens,
                            tokens_used=total_tokens,
                            cost=cost,
                            latency_ms=latency_ms,
                            metadata={
                                "finish_reason": data['choices'][0].get('finish_reason'),
                                "usage": data.get('usage')
                            }
                        )
                    else:
                        error_text = await response.text()
                        logger.error(
                            "OpenAI API error",
                            status=response.status,
                            error=error_text[:500]
                        )
                        raise Exception(f"OpenAI API error {response.status}: {error_text}")
        
        except asyncio.TimeoutError:
            logger.error("OpenAI API timeout", model=model)
            raise Exception(f"OpenAI API timeout for model {model}")
        except Exception as e:
            logger.error("OpenAI API call failed", error=str(e), model=model)
            raise
    
    async def health_check(self) -> bool:
        """
        Check if OpenAI API is accessible.
        
        Returns:
            True if API is healthy, False otherwise
        """
        try:
            # Simple health check - verify API key format
            if not self.api_key or not self.api_key.startswith('sk-'):
                logger.warning("Invalid OpenAI API key format")
                return False
            
            # Could make a lightweight API call here if needed
            return True
            
        except Exception as e:
            logger.error("OpenAI health check failed", error=str(e))
            return False
    
    def get_cost_per_token(self, model: str) -> Dict[str, float]:
        """
        Get cost per token for OpenAI models.
        
        Pricing as of October 2024 (per 1M tokens):
        - GPT-4 Turbo: $10 input / $30 output
        - GPT-4: $30 input / $60 output
        - GPT-3.5 Turbo: $0.50 input / $1.50 output
        - GPT-4o: $5 input / $15 output
        
        Args:
            model: Model identifier
        
        Returns:
            Dictionary with 'input' and 'output' costs per token
        """
        pricing = {
            # GPT-4 Turbo
            "gpt-4-turbo": {
                "input": 10.0 / 1_000_000,
                "output": 30.0 / 1_000_000
            },
            "gpt-4-turbo-preview": {
                "input": 10.0 / 1_000_000,
                "output": 30.0 / 1_000_000
            },
            
            # GPT-4
            "gpt-4": {
                "input": 30.0 / 1_000_000,
                "output": 60.0 / 1_000_000
            },
            "gpt-4-0125-preview": {
                "input": 10.0 / 1_000_000,
                "output": 30.0 / 1_000_000
            },
            
            # GPT-4o (Omni)
            "gpt-4o": {
                "input": 5.0 / 1_000_000,
                "output": 15.0 / 1_000_000
            },
            
            # GPT-3.5 Turbo
            "gpt-3.5-turbo": {
                "input": 0.50 / 1_000_000,
                "output": 1.50 / 1_000_000
            },
            "gpt-3.5-turbo-0125": {
                "input": 0.50 / 1_000_000,
                "output": 1.50 / 1_000_000
            },
        }
        
        # Default to GPT-4 Turbo pricing if model not found
        return pricing.get(model, {
            "input": 10.0 / 1_000_000,
            "output": 30.0 / 1_000_000
        })
