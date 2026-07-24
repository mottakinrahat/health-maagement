# 🏥 AI-Powered Online Hospital Management System — Project Documentation

An **AI-powered online hospital management platform** that connects patients with doctors efficiently. The system uses **Artificial Intelligence** to recommend doctors based on user search interests and medical needs.


# Online Hospital Management System — Project Documentation

**Document Version:** 1.0
**Prepared by:** Md. Mottakin Rahat
**Status:** Draft / In Development

---

## 1. Project Overview

**Project Name:** Online Hospital Management System (OHMS)

**Purpose:** A platform that connects patients with doctors for remote consultation. Admins manage doctor availability, patients book time slots, consultations happen over video call, and doctors issue prescriptions/documents afterward. An AI chatbot gives patients a fallback for questions when no doctor is available.

**Primary User Roles:**
| Role | Responsibility |
|---|---|
| Admin | Creates and manages doctor slots, manages doctor accounts, oversees platform operations |
| Doctor | Views assigned slots, conducts video consultations, uploads prescriptions/documents |
| Patient | Browses available slots, books appointments, joins video calls, views prescriptions, chats with the AI assistant |

> This section is the "elevator pitch" of the doc — anyone (client, new dev, investor) should understand the product in 30 seconds from reading just this.

---

## 2. Problem Statement & Objectives

**Problem:** Patients often can't access a doctor quickly, and doctors' available time isn't visible or organized in one place. Post-consultation records (prescriptions, reports) are scattered and hard to retrieve.

**Objectives:**
- Give patients real-time visibility into doctor availability
- Make booking a slot simple and conflict-free
- Enable remote consultation via video call
- Centralize each patient's prescriptions/documents for easy retrieval
- Provide an always-available AI assistant grounded in the patient's own medical history

---

## 3. Core Features (Functional Requirements)

### 3.1 Doctor Slot Management (Admin)
- Admin creates time slots per doctor
- Each slot = 30 minutes (fixed duration)
- Admin can view, edit, cancel slots
- **Acceptance criteria:** Overlapping slots for the same doctor must not be allowed; slot creation requires doctor ID, date, start time.

### 3.2 Slot Visibility & Booking (Patient)
- Patients see a doctor's slot list/calendar
- Slot status is either `Available` or `Booked`
- Booking a slot instantly flips its status (real-time, no double-booking)
- **Acceptance criteria:** Two patients must never be able to book the same slot (needs a DB-level unique constraint or transaction lock, not just frontend disabling).

### 3.3 Video Consultation
- Once a slot is booked, a video call room is generated for that booking
- Doctor and patient join at the scheduled time
- **Acceptance criteria:** Room access should be restricted to the doctor + patient tied to that specific booking ID only.

### 3.4 Prescription & Document Upload
- After consultation, doctor uploads prescription(s) and any supporting documents
- Documents are linked to the specific patient and specific consultation/booking

### 3.5 RAG-Based Document Storage
- Uploaded documents are processed and stored using RAG (Retrieval-Augmented Generation)
- Storage/retrieval is indexed **by patient ID**, so each patient's full document history can be pulled independently
- This same store is the knowledge base the chatbot (3.6) draws from

### 3.6 AI Chatbot (Patient Self-Consultation)
- Patient can chat with a bot about their condition when no doctor is available
- Bot answers using RAG retrieval over that patient's own uploaded documents/history (not generic medical advice)
- **Recommended addition:** a clear disclaimer + escalation path (e.g., "this isn't a diagnosis, book a doctor for X") so the bot doesn't get treated as a replacement for real medical care — worth flagging to the client/stakeholders explicitly.

---

## 4. System Architecture (High-Level)

```
                         ┌────────────────────┐
                         │      Patient App     │
                         │   (Next.js Web/App)  │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │     API Gateway /     │
                         │   NestJS Backend      │
                         └──────────┬──────────┘
              ┌─────────────┬───────┴───────┬──────────────┐
              │             │               │              │
     ┌────────▼───────┐ ┌───▼─────┐ ┌───────▼──────┐ ┌─────▼──────┐
     │ Slot & Booking  │ │  Video  │ │  Document /   │ │  Chatbot   │
     │    Service      │ │  Call   │ │  RAG Storage  │ │  Service   │
     │  (PostgreSQL)   │ │ (Agora/ │ │ (Vector DB +  │ │ (LLM API + │
     │                 │ │ Twilio) │ │  Object store)│ │  RAG layer)│
     └─────────────────┘ └─────────┘ └───────────────┘ └────────────┘
```

*(Swap in whichever video SDK and vector DB you actually pick — Agora/Twilio/Daily.co for video, Pinecone/Weaviate/pgvector for the vector store.)*

---

## 5. Suggested Tech Stack

| Layer | Suggestion |
|---|---|
| Frontend | Next.js |
| Backend | NestJS / Node.js |
| Primary DB | PostgreSQL (Prisma ORM) — slots, bookings, users |
| Document/Chat metadata | MongoDB (flexible schema for chat logs, doc metadata) |
| Vector store (RAG) | pgvector / Pinecone / Weaviate |
| Video call | Agora, Twilio Video, or Daily.co |
| LLM for chatbot | Any RAG-compatible LLM API |
| File storage | S3-compatible bucket (documents, prescriptions) |

---

## 6. Database Schema (Entity Outline)

```
Users            (id, name, email, role[admin/doctor/patient], ...)
Doctors          (id, user_id, specialization, ...)
Slots            (id, doctor_id, date, start_time, end_time, status[available/booked])
Bookings         (id, slot_id, patient_id, status, created_at)
Consultations    (id, booking_id, video_room_id, started_at, ended_at)
Documents        (id, patient_id, consultation_id, file_url, type[prescription/report], uploaded_at)
DocumentEmbeddings (id, document_id, patient_id, vector, chunk_text)
ChatSessions     (id, patient_id, started_at)
ChatMessages     (id, session_id, sender[patient/bot], message, created_at)
```

---

## 7. Key Workflows (Sequence Summaries)

**A. Booking Flow**
`Patient views slots → selects available slot → confirms booking → slot status = booked → confirmation shown/sent → both doctor & patient notified`

**B. Consultation Flow**
`Scheduled time reached → video room activated → doctor & patient join → consultation happens → doctor ends session`

**C. Prescription Flow**
`Doctor uploads prescription/report → tagged with patient_id + consultation_id → document embedded & stored in RAG store → visible in patient's history`

**D. Bot Consultation Flow**
`Patient opens chatbot → bot retrieves that patient's document history via RAG → generates contextual response → (recommended) offers to book a real doctor if the issue seems beyond self-consultation scope`

---

## 8. Non-Functional Requirements

- **Data privacy & security:** Medical data is sensitive — encrypt documents at rest and in transit, restrict document/chat access strictly to the owning patient + their doctor, log access.
- **Compliance:** Depending on target market, check applicable health-data regulations (e.g., HIPAA-style rules in the US, or local equivalents) — flag this to the client early since it affects storage/hosting choices.
- **Scalability:** Slot booking must handle concurrent booking attempts safely (DB transactions/locking).
- **Availability:** Video consultation and chatbot should degrade gracefully (e.g., if video service is down, still allow chatbot access).

---

## 9. Testing Strategy

| Type | Focus |
|---|---|
| Unit tests | Slot creation logic, booking conflict checks |
| Integration tests | Booking → video room creation → document upload chain |
| Load tests | Concurrent booking attempts on the same slot |
| Manual QA | Video call quality, chatbot answer relevance |

---

## 10. Deployment Notes

- Separate environments: Dev / Staging / Production
- CI/CD pipeline for backend + frontend
- Document/vector store should be backed up independently (medical records = high value data)

---

## 11. Future Roadmap (Optional Section)

- Doctor rating/review system
- Multi-language support for chatbot
- Insurance/payment integration
- Push notifications for upcoming appointments

---

## 12. Glossary

- **RAG (Retrieval-Augmented Generation):** Technique where the AI retrieves relevant stored documents before generating an answer, so responses are grounded in real data instead of generic knowledge.
- **Slot:** A fixed 30-minute time window during which a doctor is available for consultation.
