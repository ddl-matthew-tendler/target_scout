(function () {
  'use strict';

  var _antd = antd;
  var ConfigProvider = _antd.ConfigProvider;
  var Button      = _antd.Button;
  var Switch      = _antd.Switch;
  var Tag         = _antd.Tag;
  var Skeleton    = _antd.Skeleton;
  var Drawer      = _antd.Drawer;
  var Tooltip     = _antd.Tooltip;
  var Spin        = _antd.Spin;
  var AutoComplete = _antd.AutoComplete;
  var Divider     = _antd.Divider;
  var Input       = _antd.Input;
  var Slider      = _antd.Slider;
  var Checkbox    = _antd.Checkbox;
  var Modal       = _antd.Modal;
  var Segmented   = _antd.Segmented;

  var h           = React.createElement;
  var useState    = React.useState;
  var useEffect   = React.useEffect;
  var useRef      = React.useRef;
  var useMemo     = React.useMemo;
  var Fragment    = React.Fragment;

  // ── Theme ──────────────────────────────────────────────
  var dominoTheme = {
    token: {
      colorPrimary:       '#3B3BD3',
      colorPrimaryHover:  '#2929C4',
      colorPrimaryActive: '#1820A0',
      colorText:          '#2E2E38',
      colorTextSecondary: '#65657B',
      colorTextTertiary:  '#8F8FA3',
      colorSuccess:       '#28A464',
      colorWarning:       '#CCB718',
      colorError:         '#C20A29',
      colorInfo:          '#0070CC',
      colorBgContainer:   '#FFFFFF',
      colorBgLayout:      '#FAFAFA',
      colorBorder:        '#E0E0E0',
      fontFamily: 'Inter, Lato, Helvetica Neue, Arial, sans-serif',
      fontSize: 14,
      borderRadius: 4,
      borderRadiusLG: 8,
    },
    components: {
      Button: { primaryShadow: 'none', defaultShadow: 'none' },
      Slider: { railBg: '#E0E0E8', trackBg: '#3B3BD3', handleColor: '#3B3BD3' },
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

  // ── Modality colors & labels ───────────────────────────
  var MOD_COLORS = {
    small_molecule: '#0070CC',
    antibody:       '#28A464',
    mixed:          '#543FDE',
    protac:         '#E835A7',
  };
  var MOD_LABELS = {
    small_molecule: 'Small Mol',
    antibody:       'Antibody',
    mixed:          'Mixed',
    protac:         'PROTAC',
  };

  function dtColor(dt) { return DT_COLORS[dt] || '#8F8FA3'; }
  function dtLabel(dt) { return DT_LABELS[dt] || dt; }
  function modColor(m) { return MOD_COLORS[m] || '#8F8FA3'; }
  function modLabel(m) { return MOD_LABELS[m] || m; }

  function scoreColor(v) {
    if (v >= 8.0) return '#28A464';
    if (v >= 6.0) return '#3B3BD3';
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

  // ── Composite score computation ───────────────────────
  var DEFAULT_WEIGHTS = { disease: 2.0, tract: 1.5, novelty: 1.5 };

  function computeComposite(target, weights) {
    var wD = weights.disease, wT = weights.tract, wN = weights.novelty;
    var total = wD + wT + wN;
    if (total === 0) return 0;
    var raw = (target.diseaseAssociation * wD + target.tractability * wT + target.novelty * wN) / total;
    return Math.round(raw * 10) / 10;
  }

  var COMPOSITE_TOOLTIP_TPL = 'Weighted composite: (Disease assoc \xd7{D}) + (Tractability \xd7{T}) + (Novelty \xd7{N}), normalized 0\u201310.';
  function compositeTooltip(w) {
    return COMPOSITE_TOOLTIP_TPL.replace('{D}', w.disease).replace('{T}', w.tract).replace('{N}', w.novelty);
  }
  var NOVELTY_TOOLTIP = 'How unexplored this target is: 10 = no known drugs, 0 = heavily drugged. Higher novelty = greater first-in-class opportunity.';
  var TRACTABILITY_TOOLTIP = 'Estimated druggability based on Open Targets tractability buckets (small molecule, antibody, PROTAC). 10 = clinical precedence, 2 = limited tractability data.';
  var DISEASE_TOOLTIP = 'Overall disease-association score from Open Targets (0\u201310), integrating genetic, literature, drug, pathway, and animal model evidence.';

  // ── TrendSparkline ────────────────────────────────────
  function TrendSparkline(props) {
    var data = props.data;   // array of 6 counts [2019..2024]
    var color = props.color || '#3B3BD3';
    if (!data || data.length < 2) return null;
    var W = 88, H = 22, pad = 2;
    var mn = Math.min.apply(null, data);
    var mx = Math.max.apply(null, data);
    var range = mx - mn || 1;
    var pts = data.map(function (v, i) {
      var x = pad + (i / (data.length - 1)) * (W - pad * 2);
      var y = H - pad - ((v - mn) / range) * (H - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    });
    var polyline = pts.join(' ');
    var last = data[data.length - 1];
    var first = data[0];
    var pct = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    var trendColor = pct >= 0 ? '#28A464' : '#C20A29';
    return h('div', { className: 'trend-sparkline-wrap' },
      h('svg', { width: W, height: H, className: 'trend-sparkline' },
        h('polyline', {
          points: polyline,
          fill: 'none',
          stroke: color,
          strokeWidth: 1.5,
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
          opacity: 0.75,
        })
      ),
      h('span', { className: 'trend-sparkline-pct', style: { color: trendColor } },
        (pct >= 0 ? '+' : '') + pct + '%'
      ),
      h('span', { className: 'trend-sparkline-label' }, '5-yr evidence trend')
    );
  }

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
    var target        = props.target;
    var rank          = props.rank;
    var narrative     = props.narrative;
    var selected      = props.selected;
    var onClick       = props.onClick;
    var composite     = props.composite;
    var compareChecked = props.compareChecked;
    var onCompareToggle = props.onCompareToggle;
    var weights       = props.weights;

    var cls = 'target-row' + (selected ? ' target-row-selected' : '');
    var sc = scoreColor(composite);

    var drugTags = null;
    if (target.knownDrugs && target.knownDrugs.length > 0) {
      var shown = target.knownDrugs.slice(0, 2);
      var extra = target.numDrugs - shown.length;
      drugTags = h('span', { style: { display: 'inline-flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' } },
        shown.map(function (d) { return h(Tag, { key: d, color: 'green', style: { fontSize: 10, margin: 0 } }, d); }),
        extra > 0 ? h('span', { style: { fontSize: 10, color: '#65657B' } }, '+' + extra + ' more') : null
      );
    } else {
      drugTags = h(Tag, { color: 'volcano', style: { fontSize: 11 } }, 'No known drugs \u2014 novel target');
    }

    return h('div', { className: cls, onClick: onClick },
      h('div', { className: 'target-rank' }, '#' + rank),
      h('div', { className: 'target-body' },
        h('div', { className: 'target-header-row' },
          // Compare checkbox — stops event bubbling so row click still works
          h('span', {
            style: { marginRight: 6, flexShrink: 0 },
            onClick: function (e) { e.stopPropagation(); },
          },
            h(Tooltip, { title: compareChecked ? 'Remove from compare' : 'Add to compare', placement: 'top' },
              h(Checkbox, {
                checked: compareChecked,
                onChange: function (e) { e.stopPropagation(); onCompareToggle(target.symbol); },
              })
            )
          ),
          h('span', { className: 'target-symbol' }, target.symbol),
          h('span', { className: 'target-name' }, target.name),
          h('div', { className: 'composite-score-col' },
            h(Tooltip, { title: compositeTooltip(weights), placement: 'left' },
              h('span', null,
                h('span', { className: 'composite-score-label' }, 'Score'),
                h('span', { className: 'composite-score', style: { color: sc } }, composite.toFixed(1))
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
        target.yearTrend
          ? h(TrendSparkline, { data: target.yearTrend, color: dtColor(target.dominantDatatype) })
          : null,
        h('div', { className: 'target-tags' },
          h(Tag, { color: 'purple', style: { fontSize: 11 } }, dtLabel(target.dominantDatatype)),
          target.modality
            ? h(Tag, {
                style: { fontSize: 11, background: modColor(target.modality) + '18', borderColor: modColor(target.modality) + '60', color: modColor(target.modality) },
              }, modLabel(target.modality))
            : null,
          drugTags
        )
      )
    );
  }

  // ── WeightSliders ─────────────────────────────────────
  function WeightSliders(props) {
    var weights = props.weights;
    var onChange = props.onChange;
    var onReset = props.onReset;

    function mk(field, label, color) {
      return h('div', { className: 'weight-slider-row', key: field },
        h('span', { className: 'weight-slider-label', style: { color: color } }, label),
        h(Slider, {
          min: 0, max: 3, step: 0.5,
          value: weights[field],
          onChange: function (v) {
            var next = Object.assign({}, weights);
            next[field] = v;
            onChange(next);
          },
          style: { flex: 1 },
          tooltip: { formatter: null },
        }),
        h('span', { className: 'weight-slider-value' }, weights[field].toFixed(1) + '\xd7')
      );
    }

    return h('div', { className: 'weight-sliders-panel' },
      mk('disease', 'Disease assoc', '#3B3BD3'),
      mk('tract',   'Tractability',  '#28A464'),
      mk('novelty', 'Novelty',       '#E8620A'),
      h('div', { style: { textAlign: 'right', marginTop: 4 } },
        h(Button, { size: 'small', onClick: onReset, style: { fontSize: 11 } }, 'Reset defaults')
      )
    );
  }

  // ── CompareModal ──────────────────────────────────────
  function CompareModal(props) {
    var targets  = props.targets;    // array of target objects (2-4)
    var composites = props.composites; // map symbol→composite
    var open     = props.open;
    var onClose  = props.onClose;
    var narratives = props.narratives;

    if (!targets || targets.length < 2) return null;

    var METRICS = [
      { label: 'Composite score', fn: function(t) { return (composites[t.symbol] || t.composite).toFixed(1); }, type: 'score' },
      { label: 'Disease assoc',   fn: function(t) { return t.diseaseAssociation.toFixed(1); }, type: 'score' },
      { label: 'Tractability',    fn: function(t) { return t.tractability.toFixed(1); }, type: 'score' },
      { label: 'Novelty',         fn: function(t) { return t.novelty.toFixed(1); }, type: 'score' },
      { label: 'Dominant evidence', fn: function(t) { return dtLabel(t.dominantDatatype); }, type: 'tag' },
      { label: 'Modality',        fn: function(t) { return t.modality ? modLabel(t.modality) : '\u2014'; }, type: 'tag' },
      { label: 'Known drugs',     fn: function(t) { return t.knownDrugs && t.knownDrugs.length ? t.knownDrugs.join(', ') : 'None'; }, type: 'text' },
      { label: 'Summary',         fn: function(t) { var n = narratives[t.symbol]; return n ? n.slice(0, 120) + '\u2026' : '\u2014'; }, type: 'narrative' },
    ];

    return h(Modal, {
      open: open,
      onCancel: onClose,
      footer: null,
      width: Math.min(200 + targets.length * 220, 900),
      title: 'Target Comparison (' + targets.length + ' targets)',
      styles: { body: { padding: '8px 16px 16px' } },
    },
      h('table', { className: 'compare-table' },
        h('thead', null,
          h('tr', null,
            h('th', { className: 'compare-th-metric' }, 'Metric'),
            targets.map(function (t) {
              return h('th', { key: t.symbol, className: 'compare-th-target' },
                h('span', { className: 'compare-symbol' }, t.symbol),
                h('span', { className: 'compare-name' }, t.name)
              );
            })
          )
        ),
        h('tbody', null,
          METRICS.map(function (m) {
            return h('tr', { key: m.label, className: 'compare-tr' },
              h('td', { className: 'compare-td-label' }, m.label),
              targets.map(function (t) {
                var val = m.fn(t);
                var content = val;
                if (m.type === 'score') {
                  content = h('span', { style: { fontWeight: 700, color: scoreColor(parseFloat(val)) } }, val);
                } else if (m.type === 'tag' && m.label === 'Dominant evidence') {
                  content = h(Tag, { color: 'purple', style: { fontSize: 10 } }, val);
                } else if (m.type === 'tag' && m.label === 'Modality') {
                  content = h(Tag, { style: { fontSize: 10, background: modColor(t.modality) + '18', borderColor: modColor(t.modality) + '60', color: modColor(t.modality) } }, val);
                }
                return h('td', { key: t.symbol, className: 'compare-td' }, content);
              })
            );
          })
        )
      )
    );
  }

  // ── EvidenceGraph (D3 force — robust multi-layer) ─────
  function EvidenceGraph(props) {
    var disease      = props.disease;
    var targets      = props.targets;
    var selectedTarget = props.selectedTarget;
    var onSelectTarget = props.onSelectTarget;
    var ppiLinks     = props.ppiLinks || [];
    var edgeFilter   = props.edgeFilter;

    var svgRef       = useRef(null);
    var simRef       = useRef(null);
    var tooltipRef   = useRef(null);
    var circleRef    = useRef(null);
    var outerRingRef = useRef(null);
    var linkSelRef   = useRef(null);
    var zoomRef      = useRef(null);

    // ── Build graph whenever targets/disease/ppi changes ──
    useEffect(function () {
      if (!targets || !targets.length || !svgRef.current) return;

      var container = svgRef.current.parentElement;
      var W = container.clientWidth  || 400;
      var H = container.clientHeight || 400;

      var svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.attr('width', W).attr('height', H);

      // Defs
      var defs = svg.append('defs');

      // Glow filter
      var filt = defs.append('filter').attr('id', 'ts-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
      filt.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
      var fm = filt.append('feMerge');
      fm.append('feMergeNode').attr('in', 'blur');
      fm.append('feMergeNode').attr('in', 'SourceGraphic');

      // Arrow markers for PPI edges
      var ARROW_TYPES = [
        { id: 'arr-ppi',   color: '#9090C0' },
        { id: 'arr-drug',  color: '#28A464' },
      ];
      ARROW_TYPES.forEach(function (a) {
        defs.append('marker')
          .attr('id', a.id)
          .attr('markerWidth', 7).attr('markerHeight', 5)
          .attr('refX', 7).attr('refY', 2.5)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 7 2.5 L 0 5 z')
          .attr('fill', a.color)
          .attr('opacity', 0.7);
      });

      // Zoom layer
      var zoomG = svg.append('g').attr('class', 'zoom-layer');
      var zoom = d3.zoom()
        .scaleExtent([0.25, 3])
        .on('zoom', function (event) { zoomG.attr('transform', event.transform); });
      svg.call(zoom);
      zoomRef.current = zoom;

      // ── Nodes ───────────────────────────────────────
      var diseaseNode = {
        id: '__d__', label: disease || 'Disease', type: 'disease',
        x: W / 2, y: H / 2,
      };

      var targetNodes = targets.map(function (t) {
        return { id: t.symbol, label: t.symbol, type: 'target', data: t };
      });

      // Drug nodes — at most 2 drugs per target to avoid overcrowding
      var drugMap = {};
      targets.forEach(function (t) {
        (t.knownDrugs || []).slice(0, 2).forEach(function (d) {
          if (!drugMap[d]) drugMap[d] = [];
          drugMap[d].push(t.symbol);
        });
      });
      var drugNodes = Object.keys(drugMap).map(function (d) {
        return { id: '__drug__' + d, label: d, type: 'drug', drugName: d };
      });

      var nodes = [diseaseNode].concat(targetNodes).concat(drugNodes);

      // ── Links ───────────────────────────────────────
      var disLinks = targets.map(function (t) {
        return { source: '__d__', target: t.symbol, linkType: 'disease', dt: t.dominantDatatype, score: t.diseaseAssociation / 10 };
      });

      var ppiEdges = ppiLinks.map(function (l) {
        return { source: l.source, target: l.target, linkType: 'ppi', strength: l.strength, relation: l.relation };
      });

      var drugEdges = [];
      Object.keys(drugMap).forEach(function (d) {
        drugMap[d].forEach(function (sym) {
          drugEdges.push({ source: '__drug__' + d, target: sym, linkType: 'drug' });
        });
      });

      var links = disLinks.concat(ppiEdges).concat(drugEdges);

      if (simRef.current) simRef.current.stop();

      var sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(function (d) { return d.id; })
          .distance(function (d) {
            if (d.linkType === 'drug') return 55;
            if (d.linkType === 'ppi')  return H * 0.20;
            return H * 0.27;
          })
          .strength(function (d) {
            if (d.linkType === 'drug') return 0.9;
            if (d.linkType === 'ppi')  return 0.25;
            return 0.55;
          })
        )
        .force('charge', d3.forceManyBody().strength(function (d) {
          if (d.type === 'drug')    return -60;
          if (d.type === 'disease') return -400;
          return -280;
        }))
        .force('center', d3.forceCenter(W / 2, H / 2))
        .force('collision', d3.forceCollide(function (d) {
          if (d.type === 'drug')    return 16;
          if (d.type === 'disease') return 36;
          return 26;
        }));

      simRef.current = sim;

      // ── Drag ───────────────────────────────────────
      function drag(s) {
        return d3.drag()
          .on('start', function (ev, d) { if (!ev.active) s.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag',  function (ev, d) { d.fx = ev.x; d.fy = ev.y; })
          .on('end',   function (ev, d) { if (!ev.active) s.alphaTarget(0); d.fx = null; d.fy = null; });
      }

      // ── Render links ───────────────────────────────
      var linkSel = zoomG.append('g').attr('class', 'ts-links')
        .selectAll('line').data(links).enter().append('line')
        .attr('stroke', function (d) {
          if (d.linkType === 'ppi')  return '#9090C0';
          if (d.linkType === 'drug') return '#28A464';
          return dtColor(d.dt);
        })
        .attr('stroke-width', function (d) {
          if (d.linkType === 'ppi')  return 1.2;
          if (d.linkType === 'drug') return 1.0;
          return Math.max(1.5, d.score * 4.5);
        })
        .attr('stroke-dasharray', function (d) {
          if (d.linkType === 'ppi')  return '5,3';
          if (d.linkType === 'drug') return '2,2';
          return null;
        })
        .attr('stroke-opacity', function (d) {
          if (d.linkType === 'ppi')  return 0.50;
          if (d.linkType === 'drug') return 0.55;
          return 0.55;
        })
        .attr('marker-end', function (d) {
          if (d.linkType === 'ppi')  return 'url(#arr-ppi)';
          if (d.linkType === 'drug') return 'url(#arr-drug)';
          return null;
        });

      linkSelRef.current = linkSel;

      // ── Render nodes ───────────────────────────────
      var nodeSel = zoomG.append('g').attr('class', 'ts-nodes')
        .selectAll('g').data(nodes).enter().append('g')
        .attr('class', 'graph-node')
        .call(drag(sim))
        .on('click', function (ev, d) {
          if (d.type === 'target') onSelectTarget(d.data);
        })
        .on('mouseover', function (ev, d) {
          var tip = tooltipRef.current;
          if (!tip) return;
          var cr = svgRef.current.getBoundingClientRect();
          var cx = ev.clientX - cr.left + 14;
          var cy = ev.clientY - cr.top - 10;
          var txt = d.type === 'disease' ? d.label
            : d.type === 'drug' ? d.drugName + ' (drug)'
            : d.data.symbol + ': composite ' + d.data.composite.toFixed(1) + ' \u2022 ' + dtLabel(d.data.dominantDatatype);
          tip.textContent = txt;
          tip.style.left = cx + 'px';
          tip.style.top  = cy + 'px';
          tip.style.display = 'block';
        })
        .on('mouseout', function () {
          if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        });

      // Main circle
      var circleSel = nodeSel.append('circle')
        .attr('class', 'main-circle')
        .attr('r', function (d) {
          if (d.type === 'disease') return 30;
          if (d.type === 'drug')    return 9;
          return 19;
        })
        .attr('fill', function (d) {
          if (d.type === 'disease') return '#E8620A';
          if (d.type === 'drug')    return '#1A6639';
          return dtColor(d.data ? d.data.dominantDatatype : null);
        })
        .attr('stroke', 'rgba(255,255,255,0.45)')
        .attr('stroke-width', 1.5)
        .style('cursor', function (d) { return d.type === 'target' ? 'pointer' : d.type === 'drug' ? 'default' : 'default'; });

      circleRef.current = circleSel;

      // Outer score ring (target nodes only)
      var outerRing = nodeSel.filter(function (d) { return d.type === 'target'; }).append('circle')
        .attr('class', 'score-ring')
        .attr('r', 23)
        .attr('fill', 'none')
        .attr('stroke', function (d) { return scoreColor(d.data ? d.data.composite : 5); })
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '3,2')
        .attr('pointer-events', 'none');

      outerRingRef.current = outerRing;

      // Labels
      nodeSel.append('text')
        .text(function (d) {
          if (d.type === 'drug') return '';   // no label on drug nodes — too small
          return d.label;
        })
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', function (d) { return d.type === 'disease' ? 10 : 9; })
        .attr('font-weight', '700')
        .attr('fill', '#fff')
        .attr('pointer-events', 'none')
        .attr('font-family', 'Inter, sans-serif');

      // ── Tick ───────────────────────────────────────
      sim.on('tick', function () {
        nodes.forEach(function (d) {
          d.x = Math.max(42, Math.min(W - 42, d.x));
          d.y = Math.max(42, Math.min(H - 42, d.y));
        });
        linkSel
          .attr('x1', function (d) { return d.source.x; })
          .attr('y1', function (d) { return d.source.y; })
          .attr('x2', function (d) {
            if (d.linkType === 'ppi' || d.linkType === 'drug') {
              // Shorten end to not overlap target circle
              var tx = d.target.x, ty = d.target.y, sx = d.source.x, sy = d.source.y;
              var dx = tx - sx, dy = ty - sy, len = Math.sqrt(dx * dx + dy * dy) || 1;
              var r = d.linkType === 'drug' ? 10 : 21;
              return tx - (dx / len) * r;
            }
            return d.target.x;
          })
          .attr('y2', function (d) {
            if (d.linkType === 'ppi' || d.linkType === 'drug') {
              var tx = d.target.x, ty = d.target.y, sx = d.source.x, sy = d.source.y;
              var dx = tx - sx, dy = ty - sy, len = Math.sqrt(dx * dx + dy * dy) || 1;
              var r = d.linkType === 'drug' ? 10 : 21;
              return ty - (dy / len) * r;
            }
            return d.target.y;
          });
        nodeSel.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
      });

      return function () { sim.stop(); };
    }, [targets, disease, ppiLinks]);

    // ── Update selection visuals without rebuilding ───
    useEffect(function () {
      var sel = circleRef.current;
      if (!sel) return;
      sel.attr('fill', function (d) {
          if (d.type === 'disease') return '#E8620A';
          if (d.type === 'drug')    return '#1A6639';
          if (selectedTarget && selectedTarget.symbol === d.id) return '#2929C4';
          return dtColor(d.data ? d.data.dominantDatatype : null);
        })
        .attr('filter', function (d) {
          return selectedTarget && d.type === 'target' && selectedTarget.symbol === d.id ? 'url(#ts-glow)' : null;
        })
        .attr('stroke', function (d) {
          return selectedTarget && d.type === 'target' && selectedTarget.symbol === d.id ? '#1820A0' : 'rgba(255,255,255,0.45)';
        })
        .attr('stroke-width', function (d) {
          return selectedTarget && d.type === 'target' && selectedTarget.symbol === d.id ? 2.5 : 1.5;
        });

      var ring = outerRingRef.current;
      if (!ring) return;
      ring.attr('r', function (d) {
          return selectedTarget && selectedTarget.symbol === d.id ? 26 : 23;
        })
        .attr('stroke', function (d) {
          return selectedTarget && selectedTarget.symbol === d.id ? '#1820A0' : scoreColor(d.data ? d.data.composite : 5);
        })
        .attr('stroke-width', function (d) {
          return selectedTarget && selectedTarget.symbol === d.id ? 2.5 : 1.5;
        })
        .attr('stroke-opacity', function (d) {
          return selectedTarget && selectedTarget.symbol === d.id ? 1 : 0.5;
        })
        .attr('stroke-dasharray', function (d) {
          return selectedTarget && selectedTarget.symbol === d.id ? null : '3,2';
        });
    }, [selectedTarget]);

    // ── Update edge visibility when filter changes ────
    useEffect(function () {
      var ls = linkSelRef.current;
      if (!ls || !edgeFilter) return;
      ls.attr('stroke-opacity', function (d) {
        if (d.linkType === 'disease' && !edgeFilter[d.dt]) return 0;
        if (d.linkType === 'ppi'  && !edgeFilter.ppi)     return 0;
        if (d.linkType === 'drug' && !edgeFilter.drug)    return 0;
        if (d.linkType === 'disease') return 0.55;
        if (d.linkType === 'ppi')     return 0.50;
        return 0.55;
      });
    }, [edgeFilter]);

    return h(Fragment, null,
      h('svg', { ref: svgRef, className: 'evidence-graph-svg' }),
      h('div', { ref: tooltipRef, className: 'graph-tooltip' }),
      h('button', {
        className: 'graph-zoom-reset',
        onClick: function () {
          if (svgRef.current && zoomRef.current) {
            d3.select(svgRef.current).transition().duration(300).call(
              zoomRef.current.transform, d3.zoomIdentity
            );
          }
        },
        title: 'Reset zoom',
      }, '\u21ba Reset')
    );
  }

  // ── DetailPane (Drawer content) ────────────────────────
  function DetailPane(props) {
    var target    = props.target;
    var disease   = props.disease;
    var narrative = props.narrative;
    var trials    = props.trials;
    var composite = props.composite;

    if (!target) return null;

    var sc = scoreColor(composite);

    return h('div', null,
      // Score cards
      h('div', { className: 'detail-section' },
        h('div', { className: 'detail-scores' },
          h('div', { className: 'detail-score-card' },
            h('div', { className: 'detail-score-label' }, 'Composite'),
            h('div', { className: 'detail-score-value', style: { color: sc } }, composite.toFixed(1))
          ),
          h('div', { className: 'detail-score-card' },
            h('div', { className: 'detail-score-label' }, 'Disease Assoc'),
            h('div', { className: 'detail-score-value', style: { color: '#3B3BD3' } }, target.diseaseAssociation.toFixed(1))
          ),
          h('div', { className: 'detail-score-card' },
            h('div', { className: 'detail-score-label' }, 'Tractability'),
            h('div', { className: 'detail-score-value', style: { color: '#28A464' } }, target.tractability.toFixed(1))
          ),
          h('div', { className: 'detail-score-card' },
            h('div', { className: 'detail-score-label' }, 'Novelty'),
            h('div', { className: 'detail-score-value', style: { color: '#E8620A' } }, target.novelty.toFixed(1))
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

      // Key Evidence Papers
      target.litPapers && target.litPapers.length > 0
        ? h('div', { className: 'detail-section' },
            h('div', { className: 'detail-section-title' }, 'Key Evidence Papers'),
            target.litPapers.map(function (p, i) {
              return h('div', { key: i, className: 'lit-paper-card' },
                h('p', { className: 'lit-paper-title' }, p.title),
                h('div', { className: 'lit-paper-meta' },
                  h('span', { className: 'lit-paper-journal' }, p.journal),
                  h('span', { className: 'lit-paper-year' }, p.year),
                  p.pmid
                    ? h('a', {
                        href: 'https://pubmed.ncbi.nlm.nih.gov/' + p.pmid,
                        target: '_blank', rel: 'noopener noreferrer',
                        className: 'lit-paper-pmid',
                      }, 'PMID ' + p.pmid)
                    : null
                )
              );
            })
          )
        : null,

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

      // Clinical trials
      h('div', { className: 'detail-section' },
        h('div', { className: 'detail-section-title' }, 'Competing Programs \u2014 ClinicalTrials.gov'),
        trials === undefined
          ? h(Skeleton, { active: true, paragraph: { rows: 2 }, title: false })
          : trials === null || trials.length === 0
          ? h('p', { style: { fontSize: 13, color: '#8F8FA3' } }, 'No matching trials found.')
          : h('div', null,
              h('div', { className: 'pipeline-phase-bar' },
                ['Phase I', 'Phase II', 'Phase III', 'Phase IV'].map(function (ph) {
                  var count = trials.filter(function (t) { return phaseLabel(t.phase).indexOf(ph.replace('Phase ', 'Ph ')) !== -1; }).length;
                  return h('div', { key: ph, className: 'pipeline-phase-cell' },
                    h('div', { className: 'pipeline-phase-track' },
                      count > 0 ? h('div', {
                        className: 'pipeline-phase-fill',
                        style: {
                          width: Math.min(100, count * 40) + '%',
                          background: ph === 'Phase III' || ph === 'Phase IV' ? '#C20A29' : ph === 'Phase II' ? '#CCB718' : '#3B3BD3',
                        },
                      }) : null
                    ),
                    h('div', { className: 'pipeline-phase-label' }, ph + (count ? ' \u00d7' + count : ''))
                  );
                })
              ),
              trials.map(function (trial) {
                return h('div', { key: trial.nctId, className: 'trial-card' },
                  h('a', { href: trial.url, target: '_blank', rel: 'noopener noreferrer', style: { textDecoration: 'none' } },
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
            )
      ),

      // Open Targets link
      target.ensemblId
        ? h('div', { style: { marginTop: 16 } },
            h('a', {
              href: 'https://platform.opentargets.org/target/' + target.ensemblId,
              target: '_blank', rel: 'noopener noreferrer',
              style: { fontSize: 12, color: '#3B3BD3' },
            }, '\u2197 View ' + target.symbol + ' on Open Targets Platform')
          )
        : null
    );
  }

  // ── Export CSV ─────────────────────────────────────────
  function exportCSV(targets, composites, disease) {
    var header = 'Rank,Symbol,Name,Composite,Disease Assoc,Tractability,Novelty,Modality,Dominant Evidence,Known Drugs';
    var rows = targets.map(function (t, i) {
      return [
        i + 1, t.symbol,
        '"' + (t.name || '').replace(/"/g, '""') + '"',
        (composites[t.symbol] || t.composite),
        t.diseaseAssociation, t.tractability, t.novelty,
        t.modality || '',
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

  // ── AboutModal ─────────────────────────────────────────
  function AboutModal(props) {
    return h(Modal, {
      open: props.open,
      onCancel: props.onClose,
      footer: h(Button, { type: 'primary', onClick: props.onClose }, 'Close'),
      title: h('span', { style: { fontSize: 18, fontWeight: 700 } }, 'About TargetScout'),
      width: 580,
    },
      h('div', { className: 'about-body' },
        h('p', { className: 'about-tagline' },
          'AI-assisted target identification and prioritization for drug discovery programs.'
        ),
        h(Divider, { style: { margin: '14px 0' } }),

        h('h4', { className: 'about-section-heading' }, 'What it does'),
        h('p', { className: 'about-para' },
          'TargetScout aggregates multi-source evidence to rank disease-relevant protein targets, '
          + 'visualizes protein–protein interaction networks, and surfaces competitive intelligence '
          + 'from active clinical programs — all in a single workflow.'
        ),

        h('h4', { className: 'about-section-heading' }, 'Scoring'),
        h('p', { className: 'about-para' },
          'Each target receives a composite score (0–10) blending three weighted dimensions:'
        ),
        h('ul', { className: 'about-list' },
          h('li', null, h('strong', null, 'Disease Association'), ' — genetic, literature and omics evidence from Open Targets Platform'),
          h('li', null, h('strong', null, 'Tractability'), ' — small-molecule and antibody druggability assessment'),
          h('li', null, h('strong', null, 'Novelty'), ' — inverse publication density; rewards under-explored targets')
        ),
        h('p', { className: 'about-para' },
          'Weights can be adjusted in real time via the Weights panel. '
          + 'Targets re-rank instantly without reloading data.'
        ),

        h('h4', { className: 'about-section-heading' }, 'Data sources'),
        h('ul', { className: 'about-list' },
          h('li', null, h('a', { href: 'https://platform.opentargets.org', target: '_blank', rel: 'noopener' }, 'Open Targets Platform'), ' — disease–target associations and evidence'),
          h('li', null, h('a', { href: 'https://clinicaltrials.gov', target: '_blank', rel: 'noopener' }, 'ClinicalTrials.gov'), ' — competitive clinical programs per target'),
          h('li', null, 'Protein–protein interaction network (curated PPI edges)'),
          h('li', null, 'Domino Model Endpoint — AI narrative generation')
        ),

        h('h4', { className: 'about-section-heading' }, 'Domino Platform primitives'),
        h('ul', { className: 'about-list' },
          h('li', null, 'App Hosting — serves this interface'),
          h('li', null, 'Model Endpoints — LLM-based narrative synthesis'),
          h('li', null, 'Agent Orchestration — multi-step scoring pipeline'),
          h('li', null, 'Scheduled Jobs — nightly data refresh from Open Targets'),
          h('li', null, 'Datasets — curated PPI and tractability reference tables')
        ),

        h(Divider, { style: { margin: '14px 0' } }),
        h('p', { style: { fontSize: 12, color: '#8F8FA3' } },
          'Demo mode uses curated mock data for IPF, ALS and Ulcerative Colitis. '
          + 'Toggle to Live to query the real Open Targets API (requires network access).'
        )
      )
    );
  }

  // ── Main App ───────────────────────────────────────────
  function App() {
    var _s0 = useState('');    var inputDisease = _s0[0]; var setInputDisease = _s0[1];
    var _s1 = useState('');    var disease      = _s1[0]; var setDisease      = _s1[1];
    var _s2 = useState(false); var loading      = _s2[0]; var setLoading      = _s2[1];
    var _s3 = useState([]);    var targets      = _s3[0]; var setTargets      = _s3[1];
    var _s4 = useState({});    var narratives   = _s4[0]; var setNarratives   = _s4[1];
    var _s5 = useState(null);  var selected     = _s5[0]; var setSelected     = _s5[1];
    var _s6 = useState(true);  var useDummy     = _s6[0]; var setUseDummy     = _s6[1];
    var _s7 = useState(false); var connected    = _s7[0]; var setConnected    = _s7[1];
    var _s8 = useState('');    var summary      = _s8[0]; var setSummary      = _s8[1];
    var _s9 = useState({});    var trialsCache  = _s9[0]; var setTrialsCache  = _s9[1];
    var _sA = useState('');    var resolvedName = _sA[0]; var setResolvedName = _sA[1];
    var _sB = useState('');    var resolvedEfo  = _sB[0]; var setResolvedEfo  = _sB[1];
    var _sAb = useState(false); var aboutOpen   = _sAb[0]; var setAboutOpen   = _sAb[1];

    // ── New feature state ─────────────────────────────
    var _sw = useState(Object.assign({}, DEFAULT_WEIGHTS));
    var weights = _sw[0]; var setWeights = _sw[1];

    var _wv = useState(false);
    var weightsOpen = _wv[0]; var setWeightsOpen = _wv[1];

    var _cm = useState([]);
    var compareSymbols = _cm[0]; var setCompareSymbols = _cm[1];

    var _co = useState(false);
    var compareOpen = _co[0]; var setCompareOpen = _co[1];

    var _mf = useState('all');
    var modalityFilter = _mf[0]; var setModalityFilter = _mf[1];

    var _ppi = useState([]);
    var ppiLinks = _ppi[0]; var setPpiLinks = _ppi[1];

    // Edge type filter — which evidence types show in the graph
    var _ef = useState({
      genetic_association: true, literature: true, known_drugs: true, pathways: true,
      rna_expression: true, animal_model: true, somatic_mutation: true,
      ppi: true, drug: true,
    });
    var edgeFilter = _ef[0]; var setEdgeFilter = _ef[1];

    // Connectivity probe
    useEffect(function () {
      fetch('api/health')
        .then(function (r) { if (r.ok) setConnected(true); })
        .catch(function () {});
    }, []);

    // ── Computed ranked + filtered targets ────────────
    var rankedTargets = useMemo(function () {
      var filtered = targets.filter(function (t) {
        if (modalityFilter === 'all') return true;
        return t.modality === modalityFilter;
      });
      return filtered.slice().sort(function (a, b) {
        return computeComposite(b, weights) - computeComposite(a, weights);
      });
    }, [targets, weights, modalityFilter]);

    // Map symbol → computed composite (used by graph + comparator too)
    var compositeMap = useMemo(function () {
      var m = {};
      targets.forEach(function (t) { m[t.symbol] = computeComposite(t, weights); });
      return m;
    }, [targets, weights]);

    // ── Targets selected for compare ──────────────────
    var compareTargets = useMemo(function () {
      return targets.filter(function (t) { return compareSymbols.indexOf(t.symbol) !== -1; });
    }, [targets, compareSymbols]);

    // ── Narratives streaming ──────────────────────────
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

    // ── Search ────────────────────────────────────────
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
      setCompareSymbols([]);
      setPpiLinks([]);

      if (useDummy || !connected) {
        setTimeout(function () {
          var key = query.toLowerCase();
          var entry = MOCK_DATA[key] || MOCK_DATA['ipf'];
          var efoMap = {
            ipf: 'EFO_0000768', 'idiopathic pulmonary fibrosis': 'EFO_0000768',
            'ulcerative colitis': 'EFO_0000384', uc: 'EFO_0000384',
            als: 'EFO_0000253', 'amyotrophic lateral sclerosis': 'EFO_0000253',
          };
          var nameMap = {
            ipf: 'Idiopathic pulmonary fibrosis',
            'ulcerative colitis': 'Ulcerative colitis', uc: 'Ulcerative colitis',
            als: 'Amyotrophic lateral sclerosis', 'amyotrophic lateral sclerosis': 'Amyotrophic lateral sclerosis',
            'idiopathic pulmonary fibrosis': 'Idiopathic pulmonary fibrosis',
          };
          setResolvedName(nameMap[key] || (entry.targets[0] && query));
          setResolvedEfo(efoMap[key] || '');
          setTargets(entry.targets);
          setPpiLinks(entry.ppiLinks || []);
          setSummary(entry.summary || '');
          setLoading(false);
          streamDummyNarratives(entry.targets);
        }, 1200);
        return;
      }

      fetch('api/score?disease=' + encodeURIComponent(query))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          var tgts = data.targets || [];
          setTargets(tgts);
          setResolvedName(data.diseaseName || '');
          setResolvedEfo(data.efoId || '');
          setSummary(data.diseaseName ? data.diseaseName : '');
          setLoading(false);
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
          setUseDummy(true);
          var key = query.toLowerCase();
          var entry = MOCK_DATA[key] || MOCK_DATA['ipf'];
          setTargets(entry.targets);
          setPpiLinks(entry.ppiLinks || []);
          setSummary(entry.summary || '');
          streamDummyNarratives(entry.targets);
        });
    }

    function handleTargetClick(target) {
      setSelected(target);
      var sym = target.symbol;
      if (trialsCache[sym] !== undefined) return;
      setTrialsCache(function (prev) { var c = Object.assign({}, prev); c[sym] = undefined; return c; });

      if (useDummy || !connected) {
        setTimeout(function () {
          setTrialsCache(function (prev) { var c = Object.assign({}, prev); c[sym] = MOCK_TRIALS[sym] || []; return c; });
        }, 600);
        return;
      }
      fetch('api/similar?target=' + encodeURIComponent(sym) + '&disease=' + encodeURIComponent(disease))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          setTrialsCache(function (prev) { var c = Object.assign({}, prev); c[sym] = data.trials || []; return c; });
        })
        .catch(function () {
          setTrialsCache(function (prev) { var c = Object.assign({}, prev); c[sym] = []; return c; });
        });
    }

    function toggleCompare(sym) {
      setCompareSymbols(function (prev) {
        if (prev.indexOf(sym) !== -1) return prev.filter(function (s) { return s !== sym; });
        if (prev.length >= 4) return prev;   // cap at 4
        return prev.concat([sym]);
      });
    }

    function toggleEdge(key) {
      setEdgeFilter(function (prev) {
        var next = Object.assign({}, prev);
        next[key] = !prev[key];
        return next;
      });
    }

    // ── Legend items for graph panel ─────────────────
    var legendItems = [
      { key: 'genetic_association', type: 'edge' },
      { key: 'literature',          type: 'edge' },
      { key: 'known_drugs',         type: 'edge' },
      { key: 'pathways',            type: 'edge' },
      { key: 'ppi',  label: 'PPI',  color: '#9090C0', type: 'edge', dash: true },
      { key: 'drug', label: 'Drug', color: '#28A464', type: 'node-drug' },
    ];

    // ── Modality options for Segmented ───────────────
    var modalityOptions = [
      { label: 'All',        value: 'all' },
      { label: 'Small Mol',  value: 'small_molecule' },
      { label: 'Antibody',   value: 'antibody' },
      { label: 'Mixed',      value: 'mixed' },
      { label: 'PROTAC',     value: 'protac' },
    ];

    // ── Render ────────────────────────────────────────
    return h(ConfigProvider, { theme: dominoTheme },
      h('div', { className: 'app-layout app-layout-no-topnav' },

        // ── Main ───────────────────────────────────
        h('div', { className: 'main-content' },

          // ── Search card (replaces dark TopNav) ──
          h('div', { className: 'search-card' },
            h('div', { className: 'search-card-identity' },
              h('span', { className: 'app-title' }, 'TargetScout'),
              h('span', { className: 'app-subtitle' }, 'Target identification & prioritization for drug discovery'),
              h('button', {
                className: 'about-link',
                onClick: function () { setAboutOpen(true); },
              }, 'About')
            ),
            h('div', { className: 'search-card-controls' },
              h(AutoComplete, {
                className: 'disease-input',
                value: inputDisease,
                onChange: function (v) { setInputDisease(v); if (summary) setSummary(''); },
                onSelect: function (v) { setInputDisease(v); handleSearch(v); },
                onKeyDown: function (e) { if (e.key === 'Enter') handleSearch(); },
                options: SUGGESTED_DISEASES.filter(function (d) {
                  return !inputDisease || d.value.toLowerCase().indexOf(inputDisease.toLowerCase()) !== -1
                    || d.label.toLowerCase().indexOf(inputDisease.toLowerCase()) !== -1;
                }),
                size: 'large',
                style: { flex: 1, minWidth: 260 },
                children: h(Input, {
                  placeholder: 'Enter disease or indication \u2014 e.g. IPF, ALS, Ulcerative Colitis',
                  size: 'large',
                  style: { borderColor: '#C0C0D8' },
                  onPressEnter: function () { handleSearch(); },
                })
              }),
              h(Button, {
                type: 'primary', size: 'large', loading: loading,
                onClick: function () { handleSearch(); },
                className: 'search-btn',
                style: { minWidth: 130, flexShrink: 0 },
              }, loading ? 'Analyzing\u2026' : 'Find Targets'),
              h(Tooltip, {
                title: useDummy
                  ? 'Demo mode: using built-in data. Toggle to query Open Targets + ClinicalTrials.gov live.'
                  : 'Live: querying Open Targets + ClinicalTrials.gov.',
                placement: 'bottomRight',
              },
                h('div', { className: 'dummy-toggle' },
                  h('span', { className: 'dummy-toggle-label' }, useDummy ? 'Demo' : 'Live'),
                  h(Switch, { checked: useDummy, onChange: setUseDummy, size: 'small' })
                )
              )
            )
          ),

          summary
            ? h('div', { className: 'summary-bar' },
                h('span', { className: 'summary-text' }, summary)
              )
            : null,

          h('div', { className: 'content-split' },

            // ── Left: target list ─────────────────
            h('div', { className: 'targets-panel' },

              h('div', { className: 'panel-header' },
                h('div', { style: { flex: 1, minWidth: 0 } },
                  h('span', { className: 'panel-title' },
                    rankedTargets.length ? 'Top ' + rankedTargets.length + ' Target Hypotheses' : 'Target Hypotheses'
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
                h('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 } },
                  compareSymbols.length >= 2
                    ? h(Button, {
                        size: 'small', type: 'primary',
                        onClick: function () { setCompareOpen(true); },
                      }, 'Compare ' + compareSymbols.length)
                    : null,
                  h(Tooltip, { title: weightsOpen ? 'Hide score weights' : 'Adjust score weights' },
                    h(Button, {
                      size: 'small',
                      type: weightsOpen ? 'primary' : 'default',
                      onClick: function () { setWeightsOpen(function (v) { return !v; }); },
                    }, 'Weights')
                  ),
                  rankedTargets.length ? h(Button, {
                    size: 'small',
                    onClick: function (e) { e.stopPropagation(); exportCSV(rankedTargets, compositeMap, disease); },
                  }, 'Export CSV') : null
                )
              ),

              // Weight sliders (collapsible)
              weightsOpen
                ? h('div', { className: 'weight-sliders-container' },
                    h(WeightSliders, {
                      weights: weights,
                      onChange: setWeights,
                      onReset: function () { setWeights(Object.assign({}, DEFAULT_WEIGHTS)); },
                    })
                  )
                : null,

              // Modality filter bar
              targets.length > 0
                ? h('div', { className: 'modality-bar' },
                    h(Segmented, {
                      options: modalityOptions,
                      value: modalityFilter,
                      onChange: setModalityFilter,
                      size: 'small',
                    })
                  )
                : null,

              loading
                ? h('div', { className: 'skeleton-list' },
                    [0, 1, 2, 3, 4].map(function (i) {
                      return h('div', { key: i, className: 'skeleton-row' },
                        h(Skeleton, { active: true, paragraph: { rows: 2 }, title: { width: 80 } })
                      );
                    })
                  )
                : rankedTargets.length > 0
                ? h('div', { className: 'target-list' },
                    rankedTargets.map(function (t, idx) {
                      return h(TargetRow, {
                        key: t.symbol,
                        target: t,
                        rank: idx + 1,
                        composite: compositeMap[t.symbol] || t.composite,
                        narrative: narratives[t.symbol],
                        selected: selected && selected.symbol === t.symbol,
                        compareChecked: compareSymbols.indexOf(t.symbol) !== -1,
                        onCompareToggle: toggleCompare,
                        weights: weights,
                        onClick: function () { handleTargetClick(t); },
                      });
                    })
                  )
                : h('div', { className: 'empty-state' },
                    h('div', { className: 'empty-icon', style: { fontSize: 48, opacity: 0.12, lineHeight: 1 } }, '\u25c6'),
                    h('div', { className: 'empty-text' }, 'Enter a disease to discover targets'),
                    h('div', { className: 'empty-sub' },
                      'Powered by Open Targets Platform \u00b7 ClinicalTrials.gov \u00b7 Domino Model Endpoint \u00b7 Agent Orchestration'
                    )
                  )
            ),

            // ── Right: evidence graph ─────────────
            h('div', { className: 'graph-panel' },
              h('div', { className: 'panel-header' },
                h('span', { className: 'panel-title' }, 'Evidence Graph'),
                h('div', { className: 'legend' },
                  legendItems.map(function (item) {
                    var color = item.color || dtColor(item.key);
                    var label = item.label || dtLabel(item.key);
                    var active = edgeFilter[item.key] !== false;
                    return h(Tooltip, { key: item.key, title: (active ? 'Hide ' : 'Show ') + label + ' edges' },
                      h('span', {
                        className: 'legend-item' + (active ? '' : ' legend-item-dim'),
                        onClick: function () { toggleEdge(item.key); },
                        style: { cursor: 'pointer' },
                      },
                        h('span', {
                          className: 'legend-dot',
                          style: {
                            background: color,
                            borderRadius: item.type === 'node-drug' ? 2 : '50%',
                          },
                        }),
                        h('span', { className: 'legend-label' }, label)
                      )
                    );
                  })
                )
              ),
              h('div', { className: 'graph-container' },
                rankedTargets.length > 0
                  ? h(EvidenceGraph, {
                      disease: disease,
                      targets: rankedTargets,
                      selectedTarget: selected,
                      onSelectTarget: handleTargetClick,
                      ppiLinks: ppiLinks,
                      edgeFilter: edgeFilter,
                    })
                  : h('div', { className: 'graph-empty' },
                      loading
                        ? h(Spin, { size: 'large' })
                        : h('span', { className: 'graph-empty-text', style: { color: '#6060A0', fontSize: 13 } },
                            'Evidence graph appears here'
                          )
                    )
              )
            )
          )
        ),

        // ── Detail drawer ─────────────────────────
        h(Drawer, {
          title: selected
            ? h('span', null,
                h('span', { className: 'drawer-gene' }, selected.symbol),
                h('span', { className: 'drawer-gene-name' }, ' \u2014 ' + (selected.name || ''))
              )
            : null,
          placement: 'right',
          width: 520,
          open: !!selected,
          onClose: function () { setSelected(null); },
          extra: selected
            ? h(Tag, { color: 'purple' }, 'Composite: ' + (compositeMap[selected.symbol] || selected.composite).toFixed(1) + ' / 10')
            : null,
          styles: { body: { padding: '20px 24px' } },
        },
          selected
            ? h(DetailPane, {
                target: selected,
                disease: disease,
                narrative: narratives[selected.symbol],
                trials: trialsCache[selected.symbol],
                composite: compositeMap[selected.symbol] || selected.composite,
              })
            : null
        ),

        // ── Compare modal ─────────────────────────
        h(CompareModal, {
          targets: compareTargets,
          composites: compositeMap,
          open: compareOpen,
          onClose: function () { setCompareOpen(false); },
          narratives: narratives,
        }),

        // ── About modal ───────────────────────────
        h(AboutModal, {
          open: aboutOpen,
          onClose: function () { setAboutOpen(false); },
        }),

        // ── Footer ────────────────────────────────
        h('div', { className: 'primitives-footer' },
          h('span', { className: 'primitives-label' }, 'Built on Domino Platform Primitives:'),
          h('span', { className: 'primitives-list' },
            'Data Sources \u00b7 Model Endpoint \u00b7 Agent Orchestration \u00b7 App Hosting \u00b7 Scheduled Refresh'
          )
        )
      )
    );
  }

  // ── Boot ───────────────────────────────────────────────
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(App));

})();
