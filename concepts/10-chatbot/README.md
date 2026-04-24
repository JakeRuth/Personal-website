# Concept 10 — Chatbot

The entire site is a chat interface. Visitors ask questions about Jake. A
hardcoded keyword router matches against a hand-written response database and
streams replies character-by-character, with occasional rich embedded blocks
(stats, career timeline, resume download card). No build step, no real LLM
calls, no dependencies. Open `index.html` directly via `file://` or serve with
`python3 -m http.server`.

## Files

- `index.html` — shell, suggestion chips, composer, script tag.
- `styles.css` — dark, terminal-adjacent chat UI. Accent color for bot, soft
  green for user messages. Typing dots, blinking caret during stream, subtle
  gradient backdrop.
- `app.js` — response database, keyword router, streaming writer, rich block
  renderer, greeting, fallback handler.

## What's implemented

- **Greeting on load** with typing indicator then streamed text.
- **Composer**: text input, send button, Enter-to-submit, disabled while bot is
  speaking.
- **Suggestion chips** (all six from the brief) — clickable, prefill and submit.
- **Keyword routing** — regex-based scoring across ~18 canned topics.
- **Streaming responses** — ~18ms/char with jitter and tiny multi-char chunks
  for a natural feel. Blinking caret at the tail.
- **Rich blocks** (three types):
  - `stats` — four-up grid, used in the Stock Unlock response (YC W22,
    $1.335M seed, 8 employees, 1.2K+ customers).
  - `timeline` — vertical timeline with year/node/text, used in the career
    response.
  - `resume` — clickable download card, used in the resume response. Click
    fires a follow-up bot message admitting it's a prototype and redirecting
    to email.
- **Mini markdown** in streamed text: `**bold**`, `` `code` ``, bullet lines,
  auto-linked email addresses.
- **Fallback** for unknown inputs with a suggestion list and Jake's email.

## Topics covered (>= 10)

hire · stock-unlock · rubik · unicycle · ai-philosophy · ai-tooling · career
(oscar + commercehub) · youni · resume · married · hobbies · contact ·
different · location · education · who · greeting · thanks.

## Fallback behavior

Any input that scores zero keyword matches gets a single canned fallback
message: *"hmm, i don't have a pre-canned answer for that — try asking about
stock unlock, his career, the rubik's cube thing, AI philosophy, why to hire
him, or resume — or email jake directly at jake@stockunlock.com."*

## Voice

Lowercase-lean, dry, confident, a little edgy. Matches the brief's direction.
Stock Unlock is always framed as past-tense-scaled, currently-profitable
side-business, *not currently running it*. Covers the bits: YC W22, $1.335M
seed, 8 employees, profitable, stepping back. Rubik's + unicycle anecdote,
the CommerceHub intern prod-down, Youni's cold-start failure, the
Oscar-era hackathon chatbot with Peter, the Daniel Pronk email persistence
story, the AI philosophy ("driver in the driver's seat, not driven by the
car"), and the Claude Code / Codex / CMUX tooling stack.

## If I had more time

- **Real fuzzy matching / embeddings-style similarity** rather than regex
  scoring — would handle more phrasings gracefully.
- **Conversation memory** — follow-ups like "tell me more about that" would
  need a lightweight topic stack. Right now every message is independent.
- **More blocks** — an animated "cube solve time" bar chart for the rubik's
  response; a small Oscar-era org-chart growth line; an interactive "ask a
  follow-up" chip cluster that appears after certain answers.
- **Actual resume PDF** wired to the download card instead of the self-aware
  "this is a prototype" redirect.
- **Voice / audio** — hit a synthesis API to read replies aloud. Would be a
  cute touch, scope-cut for now.
- **Rate limiting + abuse prevention** — if this were ever actually on the
  internet with a real LLM behind it.
- **Mobile polish** — works but the composer could pin better above the iOS
  keyboard, and the timeline could collapse into a single column more
  gracefully.
