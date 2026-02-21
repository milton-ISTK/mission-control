#!/opt/homebrew/bin/python3
"""
ISTK Workflow Orchestration Engine — Daemon Workflow Processor (Phase 3)

Core execution engine that:
  1. Polls Convex for pending workflow steps (status: "pending")
  2. Routes each step to the correct agent based on agentRole
  3. Fetches agent config (system prompt, model ID, provider)
  4. Executes the step via LLM API calls (Anthropic, OpenAI, Google, etc.)
  5. Captures output + thinking + errors
  6. Writes results back to Convex via updateStepOutput mutation
  7. Triggers advanceWorkflow to progress to next step

Production daemon — runs 24/7 via launchd.
"""
import os
import sys
import time
import json
import re
import signal
import requests
import traceback
from datetime import datetime, timezone
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# ============================================================
# CONFIG
# ============================================================

CONVEX_SITE_URL = "https://usable-cow-139.eu-west-1.convex.site"
CONVEX_ADMIN_KEY = "dev:usable-cow-139|eyJ2MiI6ImQ4NmY1OGEwYmI5ZTQzMmNhMzRmNmNkOGVlM2Y5In0="
BRAVE_API_KEY = "BSALVC7NKrfL3UdC0HIP9g-Y0LgcwfA"

POLL_INTERVAL = 8          # seconds between polls
MAX_CONCURRENT_STEPS = 4   # parallel step execution threads
LLM_TIMEOUT = 120          # seconds for LLM API calls
MAX_OUTPUT_CHARS = 50000   # safety cap on output size
HEALTH_INTERVAL = 60       # seconds between health pings
KEY_SYNC_INTERVAL = 30     # seconds between key syncs

KEYS_FILE = Path.home() / ".config" / "mission-control" / "api-keys.json"
LOG_PREFIX = "workflow-daemon"

# ============================================================
# LOGGING
# ============================================================

def log(msg: str, level: str = "INFO"):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] [{level}] {msg}", file=sys.stderr, flush=True)

def log_step(step_id: str, msg: str, level: str = "INFO"):
    short_id = step_id[-8:] if len(step_id) > 8 else step_id
    log(f"[step:{short_id}] {msg}", level)

# ============================================================
# JSON PARSING (ROBUST)
# ============================================================

def extract_json_from_text(text: str):
    """Extract JSON from LLM response that may contain extra text, markdown, etc."""
    if not text or not isinstance(text, str):
        raise ValueError(f"Invalid input: expected string, got {type(text)}")
    
    # Strip markdown code fences
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try to find JSON object or array in the text
    for pattern in [
        r'(\{[\s\S]*\})',  # Find JSON object
        r'(\[[\s\S]*\])',  # Find JSON array
    ]:
        match = re.search(pattern, text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                continue
    
    raise ValueError(f"Could not extract valid JSON from response: {text[:200]}...")

# ============================================================
# GRACEFUL SHUTDOWN
# ============================================================

_shutdown_requested = False

def _handle_signal(signum, frame):
    global _shutdown_requested
    _shutdown_requested = True
    log(f"🛑 Shutdown signal received (sig={signum})")

signal.signal(signal.SIGTERM, _handle_signal)
signal.signal(signal.SIGINT, _handle_signal)

# ============================================================
# API KEY MANAGEMENT
# ============================================================

_keys_cache: dict = {}
_keys_lock = Lock()

def load_api_keys() -> dict:
    """Load API keys from local file (synced from Convex by content-pipeline-daemon)."""
    global _keys_cache
    if not KEYS_FILE.exists():
        return _keys_cache
    try:
        with open(KEYS_FILE, "r") as f:
            with _keys_lock:
                _keys_cache = json.load(f)
        return _keys_cache
    except Exception as e:
        log(f"⚠ Failed to load API keys: {e}", "WARN")
        return _keys_cache

def get_api_key(provider: str) -> str:
    """Get API key for a provider. Returns empty string if not found."""
    with _keys_lock:
        return _keys_cache.get(provider, "").strip()

# ============================================================
# CONVEX HTTP HELPERS
# ============================================================

_auth_headers = {
    "Authorization": f"Bearer {CONVEX_ADMIN_KEY}",
    "Content-Type": "application/json",
}

def convex_get(path: str, params: dict = None, timeout: int = 15) -> dict:
    """GET request to Convex HTTP API."""
    r = requests.get(
        f"{CONVEX_SITE_URL}{path}",
        headers=_auth_headers,
        params=params,
        timeout=timeout,
    )
    r.raise_for_status()
    return r.json()

def convex_post(path: str, body: dict, timeout: int = 15) -> dict:
    """POST request to Convex HTTP API."""
    r = requests.post(
        f"{CONVEX_SITE_URL}{path}",
        headers=_auth_headers,
        json=body,
        timeout=timeout,
    )
    r.raise_for_status()
    return r.json()

# ============================================================
# CONVEX WORKFLOW API
# ============================================================

def fetch_pending_steps() -> list:
    """Poll Convex for all pending workflow steps."""
    try:
        resp = convex_get("/api/workflow/pending-steps")
        return resp.get("steps", [])
    except Exception as e:
        log(f"✗ Failed to fetch pending steps: {e}", "ERROR")
        return []

def fetch_agent_config(agent_role: str) -> dict:
    """Fetch agent configuration from Convex by agentRole."""
    resp = convex_get("/api/agents/by-role", params={"role": agent_role})
    if resp.get("ok") and resp.get("agent"):
        return resp["agent"]
    raise Exception(f"Agent not found for role: {agent_role}")

def fetch_step_context(step_id: str) -> dict:
    """Fetch full step context including parent workflow details."""
    resp = convex_get("/api/workflow/step-input", params={"stepId": step_id})
    if resp.get("ok"):
        return resp
    raise Exception(f"Failed to fetch step context for {step_id}")

def update_step_status(step_id: str, status: str):
    """Update step status (e.g. pending → agent_working)."""
    convex_post("/api/workflow/step-status", {"stepId": step_id, "status": status})

def submit_step_output(step_id: str, output: str):
    """Submit step output. Also triggers advanceWorkflow if step doesn't need approval."""
    convex_post("/api/workflow/step-output", {"stepId": step_id, "output": output}, timeout=30)

def fail_step(step_id: str, error_message: str):
    """Mark step as failed with error message."""
    # Truncate error for storage
    error_message = error_message[:2000]
    try:
        convex_post("/api/workflow/step-fail", {
            "stepId": step_id,
            "errorMessage": error_message,
        })
    except Exception as e:
        log_step(step_id, f"⚠ Failed to report failure to Convex: {e}", "ERROR")

def send_thinking(step_id: str, line1: str, line2: str = ""):
    """Send live thinking/progress lines for the UI."""
    try:
        convex_post("/api/workflow/step-thinking", {
            "stepId": step_id,
            "thinkingLine1": line1[:200],
            "thinkingLine2": line2[:200],
        }, timeout=10)
    except Exception:
        pass  # Non-fatal

def post_daemon_health(status: str, details: str = ""):
    """Post daemon health status to Convex (separate key from content-pipeline)."""
    try:
        convex_post("/api/sync/daemon-status", {
            "status": status,
            "details": f"[workflow] {details}",
        }, timeout=10)
    except Exception:
        pass

# ============================================================
# BRAVE SEARCH (for agents that need web research)
# ============================================================

def brave_search(query: str, count: int = 8, freshness: str = "pw") -> list:
    """Search Brave API for recent results."""
    try:
        r = requests.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers={
                "Accept": "application/json",
                "X-Subscription-Token": BRAVE_API_KEY,
            },
            params={"q": query, "count": count, "freshness": freshness},
            timeout=15,
        )
        r.raise_for_status()
        results = []
        for item in r.json().get("web", {}).get("results", [])[:count]:
            results.append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "description": item.get("description", ""),
            })
        return results
    except Exception as e:
        log(f"⚠ Brave search failed: {e}", "WARN")
        return []

# ============================================================
# LLM PROVIDER API CALLS
# ============================================================

def _is_reasoning_model(model: str) -> bool:
    """Check if model requires max_completion_tokens (reasoning/GPT-5/o-series)."""
    m = (model or "").lower()
    return any(m.startswith(p) for p in ("gpt-5", "o1", "o3", "o4"))

def call_anthropic(api_key: str, model: str, system_prompt: str, user_prompt: str) -> str:
    """Call Anthropic Messages API (Claude)."""
    body = {
        "model": model,
        "max_tokens": 8192,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    if system_prompt:
        body["system"] = system_prompt

    r = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json=body,
        timeout=LLM_TIMEOUT,
    )
    r.raise_for_status()
    resp = r.json()

    if "error" in resp:
        raise Exception(f"Claude API error: {resp['error'].get('message', 'unknown')}")

    content = resp.get("content", [])
    if not content:
        raise Exception("Claude returned empty content array")

    # Extract text from content blocks
    texts = []
    for block in content:
        if block.get("type") == "text":
            texts.append(block.get("text", ""))
    text = "\n".join(texts)

    if not text.strip():
        raise Exception("Claude returned empty text")

    return text.strip()

def call_openai(api_key: str, model: str, system_prompt: str, user_prompt: str,
                base_url: str = "https://api.openai.com/v1/chat/completions") -> str:
    """Call OpenAI-compatible APIs (OpenAI, xAI/Grok, Groq/Llama)."""
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    body = {"model": model, "messages": messages}

    if _is_reasoning_model(model):
        body["max_completion_tokens"] = 16384
    else:
        body["max_tokens"] = 8192
        body["temperature"] = 0.7

    r = requests.post(
        base_url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=body,
        timeout=LLM_TIMEOUT,
    )
    r.raise_for_status()
    resp = r.json()

    # Multi-strategy content extraction (handles Chat Completions + Responses API)
    # Strategy 1: choices[0].message.content
    choices = resp.get("choices")
    if choices and isinstance(choices, list) and len(choices) > 0:
        msg = choices[0].get("message", {})
        content = msg.get("content")
        if content and isinstance(content, str) and content.strip():
            return content.strip()
        if isinstance(content, list):
            texts = [p.get("text", "") for p in content if isinstance(p, dict)]
            joined = "\n".join(t for t in texts if t)
            if joined.strip():
                return joined.strip()

    # Strategy 2: output_text (Responses API)
    output_text = resp.get("output_text")
    if output_text and isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    # Strategy 3: output[].content[].text
    output = resp.get("output")
    if output and isinstance(output, list):
        for entry in output:
            if not isinstance(entry, dict):
                continue
            if entry.get("text"):
                return entry["text"].strip()
            for part in (entry.get("content") or []):
                if isinstance(part, dict) and part.get("text"):
                    return part["text"].strip()

    raise Exception(f"Could not extract content from API response. Keys: {list(resp.keys())}")

def call_minimax(api_key: str, model: str, system_prompt: str, user_prompt: str) -> str:
    """Call MiniMax via Anthropic-compatible endpoint."""
    body = {
        "model": model,
        "max_tokens": 8192,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    if system_prompt:
        body["system"] = system_prompt

    r = requests.post(
        "https://api.minimax.io/anthropic/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json=body,
        timeout=LLM_TIMEOUT,
    )
    r.raise_for_status()
    resp = r.json()
    content = resp.get("content", [])
    if not content:
        raise Exception("MiniMax returned empty content")
    text = content[0].get("text", "")
    if not text.strip():
        raise Exception("MiniMax returned empty text")
    return text.strip()

def call_google_gemini(api_key: str, model: str, system_prompt: str, user_prompt: str) -> str:
    """Call Google Generative Language API (Gemini)."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    contents = []
    if system_prompt:
        # Gemini uses system_instruction for system prompts in newer API, but we can prepend
        contents.append({"role": "user", "parts": [{"text": f"[System Instructions]\n{system_prompt}\n\n[Task]\n{user_prompt}"}]})
    else:
        contents.append({"role": "user", "parts": [{"text": user_prompt}]})

    r = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        json={
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 8192,
            },
        },
        timeout=LLM_TIMEOUT,
    )
    r.raise_for_status()
    resp = r.json()

    candidates = resp.get("candidates", [])
    if not candidates:
        raise Exception("Google returned no candidates")
    text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    if not text.strip():
        raise Exception("Google returned empty text")
    return text.strip()

def call_llm(provider: str, api_key: str, model: str,
             system_prompt: str, user_prompt: str) -> str:
    """Route to the correct LLM provider API."""
    if provider == "anthropic":
        return call_anthropic(api_key, model, system_prompt, user_prompt)
    elif provider == "openai":
        return call_openai(api_key, model, system_prompt, user_prompt)
    elif provider == "grok":
        return call_openai(api_key, model, system_prompt, user_prompt,
                           "https://api.x.ai/v1/chat/completions")
    elif provider == "meta":
        return call_openai(api_key, model, system_prompt, user_prompt,
                           "https://api.groq.com/openai/v1/chat/completions")
    elif provider == "minimax":
        return call_minimax(api_key, model, system_prompt, user_prompt)
    elif provider == "google":
        return call_google_gemini(api_key, model, system_prompt, user_prompt)
    else:
        raise Exception(f"Unsupported LLM provider: {provider}")

# ============================================================
# PROMPT BUILDER
# ============================================================

def build_user_prompt(step: dict, step_context: dict) -> str:
    """
    Build the user prompt from step input + workflow context.

    Injects:
    - Content type, selected angle, briefing from workflow
    - Step input (JSON from previous step or initial research)
    - Web search results if the agent needs them (news_scraper, sentiment_scraper)
    """
    agent_role = step.get("agentRole", "")
    step_name = step.get("name", "")
    input_raw = step.get("input", "{}")

    # Parse input JSON
    try:
        input_data = json.loads(input_raw) if input_raw else {}
    except (json.JSONDecodeError, TypeError):
        input_data = {"raw_input": input_raw}

    content_type = step_context.get("contentType", "blog_post")
    selected_angle = step_context.get("selectedAngle", "")
    briefing = step_context.get("briefing", "")
    topic = input_data.get("topic", selected_angle)

    # Build structured prompt
    sections = []

    sections.append(f"## Task: {step_name}")
    sections.append(f"Content Type: {content_type}")
    if selected_angle:
        sections.append(f"Selected Angle: {selected_angle}")
    if briefing:
        sections.append(f"Briefing: {briefing}")

    # For scraper/research agents, include web search results
    if agent_role in ("news_scraper", "sentiment_scraper", "research_enhancer"):
        search_query = topic or selected_angle
        if search_query:
            results = brave_search(search_query)
            if results:
                sections.append("\n## Latest Web Results")
                for i, r in enumerate(results, 1):
                    sections.append(f"{i}. **{r['title']}**\n   {r['url']}\n   {r['description']}")

    # Include the input data
    sections.append("\n## Input Data")
    if isinstance(input_data, dict):
        # Include key fields, not the entire blob if it's huge
        for key in ("topic", "selectedAngle", "summary", "sentiment",
                     "narratives", "angles", "quotes", "fullReport"):
            val = input_data.get(key)
            if val:
                if isinstance(val, list):
                    sections.append(f"**{key}:**")
                    for item in val:
                        sections.append(f"  - {item}")
                else:
                    sections.append(f"**{key}:** {str(val)[:3000]}")

        # If there are other keys (from previous step outputs), include them
        extra_keys = set(input_data.keys()) - {
            "topic", "selectedAngle", "summary", "sentiment",
            "narratives", "angles", "quotes", "fullReport", "briefing", "sources"
        }
        if extra_keys:
            sections.append("\n**Additional context:**")
            for key in extra_keys:
                val = input_data.get(key)
                sections.append(f"  {key}: {str(val)[:1000]}")
    else:
        sections.append(str(input_data)[:5000])

    # Output format instruction
    sections.append("\n## Output Format")
    sections.append(
        "Return your output as a valid JSON object. Include at minimum:\n"
        "- \"result\": your main output text/analysis\n"
        "- \"metadata\": any structured data relevant to the task\n"
        "Do NOT wrap in markdown code blocks. Return ONLY valid JSON."
    )

    return "\n\n".join(sections)

# ============================================================
# STEP EXECUTOR — Core execution logic for a single step
# ============================================================

def execute_step(step: dict) -> None:
    """
    Execute a single workflow step end-to-end:
      1. Claim → agent_working
      2. Fetch agent config
      3. Fetch step context
      4. Build prompt
      5. Call LLM
      6. Submit output (triggers advance)

    All exceptions are caught and reported as step failures.
    """
    step_id = step["_id"]
    step_name = step.get("name", "Unknown")
    agent_role = step.get("agentRole", "unknown")
    step_num = step.get("stepNumber", 0)
    workflow_id = step.get("workflowId", "?")

    log_step(step_id, f"▶ Starting: '{step_name}' (role={agent_role}, step={step_num})")

    try:
        # ---- 1. Claim the step ----
        send_thinking(step_id, f"🔄 Starting {step_name}...", "Claiming step...")
        update_step_status(step_id, "agent_working")
        log_step(step_id, "Status → agent_working")

        # ---- 2. Fetch agent config ----
        send_thinking(step_id, f"🤖 Loading agent config for '{agent_role}'...", "")
        try:
            agent = fetch_agent_config(agent_role)
        except Exception as e:
            raise Exception(
                f"No agent configured for role '{agent_role}'. "
                f"Create an agent in Mission Control with agentRole='{agent_role}'. "
                f"Error: {e}"
            )

        provider = agent.get("provider", "anthropic")
        model_id = agent.get("modelId", "claude-haiku-4-5-20251001")
        system_prompt = agent.get("systemPrompt", "")
        agent_name = agent.get("name", agent_role)

        log_step(step_id, f"Agent: {agent_name} | Provider: {provider} | Model: {model_id}")
        send_thinking(step_id,
                       f"🤖 Agent: {agent_name}",
                       f"Model: {model_id} ({provider})")

        # ---- 3. Get API key ----
        api_key = get_api_key(provider)
        if not api_key:
            raise Exception(
                f"No API key configured for provider '{provider}'. "
                f"Set it in Mission Control → Settings → API Keys."
            )

        # ---- 4. Fetch step context (workflow metadata) ----
        try:
            step_context = fetch_step_context(step_id)
        except Exception:
            # If context fetch fails, use what we have from the step itself
            step_context = {
                "contentType": "blog_post",
                "selectedAngle": "",
                "briefing": "",
            }

        # ---- 5. Build prompt ----
        send_thinking(step_id,
                       f"📝 Building prompt for {agent_name}...",
                       "Assembling input data + web research...")
        user_prompt = build_user_prompt(step, step_context)
        log_step(step_id, f"Prompt built: {len(user_prompt)} chars")

        # ---- 6. Call LLM ----
        send_thinking(step_id,
                       f"🧠 Calling {model_id}...",
                       f"Provider: {provider} | Waiting for response...")
        log_step(step_id, f"→ Calling {provider}/{model_id}...")

        start_time = time.time()
        raw_output = call_llm(provider, api_key, model_id, system_prompt, user_prompt)
        elapsed = time.time() - start_time

        log_step(step_id, f"✅ LLM returned {len(raw_output)} chars in {elapsed:.1f}s")
        send_thinking(step_id,
                       f"✅ Response received ({len(raw_output)} chars)",
                       f"Processing output...")

        # ---- 7. Validate and cap output ----
        if len(raw_output) > MAX_OUTPUT_CHARS:
            log_step(step_id, f"⚠ Output truncated from {len(raw_output)} to {MAX_OUTPUT_CHARS}", "WARN")
            raw_output = raw_output[:MAX_OUTPUT_CHARS]

        # Try to validate/extract JSON from LLM output
        output_to_store = raw_output
        try:
            extracted_obj = extract_json_from_text(raw_output)
            # Valid JSON extracted — use it
            output_to_store = json.dumps(extracted_obj) if isinstance(extracted_obj, (dict, list)) else raw_output
        except ValueError:
            # Not JSON or can't extract — wrap in JSON envelope
            output_to_store = json.dumps({
                "result": raw_output,
                "metadata": {
                        "raw_response": True,
                        "provider": provider,
                        "model": model_id,
                        "chars": len(raw_output),
                    }
                })

        # ---- 8. Submit output ----
        send_thinking(step_id,
                       f"💾 Saving output...",
                       "Submitting to workflow engine...")
        submit_step_output(step_id, output_to_store)

        log_step(step_id, f"✅ Step complete! Output submitted ({len(output_to_store)} chars)")
        send_thinking(step_id,
                       f"✅ {step_name} complete!",
                       f"{len(output_to_store)} chars | {elapsed:.1f}s")

    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response is not None else "?"
        try:
            error_body = e.response.text[:500] if e.response is not None else ""
        except Exception:
            error_body = ""
        error_msg = f"HTTP {status_code} error: {str(e)[:300]}"
        if error_body:
            error_msg += f" | Body: {error_body}"
        log_step(step_id, f"✗ {error_msg}", "ERROR")
        send_thinking(step_id, f"❌ Failed: HTTP {status_code}", error_msg[:100])
        fail_step(step_id, error_msg)

    except requests.exceptions.Timeout:
        error_msg = f"LLM API timeout ({LLM_TIMEOUT}s)"
        log_step(step_id, f"✗ {error_msg}", "ERROR")
        send_thinking(step_id, "❌ Timeout", error_msg)
        fail_step(step_id, error_msg)

    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)[:500]}"
        log_step(step_id, f"✗ {error_msg}", "ERROR")
        log_step(step_id, traceback.format_exc()[:1000], "DEBUG")
        send_thinking(step_id, "❌ Failed", str(e)[:100])
        fail_step(step_id, error_msg)

# ============================================================
# MAIN POLLING LOOP
# ============================================================

def run_daemon():
    """Main daemon loop with proper concurrent step management."""
    log("=" * 70)
    log("🚀 ISTK Workflow Daemon v1.0 starting")
    log(f"   Convex: {CONVEX_SITE_URL}")
    log(f"   Poll interval: {POLL_INTERVAL}s")
    log(f"   Max concurrent: {MAX_CONCURRENT_STEPS}")
    log(f"   LLM timeout: {LLM_TIMEOUT}s")
    log(f"   Keys file: {KEYS_FILE}")
    log("=" * 70)

    # Initial key load
    load_api_keys()
    log(f"🔑 Loaded {len(_keys_cache)} API key(s): {list(_keys_cache.keys())}")

    # Track active step futures (step_id → future)
    active_futures: dict = {}
    active_lock = Lock()

    last_health_ping = 0
    last_key_sync = 0
    total_processed = 0
    total_failed = 0

    post_daemon_health("online", "Workflow daemon started")

    executor = ThreadPoolExecutor(max_workers=MAX_CONCURRENT_STEPS, thread_name_prefix="step")

    try:
        while not _shutdown_requested:
            now = time.time()

            # ---- Reap completed futures ----
            with active_lock:
                completed_ids = []
                for step_id, future in active_futures.items():
                    if future.done():
                        completed_ids.append(step_id)
                        try:
                            future.result()
                            total_processed += 1
                        except Exception as e:
                            total_failed += 1
                            log(f"✗ Unhandled error in step {step_id[-8:]}: {e}", "ERROR")
                for step_id in completed_ids:
                    del active_futures[step_id]
                active_count = len(active_futures)

            # ---- Health ping ----
            if now - last_health_ping >= HEALTH_INTERVAL:
                post_daemon_health("online",
                    f"Running | ok={total_processed} err={total_failed} active={active_count}")
                last_health_ping = now

            # ---- Key sync ----
            if now - last_key_sync >= KEY_SYNC_INTERVAL:
                load_api_keys()
                last_key_sync = now

            # ---- Poll for pending steps ----
            pending = fetch_pending_steps()

            if pending:
                with active_lock:
                    active_ids = set(active_futures.keys())
                    new_steps = [s for s in pending if s["_id"] not in active_ids]
                    slots_available = MAX_CONCURRENT_STEPS - len(active_futures)

                if new_steps and slots_available > 0:
                    batch = new_steps[:slots_available]
                    log(f"📋 Dispatching {len(batch)} step(s) "
                        f"(pending={len(pending)} new={len(new_steps)} "
                        f"active={active_count} slots={slots_available})")

                    for step in batch:
                        step_id = step["_id"]
                        with active_lock:
                            if step_id in active_futures:
                                continue
                            future = executor.submit(execute_step, step)
                            active_futures[step_id] = future

            # ---- Sleep (interruptible) ----
            sleep_remaining = POLL_INTERVAL
            while sleep_remaining > 0 and not _shutdown_requested:
                time.sleep(min(1.0, sleep_remaining))
                sleep_remaining -= 1.0

    except KeyboardInterrupt:
        log("🛑 Keyboard interrupt")
    finally:
        log("🛑 Shutting down...")
        post_daemon_health("offline", "Workflow daemon stopped")
        executor.shutdown(wait=True, cancel_futures=True)
        log(f"🛑 Daemon stopped (processed={total_processed} failed={total_failed})")

# ============================================================
# ENTRYPOINT
# ============================================================

if __name__ == "__main__":
    run_daemon()
