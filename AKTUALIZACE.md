# Jak aktualizovat data (pro všechny)

Stránka zobrazuje **zašifrovaný** soubor `public/data.enc`. Pouhé nahrání Excelu
na GitHub (drag-drop) **nestačí** — data se musí nejdřív zašifrovat, jinak by se
nezobrazila (a nešifrovaný Excel se na web nesmí dostat).

## Postup

```bash
node encrypt.mjs "novy-export.xlsx"     # zadáš heslo
git add public/data.enc
git commit -m "update dat"
git push
```

Za ~minutu se stránka sama přenasadí (GitHub Actions) a všichni uvidí nová data.

- Heslo můžeš nechat **stejné**, nebo zvolit **nové** (pak ho pošli kolegům znovu).
- `node encrypt.mjs` bez názvu souboru tě vyzve k zadání cesty i hesla.

## Odkaz a heslo

- **Odkaz:** https://oskar-pihrt.github.io/archa-vysledky/
- **Heslo:** posílá se kolegům zvlášť (do stránky se zadává po otevření).

## Co se NESMÍ udělat

- ❌ Commitovat nešifrovaný `.xlsx` do repozitáře (je v `.gitignore`, aby k tomu
  nedošlo). Na web patří **jen** `data.enc`.

## Typy otázek (graf vs. seznam)

Pokud chceš změnit, jak se která otázka zobrazuje (koláč / sloupce / seznam),
uprav `src/config.js` (sekce `typeOverrides`) a pushni — viz [README.md](README.md).
