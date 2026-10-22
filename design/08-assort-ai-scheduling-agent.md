# Design: AI Phone Agent That Books Patient Appointments (Assort Health-style)

**Time:** 60 min, unstructured (like Assort's round: whiteboard schemas, architecture, edge cases)
**Why this one:** Assort builds AI voice agents that answer patient calls for medical practices. Their system design round is "a real problem we've had to solve", and both technical interviewers are Agent Software Engineers. Expect full-stack/backend depth, not just UI.
**Related practice in this workspace:** `design/06` (who owns time, time zones), `backend-practice/guided/rate-limiter` (shared store, failure modes), Feature 13 in `nextjs-interview-prep` (idempotent order API)

## Prompt

> A medical practice gets hundreds of calls a day. Design a system where an AI agent answers the phone, figures out what the patient needs, and **books, reschedules or cancels appointments** in the practice's scheduling system (their EHR). Front-desk staff need a dashboard to see calls, take over when needed, and fix mistakes.
>
> Follow-up the interviewer may add: the EHR's API is slow (2–5 s) and sometimes down. Two patients ask for the same 9:00 slot within seconds of each other.

## Clarifying questions to ask

- One practice or many (multi-tenant)? How many providers and locations per practice?
- Which EHRs? One, or many with different APIs? (Assume several → an adapter per EHR.)
- Who is the source of truth for the schedule: the EHR or us? (Assume the EHR.)
- Appointment rules: types (new patient 60 min, follow-up 30 min), provider-specific hours, buffers, which insurance each provider accepts?
- What must the agent never do alone? (Assume: anything clinical or urgent → hand off to a human.)
- Compliance: HIPAA. What data can we store, and for how long? Audit requirements?
- Peak load: calls per minute at 8 AM Monday?

## Assumptions to use if the interviewer says "you decide"

| | |
| --- | --- |
| Tenants | ~1,000 practices, each with 1–50 providers |
| Calls | ~200k/day total, peaks at practice opening times |
| EHR | Source of truth; 2–5 s per call; rate-limited; occasionally down |
| Agent | Speech-to-text → LLM with tools (`findSlots`, `bookAppointment`, …) → text-to-speech |
| Handoff | Staff can join any live call or take over a failed task |

## What to produce

1. **Requirements**: functional (understand intent, verify patient identity, find slots, book/reschedule/cancel, confirm by SMS, hand off) and non-functional (agent replies within ~1 s of the patient finishing speaking; **never double-book**; never lose a booking the patient was told about; HIPAA, audit trail).
2. **Architecture**:
   - **Telephony** (e.g. Twilio) → **call session service** (one stateful session per live call; streaming audio).
   - **Agent orchestrator**: runs the conversation, calls **tools** that wrap our scheduling service. Never lets the LLM call the EHR directly.
   - **Scheduling service**: finds slots, holds and books them, applies practice rules.
   - **EHR adapters**: one per EHR vendor, same internal interface (adapter pattern).
   - **Availability cache**: recent schedule data per provider, refreshed in the background, so the agent isn't waiting 5 s per question.
   - **Task queue + workers**: bookings and confirmations that must retry when the EHR is down.
   - **Staff dashboard**: live calls, transcripts, task status, "take over" button (WebSocket for live updates).
   - **Audit log**: every action the agent took and why.
3. **Schemas** (whiteboard these):
   ```
   practices(id, name, timezone, ehr_type, ehr_credentials_ref, settings)
   providers(id, practice_id, name, ehr_provider_id, appointment_types[])
   patients(id, practice_id, ehr_patient_id, name, dob, phone)          -- minimum PHI
   calls(id, practice_id, from_phone, patient_id?, started_at, ended_at, status, intent, handed_off_to?)
   call_turns(id, call_id, seq, speaker, text, created_at)              -- transcript
   slot_holds(id, provider_id, start_at, end_at, call_id, expires_at)   -- UNIQUE(provider_id, start_at) while active
   booking_requests(id, idempotency_key, call_id, patient_id, provider_id, start_at, type,
                    status: pending|confirmed|failed|needs_staff, ehr_appointment_id?, attempts, last_error)
   audit_events(id, practice_id, actor: agent|staff|system, action, payload, created_at)
   ```
4. **API / tools**:
   ```
   Agent tools (internal):
     findSlots({ providerId?, type, fromDate, toDate })        → [{ providerId, startAt, endAt }]
     holdSlot({ providerId, startAt, callId })                 → { holdId, expiresAt }   (or "taken")
     bookAppointment({ holdId, patientId, type, idempotencyKey }) → { bookingId, status }
     cancelAppointment({ appointmentId, reason })
     handoffToStaff({ callId, reason })

   Dashboard (REST + WebSocket):
     GET  /api/practices/:id/calls?status=live|needs_staff
     GET  /api/calls/:id                     → call + transcript + bookings
     POST /api/calls/:id/takeover
     PATCH /api/booking-requests/:id         (staff fixes or retries)
     WS   /api/practices/:id/live            → call.updated, booking.updated events
   ```

## Deep dives the interviewer will push on

- **Double booking:** two calls want Dr. Lee at 9:00. Hold the slot in **our** database with a unique constraint (only one active hold per provider + start time) and a short expiry (~5 min, the length of the conversation). Then book in the EHR. Why not only check the EHR? (It's slow, and two checks can both see "free" before either books.) What if the EHR already has something we didn't know about? (Booking fails → offer the next slot.)
- **The EHR is slow or down:** the agent can't make the patient wait 5 s per question. Read slots from the cache; confirm with the EHR at booking time. If the EHR is down when booking: save the `booking_request` as `pending`, tell the patient "you'll get a text confirmation shortly", and let a **worker retry with backoff + jitter**. If it still fails → `needs_staff` + an alert, and the patient gets a call back. Never tell the patient "booked" before something durable is saved.
- **Idempotency:** the agent's tool call times out and is retried, or the worker retries. The `idempotency_key` (e.g. call id + slot) makes sure the EHR gets one appointment, not two.
- **The call drops mid-booking:** the hold expires on its own; a `pending` booking still completes and the SMS confirms it. What does the dashboard show?
- **Time zones:** the practice's timezone is the truth for "Tuesday at 9". Store UTC; convert using the practice's zone (not the server's, not the caller's).
- **Patient identity:** verify (name + date of birth) before revealing or changing anything. What if two patients share a phone number (a family)?
- **When the agent must hand off:** urgent symptoms, low confidence, the patient asks for a human, repeated misunderstanding. How does staff join with full context? (Transcript + extracted intent on the dashboard.)
- **Multi-EHR:** one internal `SchedulingProvider` interface; each EHR adapter maps its own fields and errors to ours. Adding a new EHR doesn't touch the agent.
- **Observability:** how do you know the agent booked the wrong appointment type? (Audit log, staff corrections tracked as a metric, sampled transcript review.)

## Follow-ups

- Reminders and confirmations: "Reply C to confirm, R to reschedule" texts 24 h before. What owns the timing? (Same "server owns time" answer as `design/06`.)
- Waitlist: a slot opens up from a cancellation; who gets offered it first, and how do you avoid offering it to two people?
- 8 AM Monday spike: 10× the usual calls. What scales, and what's rate-limited (the EHR)?
- Data retention: transcripts contain PHI. Encryption, retention period, access logging.

## Self-grading rubric

**Strong signals**
- Clear source of truth (the EHR) plus our own holds to prevent races.
- Idempotent booking with retries in a queue; never confirm to the patient before it's durable.
- The LLM only acts through narrow, validated tools; it never touches the EHR directly.
- A real handoff story, and a staff dashboard that shows what happened.
- Timezone handled by the practice's zone; PHI minimized and audited.
- Adapter per EHR behind one interface.

**Weak signals**
- "Check if the slot is free, then book it" with no race handling.
- The agent waits on the EHR synchronously for every question.
- No plan for the EHR being down, or retries that can double-book.
- Treating the LLM's output as trusted input to the database.
