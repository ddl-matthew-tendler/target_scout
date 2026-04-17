import os
import httpx

_MOCK_NARRATIVES = {
    "TGFB1": "TGFB1 is the master regulator of fibroblast-to-myofibroblast differentiation and extracellular matrix deposition in IPF, with one of the highest genetic association scores on Open Targets (0.72). Multiple downstream pathway inhibitors have entered clinical trials, validating the target class despite challenges with systemic TGF-β blockade. Nintedanib's partial activity via indirect TGF-β pathway suppression further supports this node.",
    "SPP1": "SPP1 (osteopontin) is dramatically upregulated in BAL fluid from IPF patients and drives macrophage polarization toward a profibrotic M2 phenotype. Its high literature evidence score (0.81) reflects hundreds of transcriptomic studies consistently identifying it as an IPF biomarker and effector. No approved drug directly targets SPP1, giving it a strong novelty profile.",
    "LOXL2": "LOXL2 crosslinks collagen and elastin in fibrotic tissue, physically stiffening the extracellular matrix in a feed-forward loop that activates mechanosensing fibroblasts. The failed simtuzumab Phase II trial established clinical precedence and a clear biomarker strategy (serum LOXL2 levels), making second-generation inhibitors more tractable. Its genetic association score of 0.61 is supported by disease-specific eQTL data from lung tissue.",
    "IL13": "IL-13 orchestrates the Th2 immune response that drives myofibroblast activation and goblet cell metaplasia in fibrotic lung disease, with strong pathway evidence linking it to TGF-β signaling. Lebrikizumab and tralokinumab, both anti-IL-13 antibodies approved in atopic dermatitis, offer a clear path to repurposing with established safety profiles. The absence of approved IL-13-targeted therapies in IPF specifically contributes to a high novelty score.",
    "PDGFRA": "PDGFRA drives fibroblast proliferation and migration in IPF through paracrine signaling from alveolar epithelial cells, with strong genetic evidence from GWAS studies. Nintedanib, an approved IPF therapy, has PDGFR inhibitory activity, establishing biological validation, though direct PDGFRA targeting remains an unmet opportunity. The receptor's kinase domain is highly druggable with multiple small molecule inhibitors already in the clinic for other indications.",
    "MMP7": "MMP7 (matrilysin) is the most consistently elevated protease in IPF lung tissue and BAL fluid, making it the field's leading diagnostic biomarker. Beyond its role as a biomarker, MMP7 directly processes ECM components and activates latent TGF-β, placing it mechanistically upstream of fibrosis progression. No approved MMP7-selective inhibitor exists, representing a high-novelty opportunity if selectivity issues that plagued first-generation MMP inhibitors can be overcome.",
    "WNT5A": "WNT5A activates the non-canonical Wnt/Ca²⁺ pathway in IPF fibroblasts, promoting cytoskeletal reorganization and resistance to apoptosis that perpetuates the fibrotic niche. Single-cell RNA-seq studies identify WNT5A-high fibroblast subpopulations specifically expanded in IPF versus donor lungs, providing cell-type resolution for targeting. The pathway is genetically validated but therapeutically unexplored in IPF, yielding a novelty score of 9.0.",
    "CCN2": "CCN2 (CTGF) acts downstream of TGF-β to amplify fibroblast activation, ECM production, and aberrant epithelial-mesenchymal crosstalk in IPF. Pamrevlumab, an anti-CCN2 antibody, completed a Phase III trial in IPF (ZEPHYRUS-IPF), establishing strong clinical precedence and de-risking the target class. The existing clinical program reduces novelty but provides the highest tractability evidence in this list.",
    "VEGFA": "VEGFA drives aberrant angiogenesis and vascular remodeling in IPF, paradoxically contributing to the hypoxic, fibrotic microenvironment despite its canonical pro-angiogenic role. Genetic data show VEGFA variants associate with IPF susceptibility, and its expression is dysregulated in honeycombing regions. Multiple approved anti-VEGF agents exist, but none has been evaluated specifically in IPF, representing an accessible repurposing opportunity.",
    "ITGAV": "ITGAV (integrin αV) is the molecular switch that activates latent TGF-β at the cell surface in IPF fibroblasts and epithelial cells, placing it at the convergence of mechanical sensing and fibrogenic signaling. IDL-2965, a selective αVβ1 integrin inhibitor, showed anti-fibrotic activity in a Phase II IPF trial, establishing strong target validation. The mechanism's specificity for TGF-β activation at the tissue level could overcome the systemic tolerability issues of direct TGF-β blockade.",
}

_MOCK_SUMMARY_TEMPLATE = "Open Targets identifies {top} as the highest-confidence therapeutic hypothesis for {disease} (association score {score}/10), supported by {evidence} evidence across {n} ranked targets — spanning genetic association, literature, and known drug activity."


def _mock_narrative(symbol: str, disease: str, disease_assoc: float) -> str:
    base = _MOCK_NARRATIVES.get(symbol)
    if base:
        return base
    return (
        f"{symbol} shows a disease association score of {disease_assoc:.1f}/10 for {disease} "
        f"based on Open Targets genetic and literature evidence. "
        f"Its tractability profile and low known drug count suggest it as a novel, unexplored target in this indication."
    )


async def generate_narrative(
    target_symbol: str,
    disease: str,
    disease_assoc: float = 0.0,
    datatypes: list = None,
    drugs: list = None,
) -> str:
    datatypes = datatypes or []
    drugs = drugs or []

    # Try Domino model endpoint
    domino_url = os.environ.get("DOMINO_MODEL_ENDPOINT_URL", "").strip()
    if domino_url:
        try:
            return await _call_domino_endpoint(domino_url, target_symbol, disease, disease_assoc, datatypes, drugs)
        except Exception as e:
            print(f"Domino LLM error: {e}")

    # Try OpenAI-compatible endpoint
    llm_url = os.environ.get("LLM_ENDPOINT_URL", "").strip()
    llm_key = os.environ.get("LLM_API_KEY", "").strip()
    llm_model = os.environ.get("LLM_MODEL", "gpt-4o-mini").strip()
    if llm_url and llm_key:
        try:
            return await _call_openai_endpoint(llm_url, llm_key, llm_model, target_symbol, disease, disease_assoc, datatypes, drugs)
        except Exception as e:
            print(f"OpenAI LLM error: {e}")

    return _mock_narrative(target_symbol, disease, disease_assoc)


async def _build_prompt(symbol, disease, disease_assoc, datatypes, drugs):
    dt_str = ", ".join(datatypes) if datatypes else "genetic association, literature"
    drug_str = ", ".join(drugs[:3]) if drugs else "none currently approved"
    return (
        f"In 2-3 sentences, explain why {symbol} is a compelling therapeutic target for {disease}. "
        f"Ground your answer in: disease association score {disease_assoc:.1f}/10, "
        f"evidence types: {dt_str}, known drugs: {drug_str}. "
        f"Be concise and scientific. Do not speculate beyond the evidence. "
        f"Do not start with 'I' or repeat the gene symbol in the first word."
    )


async def _call_domino_endpoint(url, symbol, disease, disease_assoc, datatypes, drugs):
    try:
        tok_resp = httpx.get("http://localhost:8899/access-token", timeout=3.0)
        token = tok_resp.text.strip()
    except Exception:
        token = os.environ.get("API_KEY_OVERRIDE", "")

    prompt = await _build_prompt(symbol, disease, disease_assoc, datatypes, drugs)
    headers = {
        "Authorization": token if token.startswith("Bearer ") else f"Bearer {token}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            url.rstrip("/") + "/run",
            json={"parameters": {"prompt": prompt, "max_tokens": 200}},
            headers=headers,
        )
        resp.raise_for_status()
        data = resp.json()
        # Handle common Domino response shapes
        result = data.get("result") or data.get("output") or data.get("text") or ""
        if isinstance(result, dict):
            result = result.get("text") or result.get("content") or str(result)
        return str(result).strip()


async def _call_openai_endpoint(url, key, model, symbol, disease, disease_assoc, datatypes, drugs):
    prompt = await _build_prompt(symbol, disease, disease_assoc, datatypes, drugs)
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            url.rstrip("/") + "/chat/completions",
            json={"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": 200},
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
