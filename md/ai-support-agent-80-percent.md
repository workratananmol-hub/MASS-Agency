---
title: "AI Customer Support Agent: Architecture & Escalation | MASS"
description: "Design an AI customer support agent with approved knowledge, deterministic tools, confidence-based escalation, human review, evaluation, logging, and failure handling."
canonical: https://mass.llc/ai-support-agent-80-percent
---

AI Agents · 11 min read15 January 2026 · Updated 26 September 2026

# How to Design an AI Support Agent with escalation and evaluation

Approved knowledge, human handoff, evaluation, and failure handling. The URL still contains “80-percent”; MASS does not publish a verified 80% containment result.

**In this guide** [About “80%”](https://mass.llc/ai-support-agent-80-percent#claim) [The real goal](https://mass.llc/ai-support-agent-80-percent#goal) [Architecture](https://mass.llc/ai-support-agent-80-percent#architecture) [Knowledge design](https://mass.llc/ai-support-agent-80-percent#knowledge) [Guardrails](https://mass.llc/ai-support-agent-80-percent#guardrails) [Evaluation](https://mass.llc/ai-support-agent-80-percent#evaluation) [Failure handling](https://mass.llc/ai-support-agent-80-percent#failure) [FAQ](https://mass.llc/ai-support-agent-80-percent#faq)

Design a support agent around a named intent set, retrieval from approved content, deterministic account tools, confidence-based escalation, and continuous review of failed conversations. Do not advertise a containment percentage without a denominator, sample, time period, and definition of success. For implementation, see MASS’s [AI agent development services](https://mass.llc/agentic-ai).

## About the “80%” in this URL

This page used to lead with “handles 80% of queries without human help.” MASS has not published a dataset, client, time window, or denominator that would support that figure. The number is therefore **not a verified result**. The URL is unchanged so existing links keep working. The article is an implementation guide.

If you later report containment, state all of the following in the same sentence: the intent groups included, the channel, the sample size, the dates, and whether “success” means the customer did not come back, a human agreed the answer was correct, or merely that no ticket was opened.

## Optimize for correct resolution, not deflection

“Ticket deflection” is a dangerous north-star metric. A system can reduce tickets by frustrating customers, inventing answers, or hiding the path to a person. Define success as a resolved routine request with supporting evidence and no human action required—then measure false containment separately.

Ambiguous requests, sensitive account actions, policy exceptions, complaints, and cases with insufficient evidence belong in escalation. They are not a residual “failure bucket” to be optimized away.

## The support agent architecture

Component

Responsibility

Failure behavior

Intent router

Identify request type and required systems

Ask one clarifying question or escalate

Knowledge retrieval

Find relevant approved support content

Do not answer without sufficient evidence

Account tools

Read order, subscription, or ticket state

Return structured error; never guess

Policy layer

Check action limits and approval rules

Block or request human approval

Response composer

Explain the answer and next step clearly

Use a safe escalation response

Trace and evaluation

Record evidence, tool calls, and outcomes

Queue failures for review

## The knowledge base mattered more than the prompt

We broke long help documents into task-centered passages, preserved titles and update dates, and attached metadata for product, region, plan, and policy status. Retrieval returned a small evidence set; the model had to cite that evidence internally before composing the customer response.

### Knowledge rules that improved reliability

-   One authoritative owner for each policy.
-   Expiration or review dates on high-change content.
-   Separate “how-to” instructions from contractual policy.
-   Version-aware retrieval so old plans do not leak into current answers.
-   A visible “no evidence” path that escalates rather than improvises.

## Actions were tiered by risk

Read-only account lookup was low risk. Drafting a response was moderate. Changing a subscription, issuing value, or deleting data was high risk. Every tool declared its required permissions, reversibility, and confirmation policy.

**Escalation triggers**

Low retrieval confidence, conflicting sources, repeated tool failure, negative sentiment plus account impact, sensitive personal information, policy exception, or any action above the agent’s authority.

OpenAI’s agent guidance recommends human intervention after failure thresholds and before high-risk actions. That principle became part of the workflow, not a disclaimer at the bottom of the interface.

## How we evaluated the agent

Before release, we assembled a test set of common questions, awkward phrasing, missing details, conflicting information, adversarial instructions, and known edge cases. Each run was scored on outcome, evidence, tool correctness, tone, and escalation behavior.

-   **Containment rate:** routine requests resolved without human work.
-   **Correct resolution rate:** resolved requests that were actually correct.
-   **False containment:** cases the agent claimed to resolve but should have escalated.
-   **Escalation quality:** whether the human received a useful summary and evidence.
-   **Repeat contact:** customers returning for the same unresolved issue.

If you publish a containment rate, restrict it to the defined routine-query set and show the false-containment rate beside it. Scope discipline is what makes a number honest—not the number itself.

## Failure handling

-   Missing evidence: refuse and escalate. Do not improvise policy.
-   Tool error: retry once, then hand the structured error to a person.
-   Conflicting sources: escalate with both passages attached.
-   Customer repeats the same issue: skip the bot path and open a human ticket with the prior trace.
-   High-impact action: require an explicit human confirmation before the tool runs.

Related MASS service: [Agentic AI](https://mass.llc/agentic-ai). Related guide: [what an AI agent does—and does not do](https://mass.llc/ai-agent-business).

## What to build next

We would prioritize better policy change detection, automated regression tests whenever source content changes, multilingual evaluation sets, and clearer analytics that separate customer behavior from agent performance.

## Frequently asked questions

What percentage of support tickets can AI automate?

There is no universal percentage. It depends on query mix, knowledge quality, system access, policy complexity, and acceptable risk. Measure containment for clearly defined intent groups rather than advertising one number across every channel.

Should an AI support agent have access to customer accounts?

Only when required, with minimum permissions, structured tools, authentication, logging, and approval for sensitive actions. Start read-only and expand based on evidence.

How do you stop an AI support agent from hallucinating?

You cannot promise zero errors. Reduce them with grounded retrieval, output validation, narrow scope, deterministic tools, refusal when evidence is missing, evaluation, and human escalation.

**Sources:** [OpenAI agent design guide](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/); [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework).

## Build support automation customers can actually trust.

[Design a support agent ↗](https://mass.llc/contact)

---

Site directory: https://mass.llc/llms.txt
