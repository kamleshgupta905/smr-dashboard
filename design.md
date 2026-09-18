# Analytics

## Mission
Create implementation-ready, token-driven UI guidance for Analytics that is optimized for consistency, accessibility, and fast delivery across dashboard web app.

## Brand
- Product/brand: Analytics
- URL: https://dastone-react.vercel.app/dashboards/analytics
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Roboto`, `font.family.stack=Roboto, sans-serif`, `font.size.base=13px`, `font.weight.base=400`, `font.lineHeight.base=19.5px`
- Typography scale: `font.size.xs=10px`, `font.size.sm=11.36px`, `font.size.md=12px`, `font.size.lg=13px`, `font.size.xl=14px`, `font.size.2xl=15px`, `font.size.3xl=17px`, `font.size.4xl=20px`
- Color palette: `color.text.primary=#303e67`, `color.text.secondary=#a4abc5`, `color.text.tertiary=#1761fd`, `color.text.inverse=#1d2c48`, `color.surface.base=#000000`, `color.surface.muted=#ffffff`, `color.surface.raised=#f1f5fa`, `color.border.muted=#eaf0f9`, `color.border.strong=#e3ebf6`
- Spacing scale: `space.1=4px`, `space.2=4.8px`, `space.3=6px`, `space.4=7.2px`, `space.5=8px`, `space.6=10px`, `space.7=12px`, `space.8=16px`
- Radius/shadow/motion tokens: `radius.xs=3px`, `radius.sm=3.2px`, `radius.md=4px` | `shadow.1=rgba(0, 0, 0, 0) 0px 0px 0px 9999px inset` | `motion.duration.instant=150ms`, `motion.duration.fast=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (130), cards (38), lists (21), buttons (14), tables (3), navigation (1).

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
