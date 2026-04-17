import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.opentargets import search_disease, get_associated_targets
from app.clinicaltrials import get_similar_trials
from app.llm import generate_narrative
from app.scoring import score_targets
from app import cache as _cache

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB_DIR = os.path.join(BASE_DIR, "web")


@asynccontextmanager
async def lifespan(app):
    yield


app = FastAPI(title="TargetScout", lifespan=lifespan)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/score")
async def score(disease: str = Query(..., min_length=2)):
    key = f"score:{disease.lower().strip()}"
    cached = _cache.get(key)
    if cached:
        return cached

    disease_info = await search_disease(disease)
    if not disease_info:
        raise HTTPException(status_code=404, detail=f"Disease not found: {disease}")

    efo_id = disease_info["id"]

    rows, disease_name = await get_associated_targets(efo_id)
    if not rows:
        raise HTTPException(status_code=404, detail=f"No targets found for: {disease}")

    scored = score_targets(rows)

    result = {
        "disease": disease,
        "efoId": efo_id,
        "diseaseName": disease_name or disease,
        "targets": scored,
    }
    _cache.set(key, result)
    return result


@app.get("/api/narrative")
async def narrative(
    target: str = Query(...),
    disease: str = Query(...),
    disease_assoc: float = Query(default=0.0),
    datatypes: str = Query(default=""),
    drugs: str = Query(default=""),
):
    key = f"narrative:{target.lower()}:{disease.lower().strip()}"
    cached = _cache.get(key)
    if cached:
        return cached

    text = await generate_narrative(
        target_symbol=target,
        disease=disease,
        disease_assoc=disease_assoc,
        datatypes=[d for d in datatypes.split(",") if d] if datatypes else [],
        drugs=[d for d in drugs.split(",") if d] if drugs else [],
    )
    result = {"target": target, "text": text}
    _cache.set(key, result, ttl=7 * 24 * 3600)
    return result


@app.get("/api/similar")
async def similar(
    target: str = Query(...),
    disease: str = Query(...),
):
    key = f"similar:{target.lower()}:{disease.lower().strip()}"
    cached = _cache.get(key)
    if cached:
        return cached

    trials = await get_similar_trials(target, disease)
    result = {"trials": trials}
    _cache.set(key, result, ttl=24 * 3600)
    return result


app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="static")
