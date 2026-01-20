# ⚡ Unified LLM Engine

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Multi-provider LLM abstraction layer** with unified API, automatic fallbacks, cost tracking, and intelligent routing across OpenAI, Anthropic, Google, and more.

---

## 🌟 Features

- **Unified API** - Same interface for all providers
- **6+ Providers** - OpenAI, Anthropic, Gemini, Azure, AWS Bedrock, Ollama
- **Automatic Fallbacks** - Seamless failover between providers
- **Cost Tracking** - Token usage and cost monitoring
- **Response Caching** - Reduce costs with intelligent caching
- **Streaming Support** - Real-time response streaming
- **Async-First** - Built for high-performance async execution

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Unified LLM Engine                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   LLM Router                              │    │
│  │  • Model Selection  • Load Balancing  • Fallback Logic   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  OpenAI    │  │ Anthropic  │  │  Gemini    │  │  Ollama  │  │
│  │  Provider  │  │  Provider  │  │  Provider  │  │ Provider │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Response Cache + Cost Tracker               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/unified-llm-engine.git
cd unified-llm-engine
pip install -r requirements.txt
```

### Basic Usage

```python
from llm_engine import LLMEngine

# Initialize with multiple providers
engine = LLMEngine()

# Use like any single LLM
response = await engine.generate(
    prompt="Explain quantum computing in simple terms",
    model="gpt-4",  # or "claude-3-opus", "gemini-pro", etc.
    temperature=0.7,
    max_tokens=500
)

print(response.content)
print(response.usage)  # Token counts
print(response.cost)   # Estimated cost
```

### Provider-Specific

```python
from llm_engine.providers import OpenAIProvider, AnthropicProvider

# Use specific provider
openai = OpenAIProvider(api_key="sk-...")
response = await openai.generate(prompt="Hello!", model="gpt-4")

# With fallback
anthropic = AnthropicProvider(api_key="sk-ant-...")
response = await engine.generate(
    prompt="Hello!",
    model="gpt-4",
    fallback_models=["claude-3-opus", "gemini-pro"]
)
```

---

## 📚 Providers

| Provider | Models | Streaming | Embeddings |
|----------|--------|-----------|------------|
| **OpenAI** | GPT-4, GPT-3.5 | ✅ | ✅ |
| **Anthropic** | Claude 3 Opus/Sonnet/Haiku | ✅ | ❌ |
| **Gemini** | Gemini Pro, Gemini Flash | ✅ | ✅ |
| **Azure OpenAI** | GPT-4, GPT-3.5 | ✅ | ✅ |
| **AWS Bedrock** | Claude, Titan | ✅ | ✅ |
| **Ollama** | Llama, Mistral, etc. | ✅ | ✅ |

---

## 📁 Project Structure

```
unified-llm-engine/
├── llm_engine/
│   ├── __init__.py
│   ├── core/
│   │   └── engine.py
│   └── providers/
│       ├── base_provider.py
│       ├── openai_provider.py
│       ├── anthropic_provider.py
│       ├── gemini_provider.py
│       └── exceptions.py
├── examples/
├── tests/
├── requirements.txt
└── README.md
```

---

## ⚙️ Configuration

```bash
# .env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Optional
DEFAULT_MODEL=gpt-4
ENABLE_CACHING=true
CACHE_TTL=3600
```

---

## 📊 Cost Tracking

```python
from llm_engine import LLMEngine

engine = LLMEngine(track_costs=True)

# Make requests...
response = await engine.generate(...)

# Get cost summary
print(engine.get_cost_summary())
# {
#   "total_cost": 0.054,
#   "total_tokens": 1250,
#   "by_model": {"gpt-4": 0.050, "claude-3-sonnet": 0.004}
# }
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 📬 Contact

**Ravi Teja K** - AI/ML Engineer
- GitHub: [@TEJA4704](https://github.com/TEJA4704)
