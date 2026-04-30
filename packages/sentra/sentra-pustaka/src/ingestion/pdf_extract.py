import sys
import fitz

fitz.TOOLS.mupdf_display_errors(False)

def extract(path: str) -> None:
    doc = fitz.open(path)
    if doc.page_count == 0:
        doc.close()
        sys.exit("EMPTY_PDF")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    sys.stdout.buffer.write(text.encode("utf-8"))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Usage: pdf_extract.py <path>")
    extract(sys.argv[1])
