var MOCK_DATA = {
  "ipf": {
    summary: "Open Targets identifies TGFB1 as the highest-confidence therapeutic hypothesis for IPF (association 9.2/10), with 10 ranked targets spanning genetic, literature, drug, and pathway evidence — including 3 with active clinical programs.",
    targets: [
      {
        symbol: "TGFB1", name: "Transforming growth factor beta-1",
        ensemblId: "ENSG00000105329",
        diseaseAssociation: 9.2, tractability: 7.0, novelty: 6.0, composite: 9.2,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 9.2, literature: 8.1, known_drugs: 5.5, pathways: 7.2 },
        knownDrugs: ["Nintedanib", "Pirfenidone"], numDrugs: 4,
        narrative: "TGFB1 is the master regulator of fibroblast-to-myofibroblast differentiation and ECM deposition in IPF, with one of the highest genetic association scores on Open Targets. Multiple downstream pathway inhibitors have entered clinical trials, validating the target class despite challenges with systemic TGF-β blockade. Nintedanib's partial activity via indirect TGF-β pathway suppression further supports this node."
      },
      {
        symbol: "SPP1", name: "Secreted phosphoprotein 1 (Osteopontin)",
        ensemblId: "ENSG00000118785",
        diseaseAssociation: 8.7, tractability: 5.5, novelty: 9.0, composite: 8.7,
        dominantDatatype: "literature",
        datatypeBreakdown: { literature: 8.7, rna_expression: 7.9, genetic_association: 4.1 },
        knownDrugs: [], numDrugs: 1,
        narrative: "SPP1 (osteopontin) is dramatically upregulated in BAL fluid from IPF patients and drives macrophage polarization toward a profibrotic M2 phenotype. Its high literature evidence score reflects hundreds of transcriptomic studies consistently identifying it as an IPF biomarker and effector. No approved drug directly targets SPP1, giving it a strong novelty profile for first-in-class development."
      },
      {
        symbol: "LOXL2", name: "Lysyl oxidase-like 2",
        ensemblId: "ENSG00000134013",
        diseaseAssociation: 7.9, tractability: 8.5, novelty: 7.0, composite: 8.1,
        dominantDatatype: "known_drugs",
        datatypeBreakdown: { known_drugs: 7.8, genetic_association: 6.1, literature: 7.3 },
        knownDrugs: ["Simtuzumab"], numDrugs: 3,
        narrative: "LOXL2 crosslinks collagen and elastin in fibrotic tissue, physically stiffening the extracellular matrix in a feed-forward loop that activates mechanosensing fibroblasts. The failed simtuzumab Phase II trial established clinical precedence and a clear biomarker strategy, making second-generation inhibitors more tractable. Its genetic association score is supported by disease-specific eQTL data from lung tissue."
      },
      {
        symbol: "PDGFRA", name: "Platelet derived growth factor receptor alpha",
        ensemblId: "ENSG00000134853",
        diseaseAssociation: 7.6, tractability: 10.0, novelty: 5.0, composite: 7.9,
        dominantDatatype: "known_drugs",
        datatypeBreakdown: { known_drugs: 9.1, genetic_association: 5.8, pathways: 6.4 },
        knownDrugs: ["Nintedanib", "Imatinib", "Sunitinib", "Ponatinib"], numDrugs: 5,
        narrative: "PDGFRA drives fibroblast proliferation and migration in IPF through paracrine signaling from alveolar epithelial cells, with strong genetic evidence from GWAS studies. Nintedanib, an approved IPF therapy, has PDGFR inhibitory activity, establishing biological validation. The receptor's kinase domain is highly druggable with multiple small molecule inhibitors already in the clinic for other indications."
      },
      {
        symbol: "IL13", name: "Interleukin 13",
        ensemblId: "ENSG00000169194",
        diseaseAssociation: 7.3, tractability: 8.5, novelty: 8.0, composite: 7.6,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 7.3, literature: 6.8, known_drugs: 6.1 },
        knownDrugs: ["Lebrikizumab", "Tralokinumab"], numDrugs: 2,
        narrative: "IL-13 orchestrates the Th2 immune response that drives myofibroblast activation and goblet cell metaplasia in fibrotic lung disease, with strong pathway evidence linking it to TGF-β signaling. Lebrikizumab and tralokinumab, both anti-IL-13 antibodies approved in atopic dermatitis, offer a clear path to repurposing with established safety profiles. The absence of approved IL-13-targeted therapies specifically in IPF maintains a high novelty score."
      },
      {
        symbol: "MMP7", name: "Matrix metallopeptidase 7",
        ensemblId: "ENSG00000137673",
        diseaseAssociation: 8.1, tractability: 4.0, novelty: 9.0, composite: 7.5,
        dominantDatatype: "literature",
        datatypeBreakdown: { literature: 8.1, rna_expression: 8.4, genetic_association: 3.2 },
        knownDrugs: [], numDrugs: 1,
        narrative: "MMP7 (matrilysin) is the most consistently elevated protease in IPF lung tissue and BAL fluid, making it the field's leading diagnostic biomarker and a compelling effector target. Beyond its role as a biomarker, MMP7 directly processes ECM components and activates latent TGF-β, placing it mechanistically upstream of fibrosis progression. No approved MMP7-selective inhibitor exists — selectivity over the broader MMP family is the key development challenge."
      },
      {
        symbol: "WNT5A", name: "Wnt family member 5A",
        ensemblId: "ENSG00000112599",
        diseaseAssociation: 6.8, tractability: 3.0, novelty: 9.5, composite: 7.1,
        dominantDatatype: "pathways",
        datatypeBreakdown: { pathways: 7.2, rna_expression: 6.8, literature: 5.4 },
        knownDrugs: [], numDrugs: 0,
        narrative: "WNT5A activates the non-canonical Wnt/Ca²⁺ pathway in IPF fibroblasts, promoting cytoskeletal reorganization and resistance to apoptosis that perpetuates the fibrotic niche. Single-cell RNA-seq studies identify WNT5A-high fibroblast subpopulations specifically expanded in IPF versus donor lungs, providing cell-type resolution for targeting. The pathway is genetically validated but therapeutically unexplored in IPF, yielding a near-maximum novelty score."
      },
      {
        symbol: "CCN2", name: "Cellular communication network factor 2 (CTGF)",
        ensemblId: "ENSG00000118523",
        diseaseAssociation: 7.4, tractability: 10.0, novelty: 5.5, composite: 7.0,
        dominantDatatype: "known_drugs",
        datatypeBreakdown: { known_drugs: 8.9, literature: 7.4, genetic_association: 4.8 },
        knownDrugs: ["Pamrevlumab"], numDrugs: 3,
        narrative: "CCN2 (CTGF) acts downstream of TGF-β to amplify fibroblast activation, ECM production, and aberrant epithelial-mesenchymal crosstalk in IPF. Pamrevlumab, an anti-CCN2 antibody, completed a Phase III trial in IPF (ZEPHYRUS-IPF), establishing strong clinical precedence and de-risking the target class. The existing clinical program reduces novelty but provides the highest tractability evidence of any target in this analysis."
      },
      {
        symbol: "VEGFA", name: "Vascular endothelial growth factor A",
        ensemblId: "ENSG00000112715",
        diseaseAssociation: 6.5, tractability: 10.0, novelty: 5.0, composite: 6.6,
        dominantDatatype: "known_drugs",
        datatypeBreakdown: { known_drugs: 8.7, genetic_association: 6.5, literature: 6.1 },
        knownDrugs: ["Bevacizumab", "Nintedanib", "Sunitinib", "Aflibercept"], numDrugs: 4,
        narrative: "VEGFA drives aberrant angiogenesis and vascular remodeling in IPF, paradoxically contributing to the hypoxic fibrotic microenvironment despite its canonical pro-angiogenic role. Genetic data show VEGFA variants associate with IPF susceptibility, and its expression is dysregulated in honeycombing regions on spatial transcriptomics. Multiple approved anti-VEGF agents exist, but none has been rigorously evaluated in IPF — making this a high-tractability, accessible repurposing opportunity."
      },
      {
        symbol: "ITGAV", name: "Integrin subunit alpha V",
        ensemblId: "ENSG00000069482",
        diseaseAssociation: 6.2, tractability: 7.0, novelty: 7.5, composite: 6.4,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 6.2, pathways: 5.9, literature: 5.3 },
        knownDrugs: ["IDL-2965"], numDrugs: 2,
        narrative: "ITGAV (integrin αV) is the molecular switch that activates latent TGF-β at the cell surface in IPF fibroblasts and epithelial cells, placing it at the convergence of mechanical sensing and fibrogenic signaling. IDL-2965, a selective αVβ1 integrin inhibitor, showed anti-fibrotic activity in a Phase II IPF trial, establishing strong target validation. The mechanism's tissue-specificity for TGF-β activation could overcome the systemic tolerability issues of direct TGF-β blockade."
      }
    ]
  },
  "ulcerative colitis": {
    summary: "Open Targets ranks TNF and IL23A as leading targets for ulcerative colitis, with 8 of 10 top candidates already having approved therapies — defining a landscape where novel targets like SLC9A3R1 and PTPN22 offer the highest differentiation opportunity.",
    targets: [
      {
        symbol: "TNF", name: "Tumor necrosis factor",
        ensemblId: "ENSG00000232810",
        diseaseAssociation: 9.8, tractability: 10.0, novelty: 1.0, composite: 9.5,
        dominantDatatype: "known_drugs",
        datatypeBreakdown: { known_drugs: 9.8, genetic_association: 8.1, literature: 9.2, pathways: 7.8 },
        knownDrugs: ["Infliximab", "Adalimumab", "Certolizumab", "Golimumab"], numDrugs: 9,
        narrative: "TNF drives mucosal inflammation in UC through NF-κB activation in intestinal epithelial cells and macrophages, with the highest combined genetic and drug evidence on Open Targets. Four anti-TNF biologics are approved for UC, establishing it as the most validated therapeutic target in IBD. However, 30-40% primary non-response and secondary loss of response create ongoing demand for alternative mechanisms."
      },
      {
        symbol: "IL23A", name: "Interleukin 23 subunit alpha",
        ensemblId: "ENSG00000110944",
        diseaseAssociation: 9.1, tractability: 10.0, novelty: 2.0, composite: 8.9,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 9.1, known_drugs: 8.8, literature: 7.4 },
        knownDrugs: ["Risankizumab", "Guselkumab", "Mirikizumab"], numDrugs: 6,
        narrative: "IL-23/Th17 axis is genetically the most strongly implicated pathway in UC, with multiple GWAS hits converging on IL23A and its receptor. Mirikizumab is approved for UC; risankizumab is pending, reflecting the current wave of IL-23p19 antibodies entering the space. Best-in-class differentiation will require head-to-head data or novel combination strategies."
      },
      {
        symbol: "JAK1", name: "Janus kinase 1",
        ensemblId: "ENSG00000162434",
        diseaseAssociation: 8.4, tractability: 10.0, novelty: 3.0, composite: 8.3,
        dominantDatatype: "known_drugs",
        datatypeBreakdown: { known_drugs: 9.2, genetic_association: 6.1, pathways: 8.4 },
        knownDrugs: ["Tofacitinib", "Upadacitinib", "Filgotinib"], numDrugs: 5,
        narrative: "JAK1 mediates signaling from multiple pro-inflammatory cytokines including IL-6, IL-12, IL-23 and interferons, making it a pleiotropic target in UC mucosal immunity. Upadacitinib, a selective JAK1 inhibitor, showed superior remission rates versus anti-TNF in ULTRA trials. The cardiovascular and thromboembolic safety signals from pan-JAK inhibitors drive demand for more selective next-generation compounds."
      },
      {
        symbol: "IL6", name: "Interleukin 6",
        ensemblId: "ENSG00000136244",
        diseaseAssociation: 8.0, tractability: 10.0, novelty: 4.0, composite: 8.0,
        dominantDatatype: "known_drugs",
        datatypeBreakdown: { known_drugs: 8.7, literature: 8.0, genetic_association: 5.3 },
        knownDrugs: ["Tocilizumab", "Sarilumab"], numDrugs: 4,
        narrative: "IL-6 drives acute phase response and mucosal barrier disruption in active UC, with elevated serum levels correlating with endoscopic severity scores. Tocilizumab and sarilumab block the IL-6 receptor but are not approved for IBD indications, representing a repurposing opportunity with extensive safety data. Direct IL-6 antibody approaches may offer improved tissue penetration versus receptor blockade."
      },
      {
        symbol: "ITGA4", name: "Integrin subunit alpha 4",
        ensemblId: "ENSG00000115232",
        diseaseAssociation: 7.6, tractability: 10.0, novelty: 5.0, composite: 7.6,
        dominantDatatype: "known_drugs",
        datatypeBreakdown: { known_drugs: 9.0, literature: 6.2, genetic_association: 3.8 },
        knownDrugs: ["Vedolizumab", "Natalizumab"], numDrugs: 3,
        narrative: "ITGA4 (α4 integrin) mediates lymphocyte trafficking to inflamed intestinal tissue via MAdCAM-1 interaction; blocking this axis with vedolizumab provides gut-selective immunosuppression with a favorable safety profile. The gut-selective mechanism has driven vedolizumab to front-line biologic status in UC, particularly for patients with infection risk. Next-generation αEβ7 integrin inhibitors targeting tissue retention (rather than trafficking) represent the frontier."
      },
      {
        symbol: "PTPN22", name: "Protein tyrosine phosphatase non-receptor type 22",
        ensemblId: "ENSG00000134242",
        diseaseAssociation: 7.2, tractability: 3.0, novelty: 9.5, composite: 7.2,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 7.2, literature: 5.1, pathways: 4.8 },
        knownDrugs: [], numDrugs: 0,
        narrative: "PTPN22 is one of the most replicated genetic risk loci for UC and multiple autoimmune diseases, encoding a phosphatase that attenuates T cell receptor and BCR signaling. The R620W risk variant impairs regulatory T cell function and promotes autoreactive lymphocyte survival. No direct PTPN22 inhibitor has entered clinical development, representing a high-novelty opportunity if selective allosteric approaches can restore physiologic signaling balance."
      },
      {
        symbol: "SLC9A3R1", name: "SLC9A3 regulator 1",
        ensemblId: "ENSG00000109063",
        diseaseAssociation: 6.8, tractability: 2.0, novelty: 10.0, composite: 6.9,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 6.8, pathways: 5.2 },
        knownDrugs: [], numDrugs: 0,
        narrative: "SLC9A3R1 (NHERF1) is a scaffolding protein that regulates epithelial ion transport and tight junction assembly, with strong GWAS evidence for UC susceptibility. Its role in intestinal barrier integrity places it upstream of the microbial antigen exposure that initiates mucosal inflammation. No therapeutic program has targeted this gene; its epithelial expression pattern suggests potential for oral, gut-restricted small molecule development."
      },
      {
        symbol: "IL10", name: "Interleukin 10",
        ensemblId: "ENSG00000136634",
        diseaseAssociation: 7.5, tractability: 5.5, novelty: 6.5, composite: 6.9,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 7.5, literature: 7.0, pathways: 5.8 },
        knownDrugs: [], numDrugs: 2,
        narrative: "IL-10 is the master anti-inflammatory cytokine in the intestinal mucosa; loss-of-function mutations in IL10 and its receptor cause severe early-onset IBD. Paradoxically, systemic IL-10 administration has shown poor efficacy in UC trials, likely due to pharmacokinetic limitations. Local delivery approaches — engineered bacteria expressing IL-10 or mucosal gene therapy — are being pursued to overcome the systemic delivery barrier."
      },
      {
        symbol: "OSM", name: "Oncostatin M",
        ensemblId: "ENSG00000099985",
        diseaseAssociation: 7.0, tractability: 7.0, novelty: 7.5, composite: 6.8,
        dominantDatatype: "literature",
        datatypeBreakdown: { literature: 7.0, rna_expression: 7.8, genetic_association: 4.2 },
        knownDrugs: ["Izokibep"], numDrugs: 2,
        narrative: "Oncostatin M (OSM) is highly expressed in inflamed UC tissue and signals through OSMR/gp130 to drive stromal fibroblast activation and therapy resistance — high mucosal OSM predicts anti-TNF non-response. This biomarker-therapy link has catalyzed anti-OSM antibody development as a precision strategy for the predicted non-responder population. Izokibep, a compact anti-OSM antibody, is in Phase II, establishing initial clinical precedence."
      },
      {
        symbol: "STAT3", name: "Signal transducer and activator of transcription 3",
        ensemblId: "ENSG00000168610",
        diseaseAssociation: 6.5, tractability: 5.5, novelty: 6.0, composite: 6.3,
        dominantDatatype: "pathways",
        datatypeBreakdown: { pathways: 8.1, literature: 6.5, known_drugs: 4.8 },
        knownDrugs: ["Napabucasin"], numDrugs: 3,
        narrative: "STAT3 integrates signals from IL-6, IL-10, IL-23, and OSM to regulate both inflammatory gene expression and intestinal epithelial regeneration, making it a pleiotropic node in UC pathobiology. Mucosal STAT3 activation correlates with disease severity and predicts biological therapy response. Direct STAT3 inhibitors face the challenge of separating anti-inflammatory from pro-regenerative functions in epithelial homeostasis."
      }
    ]
  },
  "als": {
    summary: "Open Targets identifies SOD1 as the top ALS target with the highest genetic association score (9.6/10), but 9 of 10 top candidates remain in early clinical or pre-clinical stages — reflecting the substantial unmet need and opportunity for novel ALS therapies.",
    targets: [
      {
        symbol: "SOD1", name: "Superoxide dismutase 1",
        ensemblId: "ENSG00000142168",
        diseaseAssociation: 9.6, tractability: 8.5, novelty: 3.0, composite: 9.1,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 9.6, known_drugs: 7.8, literature: 9.1, pathways: 6.2 },
        knownDrugs: ["Tofersen", "Ozanezumab"], numDrugs: 3,
        narrative: "SOD1 mutations account for ~20% of familial ALS; the mutant protein aggregates and is directly toxic to motor neurons via multiple mechanisms including mitochondrial dysfunction and ER stress. Tofersen, an antisense oligonucleotide approved for SOD1-ALS, established the genetic medicine paradigm for targeted ALS therapy and validated SOD1 protein reduction as a disease-modifying strategy. Its approval has catalyzed a broader wave of mutation-specific ASO and gene editing programs."
      },
      {
        symbol: "TARDBP", name: "TAR DNA binding protein (TDP-43)",
        ensemblId: "ENSG00000120948",
        diseaseAssociation: 9.2, tractability: 4.0, novelty: 7.0, composite: 8.8,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 9.2, literature: 8.9, pathways: 7.4 },
        knownDrugs: [], numDrugs: 1,
        narrative: "TDP-43 pathology — cytoplasmic mislocalization and nuclear depletion — is present in >95% of all ALS cases, making it the near-universal hallmark of disease regardless of genetic cause. Restoring TDP-43 nuclear function and clearing cytoplasmic aggregates are the two major therapeutic hypotheses, pursued through phase separation modulators, autophagy inducers, and small molecules that stabilize the nuclear import pathway. No approved therapy directly targets TDP-43, placing it among the highest-novelty, highest-impact opportunities in neurodegeneration."
      },
      {
        symbol: "FUS", name: "FUS RNA binding protein",
        ensemblId: "ENSG00000089280",
        diseaseAssociation: 8.7, tractability: 3.0, novelty: 8.5, composite: 8.2,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 8.7, literature: 7.2, pathways: 6.1 },
        knownDrugs: [], numDrugs: 0,
        narrative: "FUS mutations cause a juvenile-onset, rapidly progressive form of ALS through cytoplasmic mislocalization, stress granule sequestration, and toxic RNA-binding gain-of-function. The structural similarity to TDP-43 positions FUS as a key validation target for phase separation biology and liquid-to-solid transition inhibitors being developed across multiple neurodegeneration indications. No FUS-directed clinical program exists, representing a high-novelty opportunity with the TDP-43 biology de-risking the pathway."
      },
      {
        symbol: "C9orf72", name: "C9orf72-SMCR8 complex subunit",
        ensemblId: "ENSG00000147894",
        diseaseAssociation: 9.0, tractability: 6.0, novelty: 5.5, composite: 8.1,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 9.0, literature: 8.2, known_drugs: 4.1 },
        knownDrugs: ["BIIB078", "WVE-004"], numDrugs: 2,
        narrative: "The G4C2 hexanucleotide repeat expansion in C9orf72 is the most common genetic cause of ALS and FTD, accounting for ~40% of familial cases and 5-10% of sporadic ALS. Repeat-targeting ASOs and RNA therapies have reached Phase II trials, leveraging the same genetic medicine platform validated by tofersen in SOD1-ALS. Reducing repeat-derived dipeptide repeat proteins and toxic RNA foci while preserving C9orf72 protein function remains the key therapeutic design challenge."
      },
      {
        symbol: "OPTN", name: "Optineurin",
        ensemblId: "ENSG00000123240",
        diseaseAssociation: 7.8, tractability: 3.0, novelty: 9.5, composite: 7.6,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 7.8, pathways: 6.4, literature: 5.1 },
        knownDrugs: [], numDrugs: 0,
        narrative: "OPTN is an autophagy receptor and NF-κB regulator whose loss-of-function mutations impair selective autophagy of damaged mitochondria (mitophagy) and misfolded protein clearance — two converging pathways in ALS neurodegeneration. Its role in TBK1 signaling links it to neuroinflammation as well as proteostasis, making OPTN a node at the intersection of multiple ALS pathogenic mechanisms. No drug has targeted OPTN directly; autophagy inducers acting upstream may be the most tractable near-term strategy."
      },
      {
        symbol: "TBK1", name: "TANK binding kinase 1",
        ensemblId: "ENSG00000110324",
        diseaseAssociation: 7.5, tractability: 8.5, novelty: 6.5, composite: 7.4,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 7.5, pathways: 7.1, known_drugs: 6.8 },
        knownDrugs: ["Amlexanox", "MRT-67307"], numDrugs: 2,
        narrative: "TBK1 haploinsufficiency causes ALS through impaired autophagy flux and neuroinflammatory dysregulation, placing it at the intersection of proteostasis and innate immune signaling in motor neurons. TBK1 kinase inhibitors used in oncology provide a clinical-stage scaffold for neurological repurposing, though CNS penetration and selectivity are key development challenges. The causal genetic link makes patient stratification straightforward — TBK1 mutation carriers are the primary indication target."
      },
      {
        symbol: "NEFL", name: "Neurofilament light polypeptide",
        ensemblId: "ENSG00000277586",
        diseaseAssociation: 7.2, tractability: 3.0, novelty: 8.0, composite: 7.1,
        dominantDatatype: "literature",
        datatypeBreakdown: { literature: 7.2, rna_expression: 6.8, genetic_association: 4.3 },
        knownDrugs: [], numDrugs: 1,
        narrative: "Serum and CSF neurofilament light chain (NfL) is the most validated biomarker of neurodegeneration in ALS, with levels correlating with progression rate, survival, and drug target engagement. Therapeutically, restoring neurofilament stoichiometry and axonal cytoskeletal integrity represents an underexplored structural approach to neuroprotection. NfL's utility as both a target and biomarker creates opportunities to use serum NfL as a pharmacodynamic readout for emerging structural neuroprotection strategies."
      },
      {
        symbol: "VEGF", name: "Vascular endothelial growth factor A",
        ensemblId: "ENSG00000112715",
        diseaseAssociation: 6.8, tractability: 10.0, novelty: 5.0, composite: 6.8,
        dominantDatatype: "literature",
        datatypeBreakdown: { literature: 6.8, genetic_association: 5.9, known_drugs: 8.3 },
        knownDrugs: ["Bevacizumab", "Aflibercept"], numDrugs: 4,
        narrative: "VEGF has a dual role in ALS: low VEGF haplotypes are associated with increased ALS risk via impaired motor neuron vascular supply, while VEGF has direct neuroprotective effects through VEGFR2 on motor neurons. Intrathecal VEGF delivery showed signals of slowing progression in early Phase II trials, motivating gene therapy approaches that can sustain local CNS levels. The extensive approved VEGF biology de-risks the mechanism but optimal delivery modality remains unsolved."
      },
      {
        symbol: "ATXN2", name: "Ataxin 2",
        ensemblId: "ENSG00000204842",
        diseaseAssociation: 6.5, tractability: 5.5, novelty: 8.5, composite: 6.6,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 6.5, pathways: 5.8, literature: 5.4 },
        knownDrugs: [], numDrugs: 1,
        narrative: "Intermediate-length polyglutamine expansions in ATXN2 (27-33 repeats) are a genetic risk factor for ALS and modify TDP-43 toxicity by promoting its pathological phase transitions in stress granules. ATXN2 antisense oligonucleotide knockdown dramatically extends survival in TDP-43 mouse models, establishing strong preclinical proof-of-concept. An ASO program targeting ATXN2 is advancing toward clinical development, potentially as a mutation-agnostic approach targeting the convergent TDP-43 toxicity pathway."
      },
      {
        symbol: "CHMP2B", name: "Charged multivesicular body protein 2B",
        ensemblId: "ENSG00000083799",
        diseaseAssociation: 6.2, tractability: 2.0, novelty: 9.5, composite: 6.3,
        dominantDatatype: "genetic_association",
        datatypeBreakdown: { genetic_association: 6.2, pathways: 5.9 },
        knownDrugs: [], numDrugs: 0,
        narrative: "CHMP2B mutations impair the ESCRT-III pathway for endosomal sorting and autophagy, leading to accumulation of ubiquitinated protein aggregates in motor neurons. Its genetic association with ALS and FTD implicates vesicular trafficking dysfunction as a converging pathogenic mechanism alongside TDP-43 and FUS pathology. No direct CHMP2B-targeting therapy exists; ESCRT pathway restoration through autophagy enhancement represents the most tractable avenue with the highest novelty potential."
      }
    ]
  }
};

// Aliases for common abbreviations
MOCK_DATA["idiopathic pulmonary fibrosis"] = MOCK_DATA["ipf"];
MOCK_DATA["uc"] = MOCK_DATA["ulcerative colitis"];
MOCK_DATA["amyotrophic lateral sclerosis"] = MOCK_DATA["als"];

var SUGGESTED_DISEASES = [
  { value: "IPF", label: "IPF — Idiopathic Pulmonary Fibrosis" },
  { value: "Ulcerative Colitis", label: "Ulcerative Colitis" },
  { value: "ALS", label: "ALS — Amyotrophic Lateral Sclerosis" },
  { value: "NSCLC", label: "NSCLC — Non-small cell lung cancer" },
  { value: "Alzheimer's Disease", label: "Alzheimer's Disease" },
  { value: "Breast Cancer", label: "Breast Cancer" },
  { value: "Type 2 Diabetes", label: "Type 2 Diabetes" },
  { value: "Psoriasis", label: "Psoriasis" },
  { value: "Rheumatoid Arthritis", label: "Rheumatoid Arthritis" },
  { value: "Crohn's Disease", label: "Crohn's Disease" },
];

var MOCK_TRIALS = {
  "TGFB1": [
    { nctId: "NCT04572802", title: "Safety and Efficacy of SRK-181 in IPF Patients", phase: "PHASE2", status: "RECRUITING", sponsor: "Scholar Rock", url: "https://clinicaltrials.gov/study/NCT04572802" },
    { nctId: "NCT03865498", title: "Bexotegrast (PLN-74809) in Idiopathic Pulmonary Fibrosis", phase: "PHASE2", status: "COMPLETED", sponsor: "Pliant Therapeutics", url: "https://clinicaltrials.gov/study/NCT03865498" },
    { nctId: "NCT05469763", title: "Inhaled TGF-β1 siRNA in Fibrotic ILD", phase: "PHASE1", status: "RECRUITING", sponsor: "Inhala Therapeutics", url: "https://clinicaltrials.gov/study/NCT05469763" },
  ],
  "LOXL2": [
    { nctId: "NCT01769196", title: "Simtuzumab in Idiopathic Pulmonary Fibrosis", phase: "PHASE2", status: "COMPLETED", sponsor: "Gilead Sciences", url: "https://clinicaltrials.gov/study/NCT01769196" },
  ],
  "CCN2": [
    { nctId: "NCT04563650", title: "ZEPHYRUS-IPF: Pamrevlumab in IPF", phase: "PHASE3", status: "COMPLETED", sponsor: "FibroGen", url: "https://clinicaltrials.gov/study/NCT04563650" },
    { nctId: "NCT01890265", title: "Open-Label Extension Study of Pamrevlumab in IPF", phase: "PHASE2", status: "COMPLETED", sponsor: "FibroGen", url: "https://clinicaltrials.gov/study/NCT01890265" },
  ],
  "SOD1": [
    { nctId: "NCT02623699", title: "Tofersen in SOD1 ALS", phase: "PHASE3", status: "COMPLETED", sponsor: "Biogen", url: "https://clinicaltrials.gov/study/NCT02623699" },
    { nctId: "NCT05089474", title: "Tofersen Long-Term Extension in SOD1 ALS", phase: "PHASE3", status: "ACTIVE_NOT_RECRUITING", sponsor: "Biogen", url: "https://clinicaltrials.gov/study/NCT05089474" },
  ],
  "TNF": [
    { nctId: "NCT03945643", title: "Adalimumab vs Vedolizumab in UC", phase: "PHASE4", status: "COMPLETED", sponsor: "AbbVie", url: "https://clinicaltrials.gov/study/NCT03945643" },
    { nctId: "NCT04576091", title: "Infliximab Biosimilar CT-P13 SC in UC", phase: "PHASE3", status: "COMPLETED", sponsor: "Celltrion", url: "https://clinicaltrials.gov/study/NCT04576091" },
  ],
};
