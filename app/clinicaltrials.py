import httpx

CT_BASE = "https://clinicaltrials.gov/api/v2/studies"


async def get_similar_trials(target_symbol: str, disease: str, page_size: int = 5) -> list:
    params = {
        "query.cond": disease,
        "query.term": target_symbol,
        "pageSize": page_size,
        "fields": "NCTId,BriefTitle,Phase,OverallStatus,LeadSponsorName",
        "format": "json",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(CT_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()
            studies = data.get("studies", [])
            trials = []
            for s in studies:
                proto = s.get("protocolSection", {})
                id_mod = proto.get("identificationModule", {})
                status_mod = proto.get("statusModule", {})
                design_mod = proto.get("designModule", {})
                sponsor_mod = proto.get("sponsorCollaboratorsModule", {})
                nct = id_mod.get("nctId", "")
                trials.append({
                    "nctId": nct,
                    "title": id_mod.get("briefTitle", ""),
                    "phase": (design_mod.get("phases") or ["Unknown"])[0],
                    "status": status_mod.get("overallStatus", ""),
                    "sponsor": sponsor_mod.get("leadSponsor", {}).get("name", ""),
                    "url": f"https://clinicaltrials.gov/study/{nct}",
                })
            return trials
    except Exception:
        return []
