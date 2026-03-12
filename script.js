const STORAGE_KEY = 'poule-suite-state-v1';
const STEP_ORDER = ['type', 'count', 'teams', 'options', 'results'];
const SCREEN_TO_STEP = {
  type: 'type',
  count: 'count',
  teams: 'teams',
  options: 'options',
  results: 'results',
};

const screens = {};
document.querySelectorAll('[data-screen]').forEach(section => {
  screens[section.dataset.screen] = section;
});

const elements = {
  stepper: document.getElementById('stepper'),
  stepItems: document.querySelectorAll('.step'),
  startFlow: document.getElementById('startFlow'),
  resumeFlow: document.getElementById('resumeFlow'),
  navButtons: document.querySelectorAll('[data-nav]'),
  printTopBtn: document.getElementById('printTopBtn'),
  countMinus: document.getElementById('countMinus'),
  countPlus: document.getElementById('countPlus'),
  teamCountDisplay: document.getElementById('teamCountDisplay'),
  teamCountSlider: document.getElementById('teamCountSlider'),
  teamFields: document.getElementById('teamFields'),
  autoFillTeams: document.getElementById('autoFillTeams'),
  teamBulkInput: document.getElementById('teamBulkInput'),
  applyBulkNames: document.getElementById('applyBulkNames'),
  fieldCount: document.getElementById('fieldCount'),
  matchDuration: document.getElementById('matchDuration'),
  startTime: document.getElementById('startTime'),
  timerToggle: document.getElementById('timerToggle'),
  soundToggle: document.getElementById('soundToggle'),
  vibrationToggle: document.getElementById('vibrationToggle'),
  generateBtn: document.getElementById('generateBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  startLiveBtn: document.getElementById('startLiveBtn'),
  returnLiveBtn: document.getElementById('returnLiveBtn'),
  printBtn: document.getElementById('printBtn'),
  resetAppBtn: document.getElementById('resetAppBtn'),
  rotationView: document.getElementById('rotationView'),
  teamView: document.getElementById('teamView'),
  rankingView: document.getElementById('rankingView'),
  tabButtons: document.querySelectorAll('.tab'),
  summaryGrid: document.getElementById('summaryGrid'),
  resultSubtitle: document.getElementById('resultSubtitle'),
  timerWidget: document.getElementById('timerWidget'),
  timerDisplay: document.getElementById('timerDisplay'),
  timerRotationLabel: document.getElementById('timerRotationLabel'),
  timerControls: document.querySelectorAll('[data-timer]'),
  timerRanking: document.getElementById('timerRanking'),
  timerBackToLive: document.getElementById('timerBackToLive'),
  liveRotationTitle: document.getElementById('liveRotationTitle'),
  liveStatus: document.getElementById('liveStatus'),
  liveRotationContent: document.getElementById('liveRotationContent'),
  liveShell: document.getElementById('liveShell'),
  liveRankingPanel: document.getElementById('liveRankingPanel'),
  liveRankingTable: document.getElementById('liveRankingTable'),
  liveRestNotice: document.getElementById('liveRestNotice'),
  liveTimerDisplay: document.getElementById('liveTimerDisplay'),
  liveTimerState: document.getElementById('liveTimerState'),
  liveModeToggle: document.getElementById('liveModeToggle'),
  livePauseBtn: document.getElementById('livePauseBtn'),
  liveResumeBtn: document.getElementById('liveResumeBtn'),
  liveTimerResetBtn: document.getElementById('liveTimerResetBtn'),
  liveFinishBtn: document.getElementById('liveFinishBtn'),
  liveBackBtn: document.getElementById('liveBackBtn'),
  liveNextBtn: document.getElementById('liveNextBtn'),
  liveRankingBtn: document.getElementById('liveRankingBtn'),
  finalRankingModal: document.getElementById('finalRankingModal'),
  finalRankingTable: document.getElementById('finalRankingTable'),
  finalRankingCloseBtn: document.getElementById('finalRankingCloseBtn'),
  finalRankingCsvBtn: document.getElementById('finalRankingCsvBtn'),
  finalRankingOkBtn: document.getElementById('finalRankingOkBtn'),
  finalRankingLiveBtn: document.getElementById('finalRankingLiveBtn'),
};

let state = sanitizeState(loadState() ?? createDefaultState());
const timerState = {
  baseSeconds: 0,
  remainingSeconds: 0,
  intervalId: null,
  currentRotation: 1,
  totalRotations: 0,
};
let finalRankingSnapshot = null;

const timerController = {
  prepare() {
    timerState.baseSeconds = state.options.duration * 60;
    timerState.remainingSeconds = timerState.baseSeconds;
    timerState.totalRotations = state.schedule ? state.schedule.meta.rotationCount : 0;
    timerState.currentRotation = state.schedule ? (state.liveRotationIndex + 1 || 1) : 1;
    const highlightTarget = state.schedule ? state.schedule.rotations[state.liveRotationIndex]?.number || 1 : 1;
    highlightRotation(highlightTarget);
    elements.timerWidget.classList.remove('hidden', 'timer-ended', 'running');
    updateTimerDisplay();
    setLiveTimerControlsAvailability(true);
  },
  start() {
    if (timerState.intervalId || elements.timerWidget.classList.contains('hidden')) return;
    timerState.intervalId = setInterval(() => {
      if (timerState.remainingSeconds <= 0) {
        this.onEnd();
        return;
      }
      timerState.remainingSeconds -= 1;
      updateTimerDisplay();
      if (timerState.remainingSeconds === 0) {
        this.onEnd();
      }
    }, 1000);
    elements.timerWidget.classList.remove('timer-ended');
    elements.timerWidget.classList.add('running');
    updateTimerDisplay();
  },
  pause() {
    if (timerState.intervalId) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
    elements.timerWidget.classList.remove('running');
    updateTimerDisplay();
  },
  reset() {
    const wasRunning = Boolean(timerState.intervalId);
    this.pause();
    timerState.remainingSeconds = timerState.baseSeconds;
    elements.timerWidget.classList.remove('timer-ended');
    updateTimerDisplay();
    if (wasRunning && state.options.timer) {
      this.start();
    }
  },
  next() {
    if (!state.schedule) return false;
    const advanced = advanceLiveRotation({ viaTimer: true });
    if (!advanced) return false;
    const rotationNumber = state.schedule.rotations[state.liveRotationIndex]?.number || 1;
    this.syncRotation(rotationNumber);
    return true;
  },
  onEnd() {
    this.pause();
    elements.timerWidget.classList.add('timer-ended');
    updateTimerDisplay('Terminé');
    triggerFeedback();
  },
  hide() {
    this.pause();
    elements.timerWidget.classList.add('hidden');
    elements.timerWidget.classList.remove('timer-ended', 'running');
    setLiveTimerControlsAvailability(false);
    if (elements.liveTimerDisplay) elements.liveTimerDisplay.textContent = '--:--';
    if (elements.liveTimerState) elements.liveTimerState.textContent = 'Inactif';
  },
  syncRotation(rotationNumber) {
    timerState.currentRotation = rotationNumber;
    timerState.remainingSeconds = timerState.baseSeconds;
    elements.timerWidget.classList.remove('timer-ended');
    const wasRunning = Boolean(timerState.intervalId);
    updateTimerDisplay();
    if (wasRunning) {
      this.pause();
      this.start();
    }
  },
};

init();

function init() {
  bindNavigation();
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  if (state.schedule) {
    renderResults(state.schedule, { preserveTimestamp: true });
  }
  goTo('landing', { silent: true });
  setLiveModeAvailability(Boolean(state.schedule));
  elements.regenerateBtn.disabled = !state.schedule;
  updateResumeButton();
}

function bindNavigation() {
  elements.startFlow.addEventListener('click', () => goTo('type'));
  elements.resumeFlow.addEventListener('click', handleResume);

  elements.navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      if (target === 'results' && !state.schedule) return;
      goTo(target);
    });
  });

  elements.countMinus.addEventListener('click', () => adjustParticipants(-1));
  elements.countPlus.addEventListener('click', () => adjustParticipants(1));
  elements.teamCountSlider.addEventListener('input', event => updateParticipants(Number(event.target.value)));

  elements.teamFields.addEventListener('input', event => {
    if (!event.target.matches('input[data-index]')) return;
    const idx = Number(event.target.dataset.index);
    state.teamNames[idx] = event.target.value;
    persistState();
  });

  elements.autoFillTeams.addEventListener('click', () => {
    const pool = [
      'Aigles', 'Falcons', 'Titans', 'Lynx', 'Comètes', 'Spartiates', 'Orcas', 'Phoenix', 'Pumas', 'Vikings',
      'Dragons', 'Mistral', 'Tornades', 'Mambas', 'Corsaires', 'Renards', 'Tempêtes', 'Condors', 'Mustangs', 'Guépards',
      'Hurricanes', 'Bisons', 'Loutres', 'Nomades', 'Jets', 'Panthers', 'Sharks', 'Coyotes', 'Raptors', 'Tigers', 'Wolves', 'Bulls',
    ];
    state.teamNames = ensureTeamListLength(
      state.teamNames.map((_, index) => pool[index] || `Équipe ${index + 1}`),
      state.participants
    );
    buildTeamFields(state.participants);
    persistState();
  });

  if (elements.applyBulkNames) {
    elements.applyBulkNames.addEventListener('click', applyBulkTeamNames);
  }

  elements.fieldCount.addEventListener('input', event => {
    state.options.fields = clampNumber(Number(event.target.value), 1, 16, state.options.fields);
    event.target.value = state.options.fields;
    persistState();
  });

  elements.matchDuration.addEventListener('input', event => {
    state.options.duration = clampNumber(Number(event.target.value), 1, 180, state.options.duration);
    event.target.value = state.options.duration;
    persistState();
    timerState.baseSeconds = state.options.duration * 60;
  });

  elements.startTime.addEventListener('input', event => {
    state.options.startTime = event.target.value;
    persistState();
  });

  elements.timerToggle.addEventListener('change', () => {
    state.options.timer = elements.timerToggle.checked;
    persistState();
    handleTimerVisibility();
  });

  elements.soundToggle.addEventListener('change', () => {
    state.options.sound = elements.soundToggle.checked;
    persistState();
  });

  elements.vibrationToggle.addEventListener('change', () => {
    state.options.vibration = elements.vibrationToggle.checked;
    persistState();
  });

  elements.generateBtn.addEventListener('click', handleGenerate);
  elements.regenerateBtn.addEventListener('click', () => {
    if (!state.schedule) return;
    const teams = getFinalTeamNames();
    state.teamNames = teams;
    buildTeamFields(state.participants);
    renderResults(generateSchedule(teams, state.options), { resetScores: true });
  });

  elements.printBtn.addEventListener('click', () => window.print());
  elements.printTopBtn.addEventListener('click', () => window.print());
  if (elements.startLiveBtn) {
    elements.startLiveBtn.addEventListener('click', startLiveMode);
  }

  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => setActiveView(btn.dataset.view));
  });

  elements.timerControls.forEach(btn => {
    btn.addEventListener('click', () => handleTimerControl(btn.dataset.timer));
  });
  if (elements.timerRanking) {
    elements.timerRanking.addEventListener('click', () => {
      goTo('results');
      setActiveView('rankings');
    });
  }
  if (elements.timerBackToLive) {
    elements.timerBackToLive.addEventListener('click', () => {
      if (!state.schedule) return;
      goTo('live');
      renderLiveRotation();
    });
  }

  elements.rotationView.addEventListener('input', handleScoreInput);
  if (elements.liveRotationContent) {
    elements.liveRotationContent.addEventListener('input', handleScoreInput);
    elements.liveRotationContent.addEventListener('click', handleScoreAdjust);
  }
  if (elements.liveBackBtn) {
    elements.liveBackBtn.addEventListener('click', () => {
      goTo('results');
      setActiveView('rotations');
    });
  }
  if (elements.liveRankingBtn) {
    elements.liveRankingBtn.addEventListener('click', () => {
      goTo('results');
      setActiveView('rankings');
    });
  }
  if (elements.liveNextBtn) {
    elements.liveNextBtn.addEventListener('click', () => advanceLiveRotation());
  }
  if (elements.livePauseBtn) {
    elements.livePauseBtn.addEventListener('click', () => timerController.pause());
  }
  if (elements.liveResumeBtn) {
    elements.liveResumeBtn.addEventListener('click', () => timerController.start());
  }
  if (elements.liveTimerResetBtn) {
    elements.liveTimerResetBtn.addEventListener('click', () => timerController.reset());
  }
  if (elements.liveFinishBtn) {
    elements.liveFinishBtn.addEventListener('click', handleLiveFinish);
  }
  if (elements.liveModeToggle) {
    elements.liveModeToggle.addEventListener('click', toggleLiveGiantMode);
  }
  if (elements.returnLiveBtn) {
    elements.returnLiveBtn.addEventListener('click', () => {
      if (!state.schedule) return;
      goTo('live');
      renderLiveRotation();
    });
  }
  if (elements.finalRankingCloseBtn) {
    elements.finalRankingCloseBtn.addEventListener('click', hideFinalRankingModal);
  }
  if (elements.finalRankingOkBtn) {
    elements.finalRankingOkBtn.addEventListener('click', hideFinalRankingModal);
  }
  if (elements.finalRankingLiveBtn) {
    elements.finalRankingLiveBtn.addEventListener('click', () => {
      hideFinalRankingModal();
      if (state.schedule) {
        goTo('live');
        renderLiveRotation();
      }
    });
  }
  if (elements.finalRankingCsvBtn) {
    elements.finalRankingCsvBtn.addEventListener('click', downloadFinalRankingCsv);
  }
  if (elements.finalRankingModal) {
    elements.finalRankingModal.addEventListener('click', event => {
      if (event.target === elements.finalRankingModal) {
        hideFinalRankingModal();
      }
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && elements.finalRankingModal && !elements.finalRankingModal.classList.contains('hidden')) {
      hideFinalRankingModal();
    }
  });

  if (elements.resetAppBtn) {
    elements.resetAppBtn.addEventListener('click', resetApplication);
  }
}

function handleResume() {
  const stored = loadState();
  if (!stored) return;
  state = sanitizeState(stored);
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  if (state.schedule) {
    renderResults(state.schedule, { preserveTimestamp: true });
    goTo(state.currentScreen && state.currentScreen !== 'landing' ? state.currentScreen : 'results');
  } else {
    goTo(state.currentScreen && state.currentScreen !== 'landing' ? state.currentScreen : 'type');
  }
  setLiveModeAvailability(Boolean(state.schedule));
  elements.regenerateBtn.disabled = !state.schedule;
}

function goTo(screen, options = {}) {
  if (!screens[screen]) return;
  Object.values(screens).forEach(section => section.classList.remove('active'));
  screens[screen].classList.add('active');
  if (screen !== 'live' && elements.liveShell) {
    elements.liveShell.classList.remove('giant-mode');
    if (elements.liveModeToggle) {
      elements.liveModeToggle.textContent = 'Mode écran';
    }
  }
  state.currentScreen = screen;
  if (!options.silent) {
    state.lastScreen = screen;
    persistState();
  }
  updateStepper(screen);
  togglePrintButton(screen === 'results');
}

function updateStepper(screen) {
  const stepKey = SCREEN_TO_STEP[screen];
  if (!stepKey) {
    elements.stepper.classList.add('hidden');
    return;
  }
  elements.stepper.classList.remove('hidden');
  const activeIndex = STEP_ORDER.indexOf(stepKey);
  elements.stepItems.forEach(item => {
    const idx = STEP_ORDER.indexOf(item.dataset.step);
    const isDone = idx < activeIndex;
    const isCurrent = idx === activeIndex;
    item.classList.toggle('active', idx <= activeIndex);
    item.classList.toggle('done', isDone);
    item.classList.toggle('current', isCurrent);
  });
}

function togglePrintButton(visible) {
  elements.printTopBtn.classList.toggle('hidden', !visible);
  elements.printBtn.disabled = !visible;
}

function renderParticipants() {
  elements.teamCountDisplay.textContent = state.participants;
  elements.teamCountSlider.value = state.participants;
}

function adjustParticipants(delta) {
  updateParticipants(state.participants + delta);
}

function updateParticipants(value) {
  const next = clampNumber(value, 2, 32, state.participants);
  state.participants = next;
  state.teamNames = ensureTeamListLength(state.teamNames, next);
  renderParticipants();
  buildTeamFields(next);
  persistState();
}

function buildTeamFields(count) {
  elements.teamFields.innerHTML = '';
  state.teamNames = ensureTeamListLength(state.teamNames, count);
  state.teamNames.forEach((name, index) => {
    const label = document.createElement('label');
    label.className = 'field';
    const span = document.createElement('span');
    span.textContent = `Équipe ${index + 1}`;
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = `Équipe ${index + 1}`;
    input.value = name;
    input.dataset.index = index;
    label.append(span, input);
    elements.teamFields.appendChild(label);
  });
}

function syncOptionInputs() {
  elements.fieldCount.value = state.options.fields;
  elements.matchDuration.value = state.options.duration;
  elements.startTime.value = state.options.startTime;
  elements.timerToggle.checked = state.options.timer;
  elements.soundToggle.checked = state.options.sound;
  elements.vibrationToggle.checked = state.options.vibration;
}

function getFinalTeamNames() {
  return ensureTeamListLength(state.teamNames, state.participants).map((name, index) => {
    const trimmed = name.trim();
    return trimmed || `Équipe ${index + 1}`;
  });
}

function applyBulkTeamNames() {
  if (!elements.teamBulkInput) return;
  const raw = elements.teamBulkInput.value.trim();
  if (!raw) {
    alert('Collez une liste de noms avant d\'appliquer.');
    return;
  }
  const candidates = raw
    .split(/[\n,;]/)
    .map(name => name.trim())
    .filter(Boolean);
  if (!candidates.length) {
    alert('Aucun nom valide détecté.');
    return;
  }
  state.teamNames = ensureTeamListLength(candidates, state.participants);
  buildTeamFields(state.participants);
  elements.teamBulkInput.value = '';
  persistState();
}

function handleGenerate() {
  const teams = getFinalTeamNames();
  if (teams.length < 2) {
    alert('Ajoutez au moins deux équipes.');
    return;
  }
  state.teamNames = teams;
  buildTeamFields(state.participants);
  const schedule = generateSchedule(teams, state.options);
  renderResults(schedule, { resetScores: true });
  goTo('results');
}

function renderResults(schedule, options = {}) {
  const preserveTimestamp = Boolean(options.preserveTimestamp);
  const resetScores = Boolean(options.resetScores);
  if (resetScores) {
    state.scores = {};
  }
  state.schedule = schedule;
  finalRankingSnapshot = null;
  if (!preserveTimestamp || !state.generatedAt) {
    state.generatedAt = new Date().toISOString();
  }
  persistState();
  elements.resultSubtitle.textContent = `Planning généré le ${new Date(state.generatedAt).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })}`;
  state.liveRotationIndex = 0;
  renderSummary(schedule.meta);
  renderRotationView(schedule.rotations);
  renderTeamView(schedule.teams);
  renderRankingView(schedule);
  renderLiveRankingPanel(schedule.rotations[state.liveRotationIndex]?.number || 1);
  const defaultRotation = Number.isInteger(state.liveRotationIndex) ? state.liveRotationIndex + 1 : 1;
  const highlightTarget =
    state.schedule && state.schedule.meta
      ? Math.min(state.schedule.meta.rotationCount, Math.max(1, defaultRotation))
      : 1;
  highlightRotation(highlightTarget);
  setActiveView('rotations');
  elements.regenerateBtn.disabled = false;
  setLiveModeAvailability(true);
  handleTimerVisibility();
}

function renderSummary(meta) {
  const info = [
    { label: "Équipes", value: meta.teamCount },
    { label: 'Rotations', value: meta.rotationCount },
    { label: 'Matchs', value: meta.matchCount },
    { label: 'Terrains', value: meta.fieldCount },
  ];
  if (meta.estimatedDuration) info.push({ label: 'Durée totale', value: meta.estimatedDuration });
  if (meta.endTime) info.push({ label: 'Fin estimée', value: meta.endTime });
  elements.summaryGrid.innerHTML = info
    .map(item => `<article class="summary-card"><span>${item.label}</span><strong>${item.value}</strong></article>`)
    .join('');
}

function buildMatchListHTML(rotation) {
  return rotation.matches
    .map(match => {
      const matchId = match.id || buildMatchKey(rotation.number, match.home, match.away);
      match.id = matchId;
      return `
      <li>
        <div class="match-label">
          <span>${match.home} - ${match.away}</span>
          <span class="field-label">Terrain ${match.field}${match.order > 1 ? ` · slot ${match.order}` : ''}</span>
        </div>
        <div class="score-inputs" aria-label="Score ${match.home} ${match.away}">
          <input type="number" min="0" inputmode="numeric" aria-label="Score ${match.home}" data-rotation="${rotation.number}" data-match-id="${matchId}" data-score-input="home" value="${formatScoreValue(getScoreValue(matchId, 'home'))}" />
          <span>:</span>
          <input type="number" min="0" inputmode="numeric" aria-label="Score ${match.away}" data-rotation="${rotation.number}" data-match-id="${matchId}" data-score-input="away" value="${formatScoreValue(getScoreValue(matchId, 'away'))}" />
        </div>
      </li>`;
    })
    .join('');
}

function buildFieldsGridHTML(rotation) {
  return rotation.fieldAssignments
    .map(field => {
      const items = field.matches.length
        ? field.matches.map(m => `<li>${m.home} - ${m.away}${m.order > 1 ? ` (slot ${m.order})` : ''}</li>`).join('')
        : '<li>Aucun match</li>';
      return `<div class="field-card"><h4>${field.label}</h4><ul>${items}</ul></div>`;
    })
    .join('');
}

function buildRestBadgesHTML(rotation) {
  if (!rotation.byes.length) return '';
  const badges = rotation.byes.map(team => `<span class="rest-badge">${team}</span>`).join('');
  return `<div class="rest-badges" aria-label="Équipes au repos">${badges}</div>`;
}

function renderRotationView(rotations) {
  elements.rotationView.innerHTML = rotations
    .map(rotation => {
      const matches = buildMatchListHTML(rotation);
      const byes = buildRestBadgesHTML(rotation);
      const fieldsGrid = buildFieldsGridHTML(rotation);
      const timing = rotation.startLabel
        ? `<span class="rotation-meta">${rotation.startLabel} · ${rotation.durationLabel}</span>`
        : `<span class="rotation-meta">${rotation.durationLabel}</span>`;
      return `
        <article class="rotation-card" data-rotation="${rotation.number}">
          <div class="rotation-header">
            <h3>ROTATION N° ${rotation.number}</h3>
            ${timing}
          </div>
          ${byes}
          <ul class="match-list">${matches}</ul>
          <div class="fields-grid">${fieldsGrid}</div>
        </article>
      `;
    })
    .join('');
}

function renderTeamView(teams) {
  elements.teamView.innerHTML = teams
    .map(team => {
      const list = team.matches
        .map(entry => {
          const isBye = entry.bye;
          const label = isBye ? 'Repos' : entry.opponent;
          const details = isBye
            ? `Rotation ${entry.rotation}`
            : `Rotation ${entry.rotation}${entry.field ? ` · Terrain ${entry.field}` : ''}${
                entry.start != null ? ` · ${formatTime(entry.start)}` : ''
              }`;
          const byeClass = isBye ? ' class="bye"' : '';
          return `<li${byeClass}><span>${label}</span><span class="rotation-meta">${details}</span></li>`;
        })
        .join('');
      return `
        <article class="team-card">
          <h3>${team.name}</h3>
          <ul class="team-match-list">${list}</ul>
        </article>
      `;
    })
    .join('');
}

function renderRankingView(schedule) {
  if (!schedule) {
    elements.rankingView.innerHTML = '';
    return;
  }
  const cards = schedule.rotations
    .map(rotation => {
      const snapshot = computeRankingSnapshot(schedule, rotation.number);
      const rows = snapshot.table
        .map(
          (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${row.name}</td>
            <td>${row.points}</td>
            <td>${row.played}</td>
            <td>${row.wins}</td>
            <td>${row.draws}</td>
            <td>${row.losses}</td>
            <td>${row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
          </tr>`
        )
        .join('');
      return `
        <article class="ranking-card">
          <header>
            <h3>Classement après rotation ${rotation.number}</h3>
            <span class="ranking-status">${snapshot.complete ? 'Rotation complète' : 'Scores en attente'}</span>
          </header>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Équipe</th>
                <th>Pts</th>
                <th>J</th>
                <th>G</th>
                <th>N</th>
                <th>P</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </article>
      `;
    })
    .join('');
  elements.rankingView.innerHTML = cards;
}

function renderLiveRankingPanel(uptoRotation) {
  if (!elements.liveRankingTable) return;
  if (!state.schedule) {
    elements.liveRankingTable.innerHTML = '<p>Aucun planning à afficher.</p>';
    return;
  }
  const target =
    uptoRotation ||
    (state.schedule.rotations[state.liveRotationIndex] && state.schedule.rotations[state.liveRotationIndex].number) ||
    1;
  const snapshot = computeRankingSnapshot(state.schedule, target);
  if (!snapshot.table.length) {
    elements.liveRankingTable.innerHTML = '<p>Ajoutez des scores pour lancer le classement.</p>';
    return;
  }
  const rows = snapshot.table
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.name}</td>
          <td>${row.points}</td>
          <td>${row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
          <td>${row.played}</td>
        </tr>
      `
    )
    .join('');
  const statusLabel = snapshot.complete ? 'Scores validés' : 'Scores en attente';
  elements.liveRankingTable.innerHTML = `
    <p class="live-ranking-meta">Après rotation ${target}</p>
    <table>
      <thead>
        <tr>
          <th>Pos</th>
          <th>Équipe</th>
          <th>Pts</th>
          <th>Diff</th>
          <th>J</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="live-ranking-note">${statusLabel}</p>
  `;
}

function handleLiveFinish() {
  if (!state.schedule) return;
  const rotationNumber =
    Number(elements.liveRotationContent?.dataset.rotation) ||
    (state.schedule.rotations[state.liveRotationIndex] && state.schedule.rotations[state.liveRotationIndex].number) ||
    1;
  if (!isRotationComplete(rotationNumber)) {
    alert('Veuillez renseigner tous les scores de la rotation en cours avant de terminer.');
    return;
  }
  showFinalRankingModal(rotationNumber);
}

function showFinalRankingModal(uptoRotation) {
  if (!elements.finalRankingModal || !state.schedule) return;
  goTo('results');
  setActiveView('rankings');
  const upto =
    uptoRotation ||
    (state.schedule.rotations[state.liveRotationIndex] && state.schedule.rotations[state.liveRotationIndex].number) ||
    state.schedule.meta.rotationCount;
  finalRankingSnapshot = computeRankingSnapshot(state.schedule, upto);
  renderFinalRankingTable(finalRankingSnapshot, upto);
  elements.finalRankingModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function hideFinalRankingModal() {
  if (!elements.finalRankingModal) return;
  elements.finalRankingModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function renderFinalRankingTable(snapshot, upto) {
  if (!elements.finalRankingTable) return;
  if (!snapshot || !snapshot.table.length) {
    elements.finalRankingTable.innerHTML = '<p>Aucun score disponible pour établir un classement.</p>';
    if (elements.finalRankingCsvBtn) elements.finalRankingCsvBtn.disabled = true;
    return;
  }
  const rows = snapshot.table
    .map(
      (row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${row.name}</td>
        <td>${row.points}</td>
        <td>${row.played}</td>
        <td>${row.wins}</td>
        <td>${row.draws}</td>
        <td>${row.losses}</td>
        <td>${row.goalsFor}</td>
        <td>${row.goalsAgainst}</td>
        <td>${row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
      </tr>`
    )
    .join('');
  const note = snapshot.complete
    ? `Classement définitif après ${upto} rotation(s).`
    : 'Scores incomplets : classement provisoire.';
  elements.finalRankingTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pos</th>
          <th>Équipe</th>
          <th>Pts</th>
          <th>J</th>
          <th>G</th>
          <th>N</th>
          <th>P</th>
          <th>BP</th>
          <th>BC</th>
          <th>Diff</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="note">${note}</p>
  `;
  if (elements.finalRankingCsvBtn) {
    elements.finalRankingCsvBtn.disabled = false;
  }
}

function downloadFinalRankingCsv() {
  if (!state.schedule) return;
  if (!finalRankingSnapshot) {
    finalRankingSnapshot = computeRankingSnapshot(state.schedule, state.schedule.meta.rotationCount);
  }
  if (!finalRankingSnapshot || !finalRankingSnapshot.table.length) return;
  const csv = buildFinalRankingCsv(finalRankingSnapshot);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `classement-final-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildFinalRankingCsv(snapshot) {
  const header = ['Pos', 'Équipe', 'Points', 'Joués', 'G', 'N', 'P', 'BP', 'BC', 'Diff'].join(';');
  const rows = snapshot.table.map((row, index) =>
    [
      index + 1,
      row.name,
      row.points,
      row.played,
      row.wins,
      row.draws,
      row.losses,
      row.goalsFor,
      row.goalsAgainst,
      row.goalDiff,
    ].join(';')
  );
  return [header, ...rows].join('\n');
}

function startLiveMode() {
  if (!state.schedule) return;
  const maxIndex = Math.max(0, state.schedule.rotations.length - 1);
  state.liveRotationIndex = clampNumber(state.liveRotationIndex, 0, maxIndex, 0);
  persistState();
  goTo('live');
  renderLiveRotation();
}

function renderLiveRotation() {
  if (!elements.liveRotationContent) return;
  if (!state.schedule) {
    elements.liveRotationTitle.textContent = 'Rotation';
    elements.liveRotationContent.innerHTML = '<p>Générez un planning avant de lancer les rotations.</p>';
    if (elements.liveStatus) elements.liveStatus.textContent = '';
    if (elements.liveNextBtn) elements.liveNextBtn.disabled = true;
    renderLiveRankingPanel();
    renderLiveRest([]);
    return;
  }
  const rotation = state.schedule.rotations[state.liveRotationIndex] || state.schedule.rotations[0];
  if (!rotation) {
    elements.liveRotationContent.innerHTML = '<p>Aucune rotation à afficher.</p>';
    if (elements.liveStatus) elements.liveStatus.textContent = '';
    if (elements.liveNextBtn) elements.liveNextBtn.disabled = true;
    renderLiveRest([]);
    renderLiveRankingPanel();
    return;
  }
  const total = state.schedule.meta.rotationCount;
  elements.liveRotationTitle.textContent = `Rotation ${rotation.number} / ${total}`;
  elements.liveRotationContent.dataset.rotation = rotation.number;
  elements.liveRotationContent.innerHTML = buildLiveMatchCards(rotation);
  renderLiveRest(rotation.byes);
  renderLiveRankingPanel(rotation.number);
  highlightRotation(rotation.number);
  updateLiveControls();
  if (elements.liveModeToggle && elements.liveShell) {
    const label = elements.liveShell.classList.contains('giant-mode') ? 'Quitter le mode écran' : 'Mode écran';
    elements.liveModeToggle.textContent = label;
  }
}

function buildLiveMatchCards(rotation) {
  if (!rotation.matches.length) {
    return '<p class="live-empty">Aucun match prévu pour cette rotation.</p>';
  }
  return rotation.matches.map(match => buildLiveMatchCard(rotation, match)).join('');
}

function buildLiveMatchCard(rotation, match) {
  const matchId = match.id || buildMatchKey(rotation.number, match.home, match.away);
  match.id = matchId;
  const homeScore = formatScoreValue(getScoreValue(matchId, 'home'));
  const awayScore = formatScoreValue(getScoreValue(matchId, 'away'));
  const complete = isMatchCompleteById(matchId);
  const parts = [];
  if (match.field) parts.push(`Terrain ${match.field}`);
  if (match.order > 1) parts.push(`Vague ${match.order}`);
  if (rotation.startLabel) parts.push(rotation.startLabel);
  const badge = parts.length ? parts.join(' · ') : `Rotation ${rotation.number}`;
  const status = complete ? 'Validé' : 'Score à saisir';
  return `
    <article class="live-match-card ${complete ? '' : 'incomplete'}" data-match-id="${matchId}">
      <header>
        <span>${badge}</span>
        <span>${status}</span>
      </header>
      <div class="teams">
        ${buildLiveTeamColumn('home', match.home, homeScore, matchId)}
        ${buildLiveTeamColumn('away', match.away, awayScore, matchId)}
      </div>
    </article>
  `;
}

function buildLiveTeamColumn(side, name, score, matchId) {
  const minusLabel = `Diminuer le score de ${name}`;
  const plusLabel = `Augmenter le score de ${name}`;
  return `
    <div class="live-team">
      <strong>${name}</strong>
      <div class="live-score-pad">
        <button type="button" class="score-adjust" aria-label="${minusLabel}" data-score-side="${side}" data-score-step="-1" data-match-id="${matchId}">−</button>
        <input type="number" min="0" inputmode="numeric" aria-label="Score ${name}" data-match-id="${matchId}" data-score-input="${side}" value="${score}" />
        <button type="button" class="score-adjust" aria-label="${plusLabel}" data-score-side="${side}" data-score-step="1" data-match-id="${matchId}">+</button>
      </div>
    </div>
  `;
}

function renderLiveRest(byes = []) {
  if (!elements.liveRestNotice) return;
  if (!byes.length) {
    elements.liveRestNotice.classList.add('hidden');
    elements.liveRestNotice.textContent = '';
    return;
  }
  const label = byes.length > 1 ? 'Équipes au repos' : 'Équipe au repos';
  elements.liveRestNotice.innerHTML = `<strong>${label} :</strong> ${byes.join(', ')}`;
  elements.liveRestNotice.classList.remove('hidden');
}

function updateLiveControls() {
  if (!state.schedule || !elements.liveRotationContent) return;
  const rotationNumber = Number(elements.liveRotationContent.dataset.rotation);
  if (!rotationNumber) {
    if (elements.liveNextBtn) elements.liveNextBtn.disabled = true;
    if (elements.liveStatus) elements.liveStatus.textContent = 'Aucune rotation en cours.';
    return;
  }
  const rotation = state.schedule.rotations.find(r => r.number === rotationNumber);
  const total = state.schedule.meta.rotationCount;
  const missing = countMissingScores(rotationNumber);
  const isComplete = rotation ? missing === 0 && rotation.matches.length > 0 : false;
  const isLast = rotationNumber === total;
  if (elements.liveNextBtn) {
    elements.liveNextBtn.disabled = !isComplete || isLast;
    elements.liveNextBtn.textContent = 'Rotation suivante';
  }
  const timerNextBtn = getTimerNextButton();
  if (timerNextBtn) {
    timerNextBtn.disabled = !isComplete || isLast;
  }
  if (elements.liveFinishBtn) {
    elements.liveFinishBtn.disabled = !isComplete;
  }
  if (elements.liveStatus) {
    const status = isComplete
      ? `Rotation ${rotationNumber} / ${total} validée`
      : `Rotation ${rotationNumber} / ${total} · ${missing} score(s) à saisir`;
    elements.liveStatus.textContent = status;
  }
}

function advanceLiveRotation(options = {}) {
  if (!state.schedule) return false;
  const rotation = state.schedule.rotations[state.liveRotationIndex];
  if (!rotation || !isRotationComplete(rotation.number)) return false;
  const lastIndex = state.schedule.rotations.length - 1;
  if (state.liveRotationIndex >= lastIndex) {
    state.liveRotationIndex = lastIndex;
    persistState();
    showFinalRankingModal(state.schedule.meta.rotationCount);
    return true;
  }
  state.liveRotationIndex += 1;
  persistState();
  renderLiveRotation();
  if (state.options.timer && !options.viaTimer && state.schedule) {
    const nextRotationNumber = state.schedule.rotations[state.liveRotationIndex].number;
    timerController.syncRotation(nextRotationNumber);
  }
  setLiveModeAvailability(true);
  return true;
}

function isRotationComplete(rotationNumber) {
  if (!state.schedule) return false;
  const rotation = state.schedule.rotations.find(r => r.number === rotationNumber);
  if (!rotation) return false;
  return rotation.matches.every(match => {
    const key = match.id || buildMatchKey(rotation.number, match.home, match.away);
    return isMatchCompleteById(key);
  });
}

function computeRankingSnapshot(schedule, uptoRotation) {
  const stats = new Map();
  schedule.teams.forEach(team => stats.set(team.name, createBaseStat(team.name)));
  let complete = true;
  schedule.rotations.forEach(rotation => {
    if (rotation.number > uptoRotation) return;
    rotation.matches.forEach(match => {
      const key = match.id || buildMatchKey(rotation.number, match.home, match.away);
      const record = state.scores && state.scores[key];
      if (!record || !Number.isFinite(record.home) || !Number.isFinite(record.away)) {
        complete = false;
        return;
      }
      applyMatchStats(stats, match.home, match.away, record.home, record.away);
    });
  });
  const table = Array.from(stats.values()).map(entry => ({
    ...entry,
    goalDiff: entry.goalsFor - entry.goalsAgainst,
  }));
  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });
  return { table, complete };
}

function createBaseStat(name) {
  return { name, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

function applyMatchStats(map, homeName, awayName, homeScore, awayScore) {
  const home = map.get(homeName) || createBaseStat(homeName);
  const away = map.get(awayName) || createBaseStat(awayName);
  map.set(homeName, home);
  map.set(awayName, away);
  home.played += 1;
  away.played += 1;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;
  if (homeScore > awayScore) {
    home.wins += 1;
    home.points += 3;
    away.losses += 1;
  } else if (homeScore < awayScore) {
    away.wins += 1;
    away.points += 3;
    home.losses += 1;
  } else {
    home.draws += 1;
    away.draws += 1;
    home.points += 1;
    away.points += 1;
  }
}

function setActiveView(view) {
  elements.tabButtons.forEach(btn => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  const viewMap = {
    rotations: elements.rotationView,
    teams: elements.teamView,
    rankings: elements.rankingView,
  };
  Object.entries(viewMap).forEach(([key, node]) => {
    node.classList.toggle('hidden', view !== key);
  });
}

function handleTimerVisibility() {
  if (state.options.timer && state.schedule) {
    timerController.prepare();
  } else {
    timerController.hide();
  }
}

function handleScoreInput(event) {
  const target = event.target;
  if (!target.matches('[data-score-input]')) return;
  const matchId = target.dataset.matchId;
  const side = target.dataset.scoreInput;
  if (!matchId || (side !== 'home' && side !== 'away')) return;
  let value = target.value.trim();
  if (value === '') {
    applyScoreChange(matchId, side, null);
    return;
  }
  let parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    parsed = null;
  } else {
    parsed = Math.floor(parsed);
  }
  if (parsed === null) {
    applyScoreChange(matchId, side, null);
  } else {
    applyScoreChange(matchId, side, parsed);
  }
}

function handleTimerControl(action) {
  if (action === 'start') timerController.start();
  if (action === 'pause') timerController.pause();
  if (action === 'reset') timerController.reset();
  if (action === 'next') {
    const progressed = timerController.next();
    if (!progressed) {
      alert('Veuillez saisir tous les scores de la rotation en cours avant de continuer.');
    }
  }
}

function handleScoreAdjust(event) {
  const button = event.target.closest('.score-adjust');
  if (!button) return;
  const matchId = button.dataset.matchId;
  const side = button.dataset.scoreSide;
  const delta = Number(button.dataset.scoreStep);
  if (!matchId || (side !== 'home' && side !== 'away') || Number.isNaN(delta)) return;
  const current = getScoreValue(matchId, side) ?? 0;
  const next = Math.max(0, current + delta);
  applyScoreChange(matchId, side, next);
}

function applyScoreChange(matchId, side, value) {
  setScoreValue(matchId, side, value);
  syncScoreInputs(matchId, side, value);
  persistState();
  if (state.schedule) {
    renderRankingView(state.schedule);
    renderLiveRankingPanel();
    updateLiveControls();
  }
}

function syncScoreInputs(matchId, side, value) {
  const formatted = formatScoreValue(value);
  document.querySelectorAll(`input[data-match-id="${matchId}"][data-score-input="${side}"]`).forEach(input => {
    input.value = formatted;
  });
  updateMatchCompletionState(matchId);
}

function updateMatchCompletionState(matchId) {
  if (!matchId) return;
  const complete = isMatchCompleteById(matchId);
  document.querySelectorAll(`.live-match-card[data-match-id="${matchId}"]`).forEach(card => {
    card.classList.toggle('incomplete', !complete);
    const statusNode = card.querySelector('header span:last-child');
    if (statusNode) {
      statusNode.textContent = complete ? 'Validé' : 'Score à saisir';
    }
  });
}

function countMissingScores(rotationNumber) {
  if (!state.schedule) return 0;
  const rotation = state.schedule.rotations.find(r => r.number === rotationNumber);
  if (!rotation) return 0;
  return rotation.matches.reduce((acc, match) => {
    const key = match.id || buildMatchKey(rotation.number, match.home, match.away);
    return acc + (isMatchCompleteById(key) ? 0 : 1);
  }, 0);
}

function isMatchCompleteById(matchId) {
  if (!state.scores || !state.scores[matchId]) return false;
  const record = state.scores[matchId];
  return Number.isFinite(record.home) && Number.isFinite(record.away);
}

function getTimerNextButton() {
  if (!elements.timerControls) return null;
  const list = Array.from(elements.timerControls);
  return list.find(btn => btn.dataset.timer === 'next') || null;
}

function setLiveTimerControlsAvailability(enabled) {
  [elements.livePauseBtn, elements.liveResumeBtn, elements.liveTimerResetBtn].forEach(btn => {
    if (!btn) return;
    btn.disabled = !enabled;
  });
}

function toggleLiveGiantMode() {
  if (!elements.liveShell || !elements.liveModeToggle) return;
  elements.liveShell.classList.toggle('giant-mode');
  const active = elements.liveShell.classList.contains('giant-mode');
  elements.liveModeToggle.textContent = active ? 'Quitter le mode écran' : 'Mode écran';
}

function updateTimerDisplay(statusOverride) {
  if (elements.timerRotationLabel) {
    elements.timerRotationLabel.textContent = `Rotation ${timerState.currentRotation}`;
  }
  if (elements.timerDisplay) {
    elements.timerDisplay.textContent = formatSeconds(timerState.remainingSeconds);
  }
  if (elements.liveTimerDisplay) {
    elements.liveTimerDisplay.textContent = formatSeconds(timerState.remainingSeconds);
  }
  if (elements.liveTimerState) {
    const label =
      statusOverride ||
      (timerState.remainingSeconds === 0 ? 'Terminé' : timerState.intervalId ? 'En cours' : 'En pause');
    elements.liveTimerState.textContent = label;
  }
}

function highlightRotation(number) {
  document.querySelectorAll('.rotation-card').forEach(card => {
    card.classList.toggle('current', Number(card.dataset.rotation) === number);
  });
}

function triggerFeedback() {
  if (state.options.sound) {
    playBeep();
  }
  if (state.options.vibration && navigator.vibrate) {
    navigator.vibrate([150, 50, 150]);
  }
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 720;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (error) {
    console.warn('Audio non supporté', error);
  }
}

function generateSchedule(teams, options) {
  const list = [...teams];
  const teamCount = list.length;
  let working = [...list];
  const isOdd = working.length % 2 === 1;
  if (isOdd) {
    working.push('Exempt');
  }
  const rotationCount = working.length - 1;
  const matchesPerRotation = working.length / 2;
  const rotations = [];
  const teamMap = new Map();
  list.forEach(name => teamMap.set(name, []));
  let clock = parseTime(options.startTime);
  const rotationDuration = options.duration;
  let totalMatches = 0;

  for (let round = 0; round < rotationCount; round += 1) {
    const matches = [];
    const byes = [];
    for (let i = 0; i < matchesPerRotation; i += 1) {
      const home = working[i];
      const away = working[working.length - 1 - i];
      if (home === 'Exempt') {
        if (away !== 'Exempt') byes.push(away);
      } else if (away === 'Exempt') {
        byes.push(home);
      } else {
        const matchId = buildMatchKey(round + 1, home, away);
        matches.push({ home, away, id: matchId });
      }
    }

    const fieldAssignments = Array.from({ length: options.fields }, (_, index) => ({
      label: `Terrain ${index + 1}`,
      matches: [],
    }));

    matches.forEach((match, index) => {
      const fieldIndex = index % options.fields;
      const slot = Math.floor(index / options.fields) + 1;
      match.field = fieldIndex + 1;
      match.order = slot;
      fieldAssignments[fieldIndex].matches.push(match);
      teamMap.get(match.home).push({ opponent: match.away, rotation: round + 1, field: match.field, start: clock });
      teamMap.get(match.away).push({ opponent: match.home, rotation: round + 1, field: match.field, start: clock });
      totalMatches += 1;
    });

    byes.forEach(team => {
      teamMap.get(team).push({ bye: true, rotation: round + 1, start: clock });
    });

    const startLabel = clock != null ? formatTime(clock) : null;
    const endLabel = clock != null ? formatTime(clock + rotationDuration) : null;

    rotations.push({
      number: round + 1,
      matches,
      byes,
      startLabel,
      durationLabel: `${rotationDuration} min${endLabel ? ` · fin ${endLabel}` : ''}`,
      fieldAssignments,
    });

    const pivot = working[0];
    const rest = working.slice(1);
    rest.unshift(rest.pop());
    working = [pivot, ...rest];
    if (clock != null) clock += rotationDuration;
  }

  const estimatedDuration = rotationDuration * rotationCount;
  const meta = {
    teamCount,
    rotationCount,
    matchCount: totalMatches,
    fieldCount: options.fields,
    estimatedDuration: estimatedDuration ? humanizeDuration(estimatedDuration) : null,
    endTime: parseTime(options.startTime) != null ? formatTime(parseTime(options.startTime) + estimatedDuration) : null,
  };

  const teamsView = list.map(name => ({
    name,
    matches: teamMap.get(name) || [],
  }));

  return { rotations, teams: teamsView, meta };
}

function parseTime(value) {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function formatTime(minutes) {
  const mod = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = String(Math.floor(mod / 60)).padStart(2, '0');
  const m = String(mod % 60).padStart(2, '0');
  return `${h}h${m}`;
}

function humanizeDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildMatchKey(rotationNumber, home, away) {
  const encode = value => encodeURIComponent(value.trim());
  return `r${rotationNumber}-${encode(home)}-${encode(away)}`;
}

function getScoreValue(matchId, side) {
  if (!state.scores || !state.scores[matchId]) return null;
  const value = state.scores[matchId][side];
  return Number.isFinite(value) ? value : null;
}

function setScoreValue(matchId, side, value) {
  if (!state.scores) state.scores = {};
  if (!state.scores[matchId]) state.scores[matchId] = { home: null, away: null };
  state.scores[matchId][side] = value;
  const counterpart = side === 'home' ? 'away' : 'home';
  if (state.scores[matchId][side] === null && state.scores[matchId][counterpart] === null) {
    delete state.scores[matchId];
  }
}

function formatScoreValue(value) {
  return value ?? '';
}

function clampNumber(value, min, max, fallback) {
  if (Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function ensureTeamListLength(list, length) {
  const current = [...list];
  while (current.length < length) {
    current.push(`Équipe ${current.length + 1}`);
  }
  return current.slice(0, length);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function updateResumeButton() {
  const stored = loadState();
  elements.resumeFlow.disabled = !stored;
}

function createDefaultState() {
  return {
    currentScreen: 'landing',
    lastScreen: 'landing',
    tournamentType: 'round-robin',
    participants: 8,
    teamNames: Array.from({ length: 8 }, (_, index) => `Équipe ${index + 1}`),
    options: {
      fields: 2,
      duration: 12,
      startTime: '09:00',
      timer: false,
      sound: true,
      vibration: true,
    },
    schedule: null,
    generatedAt: null,
    scores: {},
    liveRotationIndex: 0,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Impossible de charger la sauvegarde', error);
    return null;
  }
}

function sanitizeState(raw) {
  const base = createDefaultState();
  const source = raw || base;
  const merged = {
    ...base,
    ...source,
  };
  merged.participants = clampNumber(Number(merged.participants), 2, 32, base.participants);
  const optionSource = { ...base.options, ...(source.options || {}) };
  optionSource.fields = clampNumber(Number(optionSource.fields), 1, 16, base.options.fields);
  optionSource.duration = clampNumber(Number(optionSource.duration), 1, 180, base.options.duration);
  optionSource.startTime = optionSource.startTime || base.options.startTime;
  optionSource.timer = Boolean(optionSource.timer);
  optionSource.sound = optionSource.sound !== undefined ? Boolean(optionSource.sound) : base.options.sound;
  optionSource.vibration =
    optionSource.vibration !== undefined ? Boolean(optionSource.vibration) : base.options.vibration;
  merged.options = optionSource;
  const incomingNames = Array.isArray(source.teamNames) ? source.teamNames : base.teamNames;
  merged.teamNames = ensureTeamListLength(incomingNames, merged.participants);
  const sanitizedScores = {};
  if (isPlainObject(source.scores)) {
    Object.entries(source.scores).forEach(([key, value]) => {
      if (!isPlainObject(value)) return;
      sanitizedScores[key] = {
        home: Number.isFinite(value.home) ? value.home : null,
        away: Number.isFinite(value.away) ? value.away : null,
      };
    });
  }
  merged.scores = sanitizedScores;
  merged.liveRotationIndex = Number.isInteger(source.liveRotationIndex) ? source.liveRotationIndex : 0;
  if (merged.schedule && Array.isArray(merged.schedule.rotations) && merged.schedule.rotations.length) {
    merged.liveRotationIndex = clampNumber(
      merged.liveRotationIndex,
      0,
      merged.schedule.rotations.length - 1,
      0
    );
  } else {
    merged.liveRotationIndex = 0;
  }
  return merged;
}

function persistState() {
  try {
    const snapshot = { ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    updateResumeButton();
  } catch (error) {
    console.warn('Sauvegarde impossible', error);
  }
}

function resetApplication() {
  const confirmed = window.confirm('Réinitialiser complètement la configuration et effacer les scores ?');
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  state = sanitizeState(createDefaultState());
  persistState();
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  elements.summaryGrid.innerHTML = '';
  elements.rotationView.innerHTML = '';
  elements.teamView.innerHTML = '';
  elements.rankingView.innerHTML = '';
  elements.resultSubtitle.textContent = 'Aucun planning pour le moment.';
  setActiveView('rotations');
  setLiveModeAvailability(false);
  elements.regenerateBtn.disabled = true;
  timerController.hide();
  hideFinalRankingModal();
  goTo('landing');
}

function setLiveModeAvailability(enabled) {
  if (!elements.startLiveBtn) return;
  elements.startLiveBtn.disabled = !enabled;
  if (enabled) {
    const rotationNumber =
      state.schedule && state.schedule.rotations[state.liveRotationIndex]
        ? state.schedule.rotations[state.liveRotationIndex].number
        : 1;
    elements.startLiveBtn.textContent =
      state.liveRotationIndex > 0 ? `Reprendre le live (Rotation ${rotationNumber})` : 'Démarrer le live';
  } else {
    elements.startLiveBtn.textContent = 'Démarrer le live';
  }
  if (elements.returnLiveBtn) {
    elements.returnLiveBtn.disabled = !enabled;
  }
}
