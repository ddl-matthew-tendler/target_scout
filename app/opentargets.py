import httpx

OT_URL = "https://api.platform.opentargets.org/api/v4/graphql"

_DISEASE_SEARCH = """
query SearchDisease($q: String!) {
  search(queryString: $q, entityNames: ["disease"], page: {index: 0, size: 5}) {
    hits { id name entity }
  }
}
"""

_TARGETS_QUERY = """
query TargetsForDisease($efoId: String!) {
  disease(efoId: $efoId) {
    id
    name
    associatedTargets(page: { index: 0, size: 25 }) {
      rows {
        score
        target {
          id
          approvedSymbol
          approvedName
          tractability { modality id value }
          knownDrugs { uniqueDrugs }
        }
        datatypeScores { id score }
      }
    }
  }
}
"""


async def search_disease(query: str):
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(OT_URL, json={
            "query": _DISEASE_SEARCH,
            "variables": {"q": query},
        })
        resp.raise_for_status()
        hits = resp.json().get("data", {}).get("search", {}).get("hits", [])
        disease_hits = [h for h in hits if h.get("entity") == "disease"]
        if not disease_hits:
            return None
        return {"id": disease_hits[0]["id"], "name": disease_hits[0]["name"]}


async def get_associated_targets(efo_id: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(OT_URL, json={
            "query": _TARGETS_QUERY,
            "variables": {"efoId": efo_id},
        })
        resp.raise_for_status()
        disease_data = resp.json().get("data", {}).get("disease", {})
        if not disease_data:
            return [], ""
        rows = disease_data.get("associatedTargets", {}).get("rows", [])
        name = disease_data.get("name", "")
        return rows, name
