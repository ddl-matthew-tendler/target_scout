def _tractability_score(tractability_data: list) -> float:
    if not tractability_data:
        return 2.0
    active_buckets = []
    for item in tractability_data:
        if item.get('value') is True:
            raw_id = str(item.get('id', ''))
            for prefix in ('SM', 'AB', 'PR', 'OC', 'HY', 'CC', 'TN', 'PB', 'GA'):
                raw_id = raw_id.replace(prefix, '')
            try:
                active_buckets.append(int(raw_id))
            except ValueError:
                pass
    if not active_buckets:
        return 2.0
    min_b = min(active_buckets)
    if min_b <= 1:  return 10.0
    if min_b <= 2:  return 8.5
    if min_b <= 3:  return 7.0
    if min_b <= 5:  return 5.5
    if min_b <= 7:  return 4.0
    return 3.0


def _novelty_score(known_drugs: list) -> float:
    n = len(known_drugs) if known_drugs else 0
    return max(0.0, 10.0 - min(10.0, float(n)))


def _composite(disease: float, tract: float, novelty: float) -> float:
    raw = disease * 2.0 + tract * 1.5 + novelty * 1.5
    return round(raw / 50.0 * 10, 1)


def _dominant_datatype(datatype_scores: list) -> str:
    if not datatype_scores:
        return 'literature'
    best = max(datatype_scores, key=lambda x: x.get('score', 0))
    return best.get('id', 'literature')


def score_targets(rows: list) -> list:
    scored = []
    for row in rows:
        target = row.get('target', {})
        overall = row.get('score', 0)
        dt_scores = row.get('datatypeScores', [])
        tractability_data = target.get('tractability', [])
        known_drugs = target.get('knownDrugs', {}).get('uniqueDrugs', [])

        disease_assoc = round(overall * 10, 1)
        tract = _tractability_score(tractability_data)
        novelty = _novelty_score(known_drugs)
        composite = _composite(disease_assoc, tract, novelty)

        dt_breakdown = {dt['id']: round(dt['score'] * 10, 2) for dt in dt_scores}

        scored.append({
            'symbol': target.get('approvedSymbol', ''),
            'name': target.get('approvedName', ''),
            'ensemblId': target.get('id', ''),
            'diseaseAssociation': disease_assoc,
            'tractability': round(tract, 1),
            'novelty': round(novelty, 1),
            'composite': composite,
            'dominantDatatype': _dominant_datatype(dt_scores),
            'datatypeBreakdown': dt_breakdown,
            'knownDrugs': known_drugs[:5],
            'numDrugs': len(known_drugs),
        })

    scored.sort(key=lambda x: x['composite'], reverse=True)
    return scored[:10]
