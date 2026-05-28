# bdtracker

Aimed to be an elegant, local-first web app designed to translate raw plain-text journaling into clinician-actionable insights for managing Bipolar Disorder.

---

> **[!] CURRENTLY IN EARLY-DEVELOPMENT [!]**

## Project Overview

This project is being built out of a direct need to streamline therapy and psychiatry sessions. Handing off a long, raw `.org` file in a terminal to a medical professional introduces a lot of time spent parsing during short sessions.

`bdtracker` aims to bridge the gap between my local workflow and practical clinical review by converting structured, machine-readable metrics and raw diary entries into clear, interactive data visualization.

Bipolar Disorder frequently distorts retrospective memory; your perception of the past weeks is heavily colored by your emotional state _right now_. Daily micro-logging captures unvarnished, objective history to ensure accurate clinical treatment.

### Why Local-First?

- **Absolute Privacy:** Mental health logs and personal diaries should never should never belong to a third-party cloud. Your data stays entirely on your local machine.

---

## Current Architecture & Pipeline

The application functions as a read-only rendering pipeline that leverages your existing local `.org` files as its flat-file database. This allows you to maintain your active text-editor journaling routines while instantly unlocking a rich frontend dashboard.

[ Local Org Files ]
├── mood.org (Metrics) ──> [ FastAPI Parser ] ──> [ JSON API ] ──> [ Tailwind & Chart.js UI ]
└── 05.org (Diary)

---

## Open Source & Contributing

This repository is kept completely public. Bipolar tracking is deeply personal, and workflows vary heavily. If you feel you can benefit from this tool, want to optimize the parsing engines, or intend to fork and tailor the interface to your specific schema-please do not hesitate to do so.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

This means that any derivative works, forks, or hosted network services utilizing this code must also be open-sourced under the exact same protective terms. Your modifications cannot be locked down behind a closed-source cloud service. See the [LICENSE](LICENSE) file for the full legal text.
