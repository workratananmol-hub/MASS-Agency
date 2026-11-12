---
title: "AI Email Automation for a Hotel Booking Team | FBEDS Case Study | MASS"
description: "How MASS built FBEDS, an AI email automation system for a UAE hotel-booking team that classifies mail, files contracts, drafts replies and replaces 3–4 hours of daily inbox work."
canonical: https://mass.llc/fbeds
---

Selected work / Agentic AI

# FBEDS

AI email automation for a hotel-booking team. It reads every email, files every contract, drafts the replies, and asks a person only when it should.

Client

FBEDS, UAE & Oman hotel distribution. Ram Kumar, Director.

The need

3–4 hours of inbox work, every day

What shipped

Six connected AI workflows and a review desk

The result

100 of 100 test emails correct, verified by the client

**3–4h**

of manual inbox work a day, by the client's own count, before FBEDS

**99%+**

accuracy standard, met in client verification of test and live email

**437**

automated checks run before any change goes live

**24/7**

health monitoring across both inboxes, every 30 minutes

The engagement

## An inbox that does the sorting before anyone opens it.

The situation

FBEDS works between hotels and travel agents across the UAE and Oman. Two shared inboxes, reservations and contracting, carry the whole business: rate contracts, season pricing, promotions, booking requests, agent enquiries, payment notices, and a steady layer of newsletters and noise.

Every day someone on the team read all of it. They worked out which hotel and season each attachment belonged to, saved it in the right folder, wrote the replies, and kept the contact list current. Ram Kumar, Director of FBEDS, put the cost at three to four hours a day. It was not hard work. It was careful work, and it started again the next morning.

MASS did not treat it as an email problem. It was a filing system, a reply desk and a contact database that all happened to arrive through the inbox. So we built one system for all three.

01 / Problem

### Hours of judgement calls, repeated daily.

Every email needed the same decisions. Is it important or promotional? Does it need a reply? Is the attachment a contract, a price list or a booking? Which emirate, which hotel, which season? One wrong folder and a rate sheet disappears when a sales agent needs it. One missed email and a partner waits. The volume did not allow slow, and the content did not allow careless.

02 / Understanding the business

### Learn the desk before writing a rule.

We started with their folders, not with a model. We mapped how the team organises hotels by emirate, star rating, hotel and season; when a promotion earns its own folder; which senders are hotels, agents or payment systems; and which emails only need a polite acknowledgement. We read real mail, labelled a golden set of examples by hand, and agreed nine email categories with the client before building anything.

Architecture / 5 layers

## How the AI email system is built, layer by layer.

Every email passes down through five layers. Each layer has one responsibility, so each can be tested, trusted and improved on its own. Scroll to move through the stack.

Layer 01 / Channels

### Two inboxes, nothing missed.

The reservations and contracting mailboxes in Zoho are watched live. A new email starts the system within moments, and an hourly sweep catches anything a live trigger might drop. Each inbox keeps its own secure connection.

Layer 02 / Understanding

### Read once, understand fully.

The intake workflow strips markup, signatures and quoted history, then an AI model classifies the email into one of nine business categories. It decides importance, whether a reply is needed and what the attachment is, and it scores its own confidence.

Layer 03 / Action

### Specialists do the work.

Three focused workflows act on the decision. Filing puts contracts and rates in the right Drive folder. Drafts writes the reply. Contacts keeps the marketing sheet clean. Each does one job and nothing else.

Layer 04 / Judgement

### A person, exactly when needed.

When the model is unsure, or the evidence disagrees, nothing happens automatically. The email waits on the review desk with the AI's best suggestion. One click confirms or corrects it, and the action layer finishes the job.

Layer 05 / Memory & oversight

### Remembered once. Watched always.

A shared ledger records every email, decision and action exactly once, so retries never duplicate work. The health workflow reconciles both inboxes against that ledger every 30 minutes, repairs what it can and alerts on the rest.

Explore / 6 workflows

## Six workflows. Each with one job.

Select a workflow to see why it exists, what it does, and the guardrail that keeps it safe.



Workflow 01 / Understanding layer

### Intake

The front door. Decides what every email is.

Runs

The moment mail lands in either inbox, plus an hourly safety sweep.

Does

Cleans the email to its meaning, classifies it into nine business categories, and scores importance, reply need, document type and its own confidence.

Why it exists

Every later step depends on one correct first read.

Guardrail

Low confidence never acts. It goes to the review desk.

Try it / Run an email

## Watch FBEDS decide, step by step.

Pick an email and run it through the system. These are illustrative examples with invented hotel names; the steps, checks and outcomes are the ones FBEDS runs in production.



1.  Arrive
2.  Clean
3.  Classify
4.  Verify
5.  Act
6.  Record

Confidence

—

Accuracy, verified

## Confidence before action. Proof before launch.

-   **100/100**

    test emails handled correctly in the verification sheet shared with the client

-   **10 days**

    of live production output reviewed by the client and confirmed accurate

-   **437**

    automated checks that every change must pass before it ships

-   **99%+**

    the accuracy standard the system is held to, every day


In this business a wrong folder is worse than an empty one. So the target was never "automate as much as possible". It was: handle at least 99% of email correctly with no one touching it, and show every uncertain case to a person instead of guessing.

We proved it with the client, not just to them. FBEDS checked a 100-email verification sheet line by line, then reviewed ten days of live production output. Every item was confirmed correct. We still publish the standard as 99%+, because a system should be judged by the bar it holds, not by its best week.

-   ### Evidence must agree

    A hotel name in the subject is not enough. The document, the subject, the sender and the file name are checked independently, and the system acts only when they line up.

-   ### Tested on real mail

    A hand-labelled golden set of real client emails is the benchmark. Every model and rule change is measured against it before it ships.

-   ### 437 checks per release

    Every bug we found became a test. Changes deploy only when the full suite passes, so a fix in one place cannot quietly break another.

-   ### Exactly once

    Each email is claimed before work starts, so a restart or a retry can never file the same contract twice or create a duplicate draft.

-   ### Drafts, never sends

    The system can prepare any reply but cannot send one. The final word stays with the team, by design rather than by setting.

-   ### Every decision explained

    Each action is logged with the reason and the confidence behind it, so the team can see why the system did what it did.


How we built it

## Built in the open. Broken on purpose.

1.  Phase 01 / Discover

    ### Map the desk

    Folder structures, sender types, reply habits and the nine categories, agreed with the client. A golden set of real emails labelled by hand.

    **What we learned**

    The hard part was never reading email. It was knowing which hotel and season a document truly belongs to.

2.  Phase 02 / First build

    ### Too much, in too many places

    The first version worked, but grew into a design with logic buried across many workflows. It was hard to read and harder to trust.

    **What we changed**

    We stopped and rebuilt around a simple spine: intake decides, specialists act, one ledger remembers. Tests moved into code.

3.  Phase 03 / Real mail

    ### Shadow runs on live inboxes

    Real email found what samples never would. Long HTML newsletters were too large for the model and too costly to send whole. Restarts could double-process work.

    **What we changed**

    Emails are cleaned to plain meaning first, cutting the text sent to the AI by about 89%. Each email is now claimed before work starts, so it is processed exactly once.

4.  Phase 04 / Go live

    ### Production, with the team watching

    Live on the reservations inbox, with every unclear case on the review desk. Then the AI provider ran out of credit and hundreds of emails had to wait.

    **What we changed**

    Work now parks safely instead of failing, and the health monitor raises an alert the moment a provider is down.

5.  Phase 05 / Harden

    ### Second inbox, real-world noise

    Brief network drops to Google failed about eleven contact updates a day. Adding the contracting inbox exposed limits in the automation platform itself.

    **What we changed**

    Network calls retry on their own. Each inbox has its own route and credentials, and the health monitor now reconciles both.


Time and effort

## Three hours of sorting become a short review.

Before

**3–4 hours a day.** Read every email, decide, file, reply, update contacts. By hand.

After

**A short daily review.** Check the few flagged items, read the drafts, press send.

Clear emails are classified, filed, drafted and recorded without anyone touching them. The team's day starts with the review desk instead of the inbox. Across a working month that returns roughly 80–100 hours to the business\*, time that now goes into hotels, agents and sales.

Quality did not trade off against speed. Nothing is filed on a hunch, nothing is sent without a person, and the system tells the team exactly where it needs them.
\* Based on the client's estimate of 3–4 hours of daily inbox work over a working month.

The people behind it

## A small team. Full ownership.

-   ### Anmol Ratan

    Project lead · AI architecture · Workflow design

-   ### Arundhati Biswas

    Lead developer · Head of integration engineering

-   ### Ayush Saxena

    Client communication · Requirements · Quality assurance

-   ### Two more at MASS

    Testing · Operations support


Five people, one brief: take the repeatable work off the desk without ever lowering the standard of what leaves it.

What MASS delivered

## Six jobs off the desk. One person still in charge.

1.  01

    ### AI email intake

    Both inboxes read the moment mail arrives, sorted into nine business categories, with importance and reply need decided for every message.

2.  02

    ### Contract and pricing filing

    Attachments filed by emirate, hotel, season and promotion, using evidence from the document, the subject, the sender and the file name together.

3.  03

    ### Reply drafts in Zoho

    Replies written for the latest email in each thread and left as drafts. A person reads and sends; the system never does.

4.  04

    ### Marketing contact sheet

    A clean, de-duplicated list of hotel and agent contacts, with real phone numbers and job titles, and booking references kept out.

5.  05

    ### Review dashboard

    One simple screen for the few unclear emails, with the AI's suggestion ready to confirm or correct.

6.  06

    ### Health monitoring

    Round-the-clock checks that catch missed mail, failed steps and provider outages, and repair what they can.


Built with

-   Zoho Mail
-   n8n
-   PostgreSQL
-   Google Drive
-   Google Sheets
-   Large language models with confidence scoring
-   Docker

Questions

## AI email automation, answered plainly.

Does the FBEDS system send emails on its own?

No. Every reply is saved as a draft in Zoho Mail. A person on the team reads it and decides whether to send.

What happens when the AI is not sure about an email?

It stops and sends the email to a review dashboard with its best suggestion. A person confirms or corrects it, and the system finishes the work.

How accurate is the AI email classification?

In client verification, 100 of 100 test emails were handled correctly, and the client confirmed ten days of live output as accurate. The system is held to a 99%+ standard and acts automatically only when its confidence is high and every piece of evidence agrees.

Can MASS build this for another inbox or industry?

Yes. The approach starts from how your team already works: your categories, your folders, your replies. The same architecture fits any team that runs its business through shared inboxes.

## Less inbox. More business.

FBEDS is what agentic AI looks like when it is built for a real desk: it does the repeatable work, shows its uncertainty, and leaves the final word with the team. If your inbox is quietly costing someone half a day, that is the brief.

[Automate your inbox work ↗](https://mass.llc/contact)

[All AI work **Agentic AI**](https://mass.llc/agentic-ai) [Next / 01 **Inventrics**](https://mass.llc/inventrics)

---

Site directory: https://mass.llc/llms.txt
