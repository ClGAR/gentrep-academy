from pathlib import Path

t = Path("reference/gentrep-academy-dashboard.html").read_text(encoding="utf-8")
out = Path("reference/extracted-strings.txt")

needles = [
    '{k:"BASE"',
    '{k:"TL"',
    '{k:"SL"',
    '{k:"PL"',
    '{k:"CC"',
    "Pt={name:",
    "Ql={name:",
    "hd=[",
    "pd={bronze",
    "md={",
    "docs",
    "About Academy",
    "hereby certifies",
    "Scan to verify",
    "Complete rank",
    "Reset all",
    "Telegram",
    "Ginhawa",
    "Product Presentation",
    "Business Orientation",
    "Your First Twenty",
    "Code of",
    "Ethics",
    "Creed",
    "Agreement",
    "en:",
    "tl:",
    "type:\"document\"",
    "type:\"attendance\"",
    "type:\"demonstration\"",
    "type:\"derived\"",
    "type:\"video\"",
]

chunks: list[str] = []
for q in needles:
    idx = 0
    found = 0
    while found < 3:
        i = t.find(q, idx)
        if i < 0:
            break
        chunks.append(f"\n===== {q} @{i} =====\n{t[max(0, i - 40) : i + 1800]}\n")
        idx = i + len(q)
        found += 1

out.write_text("".join(chunks), encoding="utf-8")
print("wrote", out, "chars", out.stat().st_size)
