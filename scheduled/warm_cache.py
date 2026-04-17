"""
Nightly job: pre-warm the cache for high-priority indications.
Run as a Domino scheduled job: python scheduled/warm_cache.py
"""
import asyncio
import httpx
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PRIORITY_DISEASES = [
    "IPF",
    "idiopathic pulmonary fibrosis",
    "ulcerative colitis",
    "ALS",
    "amyotrophic lateral sclerosis",
    "NSCLC",
    "non-small cell lung cancer",
    "Alzheimer's disease",
    "breast cancer",
    "type 2 diabetes",
    "psoriasis",
    "rheumatoid arthritis",
    "Crohn's disease",
    "multiple myeloma",
    "NASH",
]

APP_BASE = os.environ.get("TARGET_SCOUT_URL", "http://localhost:8888")


async def warm_one(disease: str):
    url = f"{APP_BASE}/api/score?disease={disease}"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                targets = data.get("targets", [])
                print(f"  OK  {disease}: {len(targets)} targets cached")
                # Also warm narratives
                narrative_tasks = []
                for t in targets:
                    dt = ",".join(t.get("datatypeBreakdown", {}).keys())
                    drugs = ",".join(t.get("knownDrugs", []))
                    narrative_url = (
                        f"{APP_BASE}/api/narrative"
                        f"?target={t['symbol']}&disease={disease}"
                        f"&disease_assoc={t['diseaseAssociation']}"
                        f"&datatypes={dt}&drugs={drugs}"
                    )
                    narrative_tasks.append(client.get(narrative_url))
                await asyncio.gather(*narrative_tasks, return_exceptions=True)
                print(f"  OK  {disease}: narratives warmed")
            else:
                print(f"  ERR {disease}: HTTP {resp.status_code}")
    except Exception as e:
        print(f"  ERR {disease}: {e}")


async def main():
    print(f"Warming cache for {len(PRIORITY_DISEASES)} diseases at {APP_BASE}")
    for disease in PRIORITY_DISEASES:
        await warm_one(disease)
        await asyncio.sleep(1)
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
