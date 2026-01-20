"""
LLM Provider Exceptions

Custom exception types for better error handling and intelligent fallback.
"""

from typing import Optional


class LLMProviderError(Exception):
    """Base exception for all LLM provider errors."""
    
    def __init__(self, message: str, provider: Optional[str] = None, **kwargs):
        super().__init__(message)
        self.provider = provider
        self.metadata = kwargs


class RateLimitError(LLMProviderError):
    """
    Provider rate limit exceeded.
    
    Manager should:
    - Wait and retry if retry_after is provided
    - Try next provider immediately
    - Temporarily skip this provider
    """
    
    def __init__(self, provider: str, retry_after: Optional[int] = None, **kwargs):
        super().__init__(
            f"Rate limit exceeded for {provider}" + 
            (f", retry after {retry_after}s" if retry_after else ""),
            provider=provider,
            **kwargs
        )
        self.retry_after = retry_after


class QuotaExceededError(LLMProviderError):
    """
    API quota or credits exhausted.
    
    Manager should:
    - Skip this provider for remainder of session
    - Alert user to add credits
    - Try next provider
    """
    
    def __init__(self, provider: str, **kwargs):
        super().__init__(
            f"Quota exceeded for {provider}. Add credits or increase limits.",
            provider=provider,
            **kwargs
        )


class ModelNotFoundError(LLMProviderError):
    """
    Requested model not available on this provider.
    
    Manager should:
    - Try alternate model if available
    - Try next provider
    - Suggest available models
    """
    
    def __init__(self, provider: str, model: str, available_models: Optional[list] = None, **kwargs):
        message = f"Model '{model}' not found on {provider}"
        if available_models:
            message += f". Available: {', '.join(available_models[:5])}"
        
        super().__init__(message, provider=provider, **kwargs)
        self.model = model
        self.available_models = available_models


class AuthenticationError(LLMProviderError):
    """
    Authentication failed (invalid API key, expired token, etc).
    
    Manager should:
    - Skip this provider permanently
    - Alert user to check credentials
    - Try next provider
    """
    
    def __init__(self, provider: str, **kwargs):
        super().__init__(
            f"Authentication failed for {provider}. Check API key/credentials.",
            provider=provider,
            **kwargs
        )


class ProviderUnavailableError(LLMProviderError):
    """
    Provider service is down or unreachable.
    
    Manager should:
    - Try next provider immediately
    - Retry this provider later
    """
    
    def __init__(self, provider: str, **kwargs):
        super().__init__(
            f"Provider {provider} is unavailable or unreachable.",
            provider=provider,
            **kwargs
        )


class ContentFilterError(LLMProviderError):
    """
    Content rejected by provider's safety filters.
    
    Manager should:
    - Try next provider (may have different filters)
    - Return specific error to user
    - Don't retry same content
    """
    
    def __init__(self, provider: str, reason: Optional[str] = None, **kwargs):
        message = f"Content filtered by {provider}"
        if reason:
            message += f": {reason}"
        
        super().__init__(message, provider=provider, **kwargs)
        self.reason = reason


class ContextLengthExceededError(LLMProviderError):
    """
    Input exceeds model's context window.
    
    Manager should:
    - Try model with larger context window
    - Suggest truncation
    - Try next provider with larger models
    """
    
    def __init__(self, provider: str, input_length: int, max_length: int, **kwargs):
        super().__init__(
            f"Context length {input_length} exceeds {provider} limit of {max_length}",
            provider=provider,
            **kwargs
        )
        self.input_length = input_length
        self.max_length = max_length


class InvalidRequestError(LLMProviderError):
    """
    Request parameters invalid for this provider.
    
    Manager should:
    - Validate and adjust parameters
    - Try next provider
    """
    
    def __init__(self, provider: str, parameter: str, reason: str, **kwargs):
        super().__init__(
            f"Invalid {parameter} for {provider}: {reason}",
            provider=provider,
            **kwargs
        )
        self.parameter = parameter
        self.reason = reason


class TimeoutError(LLMProviderError):
    """
    Provider request timed out.
    
    Manager should:
    - Try next provider
    - Optionally retry with longer timeout
    """
    
    def __init__(self, provider: str, timeout: int, **kwargs):
        super().__init__(
            f"Request to {provider} timed out after {timeout}s",
            provider=provider,
            **kwargs
        )
        self.timeout = timeout


# Convenience function for mapping HTTP status codes to exceptions
def from_http_status(
    status_code: int,
    provider: str,
    response_text: str = "",
    **kwargs
) -> LLMProviderError:
    """
    Map HTTP status code to appropriate exception.
    
    Args:
        status_code: HTTP status code
        provider: Provider name
        response_text: Response body (for details)
        **kwargs: Additional metadata
    
    Returns:
        Appropriate LLMProviderError subclass
    """
    if status_code == 401 or status_code == 403:
        return AuthenticationError(provider, response=response_text, **kwargs)
    elif status_code == 429:
        # Try to extract retry-after header
        retry_after = kwargs.get('retry_after')
        return RateLimitError(provider, retry_after=retry_after, response=response_text, **kwargs)
    elif status_code == 402 or "quota" in response_text.lower():
        return QuotaExceededError(provider, response=response_text, **kwargs)
    elif status_code == 404:
        return ModelNotFoundError(provider, model=kwargs.get('model', 'unknown'), **kwargs)
    elif status_code == 400:
        return InvalidRequestError(provider, parameter="unknown", reason=response_text, **kwargs)
    elif status_code == 503 or status_code == 502:
        return ProviderUnavailableError(provider, response=response_text, **kwargs)
    else:
        return LLMProviderError(
            f"HTTP {status_code} error from {provider}: {response_text}",
            provider=provider,
            status_code=status_code,
            **kwargs
        )
