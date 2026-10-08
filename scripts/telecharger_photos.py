#!/usr/bin/env python3
"""
Télécharge les photos des capitales (Wikimedia Commons) et écrit leurs crédits.

Pour chaque fichier listé dans PHOTOS : récupère une version de 1600 px de large,
la ré-encode en JPEG (qualité 74) dans src/assets/photos/<zone>.jpg, et écrit
auteur, licence et lien source dans src/contenu/photos.json. Seules les licences
réutilisables sont acceptées (CC0, CC BY, CC BY-SA, domaine public).

Usage (depuis la racine du dépôt) :
    python scripts/telecharger_photos.py
"""

import html
import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "src" / "assets" / "photos"
CREDITS = RACINE / "src" / "contenu" / "photos.json"
UA = {"User-Agent": "ObservatoireUEMOA/1.0 (photos des capitales ; contact via le dépôt GitHub)"}
LICENCES = re.compile(r"^(CC0|CC BY(-SA)? [0-9.]+|Public domain)$", re.I)

# zone -> (ville, fichier Commons)
PHOTOS = {
    "senegal": ("Dakar", "Dakar, Senegal - Left Half (5662420768).jpg"),
    "cote_ivoire": ("Abidjan", "Abidjan des Lagune.jpg"),
    "benin": ("Cotonou", "BCEAO tower Cotonou, Benin.jpg"),
    "burkina": ("Ouagadougou", "Avenue a Ouagadougou.jpg"),
    "mali": ("Bamako", "Bamako ACI 2000 Aeriel.jpg"),
    "niger": ("Niamey", "Zoom sur le centre ville de la capitale Niamey depuis le fleuve Niger 07.jpg"),
    "togo": ("Lomé", "Lome Togo Beach Road.jpg"),
    "guinee_bissau": ("Bissau", "Avenida dos Combatentes da Liberdade da Pátria, Bissau (2).jpg"),
}


def ouvrir(url, essais=6):
    """Requête polie : pause et nouvelles tentatives si Wikimedia limite le débit (429)."""
    for n in range(essais):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
        except urllib.error.HTTPError as exc:
            if exc.code != 429 or n == essais - 1:
                raise
            time.sleep(10 * (n + 1))


def texte(v):
    return re.sub(r"\s+", " ", re.sub("<[^>]+>", "", html.unescape(v or ""))).strip()


def main():
    DOSSIER.mkdir(parents=True, exist_ok=True)
    credits = []
    for zone, (ville, fichier) in PHOTOS.items():
        q = urllib.parse.urlencode({"action": "query", "titles": f"File:{fichier}", "prop": "imageinfo",
                                    "iiprop": "url|extmetadata", "iiurlwidth": 1600, "format": "json"})
        page = next(iter(json.loads(ouvrir(f"https://commons.wikimedia.org/w/api.php?{q}"))["query"]["pages"].values()))
        info = page["imageinfo"][0]
        meta = info["extmetadata"]
        licence = texte(meta.get("LicenseShortName", {}).get("value"))
        if not LICENCES.match(licence):
            raise SystemExit(f"{fichier} : licence non retenue ({licence})")
        time.sleep(2)
        donnees = ouvrir(info["thumburl"])
        image = Image.open(io.BytesIO(donnees)).convert("RGB")
        image.thumbnail((1600, 1067))
        cible = DOSSIER / f"{zone}.jpg"
        image.save(cible, "JPEG", quality=74, optimize=True, progressive=True)
        credits.append({
            "zone": zone,
            "ville": ville,
            "fichier": f"{zone}.jpg",
            "titre": fichier.rsplit(".", 1)[0],
            "auteur": texte(meta.get("Artist", {}).get("value")),
            "licence": licence,
            "licence_url": meta.get("LicenseUrl", {}).get("value", ""),
            "source": info["descriptionurl"],
        })
        print(f"  {zone:<14} {cible.stat().st_size // 1024:>4} Ko  {licence:<12} {credits[-1]['auteur'][:40]}")
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(credits)} photos, crédits -> {CREDITS}")


if __name__ == "__main__":
    main()
