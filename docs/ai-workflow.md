---

# AI Workflow Documentation

## Overview
This project was built using Claude Code (VS Code extension) as the primary
implementation tool and Claude Chat for architecture planning and concept explanations.
This document explains how both were used, what worked well, and what required
human judgment.

## Tools Used

### Claude Chat
Used for: architecture decisions, concept explanations, step-by-step planning.
Examples:
- Designed the overall system architecture before writing any code
- Explained why ev.waitUntil() is the correct pattern in Next.js middleware
  vs a raw void call
- Clarified why Dub stores a cache object instead of just a URL string in Redis
- Decided to use middleware.ts for redirects instead of a [slug]/route.ts file
  after reviewing the Dub codebase

### Claude Code (VS Code Extension)
Used for: file generation, code implementation, running commands, git operations.
Examples:
- Scaffolded the entire Next.js project structure
- Generated all Prisma schema migrations
- Implemented processLink(), createLink(), and the full API route handlers
- Built all React components including the analytics dashboard charts
- Ran curl test commands to verify endpoints

## CLAUDE.md
Located at the project root. Contains:
- Project architecture overview
- Critical rules (cache invalidation, error formats, ev.waitUntil)
- Folder conventions
- Dub reference file paths

The CLAUDE.md was created at the start of the project (Step 1) so every
Claude Code session automatically had project context without re-explaining
the architecture. This meant prompts could be specific ("build processLink()
following the pattern in lib/api/links/") instead of generic.

## Custom Agents

### .claude/agents/code-reviewer.md
Created in Step 15. Checks for:
- Cache invalidation bugs (linkCache.delete on every DB delete)
- Route handler architecture violations (logic in app/ instead of lib/)
- Error response format consistency
- Missing Zod validation
- ev.waitUntil usage in middleware

Used after completing each phase to catch issues before committing.

### .claude/agents/api-designer.md
Created in Step 15. Enforces:
- Consistent HTTP status codes
- Consistent error response shapes
- Route handler structure rules
- Middleware requirements

## Custom Slash Commands
Located in .claude/commands/:

- check-cache.md — checklist for cache invalidation correctness
- add-api-route.md — template scaffold for new API routes
- commit.md — generates conventional commit messages

## Key Prompts That Worked Well

### 1. The architecture-first prompt (Step 5)
Providing the Dub file path alongside the task made output dramatically better:
"Build the redirect engine in middleware.ts. Reference dub/apps/web/lib/middleware/link.ts
for the pattern. Use ev.waitUntil for all async work. Our version only handles slugs,
not multiple domains."

Why it worked: specific file reference + explicit constraint (ev.waitUntil) +
scope reduction (no multi-domain complexity).

### 2. The split-responsibility prompt (Step 4)
"Create processLink() in lib/api/links/process-link.ts for validation only —
no DB writes. Create createLink() in lib/api/links/create-link.ts for DB write
and cache write only — no validation. The route handler calls both in sequence."

Why it worked: explicit separation of concerns stated upfront prevented
Claude Code from putting everything in one function.

### 3. The cache object prompt (Step 3)
"Store { url, password, expiresAt } in Redis — NOT just the URL string.
Add a comment explaining why: middleware needs all three fields to make
redirect decisions without a DB query."

Why it worked: stating the WHY forced the correct design decision and
produced self-documenting code.

## What Claude Code Got Wrong (and Required Human Judgment)

1. Initially tried to put the redirect engine in app/[slug]/route.ts
   (a route handler) instead of middleware.ts. Required correction after
   reviewing how Dub actually handles this.

2. Generated ev.waitUntil with a raw void call on first attempt.
   Had to explicitly specify ev.waitUntil() as the required pattern.

3. On the analytics query, initially did not fill in zero-count days
   in the clicksByDay array. Had to prompt specifically for the
   buildDayArray function and explain why gaps in the array break
   the line chart rendering.

4. The cache stored only the URL string initially. Had to re-prompt
   with the explicit object shape { url, password, expiresAt } and
   explain the architectural reason.

## What I Decided vs What Claude Code Decided

Human decisions (architecture):
- Use middleware.ts for redirects (not route handlers)
- Cache an object not just a URL (so middleware avoids DB queries)
- Split processLink/createLink (mirrors Dub's separation of concerns)
- Use ev.waitUntil for both cache writes and click recording
- Use QStash instead of AWS SQS (serverless compatibility)

Claude Code decisions (implementation):
- Exact Zod schema shapes
- Tailwind class combinations for the UI
- The buildDayArray algorithm implementation
- bcrypt salt rounds (10)
- The exact sliding window parameters

## Lessons Learned

1. CLAUDE.md pays dividends immediately.
   Every session after Step 1 required shorter prompts because
   Claude Code already knew the architecture rules.

2. Reference real code in prompts.
   Pointing to dub/apps/web/lib/middleware/link.ts produced
   better output than describing the pattern in words.

3. State the WHY not just the WHAT.
   "Store an object because middleware needs all fields" produced
   better code + comments than "store { url, password, expiresAt }".

4. Custom agents catch what you miss.
   The code-reviewer agent found the ev.waitUntil issue and an
   inconsistent error format before they were committed.

5. The split between Claude Chat and Claude Code is real.
   Architecture decisions made in Claude Chat, then executed in
   Claude Code with precise prompts. Mixing the two (trying to
   design and implement in the same Claude Code session) produced
   lower quality output.

---
