# UNICOM Safety Boundary

Last updated: 2026-05-27

## Non-Negotiable Rules

- Tidak boleh menyentuh `packages/sentra/**` tanpa approval eksplisit.
- Tidak boleh membuat atau menyatakan final diagnosis klinis.
- Tidak boleh menjalankan destructive repo action tanpa approval eksplisit.
- Tidak boleh menyentuh secrets, `.env`, atau data sensitif tanpa approval.
- Tidak boleh memalsukan evidence, audit trail, atau completion claim.
- Tidak boleh menjalankan external API call berisiko secara diam-diam.

## Mandatory Approval Gates

Approval wajib untuk:

- crown-jewel path;
- governance atau policy files;
- destructive action;
- clinical atau diagnosis-related work;
- external API call dengan risiko kebocoran data;
- persistence or deployment change di luar scope aman.

## Hard Blocks

Policy harus memblok:

- completion claim tanpa evidence;
- final diagnosis claim dari agent;
- event yang menyatakan scope aman padahal menyentuh path terlarang;
- aksi yang mencoba menghilangkan jejak audit append-only.

## Human Intervention

Chief dapat:

- pause room;
- resume room;
- freeze room;
- approve proposal;
- reject proposal;
- redirect task;
- remove agent;
- assign agent;
- force final audit.

Semua intervensi manusia harus menghasilkan event yang dapat diaudit.
