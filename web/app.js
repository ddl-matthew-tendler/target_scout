(function () {
  'use strict';

  var _antd = antd;
  var ConfigProvider = _antd.ConfigProvider;
  var Button = _antd.Button;
  var Switch = _antd.Switch;
  var Tag = _antd.Tag;
  var Skeleton = _antd.Skeleton;
  var Drawer = _antd.Drawer;
  var Tooltip = _antd.Tooltip;
  var Spin = _antd.Spin;
  var AutoComplete = _antd.AutoComplete;
  var Divider = _antd.Divider;
  var Typography = _antd.Typography;
  var Input = _antd.Input;

  var Text = Typography.Text;
  var Paragraph = Typography.Paragraph;

  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var useMemo = React.useMemo;
  var useCallback = React.useCallback;

  // ── Theme ──────────────────────────────────────────────
  var dominoTheme = {
    token: {
      colorPrimary: '#3B3BD3',
      colorPrimaryHover: '#2929C4',
      colorPrimaryActive: '#1820A0',
      colorText: '#2E2E38',
      colorTextSecondary: '#65657B',
      colorTextTertiary: '#8F8FA3',
      colorSuccess: '#28A464',
      colorWarning: '#CCB718',
      colorError: '#C20A29',
      colorInfo: '#0070CC',
      colorBgContainer: '#FFFFFF',
      colorBgLayout: '#FAFAFA',
      colorBorder: '#E0E0E0',
      fontFamily: 'Inter, Lato, Helvetica Neue, Arial, sans-serif',
      fontSize: 14,
      borderRadius: 4,
      borderRadiusLG: 8,
    },
    components: {
      Button: { primaryShadow: 'none', defaultShadow: 'none' },
    },
  };

  // ── Data-type colors & labels ──────────────────────────
  var DT_COLORS = {
    genetic_association: '#3B3BD3',
    literature:          '#0070CC',
    known_drugs:         '#28A464',
    pathways:            '#CCB718',
    rna_expression:      '#E835A7',
    animal_model:        '#FF6543',
    somatic_mutation:    '#2EDCC4',
  };

  var DT_LABELS = {
    genetic_association: 'Genetic',
    literature:          'Literature',
    known_drugs:         'Drugs',
    pathways:            'Pathways',
    rna_expression:      'RNA',
    animal_model:        'Animal',
    somatic_mutation:    'Somatic',
  };

  function dtColor(dt) { return DT_COLORS[dt] || '#8F8FA3'; }
  function dtLabel(dt) { return DT_LABELS[dt] || dt; }

  function scoreColor(v) {
    if (v >= 8.0) return '#28A464';
    if (v >= 6.0) return '#543FDE';
    if (v >= 4.0) return '#CCB718';
    return '#C20A29';
  }

  function phaseBadgeColor(phase) {
    if (!phase) return 'default';
    var p = phase.toUpperCase();
    if (p.indexOf('3') !== -1 || p.indexOf('4') !== -1) return 'red';
    if (p.indexOf('2') !== -1) return 'orange';
    if (p.indexOf('1') !== -1) return 'blue';
    return 'default';
  }

  function phaseLabel(phase) {
    if (!phase) return 'N/A';
    return phase.replace('PHASE', 'Ph ').replace(/_/g, '/');
  }

  function statusColor(status) {
    if (!status) return 'default';
    var s = status.toUpperCase();
    if (s === 'RECRUITING') return 'green';
    if (s === 'COMPLETED') return 'blue';
    if (s === 'ACTIVE_NOT_RECRUITING') return 'orange';
    return 'default';
  }

  var COMPOSITE_TOOLTIP = 'Weighted composite: (Disease assoc \xd72.0) + (Tractability \xd71.5) + (Novelty \xd71.5), normalized 0\u201310. Disease association from Open Targets overall score. Tractability from OT tractability buckets. Novelty = 10 minus known drug count.';
  var NOVELTY_TOOLTIP = 'How unexplored this target is: 10 = no known drugs, 0 = heavily drugged. Higher novelty = greater first-in-class opportunity.';
  var TRACTABILITY_TOOLTIP = 'Estimated druggability based on Open Targets tractability buckets (small molecule, antibody, PROTAC). 10 = clinical precedence, 2 = limited tractability data.';
  var DISEASE_TOOLTIP = 'Overall disease-association score from Open Targets (0\u201310), integrating genetic, literature, drug, pathway, and animal model evidence.';

  // ── ScoreBar ───────────────────────────────────────────
  function ScoreBar(props) {
    var bar = h('div', { className: 'score-bar-item' },
      h('span', { className: 'score-bar-label' }, props.label),
      h('div', { className: 'score-bar-track' },
        h('div', {
          className: 'score-bar-fill',
          style: { width: (props.value * 10) + '%', background: props.color },
        })
      ),
      h('span', { className: 'score-bar-value' }, props.value.toFixed(1))
    );
    return props.tip ? h(Tooltip, { title: props.tip, placement: 'right' }, bar) : bar;
  }

  // ── TargetRow ──────────────────────────────────────────
  function TargetRow(props) {
    var target = props.target;
    var rank = props.rank;
    var narrative = props.narrative;
    var selected = props.selected;
    var onClick = props.onClick;

    var cls = 'target-row' + (selected ? ' target-row-selected' : '');
    var sc = scoreColor(target.composite);

    // Show top 2 drug names inline, then "+N more" if applicable
    var drugTags = null;
    if (target.knownDrugs && target.knownDrugs.length > 0) {
      var shown = target.knownDrugs.slice(0, 2);
      var extra = target.numDrugs - shown.length;
      drugTags = h('span', { style: { display: 'inline-flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' } },
        shown.map(function(d) { return h(Tag, { key: d, color: 'green', style: { fontSize: 10, margin: 0 } }, d); }),
        extra > 0 ? h('span', { style: { fontSize: 10, color: '#65657B' } }, '+' + extra + ' more') : null
      );
    } else {
      drugTags = h(Tag, { color: 'volcano', style: { fontSize: 11 } }, 'No known drugs — novel target');
    }

    return h('div', { className: cls, onClick: onClick },
      h('div', { className: 'target-rank' }, '#' + rank),
      h('div', { className: 'target-body' },
        h('div', { className: 'target-header-row' },
          h('span', { className: 'target-symbol' }, target.symbol),
          h('span', { className: 'target-name' }, target.name),
          h('div', { className: 'composite-score-col' },
            h(Tooltip, { title: COMPOSITE_TOOLTIP, placement: 'left' },
              h('span', null,
                h('span', { className: 'composite-score-label' }, 'Score'),
                h('span', { className: 'composite-score', style: { color: sc } }, target.composite.toFixed(1))
              )
            )
          )
        ),
        h('div', { className: 'score-bars' },
          h(ScoreBar, { label: 'Disease assoc', value: target.diseaseAssociation, color: '#3B3BD3', tip: DISEASE_TOOLTIP }),
          h(ScoreBar, { label: 'Tractability',  value: target.tractability,       color: '#28A464', tip: TRACTABILITY_TOOLTIP }),
          h(ScoreBar, { label: 'Novelty',       value: target.novelty,            color: '#E8620A', tip: NOVELTY_TOOLTIP })
        ),
        h('div', { className: 'score-source' }, 'Source: Open Targets Platform'),
        h('div', { className: 'target-narrative' },
          narrative
            ? h('p', { className: 'narrative-text' },
                narrative.length > 180
                  ? [narrative.slice(0, 180) + '\u2026 ', h('span', { key: 'rm', className: 'read-more' }, 'Read more \u2192')]
                  : narrative
              )
            : h(Skeleton, { active: true, paragraph: { rows: 1 }, title: false })
        ),
        h('div', { className: 'target-tags' },
          h(Tag, { color: 'purple', style: { fontSize: 11 } }, dtLabel(target.dominantDatatype)),
          drugTags
        )
      )
    );
  }

  // ── EvidenceGraph (D3 force) ───────────────────────────
  function EvidenceGraph(props) {
    var disease = props.disease;
    var targets = props.targets;
    var selectedTarget = props.selectedTarget;
    var onSelectTarget = props.onSelectTarget;

    var svgRef = useRef(null);
    var simRef  = useRef(null);

    useEffect(function () {
      if (!targets || !targets.length || !svgRef.current) return;

      var container = svgRef.current.parentElement;
      var W = container.clientWidth || 400;
      var H = container.clientHeight || 400;

      var svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.attr('width', W).attr('height', H);

      // Defs: glow filter
      var defs = svg.append('defs');
      var filt = defs.append('filter').attr('id', 'ts-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
      filt.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
      var fm = filt.append('feMerge');
      fm.append('feMergeNode').attr('in', 'blur');
      fm.append('feMergeNode').attr('in', 'SourceGraphic');

      var nodes = [{ id: '__d__', label: disease || 'Disease', type: 'disease', x: W / 2, y: H / 2, fx: null, fy: null }]
        .concat(targets.map(function (t) {
          return { id: t.symbol, label: t.symbol, type: 'target', data: t };
        }));

      var links = targets.map(function (t) {
        return { source: '__d__', target: t.symbol, score: t.diseaseAssociation / 10, dt: t.dominantDatatype };
      });

      if (simRef.current) simRef.current.stop();

      var sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(function (d) { return d.id; }).distance(H * 0.28).strength(0.6))
        .force('charge', d3.forceManyBody().strength(-320))
        .force('center', d3.forceCenter(W / 2, H / 2))
        .force('collision', d3.forceCollide(28));

      simRef.current = sim;

      // Links
      var linkSel = svg.append('g').attr('class', 'ts-links')
        .selectAll('line').data(links).enter().append('line')
        .attr('stroke', function (d) { return dtColor(d.dt); })
        .attr('stroke-width', function (d) { return Math.max(1.5, d.score * 5); })
        .attr('stroke-opacity', 0.55);

      // Drag behaviour
      function drag(sim) {
        return d3.drag()
          .on('start', function (event, d) {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', function (event, d) { d.fx = event.x; d.fy = event.y; })
          .on('end', function (event, d) {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          });
      }

      // Nodes
      var nodeSel = svg.append('g').attr('class', 'ts-nodes')
        .selectAll('g').data(nodes).enter().append('g')
        .attr('class', 'graph-node')
        .call(drag(sim))
        .on('click', function (event, d) {
          if (d.type === 'target') onSelectTarget(d.data);
        });

      nodeSel.append('circle')
        .attr('r', function (d) { return d.type === 'disease' ? 30 : 19; })
        .attr('fill', function (d) {
          if (d.type === 'disease') return '#E8620A';
          return selectedTarget && selectedTarget.symbol === d.id ? '#2929C4' : '#3B3BD3';
        })
        .attr('filter', function (d) {
          return selectedTarget && selectedTarget.symbol === d.id ? 'url(#ts-glow)' : null;
        })
        .attr('stroke', function (d) {
          return selectedTarget && selectedTarget.symbol === d.id ? '#1820A0' : 'rgba(255,255,255,0.4)';
        })
        .attr('stroke-width', function (d) {
          return selectedTarget && selectedTarget.symbol === d.id ? 2.5 : 1.5;
        })
        .style('cursor', function (d) { return d.type === 'target' ? 'pointer' : 'default'; });

      nodeSel.append('text')
        .text(function (d) { return d.label; })
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', function (d) { return d.type === 'disease' ? 10 : 9; })
        .attr('font-weight', '700')
        .attr('fill', '#fff')
        .attr('pointer-events', 'none')
        .attr('font-family', 'Inter, sans-serif');

      // Score rings (outer arc on target nodes) — larger + animated when selected
      nodeSel.filter(function (d) { return d.type === 'target'; }).append('circle')
        .attr('r', function (d) { return selectedTarget && selectedTarget.symbol === d.id ? 27 : 23; })
        .attr('fill', 'none')
        .attr('stroke', function (d) {
          if (selectedTarget && selectedTarget.symbol === d.id) return '#1820A0';
          return scoreColor(d.data ? d.data.composite : 5);
        })
        .attr('stroke-width', function(d) { return selectedTarget && selectedTarget.symbol === d.id ? 2.5 : 1.5; })
        .attr('stroke-opacity', function(d) { return selectedTarget && selectedTarget.symbol === d.id ? 1 : 0.5; })
        .attr('stroke-dasharray', function(d) { return selectedTarget && selectedTarget.symbol === d.id ? null : '3,2'; })
        .attr('pointer-events', 'none');

      sim.on('tick', function () {
        nodes.forEach(function (d) {
          d.x = Math.max(40, Math.min(W - 40, d.x));
          d.y = Math.max(40, Math.min(H - 40, d.y));
        });
        linkSel
          .attr('x1', function (d) { return d.source.x; })
          .attr('y1', function (d) { return d.source.y; })
          .attr('x2', function (d) { return d.target.x; })
          .attr('y2', function (d) { return d.target.y; });
        nodeSel.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
      });

      return function () { sim.stop(); };
    }, [targets, disease, selectedTarget]);

    return h('svg', { ref: svgRef, className: 'evidence-graph-svg' });
  }

  // ── DetailPane (Drawer content) ────────────────────────
  function DetailPane(props) {
    var target = props.target;
    var disease = props.disease;
    var narrative = props.narrative;
    var trials = props.trials;

    if (!target) return null;

    var sc = scoreColor(target.composite);

    return h('div', null,
      // Score cards
      h('div', { className: 'detail-section' },
        h('div', { className: 'detail-scores' },
          h('div', { className: 'detail-score-card' },
            h('div', { className: 'detail-score-label' }, 'Composite'),
            h('div', { className: 'detail-score-value', style: { color: sc } }, target.composite.toFixed(1))
          ),
          h('div', { className: 'detail-score-card' },
            h('div', { className: 'detail-score-label' }, 'Disease Assoc'),
            h('div', { className: 'detail-score-value', style: { color: '#543FDE' } }, target.diseaseAssociation.toFixed(1))
          ),
          h('div', { className: 'detail-score-card' },
            h('div', { className: 'detail-score-label' }, 'Tractability'),
            h('div', { className: 'detail-score-value', style: { color: '#28A464' } }, target.tractability.toFixed(1))
          ),
          h('div', { className: 'detail-score-card' },
            h('div', { className: 'detail-score-label' }, 'Novelty'),
            h('div', { className: 'detail-score-value', style: { color: '#FF6543' } }, target.novelty.toFixed(1))
          )
        )
      ),

      // Narrative
      h('div', { className: 'detail-section' },
        h('div', { className: 'detail-section-title' }, 'Analysis'),
        narrative
          ? h('p', { className: 'detail-narrative' }, narrative)
          : h(Skeleton, { active: true, paragraph: { rows: 3 }, title: false })
      ),

      // Evidence breakdown
      target.datatypeBreakdown && Object.keys(target.datatypeBreakdown).length > 0
        ? h('div', { className: 'detail-section' },
            h('div', { className: 'detail-section-title' }, 'Evidence Breakdown'),
            h('div', { className: 'score-bars' },
              Object.entries(target.datatypeBreakdown)
                .sort(function (a, b) { return b[1] - a[1]; })
                .map(function (entry) {
                  return h(ScoreBar, { key: entry[0], label: dtLabel(entry[0]), value: entry[1], color: dtColor(entry[0]) });
                })
            )
          )
        : null,

      // Known drugs
      target.knownDrugs && target.knownDrugs.length > 0
        ? h('div', { className: 'detail-section' },
            h('div', { className: 'detail-section-title' }, 'Known Drugs'),
            h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
              target.knownDrugs.map(function (d) {
                return h(Tag, { key: d, color: 'green' }, d);
              })
            )
          )
        : null,

      h(Divider, { style: { margin: '12px 0' } }),

      // Similar trials
      h('div', { className: 'detail-section' },
        h('div', { className: 'detail-section-title' }, 'Similar Programs — ClinicalTrials.gov'),
        trials === undefined
          ? h(Skeleton, { active: true, paragraph: { rows: 2 }, title: false })
          : trials === null || trials.length === 0
          ? h('p', { style: { fontSize: 13, color: '#8F8FA3' } }, 'No matching trials found.')
          : trials.map(function (trial) {
              return h('div', { key: trial.nctId, className: 'trial-card' },
                h('a', { href: trial.url, target: '_blank', rel: 'noopener noreferrer',
                  style: { textDecoration: 'none' } },
                  h('p', { className: 'trial-title' }, trial.title),
                  h('div', { className: 'trial-meta' },
                    h('span', { className: 'trial-nct' }, trial.nctId),
                    h(Tag, { color: phaseBadgeColor(trial.phase), style: { fontSize: 10 } }, phaseLabel(trial.phase)),
                    h(Tag, { color: statusColor(trial.status), style: { fontSize: 10 } },
                      (trial.status || '').replace(/_/g, ' ')
                    ),
                    trial.sponsor ? h('span', { style: { fontSize: 11, color: '#8F8FA3' } }, trial.sponsor) : null
                  )
                )
              );
            })
      ),

      // Open Targets link
      target.ensemblId
        ? h('div', { style: { marginTop: 16 } },
            h('a', {
              href: 'https://platform.opentargets.org/target/' + target.ensemblId,
              target: '_blank',
              rel: 'noopener noreferrer',
              style: { fontSize: 12, color: '#3B3BD3' },
            }, '↗ View ' + target.symbol + ' on Open Targets Platform')
          )
        : null
    );
  }

  // ── Export CSV ─────────────────────────────────────────
  function exportCSV(targets, disease) {
    var header = 'Rank,Symbol,Name,Composite,Disease Assoc,Tractability,Novelty,Dominant Evidence,Known Drugs';
    var rows = targets.map(function(t, i) {
      return [
        i + 1, t.symbol,
        '"' + (t.name || '').replace(/"/g, '""') + '"',
        t.composite, t.diseaseAssociation, t.tractability, t.novelty,
        dtLabel(t.dominantDatatype),
        '"' + (t.knownDrugs || []).join('; ') + '"'
      ].join(',');
    });
    var csv = [header].concat(rows).join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'targetscout_' + (disease || 'results').replace(/\s+/g, '_').toLowerCase() + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Main App ───────────────────────────────────────────
  function App() {
    var _s0 = useState('');           var inputDisease = _s0[0]; var setInputDisease = _s0[1];
    var _s1 = useState('');           var disease      = _s1[0]; var setDisease      = _s1[1];
    var _s2 = useState(false);        var loading      = _s2[0]; var setLoading      = _s2[1];
    var _s3 = useState([]);           var targets      = _s3[0]; var setTargets      = _s3[1];
    var _s4 = useState({});           var narratives   = _s4[0]; var setNarratives   = _s4[1];
    var _s5 = useState(null);         var selected     = _s5[0]; var setSelected     = _s5[1];
    var _s6 = useState(true);         var useDummy     = _s6[0]; var setUseDummy     = _s6[1];
    var _s7 = useState(false);        var connected    = _s7[0]; var setConnected    = _s7[1];
    var _s8 = useState('');           var summary      = _s8[0]; var setSummary      = _s8[1];
    var _s9 = useState({});           var trialsCache  = _s9[0]; var setTrialsCache  = _s9[1];
    var _sA = useState('');           var resolvedName = _sA[0]; var setResolvedName = _sA[1];
    var _sB = useState('');           var resolvedEfo  = _sB[0]; var setResolvedEfo  = _sB[1];

    // Connectivity probe
    useEffect(function () {
      fetch('api/health')
        .then(function (r) { if (r.ok) setConnected(true); })
        .catch(function () {});
    }, []);

    function streamDummyNarratives(tgts) {
      tgts.forEach(function (t, i) {
        setTimeout(function () {
          setNarratives(function (prev) {
            var n = Object.assign({}, prev);
            n[t.symbol] = t.narrative || '';
            return n;
          });
        }, (i + 1) * 650);
      });
    }

    function handleSearch(q) {
      var query = (q || inputDisease || '').trim();
      if (!query) return;

      setDisease(query);
      setLoading(true);
      setTargets([]);
      setNarratives({});
      setSelected(null);
      setSummary('');
      setResolvedName('');
      setResolvedEfo('');

      if (useDummy || !connected) {
        setTimeout(function () {
          var key = query.toLowerCase();
          var entry = MOCK_DATA[key] || MOCK_DATA['ipf'];
          var efoMap = { ipf: 'EFO_0000768', 'idiopathic pulmonary fibrosis': 'EFO_0000768', 'ulcerative colitis': 'EFO_0000384', uc: 'EFO_0000384', als: 'EFO_0000253', 'amyotrophic lateral sclerosis': 'EFO_0000253' };
          var nameMap = { ipf: 'Idiopathic pulmonary fibrosis', 'ulcerative colitis': 'Ulcerative colitis', uc: 'Ulcerative colitis', als: 'Amyotrophic lateral sclerosis', 'amyotrophic lateral sclerosis': 'Amyotrophic lateral sclerosis', 'idiopathic pulmonary fibrosis': 'Idiopathic pulmonary fibrosis' };
          setResolvedName(nameMap[key] || entry.targets[0] && query);
          setResolvedEfo(efoMap[key] || '');
          setTargets(entry.targets);
          setSummary(entry.summary || '');
          setLoading(false);
          streamDummyNarratives(entry.targets);
        }, 1200);
        return;
      }

      // Live path
      fetch('api/score?disease=' + encodeURIComponent(query))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          var tgts = data.targets || [];
          setTargets(tgts);
          setResolvedName(data.diseaseName || '');
          setResolvedEfo(data.efoId || '');
          setSummary(data.diseaseName ? data.diseaseName : '');
          setLoading(false);

          // Fan-out narrative requests
          tgts.forEach(function (t) {
            var dt = Object.keys(t.datatypeBreakdown || {}).join(',');
            var drugs = (t.knownDrugs || []).join(',');
            var url = 'api/narrative?target=' + encodeURIComponent(t.symbol)
              + '&disease=' + encodeURIComponent(query)
              + '&disease_assoc=' + t.diseaseAssociation
              + '&datatypes=' + encodeURIComponent(dt)
              + '&drugs=' + encodeURIComponent(drugs);
            fetch(url)
              .then(function (r) { return r.json(); })
              .then(function (nd) {
                setNarratives(function (prev) {
                  var n = Object.assign({}, prev);
                  n[t.symbol] = nd.text || '';
                  return n;
                });
              })
              .catch(function () {});
          });
        })
        .catch(function () {
          setLoading(false);
          // Fallback to dummy
          setUseDummy(true);
          var key = query.toLowerCase();
          var entry = MOCK_DATA[key] || MOCK_DATA['ipf'];
          setTargets(entry.targets);
          setSummary(entry.summary || '');
          streamDummyNarratives(entry.targets);
        });
    }

    function handleTargetClick(target) {
      setSelected(target);

      var sym = target.symbol;
      if (trialsCache[sym] !== undefined) return;

      // Mark loading
      setTrialsCache(function (prev) {
        var c = Object.assign({}, prev);
        c[sym] = undefined; // undefined = loading
        return c;
      });

      if (useDummy || !connected) {
        // Load mock trials
        setTimeout(function () {
          setTrialsCache(function (prev) {
            var c = Object.assign({}, prev);
            c[sym] = MOCK_TRIALS[sym] || [];
            return c;
          });
        }, 600);
        return;
      }

      fetch('api/similar?target=' + encodeURIComponent(sym) + '&disease=' + encodeURIComponent(disease))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          setTrialsCache(function (prev) {
            var c = Object.assign({}, prev);
            c[sym] = data.trials || [];
            return c;
          });
        })
        .catch(function () {
          setTrialsCache(function (prev) {
            var c = Object.assign({}, prev);
            c[sym] = [];
            return c;
          });
        });
    }

    // ── Legend items ──────────────────────────────────────
    var legendItems = [
      { dt: 'genetic_association' },
      { dt: 'literature' },
      { dt: 'known_drugs' },
      { dt: 'pathways' },
    ];

    // ── Render ────────────────────────────────────────────
    return h(ConfigProvider, { theme: dominoTheme },
      h('div', { className: 'app-layout' },

        // Header
        h('div', { className: 'search-header' },
          h('div', { className: 'search-header-inner' },
            h('div', { className: 'app-logo' },
              h('div', { className: 'app-logo-icon' }, 'TS'),
              h('span', { className: 'app-logo-text' }, 'TargetScout')
            ),
            h('div', { className: 'search-controls' },
              h(AutoComplete, {
                className: 'disease-input',
                value: inputDisease,
                onChange: function(v) { setInputDisease(v); if (summary) setSummary(''); },
                onSelect: function (v) { setInputDisease(v); handleSearch(v); },
                onKeyDown: function (e) { if (e.key === 'Enter') handleSearch(); },
                options: SUGGESTED_DISEASES.filter(function (d) {
                  return !inputDisease || d.value.toLowerCase().indexOf(inputDisease.toLowerCase()) !== -1
                    || d.label.toLowerCase().indexOf(inputDisease.toLowerCase()) !== -1;
                }),
                size: 'large',
                style: { minWidth: 340 },
                children: h(Input, {
                  placeholder: 'Enter disease or indication — e.g. IPF, ALS, Ulcerative Colitis',
                  size: 'large',
                  style: { background: '#fff', borderColor: '#C0C0D8', color: '#2E2E38' },
                  onPressEnter: function () { handleSearch(); },
                })
              }),
              h(Button, {
                type: 'primary',
                size: 'large',
                loading: loading,
                onClick: function () { handleSearch(); },
                className: 'search-btn',
                style: { minWidth: 130 },
              }, loading ? 'Analyzing…' : 'Find Targets')
            ),
            h('div', { className: 'dummy-toggle' },
              h(Tooltip, {
                title: useDummy
                  ? 'Using built-in demo data. Toggle off to query Open Targets + ClinicalTrials.gov live (requires network).'
                  : 'Using live data from Open Targets + ClinicalTrials.gov.',
                placement: 'bottomRight',
              },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' } },
                  h('span', { className: 'dummy-toggle-label' }, useDummy ? 'Demo' : 'Live'),
                  h(Switch, {
                    checked: useDummy,
                    onChange: setUseDummy,
                    size: 'small',
                  })
                )
              )
            )
          )
        ),

        // Main
        h('div', { className: 'main-content' },
          summary
            ? h('div', { className: 'summary-bar' },
                h('span', { className: 'summary-text' }, summary)
              )
            : null,

          h('div', { className: 'content-split' },

            // Left: target list
            h('div', { className: 'targets-panel' },
              h('div', { className: 'panel-header' },
                h('div', { style: { flex: 1, minWidth: 0 } },
                  h('span', { className: 'panel-title' },
                    targets.length ? 'Top ' + targets.length + ' Target Hypotheses' : 'Target Hypotheses'
                  ),
                  resolvedName ? h('div', { className: 'resolved-disease' },
                    resolvedName,
                    resolvedEfo ? h('a', {
                      href: 'https://platform.opentargets.org/disease/' + resolvedEfo,
                      target: '_blank', rel: 'noopener noreferrer',
                      className: 'efo-link',
                    }, ' ' + resolvedEfo) : null
                  ) : null
                ),
                targets.length ? h(Button, {
                  size: 'small',
                  onClick: function(e) { e.stopPropagation(); exportCSV(targets, disease); },
                  style: { flexShrink: 0 },
                }, 'Export CSV') : null
              ),

              loading
                ? h('div', { className: 'skeleton-list' },
                    [0, 1, 2, 3, 4].map(function (i) {
                      return h('div', { key: i, className: 'skeleton-row' },
                        h(Skeleton, { active: true, paragraph: { rows: 2 }, title: { width: 80 } })
                      );
                    })
                  )
                : targets.length > 0
                ? h('div', { className: 'target-list' },
                    targets.map(function (t, idx) {
                      return h(TargetRow, {
                        key: t.symbol,
                        target: t,
                        rank: idx + 1,
                        narrative: narratives[t.symbol],
                        selected: selected && selected.symbol === t.symbol,
                        onClick: function () { handleTargetClick(t); },
                      });
                    })
                  )
                : h('div', { className: 'empty-state' },
                    h('div', { className: 'empty-icon' }),
                    h('div', { className: 'empty-text' }, 'Enter a disease to discover targets'),
                    h('div', { className: 'empty-sub' },
                      'Powered by Open Targets Platform · ClinicalTrials.gov · Domino Model Endpoint · Agent Orchestration'
                    )
                  )
            ),

            // Right: graph
            h('div', { className: 'graph-panel' },
              h('div', { className: 'panel-header' },
                h('span', { className: 'panel-title' }, 'Evidence Graph'),
                h('div', { className: 'legend' },
                  legendItems.map(function (item) {
                    return h('span', { key: item.dt, className: 'legend-item' },
                      h('span', { className: 'legend-dot', style: { background: dtColor(item.dt) } }),
                      h('span', { className: 'legend-label' }, dtLabel(item.dt))
                    );
                  })
                )
              ),
              h('div', { className: 'graph-container' },
                targets.length > 0
                  ? h(EvidenceGraph, {
                      disease: disease,
                      targets: targets,
                      selectedTarget: selected,
                      onSelectTarget: handleTargetClick,
                    })
                  : h('div', { className: 'graph-empty' },
                      loading
                        ? h(Spin, { size: 'large', style: { color: '#543FDE' } })
                        : h('span', { className: 'graph-empty-text', style: { color: '#404060', fontSize: 13 } },
                            'Evidence graph appears here'
                          )
                    )
              )
            )
          )
        ),

        // Detail drawer
        h(Drawer, {
          title: selected
            ? h('span', null,
                h('span', { className: 'drawer-gene' }, selected.symbol),
                h('span', { className: 'drawer-gene-name' }, ' — ' + (selected.name || ''))
              )
            : null,
          placement: 'right',
          width: 520,
          open: !!selected,
          onClose: function () { setSelected(null); },
          extra: selected
            ? h(Tag, { color: 'purple' },
                'Composite: ' + selected.composite.toFixed(1) + ' / 10'
              )
            : null,
          bodyStyle: { padding: '20px 24px' },
        },
          selected
            ? h(DetailPane, {
                target: selected,
                disease: disease,
                narrative: narratives[selected.symbol],
                trials: trialsCache[selected.symbol],
              })
            : null
        ),

        // Primitives footer
        h('div', { className: 'primitives-footer' },
          h('span', { className: 'primitives-logo' }),
          h('span', { className: 'primitives-label' }, 'Built on Domino Platform Primitives:'),
          h('span', { className: 'primitives-list' },
            'Data Sources · Model Endpoint · Agent Orchestration · App Hosting · Scheduled Refresh'
          )
        )
      )
    );
  }

  // ── Boot ───────────────────────────────────────────────
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(App));

})();
