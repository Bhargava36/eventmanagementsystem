# 🎪 AYOJAN — Unified Event Management Platform

> An enterprise-grade, high-performance Event Management System built to orchestrate **Hackathons**, **Hands-on Workshops**, **Webinars**, **Conferences**, **Coding Contests**, **Ideathons**, **Project Expos**, **Cybersecurity CTFs**, and **Esports Tournaments** with isolated workspaces, dynamic interfaces, and real-time operations.

---

## 🚀 Supported Event Types & Architectural Modules

The platform features a **Dynamic Event Engine** (`getEventTypeInfo`) that detects the event type and tailors the admin dashboards, participant workspaces, public portals, registration forms, and operational tooling dynamically.

```
                                  ┌─────────────────────────────┐
                                  │   AYOJAN Multi-Event Core   │
                                  └──────────────┬──────────────┘
                                                 │
          ┌──────────────────────┬───────────────┴──────────────┬──────────────────────┐
          ▼                      ▼                              ▼                      ▼
  ┌───────────────┐      ┌───────────────┐              ┌───────────────┐      ┌───────────────┐
  │  HACKATHONS   │      │   WORKSHOPS   │              │   WEBINARS    │      │  CONFERENCES  │
  │ • Squads 2-4  │      │ • Solo Seats  │              │ • Tech Talks  │      │ • CFP Papers  │
  │ • PS Locks    │      │ • Live QR Cam │              │ • Live Stream │      │ • Multi-Hall  │
  │ • ID / Food   │      │ • Curriculum  │              │ • Q&A Doubts  │      │ • Keynotes    │
  │ • Rounds Eval │      │ • Instructors │              │ • Recordings  │      │ • Delegates   │
  └───────────────┘      └───────────────┘              └───────────────┘      └───────────────┘
          │                      │                              │                      │
          ▼                      ▼                              ▼                      ▼
  ┌───────────────┐      ┌───────────────┐              ┌───────────────┐      ┌───────────────┐
  │CODING CONTESTS│      │   IDEATHONS   │              │ PROJECT EXPOS │      │  ESPORTS/CTF  │
  │ • Solo / Duo  │      │ • Pitch Decks │              │ • Stalls/Labs │      │ • In-Game IDs │
  │ • Leaderboard │      │ • Investor Rub│              │ • IoT Models  │      │ • Brackets    │
  │ • Speed Code  │      │ • Track Ideas │              │ • Live Rating │      │ • Flags / CTF │
  └───────────────┘      └───────────────┘              └───────────────┘      └───────────────┘
```

---

### 1. ⚡ Hackathons (Physical, Virtual & Hybrid)
Designed for multi-day collaborative engineering sprints:
- **Participant Model**: Multi-member Squads / Teams (e.g., 2–4 members) with Lead & member roles.
- **Problem Statement Engine**: Round-locked problem statements, selection limits, and custom PDF briefs.
- **Round Submissions & Judging**: Multi-round project submissions (GitHub repo, demo video, architectural slides) with custom judging rubric and live scorecard evaluation.
- **On-Campus Logistics**: Physical accommodation management, ID card canvas designer/batch printing, and food token redemption terminals with live QR scanning.
- **Virtual Hackathon Hub**: Integrated Google Meet/Zoom rooms, checkpoint announcements, and sprint roadmaps.

---

### 2. 🎓 Workshops & Hands-on Bootcamps
Engineered for skill development, masterclasses, and technical bootcamps:
- **Participant Model**: Solo Individual Attendees (1 Seat allocation per enrollment).
- **Curriculum & Schedule Manager**: Timeline of hands-on sessions, lecture timings, lab demonstrations, and meeting links.
- **Live Attendance Camera Scanner**: Built-in HTML5 QR camera scanner for organizers with instant audio chime feedback and manual overrides.
  - **Tri-State Attendance Tracking**:
    - `Present`: Verified check-in with timestamp.
    - `Absent`: Marked absent by admin.
    - `Pending / Not Taken`: Yet to check-in (cleared state).
- **Attendee Digital Pass**: Instant downloadable and scannable personal QR Pass on the participant portal.
- **Instructors & Core Faculty**: Profile showcase of lead instructors, co-instructors, and teaching assistants.
- **Learning Resources Hub**: Direct downloads for course slides, GitHub starter repos, handouts, and recordings.

---

### 3. 🎙️ Webinars & Virtual Tech Talks
Streamlined for remote knowledge sharing and alumni talks:
- **Participant Model**: Unlimited or capped remote registrations.
- **Keynote Speaker Profiles**: Industry background, bio, social links, and session topics.
- **Live Broadcast Links**: One-click join for Google Meet, Zoom, YouTube Live, or MS Teams.
- **Interactive Q&A / Doubt Portal**: Attendees submit questions in real-time; speakers and organizers can upvote and resolve them.
- **Archive & Distribution**: Post-session video recording archive, downloadable presentation slides, and instant verifiable E-Certificates.

---

### 4. 🏛️ Conferences & Academic Seminars / Symposiums
Tailored for colleges, research institutes, and professional bodies:
- **Call for Papers (CFP)**: PDF paper submission, peer-review routing, and acceptance/rejection status.
- **Multi-Track / Multi-Hall Schedules**: Parallel track agendas (e.g., Hall A: AI & Data Science, Hall B: VLSI & Embedded Systems).
- **Keynote & Chief Guest Management**: Formal introductions, honorary keynote cards, and session chairs.
- **Delegate Passes**: Official conference badges with college/institution branding.

---

### 5. 💻 Coding Contests & Speed Programming (CodeSprints)
Built for algorithmic challenges and competitive coding:
- **Participant Model**: Individual contestants or pairs.
- **Contest Linking**: Seamless redirects and token passing to HackerRank, LeetCode, CodeChef, or custom judge links.
- **Contest Rules & Constraints**: Time limits, penalty systems, and allowed programming languages.
- **Live Leaderboard**: Real-time ranks, problem solve counts, and milestone badges.

---

### 6. 💡 Ideathons & Startup Pitch Competitions
Tailored for early-stage startup incubation, B-plan competitions, and innovation days:
- **Pitch Deck Upload**: PPTX/PDF presentation decks, business model canvases, and executive summaries.
- **Domain Categories**: FinTech, HealthTech, AgriTech, Clean Energy, EdTech, and Open Innovation.
- **Investor & Jury Scoring**: Multidimensional scoring (Feasibility, Market Size, Innovation, Presentation & Scalability).
- **Mentor Feedback**: Private feedback notes and investor connection requests.

---

### 7. 🔬 Project Expos & Capstone Showcases
Built for engineering exhibitions, hardware demonstrations, and science fairs:
- **Stall & Booth Allocation**: Department, lab room, and stall number assignments (e.g., Stall #E-14).
- **Model Requirements**: Hardware specifications (230V AC socket, Wi-Fi, table space, projector).
- **Demonstration Media**: Working prototype video clips and poster uploads.
- **Visitor & Evaluator Scoring**: Digital evaluation rubrics for on-site judges.

---

### 8. 🛡️ Cybersecurity CTF (Capture The Flag)
Designed for ethical hacking and security challenges:
- **Categories**: Web Exploitation, Cryptography, Reverse Engineering, Forensics, and OSINT.
- **Flag Verification**: Automatic cryptographic SHA-256 hash validation for submitted flags.
- **Dynamic Score Decay**: Points decrease as more solvers submit the correct flag.

---

### 9. 🎮 Esports & Gaming Tournaments
Built for competitive LAN gaming and online leagues (BGMI, Valorant, FIFA, FreeFire):
- **Gamer Roster**: In-Game Names (IGN), Player IDs, and Discord usernames.
- **Tournament Brackets**: Single-elimination / double-elimination knockout trees.
- **Match Broadcasting**: Automated Room ID and password delivery to qualified squads.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS (Design System Tokens), Framer Motion |
| **Icons & Media** | Lucide React, HTML5-QRCode, QRCode.react, Canvas API |
| **Typography** | Playfair Display (Luxury display serif), Quicksand (Clean modern body) |
| **Backend** | Node.js, Express.js, MySQL (Connection Pooling) |
| **Authentication** | JWT (JSON Web Tokens), Role-Based Access Control (`Admin`, `SuperAdmin`, `User`, `Evaluator`) |
| **Realtime** | Custom events, Web Audio API (sound feedback), WebSockets/Storage bus |

---

## 📁 Repository Structure

```
├── backend/
│   ├── server.js                          # Express application entry point
│   └── src/
│       ├── config/                        # Database connection pool & environment
│       └── modules/
│           ├── admins/                    # Admin auth, profiles & workspaces
│           ├── events/                    # Event lifecycle & configuration
│           ├── workshops/                 # Sessions, attendance & resources API
│           ├── teams/                     # Team formation & roster API
│           ├── problem_statements/        # PS tracks & brief management
│           ├── feedback/                  # Event-isolated attendee reviews
│           └── id_cards/                  # Digital pass & canvas generator
│
└── ems_client/
    ├── src/
    │   ├── app/App.jsx                    # Client router & role protection
    │   ├── components/                    # Atoms, Molecules & Organisms (Sidebar, Nav)
    │   ├── features/
    │   │   ├── auth/                      # Login, registration & account security
    │   │   ├── public/                    # Explore events, home & event landing details
    │   │   ├── id_card/                   # ID Card Designer & generator
    │   │   └── auth/pages/
    │   │       ├── Admin/                 # Admin Dashboard, Settings, Attendance, Sessions
    │   │       └── Users/                 # Participant Dashboard, Team Workspace, Passes
    │   └── lib/utils.js                   # getEventTypeInfo dynamic event engine
    └── package.json
```

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server (v8 or higher)

### 1. Database Setup
Ensure MySQL is running with the AYOJAN schema:
```sql
CREATE DATABASE IF NOT EXISTS event_management;
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ems_client
npm install
npm run dev
# Application will run on http://localhost:5173
```

---

## 🔒 Design System & Aesthetics
- **Theme Principle**: Strict website theme compliance with solid obsidian dark mode (`#000000`), crisp zinc borders (`border-zinc-800`), and emerald accents (`text-emerald-500`, `bg-emerald-600`).
- **No Random Gradients**: Clean, solid, high-contrast surfaces without gradients.
- **No Pill Shapes**: Professional structured geometries (`rounded-xl` and `rounded-2xl` instead of `rounded-full`).
- **Fluid Micro-Animations**: Powered by Framer Motion for interactive engagement.

---

## 📄 License
This project is proprietary and confidential. Maintained for institutional & technical event management.