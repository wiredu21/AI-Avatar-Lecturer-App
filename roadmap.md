# VirtuAId Roadmap

## Phase 1: Planning & Setup (Q3 2025)
- **Finalise MVP Scope**
  - [x] Define core features (user auth, avatar customisation, AI chat, web scraping).
  - [x] Prioritise University of Northampton and Computer Science for MVP.
- **Tech Stack Setup**
  - [x] Set up Django backend with MySQL.
  - [x] Initialise React frontend with Tailwind CSS.
  - [x] Configure Llama 3 for local development.

---

## Phase 2: MVP Development (Q3-Q4 2025)
### Milestone 1: User Authentication & Onboarding
- [ ] **User Registration/Login**
  - Implement email/password auth with Django’s `django.contrib.auth`.
  - Add email verification via SendGrid.
- [ ] **Onboarding Flow**
  - Build "About You" page (personal details form).
  - Create university/course selection dropdowns (pre-populated with MVP data).

### Milestone 2: AI Integration
- [ ] **Llama 3 API Setup**
  - Host Llama 3 locally.
  - Build DRF endpoints for query handling.
- [ ] **Response Validation**
  - Add backend filtering for off-topic queries.
  - Implement fallback messages.

### Milestone 3: Content Delivery
- [ ] **Web Scraping Pipeline**
  - Build scrapers for University of Northampton’s news/events pages (BeautifulSoup/Selenium).
  - Schedule daily scraping tasks with Celery.
- [ ] **Database Integration**
  - Store scraped content in `UniversityContent` table.

### Milestone 4: Avatar & Chat Interface
- [ ] **Avatar Customisation**
  - Integrate 8 pre-built avatars (4 male/4 female).
  - Add voice selection (male/female) with Coqui TTS.
- [ ] **Chat UI**
  - Build text/voice input interface (Web Speech API).
  - Display responses as text + synthesised speech.

### Milestone 5: Dashboard & Profile
- [ ] **Dashboard**
  - Develop sidebar navigation (Chat History, University Updates).
  - Add real-time avatar animations (Lottie/Rhubarb Lip Sync).
- [ ] **Profile Management**
  - Enable GDPR-compliant data edits/deletion.

---

## Phase 3: Post-MVP (Q4 2023-Q1 2026)
### Testing & Deployment
- [ ] **Performance Testing**
  - Use Locust/JMeter to ensure <2s response times.
- [ ] **Security Audits**
  - Implement data encryption and GDPR compliance checks.
- [ ] **Deployment**
  - Host on Vercel.
  - Set up CI/CD with GitHub Actions.

### Initial User Feedback
- [ ] **Closed Beta**
  - Test with 50 University of Northampton Computer Science students.
  - Collect feedback on response accuracy and UX.

---

## Phase 4: Future Enhancements (2026+)
### Feature Expansion
- [ ] **Multi-University Support**
  - Add 5+ UK universities.
- [ ] **Course Expansion**
  - Include 10+ courses (e.g., Engineering, Business).
- [ ] **Advanced AI**
  - Fine-tune Llama 3 for academic contexts.
  - Add LMS integration (e.g., Moodle).

### Monetisation
- [ ] **Subscription Tiers**
  - Launch free (basic) and premium (advanced avatars, priority support) tiers.

### Scalability
- [ ] **Cloud Migration**
  - Host Llama 3 on AWS SageMaker.
  - Scale MySQL to AWS RDS.

---

## Key Metrics
- **Q3 2023:** MVP feature completion.
- **Q4 2023:** 90% response accuracy for Computer Science queries.
- **Q1 2024:** 1,000 active users.
- **2024:** Expand to 5 universities and 10 courses.