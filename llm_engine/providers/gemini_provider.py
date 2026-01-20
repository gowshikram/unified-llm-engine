"""Google Gemini Provider for LLM Engine
Supports Gemini 2.5 Flash/Pro with thinking mode
Uses Google GenAI SDK for thinking mode, REST API for standard mode
"""

import os
import asyncio
import aiohttp
from typing import Dict, Any, Optional

from .base_provider import BaseLLMProvider, LLMProviderType, LLMRequest, LLMResponse
import logging
from shared.utils.retry import SmartRetry

try:
    from google import genai
    from google.genai import types
    GENAI_SDK_AVAILABLE = True
except ImportError:
    GENAI_SDK_AVAILABLE = False
    genai = None
    types = None

logger = logging.getLogger(__name__)


class GeminiProvider(BaseLLMProvider):
    """
    Provider for Google Gemini API (direct, not Vertex AI).
    
    Supports:
    - Gemini 2.5 Flash (recommended for production)
    - Gemini 2.5 Pro (higher quality, lower rate limits)
    
    Features:
    - FREE tier: 1500 RPD, 250K TPM, 10 RPM
    - Thinking mode support
    - Commercial use allowed
    - No GCP project required (just API key)
    """
    
    # Class-level rate limiter (shared across all instances)
    _rate_limiter = None
    
    def __init__(self, config: Dict[str, Any], provider_name: Optional[str] = None):
        """Initialize Gemini provider."""
        super().__init__(config, provider_name)
        
        # Initialize rate limiter (max 8 concurrent requests to avoid rate limits)
        if GeminiProvider._rate_limiter is None:
            max_concurrent = config.get('max_concurrent_requests', 8)
            GeminiProvider._rate_limiter = asyncio.Semaphore(max_concurrent)
            logger.info(f"Gemini rate limiter initialized", max_concurrent=max_concurrent)
        
        # API key from config or environment
        self.api_key = config.get('api_key') or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("Gemini API key not provided")
        
        # Model configuration
        self.default_model = config.get('default_model', 'gemini-2.5-flash')
        self.thinking_mode = config.get('thinking_mode', True)
        
        # API endpoint
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
        # Request configuration
        self.timeout = config.get('timeout', 60)
        self.max_retries = config.get('max_retries', 3)
        
        # Initialize GenAI SDK client for thinking mode
        self.genai_client = None
        if GENAI_SDK_AVAILABLE:
            try:
                self.genai_client = genai.Client(api_key=self.api_key)
                logger.info("Google GenAI SDK client initialized for thinking mode")
            except Exception as e:
                logger.warning(f"Failed to initialize GenAI SDK: {e}. Thinking mode disabled.")
        else:
            logger.warning("Google GenAI SDK not installed. Thinking mode disabled. Install: pip install google-genai")
        
        logger.info(
            "Gemini provider initialized",
            model=self.default_model,
            thinking_mode=self.thinking_mode,
            genai_sdk_available=self.genai_client is not None
        )
    
    def _get_provider_type(self) -> LLMProviderType:
        """Return provider type."""
        return LLMProviderType.GEMINI
    
    @SmartRetry(max_retries=3, base_delay=2.0, retry_on=(Exception,))
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """
        Generate completion using Gemini API.
        
        Args:
            request: LLMRequest with prompt and parameters
        
        Returns:
            LLMResponse with generated content
        """
        await self.validate_request(request)
        
        model = request.model_override or self.default_model
        
        # Strip 'models/' prefix if present (Google API lists return "models/gemini-2.5-flash")
        model_name = model.replace("models/", "")
        
        # Construct API URL
        url = f"{self.base_url}/models/{model_name}:generateContent?key={self.api_key}"
        
        # Build request payload
        payload = {
            "contents": [{
                "parts": [{
                    "text": request.prompt
                }]
            }],
            "generationConfig": {
                "temperature": request.temperature,
                "maxOutputTokens": request.max_tokens,
                "topP": request.top_p,
            }
        }
        
        # Add system instruction if provided
        if request.system_message:
            payload["systemInstruction"] = {
                "parts": [{
                    "text": request.system_message
                }]
            }
        
        # Check if thinking mode is requested
        thinking_budget = request.metadata.get('thinking_budget') if request.metadata else None
        
        # If thinking mode requested and GenAI SDK available, use SDK
        if thinking_budget is not None and self.genai_client is not None:
            return await self._generate_with_sdk(request, model, thinking_budget)
        
        # Otherwise use REST API (standard mode, no thinking)
        
        start_time = asyncio.get_event_loop().time()
        
        # Make API request with rate limiting
        async with self._rate_limiter:  # Rate limit concurrent requests
            async with aiohttp.ClientSession() as session:
                for attempt in range(self.max_retries):
                    try:
                        async with session.post(
                            url,
                            json=payload,
                            timeout=aiohttp.ClientTimeout(total=self.timeout)
                        ) as response:
                            if response.status != 200:
                                error_text = await response.text()
                                
                                # Parse error details for better logging
                                error_type = "unknown"
                                if response.status == 429:
                                    error_type = "rate_limit"
                                elif response.status == 401:
                                    error_type = "authentication"
                                elif response.status == 400:
                                    error_type = "bad_request"
                                elif response.status >= 500:
                                    error_type = "server_error"
                                
                                logger.error(
                                    f"Gemini API {error_type} (attempt {attempt + 1}/{self.max_retries})",
                                    status=response.status,
                                    error_type=error_type,
                                    error_detail=error_text[:200],  # Limit error text length
                                    model=model,
                                    will_retry=(attempt < self.max_retries - 1)
                                )
                                
                                if attempt < self.max_retries - 1:
                                    wait_time = 2 ** attempt
                                    logger.info(f"Retrying in {wait_time}s...", attempt=attempt+1)
                                    await asyncio.sleep(wait_time)  # Exponential backoff
                                    continue
                                else:
                                    raise Exception(f"Gemini API {error_type} (HTTP {response.status}): {error_text[:500]}")
                            
                            result = await response.json()
                            
                            # Extract generated text
                            if 'candidates' in result and len(result['candidates']) > 0:
                                candidate = result['candidates'][0]
                                if 'content' in candidate and 'parts' in candidate['content']:
                                    generated_text = candidate['content']['parts'][0].get('text', '')
                                else:
                                    generated_text = ""
                            else:
                                generated_text = ""
                            
                            # Calculate metrics
                            latency_ms = (asyncio.get_event_loop().time() - start_time) * 1000
                            
                            # Extract usage metadata
                            usage_metadata = result.get('usageMetadata', {})
                            prompt_tokens = usage_metadata.get('promptTokenCount', 0)
                            candidates_tokens = usage_metadata.get('candidatesTokenCount', 0)
                            total_tokens = usage_metadata.get('totalTokenCount', prompt_tokens + candidates_tokens)
                            
                            # Calculate cost (Gemini is FREE for now, but structure for paid tiers)
                            cost = self.calculate_cost(prompt_tokens, candidates_tokens, model)
                            
                            return LLMResponse(
                                content=generated_text,
                                model=model,
                                provider="gemini",
                                tokens_used=total_tokens,
                                cost=cost,
                                latency_ms=latency_ms,
                                metadata={
                                    "prompt_tokens": prompt_tokens,
                                    "completion_tokens": candidates_tokens,
                                    "thinking_mode": self.thinking_mode,
                                    "finish_reason": candidate.get('finishReason', 'STOP')
                                }
                            )
                
                    except asyncio.TimeoutError:
                        logger.warning(
                            f"Gemini API timeout (attempt {attempt + 1}/{self.max_retries})",
                            timeout=self.timeout,
                            model=model,
                            will_retry=(attempt < self.max_retries - 1)
                        )
                        if attempt < self.max_retries - 1:
                            wait_time = 2 ** attempt
                            logger.info(f"Retrying in {wait_time}s...", attempt=attempt+1)
                            await asyncio.sleep(wait_time)
                            continue
                        else:
                            raise Exception(f"Gemini API timeout after {self.max_retries} attempts ({self.timeout}s each)")
                    
                    except Exception as e:
                        logger.error(
                            f"Gemini API unexpected error (attempt {attempt + 1}/{self.max_retries})",
                            error=str(e),
                            error_type=type(e).__name__,
                            model=model,
                            will_retry=(attempt < self.max_retries - 1)
                        )
                        if attempt < self.max_retries - 1:
                            wait_time = 2 ** attempt
                            logger.info(f"Retrying in {wait_time}s...", attempt=attempt+1)
                            await asyncio.sleep(wait_time)
                            continue
                        else:
                            raise
    
    async def health_check(self) -> bool:
        """
        Check if Gemini API is accessible.
        
        Returns:
            True if healthy, False otherwise
        """
        try:
            # Simple test request
            test_request = LLMRequest(
                prompt="test",
                max_tokens=10,
                temperature=0.1
            )
            
            await self.generate(test_request)
            return True
            
        except Exception as e:
            logger.warning(f"Gemini health check failed: {e}")
            return False
    
    def get_cost_per_token(self, model: str) -> Dict[str, float]:
        """
        Get cost per token for Gemini models.
        
        FREE tier (current):
        - Input: $0
        - Output: $0
        
        Paid tier (if needed):
        - Gemini 2.5 Flash: $0.075 / 1M input, $0.30 / 1M output
        - Gemini 2.5 Pro: $1.25 / 1M input, $5.00 / 1M output
        
        Returns:
            Dictionary with 'input' and 'output' costs per token
        """
        # FREE tier (no cost)
        if "flash" in model.lower():
            return {
                "input": 0.0,   # FREE
                "output": 0.0   # FREE
            }
        elif "pro" in model.lower():
            return {
                "input": 0.0,   # FREE tier
                "output": 0.0   # FREE tier
            }
        else:
            # Default to free
            return {
                "input": 0.0,
                "output": 0.0
            }
    
    async def _generate_with_sdk(
        self,
        request: LLMRequest,
        model: str,
        thinking_budget: int
    ) -> LLMResponse:
        """
        Generate using Google GenAI SDK with thinking mode.
        
        Args:
            request: LLM request
            model: Model name
            thinking_budget: Thinking budget (-1=dynamic, 0=disabled, 1-24576=specific)
        
        Returns:
            LLMResponse
        """
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Build contents
            contents = request.prompt
            
            # Build system instruction if provided
            system_instruction = None
            if request.system_message:
                system_instruction = request.system_message
            
            # Configure thinking mode
            config = types.GenerateContentConfig(
                temperature=request.temperature,
                max_output_tokens=request.max_tokens,
                top_p=request.top_p,
                thinking_config=types.ThinkingConfig(
                    thinking_budget=thinking_budget
                ),
                system_instruction=system_instruction if system_instruction else None
            )
            
            # Strip 'models/' prefix if present (SDK expects just the model name)
            model_name = model.replace("models/", "")
            
            logger.info(
                f"Calling Gemini with thinking mode (SDK)",
                model=model_name,
                thinking_budget=thinking_budget
            )
            
            # Call API using SDK (sync call, but we'll handle it)
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.genai_client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config
                )
            )
            
            # Extract generated text
            generated_text = response.text if hasattr(response, 'text') else ""
            
            # Calculate latency
            latency_ms = (asyncio.get_event_loop().time() - start_time) * 1000
            
            # Extract usage if available
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0
            
            if hasattr(response, 'usage_metadata'):
                usage = response.usage_metadata
                prompt_tokens = getattr(usage, 'prompt_token_count', 0)
                completion_tokens = getattr(usage, 'candidates_token_count', 0)
                total_tokens = getattr(usage, 'total_token_count', prompt_tokens + completion_tokens)
            
            # Calculate cost (FREE tier)
            cost = self.calculate_cost(prompt_tokens, completion_tokens, model)
            
            logger.info(
                "✅ Gemini SDK response received",
                model=model,
                thinking_budget=thinking_budget,
                tokens=total_tokens,
                latency_ms=int(latency_ms)
            )
            
            return LLMResponse(
                content=generated_text,
                model=model,
                provider="gemini",
                tokens_used=total_tokens,
                cost=cost,
                latency_ms=latency_ms,
                metadata={
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "thinking_mode": True,
                    "thinking_budget": thinking_budget,
                    "sdk_used": "google-genai"
                }
            )
            
        except Exception as e:
            logger.error(
                f"Gemini SDK generation failed: {e}",
                model=model,
                thinking_budget=thinking_budget
            )
            raise
