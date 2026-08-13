from pathlib import Path

t = Path("reference/gentrep-academy-dashboard.html").read_text(encoding="utf-8")
j = t.find('className:"about-table"')
Path("reference/about-extract.txt").write_text(t[j : j + 3500], encoding="utf-8")
print("wrote about extract", j)
