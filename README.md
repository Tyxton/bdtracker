# bdtracker

** Bipolar Disorder Tracking | Clinical Insight | Local-First Security **

`bdtracker` is a self-hosted web application designed to convert raw journaling and daily metric tracking into clinically actionable insights.

---

> **[!] CURRENTLY IN DEVELOPMENT [!]**

## Project Overview

This project is being built out of a direct need to streamline therapy and psychiatry sessions. Handing off a long, raw `.org` file in a terminal to a medical professional introduces a lot of time spent parsing during short sessions.

`bdtracker` aims to bridge the gap between my local workflow and practical clinical review by converting structured, machine-readable metrics and raw diary entries into clear, interactive data visualization.

Bipolar Disorder frequently distorts retrospective memory; your perception of the past weeks is heavily colored by your emotional state _right now_. Daily micro-logging captures unvarnished, objective history to ensure accurate clinical treatment.

### Current Capabilities

- **Clinical-Grade Visualization:** Track Mood vs. Energy over time to identify cycles and state signatures (Mixed, Depressive, Hypomanic).
- **Secure Multi-Device Access:** Log entries from your phone, laptop, or desktop via a secure, token-authenticated API gateway.
- **Local-First Privacy:** No third-party clouds. Your clinical history stays on your hardware.
- **Ephemeral Clinical Sharing:** Generate temporary, read-only capability tokens to share data with clinical help, with built-in expiration logic.

### Security Architecture

- **Token-Authenticated Gateways:** All private data endpoints are locked behind high-entropy master tokens.
- **Capability-Based Access:** Share specific timeline slices with external guests via short-lived, hashed URL tokens - no account registration required for guests.
- **Containerized Deployment:** Designed for Docker; secrets and sensitive database paths are injected at runtime, ensuring your security configuration never lives in the codebase.

---

## Docker Usage

Currently, BDTracker is built for docker usage, though if you git clone the repo, works excellently from uvicorn cli.

```
services:
  bdtracker:
    build: .
    container_name: bdtracker
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - DB_ROOT_DIR=/app/data/bdtracker.db
      - DB_RAW_HOSTS=your_allowed_hosts       # e.g. "your_domain.com,192.168.1.1,localhost,etc"
      - DB_RAW_ORIGINS=your_allowed_origins   # e.g. "https://your_domain.com,http://localhost,etc"
      - DB_ADMIN_MASTER_KEY=your_admin_token  # python -c "import secrets; print(secrets.token_urlsafe(32))"
```

After installing `bdtracker` you must set your BD_ADMIN_MASTER_KEY in your browser's Local Storage:

for instance, in the Inspect console tool you would use:

```
localStorage.setItem("bd_admin_token", "your_generated_random_string_here");
```

or configure it manually.

** CRUCIAL REMINDER: ** Any data stored in Incognito Mode, or if you have Cookies disabled / wiped on close, your browser will not retain this key.

---

## Open Source & Contributing

This repository is kept completely public. Bipolar (and any kind of mental-health) tracking is deeply personal, and workflows vary heavily. If you feel you can benefit from this tool, want to optimize the parsing engines, or intend to fork and tailor the interface to your specific schema-please do not hesitate to do so.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

This means that any derivative works, forks, or hosted network services utilizing this code must also be open-sourced under the exact same protective terms. Your modifications cannot be locked down behind a closed-source cloud service. See the [LICENSE](LICENSE) file for the full legal text.
