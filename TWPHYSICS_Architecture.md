# TWPHYSICS — Complete Platform Architecture

**A NEET / IIT-Mains online coaching platform for English-medium students, with faculty teaching in a natural Telugu-English mixed spoken style (regional connect through delivery, not through the platform UI), inspired by Physics Wallah's model, built on Next.js + Supabase + Vercel.**

---

## 0. Product Philosophy (Why This Doc Looks Like This)

Physics Wallah didn't win because of features — it won because of **trust at scale + visible proof + emotional accessibility**. Before any schema or dashboard, the platform must be built around these psychological levers:

1. **Affordability as identity** — PW's core message is "quality education shouldn't be a luxury." TWPHYSICS should carry this same tone — pricing shown transparently, no hidden fees, EMI options visible upfront.
2. **Social proof at every scroll** — student counts, results, AIR/rank holders, "X students currently enrolled," live class attendance counters. Numbers convert better than adjectives.
3. **Face of trust** — a founding faculty figure (the "Alakh Pandey" equivalent) humanizes the brand. Faculty photos, credentials, and short video intros build parent trust — parents are often the actual buyers, not the student.
4. **Free-to-paid funnel** — PW built its empire on free YouTube content before monetizing. TWPHYSICS should have a free tier (sample classes, free PDFs, one free mock test) that captures leads before the purchase decision.
5. **Urgency without being sleazy** — batch seats filling up, enrollment deadlines, early-bird pricing. Real scarcity (batch capacity), not fake countdown timers.
6. **Regional trust signal** — the platform UI and content stay professional, standard English (this is an English-medium product), but faculty teach live classes in a natural Telugu-English mixed spoken style, plus local exam context (EAPCET alongside NEET/JEE framing) — this signals "this is built for us" through delivery and faculty relatability rather than through the website itself.
7. **Parent-facing reassurance** — parents want to see structure: syllabus plans, attendance, test scores. A results/progress view that's shareable or visible builds parent confidence and reduces churn.

Every feature below should be read through this lens: **does this build trust, prove outcomes, or reduce friction to pay?**

---

## 1. Tech Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript | SSR/ISR for SEO on public pages, one codebase for 3 dashboards via route groups |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, accessible components; clean, professional English-medium UI |
| Backend | Supabase (Postgres, Auth, RLS, Storage, Edge Functions, pg_cron, Realtime) | One platform for DB + auth + storage + serverless functions + scheduled jobs |
| Hosting | Vercel | Native Next.js integration, edge network, preview deployments |
| Payments | Razorpay (primary) | UPI/netbanking/wallets dominant in this market; supports EMI; better than Stripe for India |
| Video (Live) | Google Meet / YouTube Live (unlisted) embed, evaluate 100ms/Agora later | Don't build a custom RTC layer initially — reliability > control |
| Video (Recorded) | Bunny.net Stream or Mux (NOT Supabase Storage) | Supabase Storage isn't built for adaptive video streaming/bandwidth at scale; signed URLs prevent link leeching |
| Documents/Images | Supabase Storage (buckets, RLS-scoped) | Study material PDFs, profile photos, ID proofs, question papers |
| Notifications | Resend (email) + Supabase Realtime (in-app) + WhatsApp Business API (Gupshup/Interakt) — phase 2 | WhatsApp is the highest-reach channel for this demographic — flag as strong recommendation |
| Validation | Zod (shared schemas, frontend + Edge Functions) | Single source of truth for field rules; defense-in-depth alongside RLS |
| Testing | Vitest (unit/logic), Playwright (E2E per role), pgTAP (RLS/policy tests) | RLS bugs are data leaks — must be tested like security code, not just UI |
| Monitoring | Vercel Analytics + Sentry | Error tracking and performance monitoring from day one |
| Search/SEO | Next.js metadata API, sitemap.xml, structured data | Public course pages need to rank for "NEET/IIT coaching Telangana/AP" type queries |

---

## 2. High-Level System Architecture

```
                          ┌─────────────────────┐
                          │   Public Website     │
                          │  (Next.js, SSR/ISR)  │
                          │  Marketing + SEO      │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
             ┌──────▼─────┐  ┌───────▼──────┐  ┌──────▼──────┐
             │   Admin     │  │    Tutor      │  │   Student    │
             │  Dashboard  │  │  Dashboard    │  │  Dashboard   │
             └──────┬──────┘  └───────┬───────┘  └──────┬───────┘
                    │                 │                  │
                    └─────────────────┼──────────────────┘
                                      │
                        ┌─────────────▼─────────────┐
                        │   Supabase Auth (JWT)       │
                        │   Role stored in claims      │
                        └─────────────┬─────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
┌───────▼────────┐          ┌─────────▼─────────┐         ┌─────────▼─────────┐
│  Postgres + RLS  │          │  Edge Functions     │         │  Storage Buckets    │
│  (all app data)  │◄────────┤  (webhooks, cron,    │────────►│ (docs, materials,   │
│                   │          │  business logic)    │         │  profile photos)    │
└───────┬───────────┘          └─────────┬───────────┘         └─────────────────────┘
        │                                │
        │                     ┌──────────┴───────────┐
        │                     │                       │
┌───────▼────────┐  ┌─────────▼────────┐  ┌───────────▼──────────┐
│  pg_cron jobs    │  │  Razorpay webhook  │  │  Resend / WhatsApp    │
│  (attendance,     │  │  (payment→enroll)  │  │  notification sender  │
│  syllabus, expiry)│  └────────────────────┘  └────────────────────────┘
└───────────────────┘
```

---

## 3. Database Schema (Core Tables)

> Full DDL + RLS policies to be written during implementation. This is the entity map.

### Identity & Roles
- `profiles` — id (FK auth.users), full_name, phone, role (`admin`/`tutor`/`student`), avatar_url, created_at
- `admin_settings` — platform-wide config (announcement dates, feature flags)

### Tutor Pipeline
- `tutor_applications` — name, phone, email, qualifications, experience, subject, resume_url, form_source (`google_form`/`website`), status (`pending`/`approved`/`rejected`), reviewed_by, reviewed_at
- `tutor_profiles` — profile_id (FK), subjects, bio, qualifications, locked_fields (json — what's admin-only after approval), joined_at

### Courses & Batches
- `courses` — id, name (`NEET`, `IIT-MAINS`), description, base_price, duration_months, is_active
- `batches` — id, course_id, name, capacity, start_date, end_date, is_active
- `batch_tutor_assignments` — batch_id, tutor_id, start_date, end_date (nullable = active) — **history preserved, never deleted**
- `batch_students` — batch_id, student_id, joined_at, left_at (nullable)

### Enrollment & Payments
- `enrollments` — id, student_id, course_id, batch_id, purchase_date, duration_months, expiry_date, status (`active`/`expired`/`cancelled`), payment_id
- `payments` — id, enrollment_id, razorpay_order_id, razorpay_payment_id, amount, status, method, created_at
- `coupons` — code, discount_type, discount_value, valid_from, valid_to, usage_limit, used_count

### Syllabus & Content
- `syllabus` — id, course_id, batch_id, topic, subject, deadline, order_index, created_by (admin)
- `syllabus_progress` — syllabus_id, batch_id, status (`not_started`/`in_progress`/`completed`), updated_by (tutor), updated_at
- `study_materials` — id, batch_id, tutor_id, title, file_url (storage), type (`pdf`/`notes`/`link`), uploaded_at
- `class_schedule` — id, batch_id, tutor_id, subject, topic, start_time, end_time, meeting_link, recording_url (nullable, added post-class)
- `class_attendance` — class_id, student_id, attended (bool), joined_at
- `class_notes` — id, class_id, student_id, content, created_at, updated_at (student's private notes — editable/deletable)

### Exams & Results
- `exams` — id, batch_id, title, subject, exam_date, start_time, end_time, duration_minutes, total_marks, result_announce_date, is_published
- `exam_questions` — exam_id, question_text, options (json), correct_option, marks
- `exam_results` — exam_id, student_id, score, rank_in_batch, attempted_at, is_visible (gated by result_announce_date)
- `mcq_practice_sets` — id, subject, topic, created_by
- `leaderboard_snapshot` — batch_id, student_id, total_score, rank, computed_at (materialized periodically)

### Tracking, Flags & Automation
- `student_tags` — student_id, batch_id, tag (`focus_needed`/`weak`/`topper`), tagged_by (tutor), tagged_at, note
- `flags` — id, student_id, type (`missed_class`/`missed_exam`/`syllabus_behind`/`inactive`/`expiring_soon`), batch_id, detected_at, resolved_at, resolved_by
- `activity_logs` — id, actor_id, actor_role, action, table_name, record_id, before_data (json), after_data (json), created_at — **append-only, global audit trail**

### Communication
- `broadcasts` — id, batch_id, sender_id (tutor/admin), message, sent_at
- `broadcast_reads` — broadcast_id, student_id, read_at
- `notifications` — id, user_id, type, title, message, is_read, created_at, related_entity_id
- `issues` — id, raised_by (student/tutor), role, subject, description, status (`open`/`in_progress`/`resolved`), assigned_to (admin), created_at, resolved_at
- `issue_comments` — issue_id, author_id, comment, created_at

---

## 4. Row-Level Security Strategy

- **Admin**: bypass-all policy (`is_admin()` check via role claim) on every table.
- **Tutor**: read/write scoped to `batch_id IN (SELECT batch_id FROM batch_tutor_assignments WHERE tutor_id = auth.uid() AND end_date IS NULL)`. Historical batches (post-reassignment) become read-only for the old tutor.
- **Student**: read own rows only (`student_id = auth.uid()`), plus read-only access to batch-scoped public data (batch-mates list — name only, not full profile; leaderboard; broadcasts for their batch).
- **Storage buckets**: separate buckets per purpose (`study-materials`, `profile-photos`, `id-documents`, `tutor-resumes`), each with policies mirroring table-level RLS — e.g., study materials bucket readable only by students with an active enrollment in that batch.
- **Exam results**: `is_visible` flag + `result_announce_date` check baked into the RLS policy itself, not just UI hiding — a student querying early gets zero rows, not a hidden button.

---

## 5. Automation Engine (pg_cron + Edge Functions)

| Job | Frequency | Logic | Resulting Action |
|---|---|---|---|
| Attendance sweep | Nightly | Compare `class_attendance` vs `class_schedule` per enrolled student | Insert `flags` row (`missed_class`), notify tutor + admin |
| Syllabus deadline check | Daily | `syllabus.deadline < now()` AND `syllabus_progress.status != completed` | Flag batch as "behind," dashboard badge for admin + tutor |
| Exam absence check | After exam window closes | Roster vs `exam_results` diff | Flag `missed_exam`, notify admin |
| Result auto-publish | Daily, checks `result_announce_date = today` | Set `is_visible = true` on `exam_results` | Notify all students in batch that results are live |
| Enrollment expiry | Daily | `enrollments.expiry_date` approaching (7/3/1 day) or passed | Notify student (renewal), auto-revoke access on expiry |
| Inactivity detector | Weekly | No login / no class access in N days | Flag `inactive`, surfaced to tutor + admin |
| Leaderboard recompute | After each exam result publish | Aggregate scores per batch | Update `leaderboard_snapshot` |

All jobs write to `activity_logs` too, so the automation itself is auditable.

---

## 6. Homepage & Public Site (Psychology-Driven Structure)

Order matters — this sequence is deliberately modeled on what converts in this category:

1. **Hero section** — bold, professional value prop in English ("NEET & IIT Preparation, Made Accessible to Everyone"), primary CTA "Start Free Demo," secondary CTA "Explore Courses."
2. **Live stats bar** — students enrolled, classes conducted, average rank improvement — real numbers pulled from DB (auto-updating, not hardcoded).
3. **Founder/Faculty spotlight** — short video or photo + credentials of lead faculty, builds the "guru" trust PW relies on.
4. **Course cards** — NEET and IIT-Mains, each with: what's included, duration options, price (with EMI note), "Enroll Now."
5. **Free resources strip** — free demo class, free PDF notes, free mock test — lead capture before purchase decision.
6. **Results wall** — topper photos, rank, score, testimonial quote — the single highest-converting section for coaching platforms.
7. **How it works** — 3–4 step visual: Enroll → Get Batch & Tutor → Attend Live Classes → Track Progress & Results.
8. **Testimonials carousel** — video/text, in English, from real students.
9. **Batch showcase** — current open batches with seats-left indicator (real capacity data, not fake urgency).
10. **FAQ accordion** — addresses parent objections: refund policy, class timings, doubt-clearing, faculty background.
11. **Footer** — contact, social proof (YouTube subs if applicable), policies (refund/privacy/terms), regional trust markers (address, phone, WhatsApp).

**Additional homepage/site ideas not in the original brief:**
- **Free scholarship/entrance test** — a graded test that determines a discount tier. This is a proven PW-style funnel: it's genuinely useful AND creates a lead + urgency to enroll before the "scholarship" expires.
- **AI/chatbot FAQ widget** — instant answers to common parent/student questions (timings, fees, syllabus) reduces drop-off before a human ever needs to call.
- **Blog / NCERT-solutions style SEO content in English** — long-term organic traffic engine, exactly how PW built its early free-user base via YouTube; here it's English blog content on NEET/JEE topics, targeted at the regional student base.
- **"Talk to us on WhatsApp" floating button** — far higher response rate than a contact form for this audience.
- **Referral program** — student refers a friend, both get a discount — low-cost acquisition channel worth adding to roadmap.

---

## 7. Dashboard Feature Specification

### 7.1 Admin Dashboard

**Overview / Home**
- Key metrics: total students, active enrollments, revenue this month, open issues, flagged students count, batches behind on syllabus
- "Needs attention" panel: flagged students, overdue syllabus, unresolved issues — single glanceable widget

**User Management**
- Full CRUD on all users (students, tutors, admins)
- Tutor application queue: view submissions (from Google Form sync or website form), verify details/documents, approve/reject → auto-provisions tutor account on approval
- Student directory: search/filter by batch, course, status; manual student add (for the "finish on call" case); view full profile + enrollment + payment history

**Batch & Course Management**
- Create/edit/delete courses (NEET, IIT-Mains) and batches
- Assign/reassign tutor to batch — triggers automatic batch-wide notification ("Your tutor has been changed to X"); history preserved via `batch_tutor_assignments`
- Set batch capacity, view seats filled/available

**Syllabus Management**
- Create syllabus per course/batch with topic-level deadlines
- View completion status across all batches (rollup of tutor-marked progress)

**Exam Management**
- Create exam per batch: subject, date, time slot, duration, question upload (manual or bulk CSV import)
- Set `result_announce_date` — results are stored on grading but gated until this date (enforced at RLS level)
- Publish/override announce date manually if needed
- View full result analytics per batch (average, topper, distribution)

**Activity & Audit**
- Global activity log — every create/update/delete across the platform, filterable by actor/table/date range
- Exportable for compliance/review

**Issue Management**
- Inbox of all issues raised by students and tutors, assign/resolve, comment thread

**Cross-cutting visibility**
- Flagged students (all types), toppers list, syllabus status — all filterable by batch/tutor/course
- Full override capability — admin can edit/delete literally any record in the system (with activity log capturing the override)

**Content & Marketing (recommended addition)**
- Manage homepage content (testimonials, banners, offers) without needing a code deploy — a lightweight CMS table admin can edit
- Manage coupons/discounts

### 7.2 Tutor Dashboard

**Overview / Home**
- My batches summary, upcoming classes, pending syllabus items, unread broadcasts/issues raised by own students needing response

**My Batches**
- List of assigned batches (active only — reassigned-away batches move to a "past batches" read-only view, data intact)
- Student roster per batch with drill-down profile (attendance %, exam scores, tags, notes)

**Communication**
- Broadcast messaging — strictly batch-scoped by RLS; message history persists even after tutor reassignment (new tutor sees prior broadcast history for context, old tutor's messages remain attributed to them)
- Respond to student-raised issues within their batch (before admin escalation if applicable)

**Syllabus Tracking**
- View assigned syllabus with deadlines, mark topic status (not started/in progress/completed)
- Overdue items auto-highlighted (fed by the automation engine)

**Study Material**
- Upload PDFs/notes/links per batch (stored in Supabase Storage, RLS-scoped to enrolled batch students)

**Student Tagging**
- Tag students: needs focus / weak / topper — per batch, with optional note
- View own flagged/tagged students list

**Exams**
- View results for own batches once published
- (Optional, admin-permission-gated) propose exam questions for admin review

**Profile Settings**
- Editable: phone, photo, availability, bio
- Locked post-approval: name, qualifications, subject certification — admin-only edit, with a "request change" flow that notifies admin

### 7.3 Student Dashboard

**Overview / Home**
- Upcoming classes, latest announcement, current syllabus progress %, quick links to notes/results

**My Course**
- Enrollment details, duration/expiry countdown, renewal CTA when nearing expiry
- Batch-mates list (name + optional photo, no sensitive info exposed)
- Assigned tutor profile (public-safe fields only)

**Classes**
- Class schedule (calendar + list view), join live class link at scheduled time
- Recordings library (via Bunny/Mux signed URLs) with search/filter by topic
- In-class/post-class **notes**: create, edit, delete, tied to specific class — persisted per student, private

**Exams & Results**
- Upcoming exams with time slots
- Results — visible only after `result_announce_date`; score, rank in batch, correct/incorrect breakdown
- MCQ practice sets for self-study

**Leaderboard**
- Batch leaderboard and (optional) cross-batch leaderboard, based on exam + MCQ performance

**Progress Tracking**
- Syllabus completion view (read-only, mirrors tutor's tracking)
- Attendance history

**Issues**
- Raise an issue (technical, academic, billing) → routed to admin, status-tracked, notified on resolution

**Profile Settings**
- Editable: phone, photo, address
- Locked: name, enrolled course/batch (admin-only)

---

## 8. Payment & Enrollment Flow

1. Student lands on course page → selects course → fills details form (Zod-validated, sanitized server-side)
2. Razorpay checkout initiated (order created server-side via Edge Function — never trust client-side amount)
3. Razorpay webhook → Edge Function verifies signature → on success: creates `enrollments` row, `payments` row, sends welcome notification (email + in-app, WhatsApp phase 2)
4. New enrollment surfaces immediately on admin dashboard ("newly added students" queue) — admin can call to complete batch assignment if not auto-assigned
5. If auto-assignment enabled: system assigns to the batch with available capacity matching course + preferred timing
6. On enrollment `expiry_date`: automation revokes access, prompts renewal

**Recommended additions:**
- EMI/installment support via Razorpay's native EMI options — reduces price friction, PW-proven tactic
- Refund/cancellation policy enforced via a `refund_requests` table + admin approval flow, not ad-hoc

---

## 9. Security, Validation & Testing

**Field sanitization**
- All form inputs validated with Zod schemas — shared between client and Edge Functions (single source of truth)
- Server-side re-validation always (never trust client) — phone number format, email format, file type/size limits on uploads
- SQL injection non-issue via Supabase client/parameterized queries, but still sanitize before any dynamic query construction
- Rate limiting on public forms (course purchase, issue raising, contact) to prevent abuse — via Vercel Edge Middleware or Upstash Redis

**RLS testing**
- pgTAP test suite: for each table, assert a tutor cannot read/write outside their batch, a student cannot read another student's private data, an unauthenticated user gets zero rows
- Run RLS tests in CI on every schema migration — this is non-negotiable given the sensitivity of student/payment data

**Application testing**
- Vitest: automation logic (flag detection, expiry calculation, leaderboard computation) — these are pure functions, easy to unit test and critical to get right
- Playwright E2E: one full flow per role — student purchase → enrollment → class → exam → result; tutor onboarding → approval → batch assignment; admin CRUD + reassignment flow
- Webhook signature verification tested explicitly (payment security)

**Data protection**
- ID documents/resumes in private storage buckets, never public URLs
- Video content behind signed, time-limited URLs (anti-piracy — prevents link sharing outside the platform)
- Regular automated Postgres backups (Supabase built-in) + documented restore process

---

## 10. Notifications Architecture

- **In-app**: Supabase Realtime subscription per user, notification bell with unread count
- **Email**: Resend, transactional templates (welcome, payment receipt, result announcement, issue update)
- **WhatsApp (recommended, phase 2)**: class reminders, result announcements, renewal reminders — highest open-rate channel for this audience
- All notifications logged in `notifications` table regardless of channel, so in-app history is always complete even if email/WhatsApp delivery fails

---

## 11. Additional Features Recommended (Beyond Original Brief)

These fill gaps identified from the PW model and general platform robustness:

1. **Free scholarship test funnel** — lead gen + discount mechanism, proven conversion driver
2. **Referral program** — low-cost growth channel
3. **WhatsApp integration** — class reminders, results, renewal — matches regional user behavior far better than email-only
4. **Doubt-clearing / Q&A section** — students post subject-wise doubts, tutors respond (or a forum-style peer + tutor answer model) — directly addresses a known PW pain point (doubt resolution) as a differentiator
5. **Gamification** — streaks (consecutive days of practice/attendance), badges (topper, most improved) — increases engagement, cheap to build on top of existing attendance/exam data
6. **Parent view (optional, phase 2)** — read-only shareable link/report showing attendance + progress + results, builds the parent trust layer PW leans on heavily
7. **Mobile-first PWA** — installable, offline-capable for notes/recordings viewing, since much of this audience is mobile-primary
8. **Content protection** — video watermarking (student ID/email overlay) on recordings to discourage piracy/sharing
9. **Class recording language tags** — tag recordings/materials by the topic language mix if ever needed for search, but the platform UI itself stays English-only throughout
10. **Coupon/discount engine** — already in schema, surfaced properly in checkout UI
11. **Batch waitlist** — when a batch hits capacity, students can join a waitlist and get notified if a seat opens
12. **Downloadable study material tracking** — know what's actually being used, feed into future content decisions
13. **Terms, Privacy Policy, Refund Policy pages** — required for Razorpay merchant compliance and basic legal hygiene
14. **AI-assisted doubt bot (future)** — a scoped FAQ/topic-help chatbot trained on the syllabus content, reduces tutor load for repetitive questions

---

## 12. Deployment & Environments

- **Environments**: local (Supabase CLI + local Postgres), staging (Supabase project + Vercel preview), production (Supabase project + Vercel production)
- **CI/CD**: GitHub Actions — run Vitest + Playwright + pgTAP on every PR; deploy preview via Vercel automatically; production deploy on merge to `main` with manual approval gate
- **Migrations**: Supabase CLI migration files, version-controlled, applied via CI — never manual production schema edits
- **Secrets**: Razorpay keys, Resend API key, storage service keys — all in Vercel/Supabase environment variables, never client-exposed except publishable keys

---

## 13. Build Phasing (Recommended Order)

1. **Foundation**: Supabase schema + RLS policies + auth + role-based routing skeleton
2. **Admin core**: user management, course/batch CRUD, tutor approval pipeline
3. **Public site + payment**: homepage, course pages, Razorpay integration, enrollment flow
4. **Tutor + Student dashboards**: batch views, syllabus, study material, class schedule
5. **Exams + results**: creation, grading storage, gated announcement
6. **Automation engine**: pg_cron jobs for flags, expiry, syllabus tracking
7. **Communication**: broadcasts, notifications, issue raising
8. **Polish**: leaderboard, notes, tagging, activity log UI, testing pass, performance/SEO pass
9. **Phase 2**: WhatsApp integration, referral program, scholarship test funnel, parent view, PWA

---

*This document is the architectural foundation for implementation. Each section (schema, RLS policies, API contracts, component structure) should be expanded into detailed specs as build begins.*
