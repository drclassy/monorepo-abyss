# Patch UI AUDREY — judul warna-warni + pohon kandidat + teks lebih rapi

Berkas sasaran: `C:\Users\claud\Desktop\audrey\medgemma_chat.py`

Terapkan manual (atau jalankan dari Agent mode): impor, konstanta, fungsi baru, ubah `_retrieve_context`, `_print_header`, `_chat`, dan beberapa string UI.

---

## 1. Impor

Tambahkan setelah `from rich.text import Text`:

```python
from rich.tree import Tree
```

---

## 2. Konstanta palet judul (setelah `ITEM_STYLES`)

```python
# Warna per huruf judul AUDREY (klinis-tegas)
_TITLE_LETTER_COLORS = (
    "#E63946",
    "#F4A261",
    "#2A9D8F",
    "#E9C46A",
    "#457B9D",
    "#F77F00",
)
```

---

## 3. Fungsi bantu judul + pohon

Letakkan sebelum `# UI helpers` (sekitar baris 630), atau setelah `StreamRenderer`:

```python
def _title_audrey_colored() -> Text:
    """Judul AUDREY per huruf dengan palet tetap."""
    t = Text()
    for i, ch in enumerate("AUDREY"):
        t.append(ch, style=f"bold {_TITLE_LETTER_COLORS[i % len(_TITLE_LETTER_COLORS)]}")
    return t


def _subtitle_brand() -> Text:
    """Subjudul dua merek dengan aksen bergantian."""
    s = Text()
    s.append("Sentra AI", style="italic #7CB9E8")
    s.append("  ×  ", style=C_DIM)
    s.append("Google DeepMind", style="italic #94D2BD")
    return s


def _print_top_disease_trees(top_diseases: list[dict]) -> None:
    """Pohon kandidat: akar = kode ICD + nama; cabang = gejala (+ pemeriksaan fisik)."""
    if not top_diseases:
        return
    trees: list[Tree] = []
    for d in top_diseases:
        icd_raw = (d.get("icd10") or "—").strip()
        icd = icd_raw.split()[0][:14]
        nama = d.get("nama", "—")
        root = Text()
        root.append(f"{icd} ", style="bold #4ECDC4")
        root.append(nama, style="bold #F8F8F2")
        tr = Tree(root, guide_style="#6272A4")
        n_gejala = 0
        for g in d.get("gejala_klinis", []):
            if isinstance(g, str) and 3 < len(g) < 140:
                tr.add(Text(g, style="#BD93F9"))
                n_gejala += 1
            if n_gejala >= 6:
                break
        pf_list = [p for p in (d.get("pemeriksaan_fisik") or [])
                   if isinstance(p, str) and 5 < len(p) < 120][:3]
        if pf_list:
            pf_branch = tr.add(Text("Pemeriksaan fisik", style="italic #8BE9FD"))
            for p in pf_list:
                pf_branch.add(Text(p, style="#94A3B8"))
        trees.append(tr)

    hdr = Text()
    hdr.append("POHON ", style="bold #8892B0")
    hdr.append("KANDIDAT DIAGNOSIS", style="bold #FF79C6")
    console.print()
    console.print(Panel(
        Group(*trees),
        title=hdr,
        title_align="left",
        border_style=C_BORDER,
        padding=(0, 1),
        expand=True,
    ))
    console.print()
```

---

## 4. Ubah `_retrieve_context`

- Tanda tangan menjadi: `def _retrieve_context(query: str) -> tuple[str, list[dict]]:`
- Di akhir fungsi ganti `return "\n".join(lines)` menjadi:

```python
    return "\n".join(lines), top_diseases
```

---

## 5. Ubah `_print_header`

Ganti blok pembuatan `t1` (Row 1 — title) dari:

```python
    t1 = Text()
    t1.append("AUDREY", style=f"bold {R}")
    t1.append("  ·  ", style=D)
    t1.append("Sentra AI  ×  Google DeepMind", style=D)
```

menjadi:

```python
    t1 = Text()
    t1.append_text(_title_audrey_colored())
    t1.append("  ·  ", style=D)
    t1.append_text(_subtitle_brand())
```

---

## 6. Ubah `_chat`

- Ganti `ctx = _retrieve_context(prompt)` menjadi:

```python
    ctx, ranked = _retrieve_context(prompt)
```

- Setelah blok red flag (jika ada), **sebelum** `augmented = ...`, tambahkan:

```python
    _print_top_disease_trees(ranked)
```

- Ganti banner analisis dari tiga baris `SEP` + `[ ANALYZING...]` menjadi teks lebih rapi, misalnya:

```python
    console.print()
    console.print(Rule("[bold]Analisis data klinis[/bold]", style=C_BORDER, characters="─"))
    console.print()
```

(hapus tiga baris `console.print(SEP...)` + `[ ANALYZING CLINICAL DATA... ]` jika memakai pola di atas.)

---

## 7. Rapikan saluran UI (opsional, konsisten)

| Lokasi | Ganti menjadi |
|--------|----------------|
| `main()` setelah header | `Masukkan keluhan atau perintah. Ketik /help untuk daftar perintah.` |
| Footer setelah respons | `Perintah: /save simpan sesi · /next kasus baru · /help bantuan` |
| `_print_help` judul | `Perintah` (satu kata) + deskripsi singkat tetap |

Prompt input boleh tetap `INPUT DOKTER >` atau diganti `KELUHAN / PERINTAH >` untuk netral.

---

## 8. StreamRenderer — teks isi lebih lembut

Pada cabang `else` di `flush`, ganti `bright_white` menjadi `grey93` agar kontras dengan header tidak terlalu menusuk.

---

## Verifikasi

Dari folder audrey:

```powershell
python medgemma_chat.py
```

Pastikan Ollama berjalan; setelah memasukkan keluhan, muncul panel **Pohon kandidat diagnosis** lalu aliran jawaban model.

---

## Catatan desain

- Pohon memakai `rich.tree.Tree` (garis pandu `guide_style`, bukan huruf `L` manual — setara semantik dengan contoh "cabang di bawah diagnosis").
- Warna judul disengaja tidak memakai Inter / ungu gradien generik; palet mengacu koral/teal/kuning/ biru tua.

Jika Chief ingin patch diterapkan otomatis ke Desktop, aktifkan **Agent mode** dan minta menerapkan isi dokumen ini ke `medgemma_chat.py`.
