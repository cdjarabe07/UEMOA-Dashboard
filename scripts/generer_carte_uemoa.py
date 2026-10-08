#!/usr/bin/env python3
"""
Génère src/data/carte_uemoa.json : contours simplifiés des 8 pays de l'UEMOA
et de leurs voisins, pour la carte de la page d'accueil.

Source : Natural Earth, Admin 0 – Countries, 1:50m (domaine public).
Projection : équirectangulaire centrée sur 13° N (cos φ0), coordonnées en pixels
d'un cadre de 1000 de large ; points distants de moins de 1,4 px fusionnés.

Usage (depuis la racine du dépôt) :
    python scripts/generer_carte_uemoa.py
"""

import json
import math
import urllib.request
from datetime import date
from pathlib import Path

URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"
SORTIE = Path(__file__).resolve().parent.parent / "src" / "data" / "carte_uemoa.json"

UEMOA = {"BEN": "benin", "BFA": "burkina", "CIV": "cote_ivoire", "GNB": "guinee_bissau",
         "MLI": "mali", "NER": "niger", "SEN": "senegal", "TGO": "togo"}
VOISINS = {"MRT", "DZA", "LBY", "TCD", "NGA", "GHA", "GIN", "LBR", "SLE", "GMB", "CMR"}

LON0, LON1, LAT1 = -18.5, 16.5, 24.5
K = math.cos(math.radians(13))
LARGEUR = 1000
ECHELLE = LARGEUR / ((LON1 - LON0) * K)


def projeter(lon, lat):
    return (lon - LON0) * K * ECHELLE, (LAT1 - lat) * ECHELLE


def polygones(geom):
    return geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]


def chemin(geom):
    parties = []
    for poly in polygones(geom):
        pts = [projeter(*p) for p in poly[0]]
        simples = [pts[0]]
        for p in pts[1:]:
            if abs(p[0] - simples[-1][0]) + abs(p[1] - simples[-1][1]) > 1.4:
                simples.append(p)
        if len(simples) >= 4:
            parties.append("M" + "L".join(f"{x:.0f} {y:.0f}" for x, y in simples) + "Z")
    return "".join(parties)


def main():
    with urllib.request.urlopen(URL, timeout=120) as r:
        geo = json.load(r)
    pays, voisins, etiquettes = {}, {}, {}
    xs, ys = [], []
    for f in geo["features"]:
        iso = f["properties"].get("ADM0_A3")
        if iso in UEMOA:
            zone = UEMOA[iso]
            pays[zone] = chemin(f["geometry"])
            grand = max(polygones(f["geometry"]), key=lambda p: len(p[0]))[0]
            cx = sum(p[0] for p in grand) / len(grand)
            cy = sum(p[1] for p in grand) / len(grand)
            etiquettes[zone] = [round(v) for v in projeter(cx, cy)]
            for poly in polygones(f["geometry"]):
                for lon, lat in poly[0]:
                    x, y = projeter(lon, lat)
                    xs.append(x)
                    ys.append(y)
        elif iso in VOISINS:
            voisins[iso] = chemin(f["geometry"])
    assert len(pays) == 8, sorted(pays)
    marge = 18
    vue = [round(min(xs)) - marge, round(min(ys)) - marge, round(max(xs) - min(xs)) + 2 * marge, round(max(ys) - min(ys)) + 2 * marge]
    sortie = {
        "source": "Natural Earth, Admin 0 – Countries, 1:50m",
        "url": URL,
        "licence": "domaine public",
        "genere_le": date.today().isoformat(),
        "projection": "équirectangulaire, φ0 = 13° N",
        "vue": vue,
        "pays": pays,
        "voisins": voisins,
        "etiquettes": etiquettes,
    }
    SORTIE.write_text(json.dumps(sortie, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{SORTIE} ({SORTIE.stat().st_size // 1024} Ko), vue {vue}")


if __name__ == "__main__":
    main()
