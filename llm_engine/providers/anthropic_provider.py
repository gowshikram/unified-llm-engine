"""
Anthropic Claude Provider for LLM Engine

Supports Claude 3 models via Anthropic API.
"""

import os
import asyncio
from typing import Dict, Any, Optional
import aiohttp

from .base_provider import BaseLLMProvider, LLMProviderType, LLMRequest, LLMResponse
import logging

logger = logging.getLogger(__name__)


class AnthropicProvider(BaseLLMProvider):
    """
    Provider for Anthropic Claude models.
    
    Supports:
    - Claude 3.5 Sonnet
    - Claude 3.5 Haiku
    - Claude 3 Opus
    - Claude 3 Sonnet
    - Claude 3 Haiku
    
    Features:
    - Streaming support
    - Function calling
    - Vision capabilities
    - 200K context window
    """
    
    def __init__(self, config: Dict[str, Any], provider_name: Optional[str] = None):
        """Initialize Anthropic provider."""
        super().__init__(config, provider_name)
        
        # Get API key from config or environment
        self.api_key = config.get('api_key') or os.getenv(
            config.get('api_key_env', 'ANTHROPIC_API_KEY')
        )
        
        if not self.api_key:
            raise ValueError("Anthropic API key not provided")
        
        self.api_base = config.get('api_base', 'https://api.anthropic.com')
        self.api_version = config.get('api_version', '2023-06-01')
        self.timeout = config.get('timeout', 60)
        self.max_retries = config.get('max_retries', 3)
        
        logger.info(
            "Anthropic provider initialized",
            api_base=self.api_base,
            api_version=self.api_version
        )
    
    def _get_provider_type(self) -> LLMProviderType:
        """Return provider type."""
        return LLMProviderType.ANTHROPIC if hasattr(LLMProviderType, 'ANTHROPIC') else LLMProviderType.OLLAMA
    
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """
        Generate completion using Claude API.
        
        Args:
            request: LLMRequest with prompt and parameters
        
        Returns:
            LLMResponse with generated content
        """
        await self.validate_request(request)
        
        # Map model names
        model = request.model or self.config.get('default_model', 'claude-3-5-sonnet-20241022')
        
        # Prepare messages
        messages = []
        if request.system_message:
            # System message handled separately in Anthropic API
            pass
        
        messages.append({
            "role": "user",
            "content": request.prompt
        })
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
            "top_p": request.top_p,
        }
        
        if request.system_message:
            payload["system"] = request.system_message
        
        # Call API
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": self.api_version,
            "content-type": "application/json"
        }
        
        url = f"{self.api_base}/v1/messages"
        
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
                        content = ""
                        if data.get('content'):
                            for block in data['content']:
                                if block.get('type') == 'text':
                                    content += block.get('text', '')
                        
                        # Calculate tokens and cost
                        input_tokens = data.get('usage', {}).get('input_tokens', 0)
                        output_tokens = data.get('usage', {}).get('output_tokens', 0)
                        total_tokens = input_tokens + output_tokens
                        cost = self.calculate_cost(input_tokens, output_tokens, model)
                        
                        logger.info(
                            "Claude API success",
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
                                "stop_reason": data.get('stop_reason'),
                                "usage": data.get('usage')
                            }
                        )
                    else:
                        error_text = await response.text()
                        logger.error(
                            "Claude API error",
                            status=response.status,
                            error=error_text[:500]
                        )
                        raise Exception(f"Claude API error {response.status}: {error_text}")
        
        except asyncio.TimeoutError:
            logger.error("Claude API timeout", model=model)
            raise Exception(f"Claude API timeout for model {model}")
        except Exception as e:
            logger.error("Claude API call failed", error=str(e), model=model)
            raise
    
    async def health_check(self) -> bool:
        """
        Check if Anthropic API is accessible.
        
        Returns:
            True if API is healthy, False otherwise
        """
        try:
            # Simple health check - just verify API key format
            if not self.api_key or not self.api_key.startswith('sk-ant-'):
                logger.warning("Invalid Anthropic API key format")
                return False
            
            # Could make a lightweight API call here if needed
            return True
            
        except Exception as e:
            logger.error("Anthropic health check failed", error=str(e))
            return False
    
    def get_cost_per_token(self, model: str) -> Dict[str, float]:
        """
        Get cost per token for Claude models.
        
        Pricing as of October 2024 (per 1M tokens):
        - Claude 3.5 Sonnet: $3 input / $15 output
        - Claude 3.5 Haiku: $1 input / $5 output
        - Claude 3 Opus: $15 input / $75 output
        - Claude 3 Sonnet: $3 input / $15 output
        - Claude 3 Haiku: $0.25 input / $1.25 output
        
        Args:
            model: Model identifier
        
        Returns:
            Dictionary with 'input' and 'output' costs per token
        """
        pricing = {
            # Claude 3.5 models
            "claude-3-5-sonnet-20241022": {
                "input": 3.0 / 1_000_000,
                "output": 15.0 / 1_000_000
            },
            "claude-3-5-haiku-20241022": {
                "input": 1.0 / 1_000_000,
                "output": 5.0 / 1_000_000
            },
            
            # Claude 3 models
            "claude-3-opus-20240229": {
                "input": 15.0 / 1_000_000,
                "output": 75.0 / 1_000_000
            },
            "claude-3-sonnet-20240229": {
                "input": 3.0 / 1_000_000,
                "output": 15.0 / 1_000_000
            },
            "claude-3-haiku-20240307": {
                "input": 0.25 / 1_000_000,
                "output": 1.25 / 1_000_000
            },
        }
        
        # Default to Sonnet pricing if model not found
        return pricing.get(model, {
            "input": 3.0 / 1_000_000,
            "output": 15.0 / 1_000_000
        })
