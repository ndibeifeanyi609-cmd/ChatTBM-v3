# Progressive Response Streaming Design

Status: Proposed Design — Not Yet Implemented or Verified

## 1. Purpose

Define a provider-independent path for displaying ChatTBM responses as
incremental text while preserving the existing authenticated chat path,
canonical boundaries, final Context persistence, and non-streaming API.

This design implements Contract §36 and Roadmap §17. It does not claim that
streaming is currently available.

## 2. Current Architecture Findings

The current request path is:

Browser
→ `ui/ChatAPI.mjs: generateReply()`
→ `POST /api/chat`
→ `controllers/chatController.js: chatHandler()`
→ `chatInteraction/ChatInteractionBoundary.js: handleInteraction()`
→ `services/assistantEngine.js: generateReply()`
→ `services/aiEngine.js: generateAIResponse()`
→ `services/AIProviderBoundary.js`
→ `services/GeminiProvider.js: generateResponse()`

Current behavior waits for the complete provider response, persists the
completed turn through `ContextBoundary.updateContext()`, and returns JSON.
The browser then renders the completed response. Streaming must pass through
the existing boundaries; a UI-only change is insufficient.

## 3. Transport Decision

Use a **POST request with Fetch ReadableStream and newline-delimited JSON
(NDJSON)** for the first implementation.

Reasons:
- Chat requests require a POST body and the existing authenticated fetch
  behavior, including session cookies and optional bearer token.
- The browser can incrementally read the response body using Fetch.
- NDJSON makes each event independently parseable without relying on
  EventSource's GET-only connection setup.
- The response can use `Content-Type: application/x-ndjson; charset=utf-8`.

This choice MUST be verified on the deployed hosting path, including Render
proxy buffering, compression, timeouts, and mobile Safari. If incremental
delivery cannot be demonstrated through the deployed path, do not claim
production streaming.

## 4. Proposed Data Flow

Browser Chat UI
→ ChatAPI streaming reader
→ authenticated POST /api/chat/stream
→ HTTP controller
→ Chat Interaction Boundary
→ Assistant Engine
→ AI Engine
→ AIProviderBoundary streaming capability
→ GeminiProvider streaming API

Text deltas travel back along the same call chain. The Chat Interaction
Boundary retains responsibility for Context lookup, Memory handling,
interaction validation, and persistence of the final complete response.
The HTTP controller owns only transport framing and HTTP response behavior.
It MUST NOT call Gemini SDK methods directly.

The existing `POST /api/chat` endpoint and `generateReply()` remain
available for non-streaming callers. A separate endpoint avoids silently
changing the current JSON contract.

## 5. Provider Contract

Keep `generateResponse(request)` for compatibility. Add an explicitly
defined streaming capability, such as `streamResponse(request, onDelta)`,
only after provider boundary and test contracts are updated.

The streaming provider method must:
- validate request and provider availability
- invoke the provider SDK's supported streaming API
- validate each provider chunk and extract text only
- emit non-empty text deltas in order through the callback
- accumulate the exact emitted text for the final result
- normalize provider exceptions and empty/invalid output
- avoid returning SDK objects or credentials to higher layers

The provider boundary must capability-check `streamResponse`. A provider
without that method must return a controlled unsupported-capability error
or use a specifically approved fallback. It must not call an undefined
method. Gemini SDK stream behavior must be checked against the installed
SDK version before implementation.

## 6. Event Protocol

Each NDJSON line is one JSON object. Define and test these event types:

- `start`: request accepted; includes interactionId and protocol version
- `delta`: includes one text fragment
- `complete`: includes final response text and confirms successful
  completion/persistence
- `error`: includes a normalized error code and safe user-facing message

Every event must be UTF-8 JSON followed by a newline. Text fragments are
plain text, not HTML. The browser must not use raw `innerHTML` to insert
deltas. On normal completion, the client must observe a `complete` event;
a closed connection without completion is an interrupted response.

No provider secrets, SDK objects, stack traces, or internal prompts may be
sent in events.

## 7. Interaction and Persistence

The existing interaction validation, authenticated identity, Context
ownership checks, Memory behavior, and optimistic Context version update
remain authoritative.

The stream must accumulate the complete response while emitting deltas.
Only after provider generation finishes successfully should the interaction
boundary persist the complete response using the existing Context Boundary.
The `complete` event must be emitted only after that persistence succeeds.

If persistence fails after text has been streamed, send a normalized
`error` event if the connection is still writable. The UI must mark the
answer as incomplete/unsaved and must not treat partial output as a
successful completed turn.

Do not persist each delta as a separate Context update. Do not create a
second authoritative conversation store.

## 8. Authentication and HTTP Behavior

The streaming route must be mounted behind the same authentication controls
as the existing chat route. The server must derive user identity through
`authenticatedUserId(req)`; request-body userId is not authoritative.

Before sending headers, failures may use the existing JSON error contract.
After NDJSON headers are sent, failures must use the stream's `error`
event where possible and then close the response. Never attempt to send a
second JSON HTTP response after streaming headers have been committed.

Set headers to disable caching and buffering where supported, flush headers
when supported, and ensure middleware/proxies do not buffer the body.
Do not expose error.stack or raw provider errors to the client.

## 9. Cancellation and Resource Safety

Propagate an AbortSignal or equivalent cancellation context from browser
disconnect/cancel to the HTTP controller and provider when the SDK supports
it. A disconnect must stop writing to the response and release server
resources. Provider cancellation support must be verified rather than
assumed.

Define limits for request duration, maximum response bytes, and stream
buffering. A failed or interrupted stream must not produce a false
completion event.

## 10. UI Behavior

The UI must:
- append an assistant placeholder before reading deltas
- append each delta as plain text in arrival order
- preserve scrolling without re-rendering away current partial text
- keep send/loading state active until completion or error
- display a recoverable interrupted/error state when completion is absent
- preserve existing retry behavior
- save local/remote conversation history only with clearly defined
  completed-response semantics
- continue to support non-streaming responses and current mobile layout

The current DOM is re-rendered by the browser app, so implementation must
inspect the submit-message/render flow and avoid full re-renders that erase
or duplicate deltas. Existing Markdown rendering and DOMPurify behavior
must remain safe when final content is rendered.

## 11. Verification Plan

### Unit Tests
- provider streaming capability and unavailable-provider behavior
- ordered chunk extraction and accumulated final response
- empty/malformed provider chunks
- failure before the first delta
- failure after one or more deltas
- existing non-streaming provider behavior unchanged
- normalized error behavior

### Boundary / Integration Tests
- authenticated identity overrides body-supplied userId
- invalid interactionId/message rejected before stream start
- deltas emitted in order
- complete event occurs only after Context persistence
- persistence failure after deltas emits an error, not completion
- disconnect/cancellation stops further writes
- no second response is sent after headers are committed
- legacy `POST /api/chat` JSON contract remains unchanged

### Browser Tests
- incremental display is visible before generation finishes
- interrupted stream is not marked complete
- safe rendering of text that contains HTML-like input
- send/loading/retry state is correct
- mobile Safari supports the chosen reader path

### Live Verification
Mocks establish contract behavior only. Production streaming is verified
only after a configured Gemini response is observed arriving incrementally
through the deployed HTTP route and browser.

## 12. Implementation Order

1. Review this design against Blueprint and Contract §36.
2. Verify the installed Gemini SDK streaming API and cancellation behavior.
3. Implement provider streaming behind AIProviderBoundary.
4. Add provider-independent streaming to AI Engine and Assistant Engine.
5. Extend Chat Interaction Boundary with controlled delta delivery while
   preserving final Context persistence.
6. Add authenticated `POST /api/chat/stream` route and NDJSON controller.
7. Add a streaming reader in ChatAPI and progressive rendering in the UI.
8. Add unit, boundary, integration, and browser tests.
9. Run failure tests and non-streaming regression tests.
10. Update documentation, create checkpoint, commit, push, and confirm.

No implementation is complete until verification and failure testing pass.
