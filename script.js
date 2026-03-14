const STORAGE_KEY = 'poule-suite-state-v1';
const STEP_ORDER = ['type', 'count', 'teams', 'options', 'results'];
const SCREEN_TO_STEP = {
  type: 'type',
  count: 'count',
  teams: 'teams',
  options: 'options',
  results: 'results',
};
const TOURNAMENT_MODES = {
  'round-robin': { label: 'Poule unique' },
  groups: { label: 'Groupes' },
  'groups-finals': { label: 'Groupes + finales' },
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
  modeCards: document.querySelectorAll('.mode-card[data-mode]'),
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
  rotationBuffer: document.getElementById('rotationBuffer'),
  breakDuration: document.getElementById('breakDuration'),
  availableDuration: document.getElementById('availableDuration'),
  endTime: document.getElementById('endTime'),
  simulateBtn: document.getElementById('simulateBtn'),
  simulationResult: document.getElementById('simulationResult'),
  resetOptionsBtn: document.getElementById('resetOptionsBtn'),
  resetFeedback: document.getElementById('resetFeedback'),
  timerToggle: document.getElementById('timerToggle'),
  soundToggle: document.getElementById('soundToggle'),
  vibrationToggle: document.getElementById('vibrationToggle'),
  generateBtn: document.getElementById('generateBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  recommendBtn: document.getElementById('recommendBtn'),
  recommendationResult: document.getElementById('recommendationResult'),
  startLiveBtn: document.getElementById('startLiveBtn'),
  returnLiveBtn: document.getElementById('returnLiveBtn'),
  printBtn: document.getElementById('printBtn'),
  resetAppBtn: document.getElementById('resetAppBtn'),
  rotationView: document.getElementById('rotationView'),
  teamView: document.getElementById('teamView'),
  rankingView: document.getElementById('rankingView'),
  tabButtons: document.querySelectorAll('.tab'),
  summaryGrid: document.getElementById('summaryGrid'),
  timeIndicator: document.getElementById('timeIndicator'),
  matchInsight: document.getElementById('matchInsight'),
  resultsPrimaryHint: document.getElementById('resultsPrimaryHint'),
  resultsMoreToggle: document.getElementById('resultsMoreToggle'),
  resultsMorePanel: document.getElementById('resultsMorePanel'),
  resultSubtitle: document.getElementById('resultSubtitle'),
  printHeader: document.getElementById('printHeader'),
  timerWidget: document.getElementById('timerWidget'),
  timerDisplay: document.getElementById('timerDisplay'),
  timerRotationLabel: document.getElementById('timerRotationLabel'),
  timerControls: document.querySelectorAll('[data-timer]'),
  timerRanking: document.getElementById('timerRanking'),
  timerBackToLive: document.getElementById('timerBackToLive'),
  timerCloseBtn: document.getElementById('timerCloseBtn'),
  timerFab: document.getElementById('timerFab'),
  liveRotationTitle: document.getElementById('liveRotationTitle'),
  liveStatus: document.getElementById('liveStatus'),
  liveMeta: document.getElementById('liveMeta'),
  liveRotationContent: document.getElementById('liveRotationContent'),
  liveShell: document.getElementById('liveShell'),
  liveActionsToggle: document.getElementById('liveActionsToggle'),
  liveActionsPanel: document.getElementById('liveActionsPanel'),
  liveChronoBtn: document.getElementById('liveChronoBtn'),
  liveRankingPanel: document.getElementById('liveRankingPanel'),
  liveRankingTable: document.getElementById('liveRankingTable'),
  liveRestNotice: document.getElementById('liveRestNotice'),
  liveTimerPanel: document.getElementById('liveTimerPanel'),
  liveTimerHint: document.getElementById('liveTimerHint'),
  liveTimerDisplay: document.getElementById('liveTimerDisplay'),
  liveTimerState: document.getElementById('liveTimerState'),
  liveNextRotation: document.getElementById('liveNextRotation'),
  liveNextLabel: document.getElementById('liveNextLabel'),
  liveNextList: document.getElementById('liveNextList'),
  liveModeToggle: document.getElementById('liveModeToggle'),
  liveStartBtn: document.getElementById('liveStartBtn'),
  livePauseBtn: document.getElementById('livePauseBtn'),
  liveTimerResetBtn: document.getElementById('liveTimerResetBtn'),
  liveFinishBtn: document.getElementById('liveFinishBtn'),
  liveBackBtn: document.getElementById('liveBackBtn'),
  liveNextBtn: document.getElementById('liveNextBtn'),
  liveRankingBtn: document.getElementById('liveRankingBtn'),
  liveRankingPanelBtn: document.getElementById('liveRankingPanelBtn'),
  finalRankingModal: document.getElementById('finalRankingModal'),
  finalRankingTable: document.getElementById('finalRankingTable'),
  finalRankingCloseBtn: document.getElementById('finalRankingCloseBtn'),
  finalRankingCsvBtn: document.getElementById('finalRankingCsvBtn'),
  finalRankingOkBtn: document.getElementById('finalRankingOkBtn'),
  finalRankingLiveBtn: document.getElementById('finalRankingLiveBtn'),
  helpBtn: document.getElementById('helpBtn'),
  helpModal: document.getElementById('helpModal'),
  helpCloseBtn: document.getElementById('helpCloseBtn'),
  chronoRotationLabel: document.getElementById('chronoRotationLabel'),
  chronoDisplay: document.getElementById('chronoDisplay'),
  chronoStateLabel: document.getElementById('chronoStateLabel'),
  chronoMatchMeta: document.getElementById('chronoMatchMeta'),
  chronoMatches: document.getElementById('chronoMatches'),
  chronoRest: document.getElementById('chronoRest'),
  chronoStartBtn: document.getElementById('chronoStartBtn'),
  chronoPauseBtn: document.getElementById('chronoPauseBtn'),
  chronoResetBtn: document.getElementById('chronoResetBtn'),
  chronoNextBtn: document.getElementById('chronoNextBtn'),
  chronoBackBtn: document.getElementById('chronoBackBtn'),
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
let standingsCache = null;
const timerUiState = {
  expanded: false,
  available: false,
};
let latestRecommendation = null;
let recommendationApplied = false;
let resetFeedbackTimeout = null;

const timerController = {
  prepare() {
    timerState.baseSeconds = state.options.duration * 60;
    timerState.remainingSeconds = timerState.baseSeconds;
    timerState.totalRotations = state.schedule ? state.schedule.meta.rotationCount : 0;
    timerState.currentRotation = state.schedule ? (state.liveRotationIndex + 1 || 1) : 1;
    const highlightTarget = state.schedule ? state.schedule.rotations[state.liveRotationIndex]?.number || 1 : 1;
    highlightRotation(highlightTarget);
    elements.timerWidget.classList.remove('timer-ended', 'running');
    timerUiState.available = true;
    closeTimerPanel({ silent: true });
    updateTimerFabVisibility();
    setLiveTimerPanelEnabled(true);
    updateTimerDisplay();
    setLiveTimerControlsAvailability(true);
    setChronoPanelEnabled(true);
    renderChronoScreen();
  },
  start() {
    if (timerState.intervalId) return;
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
    updateTimerDisplay('TEMPS ÉCOULÉ');
    triggerFeedback();
  },
  hide() {
    this.pause();
    timerUiState.available = false;
    closeTimerPanel({ silent: true });
    updateTimerFabVisibility();
    setLiveTimerPanelEnabled(false);
    elements.timerWidget.classList.remove('timer-ended', 'running');
    setLiveTimerControlsAvailability(false);
    if (elements.liveTimerDisplay) elements.liveTimerDisplay.textContent = '--:--';
    if (elements.liveTimerState) elements.liveTimerState.textContent = 'Inactif';
    if (elements.chronoDisplay) elements.chronoDisplay.textContent = '--:--';
    if (elements.chronoStateLabel) elements.chronoStateLabel.textContent = 'Inactif';
    setChronoPanelEnabled(false);
    if (screens.chrono) {
      screens.chrono.classList.remove('running', 'ended');
    }
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
  syncModeSelection();
  if (state.schedule) {
    renderResults(state.schedule, { preserveTimestamp: true });
  }
  goTo('landing', { silent: true });
  setLiveModeAvailability(Boolean(state.schedule));
  elements.regenerateBtn.disabled = !state.schedule;
  updateResumeButton();
  setLiveTimerPanelEnabled(Boolean(state.schedule && state.options.timer));
  setChronoPanelEnabled(Boolean(state.schedule && state.options.timer));
}

function bindNavigation() {
  elements.startFlow.addEventListener('click', () => goTo('type'));
  elements.resumeFlow.addEventListener('click', handleResume);

  elements.modeCards.forEach(card => {
    card.addEventListener('click', () => selectTournamentMode(card.dataset.mode));
    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectTournamentMode(card.dataset.mode);
    });
  });

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

  elements.rotationBuffer.addEventListener('input', event => {
    state.options.turnaround = clampNumber(Number(event.target.value), 0, 60, state.options.turnaround);
    event.target.value = state.options.turnaround;
    persistState();
  });

  elements.breakDuration.addEventListener('input', event => {
    state.options.breakMinutes = clampNumber(Number(event.target.value), 0, 600, state.options.breakMinutes);
    event.target.value = state.options.breakMinutes;
    persistState();
  });

  elements.availableDuration.addEventListener('input', event => {
    const value = Number(event.target.value);
    if (Number.isFinite(value) && value > 0) {
      state.options.availableDuration = clampNumber(value, 0, 1440, value);
      event.target.value = state.options.availableDuration;
    } else {
      state.options.availableDuration = null;
    }
    persistState();
  });

  elements.endTime.addEventListener('input', event => {
    state.options.endTime = event.target.value;
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
    closeResultsMorePanel();
    if (!state.schedule) return;
    const teams = getFinalTeamNames();
    state.teamNames = teams;
    buildTeamFields(state.participants);
    renderResults(generateSchedule(teams, state.options), { resetScores: true });
  });

  elements.printBtn.addEventListener('click', () => window.print());
  elements.printTopBtn.addEventListener('click', () => window.print());
  if (elements.resultsMoreToggle) {
    elements.resultsMoreToggle.addEventListener('click', toggleResultsMorePanel);
  }
  if (elements.startLiveBtn) {
    elements.startLiveBtn.addEventListener('click', startLiveMode);
  }
  if (elements.liveActionsToggle) {
    elements.liveActionsToggle.addEventListener('click', toggleLiveActionsPanel);
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
  if (elements.timerFab) {
    elements.timerFab.addEventListener('click', () => openTimerPanel());
  }
  if (elements.timerCloseBtn) {
    elements.timerCloseBtn.addEventListener('click', () => closeTimerPanel());
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
    elements.liveRotationContent.addEventListener('click', handleLiveClick);
  }
  if (elements.liveBackBtn) {
    elements.liveBackBtn.addEventListener('click', () => {
      closeLiveActionsPanel();
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
  if (elements.liveRankingPanelBtn) {
    elements.liveRankingPanelBtn.addEventListener('click', () => {
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
  if (elements.liveStartBtn) {
    elements.liveStartBtn.addEventListener('click', () => timerController.start());
  }
  if (elements.liveTimerResetBtn) {
    elements.liveTimerResetBtn.addEventListener('click', () => timerController.reset());
  }
  if (elements.liveFinishBtn) {
    elements.liveFinishBtn.addEventListener('click', handleLiveFinish);
  }
  if (elements.liveModeToggle) {
    elements.liveModeToggle.addEventListener('click', () => {
      toggleLiveGiantMode();
      closeLiveActionsPanel();
    });
  }
  if (elements.liveChronoBtn) {
    elements.liveChronoBtn.addEventListener('click', () => {
      closeLiveActionsPanel();
      if (!state.schedule) return;
      renderChronoScreen();
      goTo('chrono');
    });
  }
  if (elements.returnLiveBtn) {
    elements.returnLiveBtn.addEventListener('click', () => {
      if (!state.schedule) return;
      closeResultsMorePanel();
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
  if (elements.helpBtn) {
    elements.helpBtn.addEventListener('click', openHelpModal);
  }
  if (elements.helpCloseBtn) {
    elements.helpCloseBtn.addEventListener('click', closeHelpModal);
  }
  if (elements.helpModal) {
    elements.helpModal.addEventListener('click', event => {
      if (event.target === elements.helpModal) {
        closeHelpModal();
      }
    });
  }
  if (elements.simulateBtn) {
    elements.simulateBtn.addEventListener('click', handleSimulationRequest);
  }
  if (elements.resetOptionsBtn) {
    elements.resetOptionsBtn.addEventListener('click', handleOptionsReset);
  }
  if (elements.recommendBtn) {
    elements.recommendBtn.addEventListener('click', handleRecommendationRequest);
  }
  if (elements.recommendationResult) {
    elements.recommendationResult.addEventListener('click', event => {
      const applyBtn = event.target.closest('[data-action="apply-recommendation"]');
      if (applyBtn) {
        applyRecommendedConfiguration();
      }
    });
  }
  if (elements.chronoBackBtn) {
    elements.chronoBackBtn.addEventListener('click', () => {
      goTo('live');
      renderLiveRotation();
    });
  }
  if (elements.chronoStartBtn) {
    elements.chronoStartBtn.addEventListener('click', () => timerController.start());
  }
  if (elements.chronoPauseBtn) {
    elements.chronoPauseBtn.addEventListener('click', () => timerController.pause());
  }
  if (elements.chronoResetBtn) {
    elements.chronoResetBtn.addEventListener('click', () => timerController.reset());
  }
  if (elements.chronoNextBtn) {
    elements.chronoNextBtn.addEventListener('click', () => advanceLiveRotation());
  }
  document.addEventListener('click', handleGlobalMenuClick);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    let handled = false;
    if (elements.finalRankingModal && !elements.finalRankingModal.classList.contains('hidden')) {
      hideFinalRankingModal();
      handled = true;
    }
    if (elements.helpModal && !elements.helpModal.classList.contains('hidden')) {
      closeHelpModal();
      handled = true;
    }
    if (closeOverflowPanels()) {
      handled = true;
    }
    if (handled) {
      event.preventDefault();
    }
  });

  if (elements.resetAppBtn) {
    elements.resetAppBtn.addEventListener('click', () => {
      closeResultsMorePanel();
      resetApplication();
    });
  }
}

function handleResume() {
  const stored = loadState();
  if (!stored) return;
  state = sanitizeState(stored);
  invalidateStandingsCache();
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  syncModeSelection();
  if (state.schedule) {
    renderResults(state.schedule, { preserveTimestamp: true });
    goTo(state.currentScreen && state.currentScreen !== 'landing' ? state.currentScreen : 'results');
  } else {
    goTo(state.currentScreen && state.currentScreen !== 'landing' ? state.currentScreen : 'type');
  }
  setLiveModeAvailability(Boolean(state.schedule));
  elements.regenerateBtn.disabled = !state.schedule;
  setChronoPanelEnabled(Boolean(state.schedule && state.options.timer));
  renderChronoScreen();
}

function goTo(screen, options = {}) {
  if (!screens[screen]) return;
  closeOverflowPanels();
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
  if (screen === 'chrono') {
    renderChronoScreen();
  }
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

function getTournamentType() {
  const allowed = Object.keys(TOURNAMENT_MODES);
  if (!allowed.includes(state.tournamentType)) {
    state.tournamentType = 'round-robin';
  }
  return state.tournamentType;
}

function selectTournamentMode(mode) {
  const allowed = Object.keys(TOURNAMENT_MODES);
  const next = allowed.includes(mode) ? mode : 'round-robin';
  if (state.tournamentType === next) return;
  state.tournamentType = next;
  syncModeSelection();
  persistState();
}

function syncModeSelection() {
  const current = getTournamentType();
  elements.modeCards.forEach(card => {
    const isActive = card.dataset.mode === current;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
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
  elements.rotationBuffer.value = state.options.turnaround;
  elements.breakDuration.value = state.options.breakMinutes;
  elements.availableDuration.value = state.options.availableDuration ?? '';
  elements.endTime.value = state.options.endTime || '';
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
    state.validatedMatches = {};
  }
  state.schedule = schedule;
  if (state.schedule && state.schedule.meta) {
    state.schedule.meta.formatLabel =
      state.schedule.meta.formatLabel || TOURNAMENT_MODES[getTournamentType()].label;
    state.schedule.meta.optionsSnapshot = {
      duration: state.options.duration,
    };
  }
  invalidateStandingsCache();
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
  schedule.meta.timeSummary = computeTimeSummary(schedule, state.options);
  if (schedule.meta.timeSummary) {
    schedule.meta.estimatedDuration = humanizeDuration(schedule.meta.timeSummary.totalMinutes);
    schedule.meta.endTime = schedule.meta.timeSummary.estimatedEnd;
  } else {
    schedule.meta.estimatedDuration = null;
    schedule.meta.endTime = null;
  }
  renderSummary(schedule.meta);
  updateMatchInsight(state.schedule);
  updatePrintHeader(schedule.meta);
  renderRotationView(schedule.rotations);
  const teamEntries = buildTeamEntriesFromSchedule(schedule);
  schedule.teams = teamEntries;
  renderTeamView(teamEntries);
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
  renderChronoScreen();
}

function renderSummary(meta) {
  const cards = [];
  cards.push({ label: 'Format', value: meta.formatLabel || TOURNAMENT_MODES[getTournamentType()].label });
  cards.push({ label: "Équipes", value: meta.teamCount });
  if (meta.groupCount) cards.push({ label: 'Groupes', value: meta.groupCount });
  cards.push({ label: 'Tours de jeu', value: meta.rotationCount });
  cards.push({ label: 'Matchs au total', value: meta.matchCount });
  cards.push({ label: 'Terrains', value: meta.fieldCount });
  const summary = meta.timeSummary;
  if (summary) {
    cards.push({ label: 'Volume total de jeu', value: humanizeDuration(summary.matchVolume) });
    cards.push({ label: 'Temps de transition', value: humanizeDuration(summary.rotationGaps) });
    cards.push({ label: 'Temps des pauses', value: humanizeDuration(summary.pauseMinutes) });
    cards.push({ label: 'Durée réelle du tournoi', value: humanizeDuration(summary.totalMinutes) });
    if (summary.estimatedEnd) {
      cards.push({ label: 'Fin prévue', value: summary.estimatedEnd });
    }
  } else {
    cards.push({ label: 'Volume total de jeu', value: '-' });
    cards.push({ label: 'Durée réelle du tournoi', value: '-' });
  }
  const cardsHtml = cards
    .map(item => `<article class="summary-card"><span>${item.label}</span><strong>${item.value}</strong></article>`)
    .join('');
  const analysisMetrics = buildPedagogyMetrics(meta, summary, meta.optionsSnapshot || state.options);
  const analysisCard = `<article class="summary-card analysis-card">
        <span>Analyse pédagogique</span>
        ${buildAnalysisListHTML(analysisMetrics)}
        ${buildAnalysisTagHTML(analysisMetrics)}
      </article>`;
  elements.summaryGrid.innerHTML = cardsHtml + analysisCard;
  renderTimeIndicator(summary);
}

function updatePrintHeader(meta) {
  if (!elements.printHeader) return;
  if (!meta) {
    elements.printHeader.innerHTML = '';
    return;
  }
  const formatLabel = meta.formatLabel || TOURNAMENT_MODES[getTournamentType()].label;
  const parts = [];
  if (meta.teamCount) parts.push(`${meta.teamCount} équipe${meta.teamCount > 1 ? 's' : ''}`);
  if (meta.rotationCount) parts.push(`${meta.rotationCount} rotation${meta.rotationCount > 1 ? 's' : ''}`);
  if (meta.fieldCount) parts.push(`${meta.fieldCount} terrain${meta.fieldCount > 1 ? 's' : ''}`);
  if (meta.groupCount) parts.push(`${meta.groupCount} groupe${meta.groupCount > 1 ? 's' : ''}`);
  let timeLine = '';
  if (meta.timeSummary && Number.isFinite(meta.timeSummary.matchVolume)) {
    const summary = meta.timeSummary;
    const segments = [
      `Volume de jeu : ${humanizeDuration(summary.matchVolume)}`,
      `Transitions : ${humanizeDuration(summary.rotationGaps)}`,
      `Pauses : ${humanizeDuration(summary.pauseMinutes)}`,
      `Durée réelle : ${humanizeDuration(summary.totalMinutes)}`,
    ];
    if (summary.estimatedEnd) segments.push(`Fin prévue ${summary.estimatedEnd}`);
    timeLine = `<p>${segments.join(' • ')}</p>`;
  }
  const timestamp = state.generatedAt
    ? `Généré le ${new Date(state.generatedAt).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}`
    : '';
  elements.printHeader.innerHTML = `
    <h1>PouleManager · ${formatLabel}</h1>
    ${parts.length ? `<p>${parts.join(' • ')}</p>` : ''}
    ${timeLine}
    ${timestamp ? `<p>${timestamp}</p>` : ''}
  `;
}

function renderTimeIndicator(summary) {
  if (!elements.timeIndicator) return;
  if (!summary) {
    elements.timeIndicator.textContent = '';
    elements.timeIndicator.classList.add('hidden');
    elements.timeIndicator.classList.remove('ok', 'alert');
    return;
  }
  const { totalMinutes, feasibility } = summary;
  elements.timeIndicator.classList.remove('ok', 'alert');
  if (!feasibility) {
    elements.timeIndicator.textContent = `Durée réelle estimée : ${humanizeDuration(
      totalMinutes
    )}. Indiquez un créneau disponible ou une heure de fin pour vérifier la faisabilité.`;
    elements.timeIndicator.classList.remove('hidden');
    return;
  }
  const deltaLabel = humanizeDuration(Math.abs(feasibility.delta));
  if (feasibility.ok) {
    elements.timeIndicator.classList.add('ok');
    elements.timeIndicator.textContent = `Le tournoi rentre dans le créneau disponible (marge d’environ ${deltaLabel}).`;
  } else {
    elements.timeIndicator.classList.add('alert');
    elements.timeIndicator.textContent = `Le tournoi dépasse le créneau d’environ ${deltaLabel}.`;
  }
  elements.timeIndicator.classList.remove('hidden');
}

function updateMatchInsight(schedule) {
  if (!elements.matchInsight) return;
  if (!schedule || !schedule.meta) {
    elements.matchInsight.textContent = '';
    elements.matchInsight.classList.add('hidden');
    return;
  }
  const info = getMatchLoadInfo(schedule);
  if (!info) {
    elements.matchInsight.textContent = '';
    elements.matchInsight.classList.add('hidden');
    return;
  }
  const lines = [...info.lines];
  const summary = schedule.meta.timeSummary;
  if (summary && info.perTeam > 0) {
    const approxMinutes = Math.max(1, Math.round(summary.totalMinutes / info.perTeam));
    lines.push(`Temps moyen entre deux matchs : environ ${humanizeDuration(approxMinutes)}.`);
  }
  elements.matchInsight.innerHTML = lines.join('<br />');
  elements.matchInsight.classList.remove('hidden');
}

function getMatchLoadInfo(schedule) {
  if (!schedule) return null;
  const format = schedule.format || 'round-robin';
  if (!schedule.groups || !schedule.groups.length || format === 'round-robin') {
    const teamCount = schedule.meta ? schedule.meta.teamCount : state.participants;
    const perTeam = Math.max(teamCount - 1, 0);
    const lines = [`Chaque équipe jouera ${formatMatchCount(perTeam)}.`];
    return { lines, perTeam: Math.max(perTeam, 1) };
  }
  const counts = schedule.groups.map(group => Math.max(group.teams.length - 1, 0));
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const uniform = minCount === maxCount;
  if (format === 'groups-finals') {
    const perTeamBase = uniform ? Math.max(minCount, 0) : Math.max((minCount + maxCount) / 2, 0);
    const lines = [];
    if (uniform) {
      lines.push(`Chaque équipe jouera au moins ${formatMatchCount(perTeamBase)} pendant la phase de groupes.`);
    } else {
      lines.push(`Chaque équipe jouera entre ${minCount} et ${maxCount} matchs pendant la phase de groupes.`);
    }
    lines.push('Les équipes qualifiées disputeront ensuite la phase finale.');
    return { lines, perTeam: Math.max(perTeamBase, 1) };
  }
  if (uniform) {
    const perTeam = Math.max(minCount, 0);
    const lines = [`Chaque équipe jouera ${formatMatchCount(perTeam)} dans sa phase de groupe.`];
    return { lines, perTeam: Math.max(perTeam, 1) };
  }
  const lines = [`Chaque équipe jouera entre ${minCount} et ${maxCount} matchs selon son groupe.`];
  const avg = (minCount + maxCount) / 2 || 1;
  return { lines, perTeam: Math.max(avg, 1) };
}

function handleSimulationRequest() {
  if (!elements.simulationResult) return;
  const teams = getFinalTeamNames();
  if (teams.length < 2) {
    renderSimulationResult({ error: 'Ajoutez au moins deux équipes pour lancer la simulation.' });
    return;
  }
  try {
    const preview = generateSchedule(teams, state.options);
    if (!preview || !preview.meta) {
      renderSimulationResult({ error: 'Simulation impossible avec les paramètres actuels.' });
      return;
    }
    const summary = computeTimeSummary(preview, state.options);
    renderSimulationResult({ meta: preview.meta, summary });
  } catch (error) {
    console.error('Impossible de simuler le tournoi', error);
    renderSimulationResult({ error: 'Impossible de simuler le tournoi. Vérifiez vos paramètres.' });
  }
}

function renderSimulationResult(payload) {
  if (!elements.simulationResult) return;
  const { error, meta, summary } = payload;
  if (error) {
    elements.simulationResult.innerHTML = `<h4>Simulation du tournoi</h4><p>${error}</p>`;
    elements.simulationResult.classList.remove('hidden');
    return;
  }
  if (!meta) {
    elements.simulationResult.innerHTML = `<h4>Simulation du tournoi</h4><p>Simulation indisponible pour le moment.</p>`;
    elements.simulationResult.classList.remove('hidden');
    return;
  }
  const matchCountValue = Number.isFinite(meta.matchCount) ? meta.matchCount : null;
  const teamCountValue = Number.isFinite(meta.teamCount) ? meta.teamCount : null;
  const fieldCountValue = Number.isFinite(meta.fieldCount) ? meta.fieldCount : null;
  const matchCount = matchCountValue ?? '-';
  const totalRotations = Number.isFinite(meta.rotationCount) ? meta.rotationCount : null;
  const rotationCount = totalRotations ?? '-';
  const durationLabel = summary ? humanizeDuration(summary.totalMinutes) : '-';
  const durationMinutesLabel = summary ? `${Math.round(summary.totalMinutes)} min` : '-';
  const endLabel = summary?.estimatedEnd ?? '—';
  const perTeamNumber =
    Number.isFinite(matchCountValue) && Number.isFinite(teamCountValue) && teamCountValue > 0
      ? Math.round((matchCountValue * 2) / teamCountValue)
      : null;
  const perFieldNumber =
    Number.isFinite(matchCountValue) && Number.isFinite(fieldCountValue) && fieldCountValue > 0
      ? Math.round(matchCountValue / fieldCountValue)
      : null;
  const perTeamLabel = formatMatchesDisplay(perTeamNumber);
  const perFieldLabel = formatMatchesDisplay(perFieldNumber);
  const perTeamSentence = formatMatchesSentence(perTeamNumber) || 'un volume variable';
  const perFieldSentence = formatMatchesSentence(perFieldNumber);
  const perFieldLine = perFieldSentence ? `<p>Chaque terrain accueillera environ ${perFieldSentence}.</p>` : '';
  const analysisMetrics = buildPedagogyMetrics(meta, summary, state.options);
  const timePerTeamLabel = analysisMetrics ? formatMinutesLabel(analysisMetrics.timePerTeam) : '—';
  let statusMarkup = '<p class="simulation-status">Simulation disponible.</p>';
  let detailMarkup = '';
  let suggestionsHtml = '';
  if (summary) {
    if (summary.feasibility) {
      const deltaLabel = summary.feasibility.delta != null ? humanizeDuration(Math.abs(summary.feasibility.delta)) : '';
      if (summary.feasibility.ok) {
        statusMarkup = `<p class="simulation-status ok">✓ Le tournoi tient dans le créneau.</p>`;
        detailMarkup = `
          <p>Chaque équipe jouera environ ${perTeamSentence}.</p>
          ${perFieldLine}
          <p>Temps de jeu moyen par équipe : ${timePerTeamLabel}.</p>
          <p>Durée totale estimée : ${durationMinutesLabel}.</p>
        `;
      } else {
        statusMarkup = `<p class="simulation-status alert">⚠ Le tournoi dépasse de ${deltaLabel}.</p>`;
        detailMarkup = `
          <p>Chaque équipe jouera environ ${perTeamSentence}.</p>
          ${perFieldLine}
          <p>Temps de jeu moyen par équipe : ${timePerTeamLabel}.</p>
        `;
        suggestionsHtml = `
          <div class="simulation-suggestions">
            <p>Solutions possibles :</p>
            <ul>
              <li>Réduire la durée des matchs</li>
              <li>Ajouter un terrain</li>
              <li>Réduire le nombre d’équipes</li>
              <li>Réduire la pause globale</li>
            </ul>
          </div>
        `;
      }
    } else {
      statusMarkup = `<p class="simulation-status">Ajoutez un créneau disponible ou une heure de fin pour vérifier la faisabilité.</p>`;
    }
  } else {
    statusMarkup = `<p class="simulation-status">Simulation partielle : précisez la durée des matchs et des rotations.</p>`;
  }
  elements.simulationResult.innerHTML = `
    <h4 class="panel-title"><span class="panel-icon cold">🔍</span><span>Simulation du tournoi</span></h4>
    <div class="simulation-grid">
      <div class="simulation-metric">
        <span>Matchs au total</span>
        <strong>${matchCount}</strong>
      </div>
      <div class="simulation-metric">
        <span>Tours de jeu</span>
        <strong>${rotationCount}</strong>
      </div>
      <div class="simulation-metric">
        <span>Durée du tournoi</span>
        <strong>${durationLabel}</strong>
      </div>
      <div class="simulation-metric">
        <span>Fin prévue</span>
        <strong>${endLabel}</strong>
      </div>
      <div class="simulation-metric">
        <span>Matchs par équipe</span>
        <strong>${perTeamLabel}</strong>
      </div>
      <div class="simulation-metric">
        <span>Matchs par terrain</span>
        <strong>${perFieldLabel}</strong>
      </div>
    </div>
    ${statusMarkup}
    ${detailMarkup}
    ${suggestionsHtml}
    <div class="simulation-analysis">
      <h5>Analyse pédagogique</h5>
      ${buildAnalysisListHTML(analysisMetrics)}
      ${buildAnalysisTagHTML(analysisMetrics)}
    </div>
  `;
  elements.simulationResult.classList.remove('hidden');
}

function handleRecommendationRequest() {
  if (!elements.recommendationResult) return;
  const teams = getFinalTeamNames();
  if (teams.length < 2) {
    renderRecommendationResult({ error: 'Ajoutez au moins deux équipes pour analyser une configuration.' });
    latestRecommendation = null;
    recommendationApplied = false;
    return;
  }
  const recommendation = computeRecommendedConfiguration(teams);
  if (!recommendation) {
    renderRecommendationResult({ error: 'Impossible de proposer une configuration. Vérifiez vos paramètres.' });
     latestRecommendation = null;
     recommendationApplied = false;
    return;
  }
  latestRecommendation = recommendation;
  recommendationApplied = false;
  renderRecommendationResult(recommendation);
}

function formatMatchCount(value) {
  const amount = Math.max(0, Number(value) || 0);
  const unit = amount > 1 ? 'matchs' : 'match';
  return `${amount} ${unit}`;
}

function roundMatchesValue(value) {
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.max(0, Math.round(value));
}

function formatMatchesDisplay(value) {
  const rounded = roundMatchesValue(value);
  return rounded === null ? '—' : `${rounded}`;
}

function formatMatchesSentence(value) {
  const rounded = roundMatchesValue(value);
  if (rounded === null) return null;
  const plural = rounded > 1 ? 'matchs' : 'match';
  return `${rounded} ${plural}`;
}

function buildPedagogyMetrics(meta, summary, options) {
  if (!meta) return null;
  const matchCount = Number(meta.matchCount);
  const teamCount = Number(meta.teamCount);
  const duration = Number(options?.duration);
  if (!Number.isFinite(matchCount) || !Number.isFinite(teamCount) || teamCount <= 0 || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }
  const matchesPerTeam = (matchCount * 2) / teamCount;
  const timePerTeam = matchesPerTeam * duration;
  const totalMinutes = Number(summary?.totalMinutes);
  let waitTime = null;
  if (Number.isFinite(totalMinutes) && matchesPerTeam > 0) {
    waitTime = Math.max(totalMinutes / matchesPerTeam - duration, 0);
  }
  let engagement = null;
  if (Number.isFinite(totalMinutes) && totalMinutes > 0) {
    engagement = (timePerTeam / totalMinutes) * 100;
  }
  const indicator = classifyEngagementLevel(engagement);
  return { matchesPerTeam, timePerTeam, waitTime, engagement, indicator };
}

function classifyEngagementLevel(value) {
  if (!Number.isFinite(value)) {
    return { label: 'Engagement non évalué', level: 'neutral' };
  }
  if (value > 40) {
    return { label: 'Engagement moteur élevé', level: 'high' };
  }
  if (value >= 25) {
    return { label: 'Engagement moteur correct', level: 'medium' };
  }
  return { label: 'Engagement moteur faible', level: 'low' };
}

function formatMinutesLabel(value) {
  if (!Number.isFinite(value) || value < 0) return '—';
  return humanizeDuration(Math.round(value));
}

function formatEngagementPercent(value) {
  if (!Number.isFinite(value)) return '—';
  return `${Math.round(value)}%`;
}

function buildAnalysisListHTML(metrics) {
  if (!metrics) return '<ul class="analysis-list"><li>Données insuffisantes.</li></ul>';
  const matchValue = formatMatchesDisplay(metrics.matchesPerTeam);
  const matchLabel = `Matchs par équipe : ${matchValue}`;
  const playLabel =
    metrics.timePerTeam != null
      ? `Temps de jeu par équipe : ${formatMinutesLabel(metrics.timePerTeam)}`
      : 'Temps de jeu par équipe : —';
  const waitLabel =
    metrics.waitTime != null ? `Temps moyen d’attente : ${formatMinutesLabel(metrics.waitTime)}` : 'Temps moyen d’attente : —';
  const engagementLabel =
    metrics.engagement != null
      ? `Engagement moteur estimé : ${formatEngagementPercent(metrics.engagement)}`
      : 'Engagement moteur estimé : —';
  return `
    <ul class="analysis-list">
      <li>${matchLabel}</li>
      <li>${playLabel}</li>
      <li>${waitLabel}</li>
      <li>${engagementLabel}</li>
    </ul>
  `;
}

function buildAnalysisTagHTML(metrics) {
  if (!metrics || !metrics.indicator) {
    return '<p class="analysis-tag neutral">Engagement non évalué</p>';
  }
  return `<p class="analysis-tag ${metrics.indicator.level}">${metrics.indicator.label}</p>`;
}

function applyRecommendedConfiguration() {
  if (!latestRecommendation || !latestRecommendation.options) return;
  const { duration, turnaround, breakMinutes } = latestRecommendation.options;
  let hasChange = false;
  if (Number.isFinite(duration)) {
    state.options.duration = clampNumber(duration, 1, 180, duration);
    elements.matchDuration.value = state.options.duration;
    timerState.baseSeconds = state.options.duration * 60;
    hasChange = true;
  }
  if (Number.isFinite(turnaround)) {
    state.options.turnaround = clampNumber(turnaround, 0, 60, turnaround);
    elements.rotationBuffer.value = state.options.turnaround;
    hasChange = true;
  }
  if (Number.isFinite(breakMinutes)) {
    state.options.breakMinutes = clampNumber(breakMinutes, 0, 600, breakMinutes);
    elements.breakDuration.value = state.options.breakMinutes;
    hasChange = true;
  }
  if (hasChange) {
    persistState();
    recommendationApplied = true;
    renderRecommendationResult(latestRecommendation);
  }
}

function handleOptionsReset() {
  const defaults = createDefaultState().options;
  state.options.fields = defaults.fields;
  state.options.duration = defaults.duration;
  state.options.turnaround = defaults.turnaround;
  state.options.breakMinutes = defaults.breakMinutes;
  state.options.availableDuration = defaults.availableDuration;
  state.options.startTime = defaults.startTime;
  state.options.endTime = defaults.endTime;
  timerState.baseSeconds = state.options.duration * 60;
  if (elements.fieldCount) elements.fieldCount.value = state.options.fields;
  if (elements.matchDuration) elements.matchDuration.value = state.options.duration;
  if (elements.rotationBuffer) elements.rotationBuffer.value = state.options.turnaround;
  if (elements.breakDuration) elements.breakDuration.value = state.options.breakMinutes;
  if (elements.availableDuration) elements.availableDuration.value = state.options.availableDuration ?? '';
  if (elements.startTime) elements.startTime.value = state.options.startTime;
  if (elements.endTime) elements.endTime.value = state.options.endTime || '';
  persistState();
  hideAnalysisPanels();
  showResetFeedback();
}

function hideAnalysisPanels() {
  if (elements.simulationResult) {
    elements.simulationResult.innerHTML = '';
    elements.simulationResult.classList.add('hidden');
  }
  if (elements.recommendationResult) {
    elements.recommendationResult.innerHTML = '';
    elements.recommendationResult.classList.add('hidden');
  }
  latestRecommendation = null;
  recommendationApplied = false;
}

function showResetFeedback() {
  if (!elements.resetFeedback) return;
  elements.resetFeedback.classList.remove('hidden');
  if (resetFeedbackTimeout) clearTimeout(resetFeedbackTimeout);
  resetFeedbackTimeout = setTimeout(() => {
    elements.resetFeedback.classList.add('hidden');
  }, 2500);
}

function computeRecommendedConfiguration(teams) {
  const durations = [4, 5, 6, 7, 8, 9, 10, 12];
  const recommendedRotation = clampNumber(
    state.options.turnaround && state.options.turnaround > 0 ? state.options.turnaround : 1,
    1,
    3,
    1
  );
  const recommendedPause =
    state.options.breakMinutes && state.options.breakMinutes > 0
      ? Math.min(state.options.breakMinutes, 15)
      : 5;
  let bestFeasible = null;
  let bestFallback = null;
  for (const duration of durations) {
    const candidateOptions = {
      ...state.options,
      duration,
      turnaround: recommendedRotation,
      breakMinutes: recommendedPause,
    };
    let schedule;
    try {
      schedule = generateSchedule(teams, candidateOptions);
    } catch (error) {
      console.warn('Simulation recommandée impossible', error);
      continue;
    }
    if (!schedule || !schedule.meta) continue;
    const summary = computeTimeSummary(schedule, candidateOptions);
    const metrics = buildPedagogyMetrics(schedule.meta, summary, candidateOptions);
    const feasible = Boolean(summary?.feasibility && summary.feasibility.ok);
    if (feasible) {
      bestFeasible = {
        options: candidateOptions,
        summary,
        metrics,
        feasible: true,
      };
      break;
    }
    const totalMinutes = summary?.totalMinutes ?? Number.POSITIVE_INFINITY;
    if (!bestFallback || totalMinutes < (bestFallback.summary?.totalMinutes ?? Number.POSITIVE_INFINITY)) {
      bestFallback = {
        options: candidateOptions,
        summary,
        metrics,
        feasible: false,
      };
    }
  }
  return bestFeasible || bestFallback;
}

function renderRecommendationResult(payload) {
  if (!elements.recommendationResult) return;
  if (payload.error) {
    elements.recommendationResult.innerHTML = `<h4>Configuration recommandée</h4><p>${payload.error}</p>`;
    elements.recommendationResult.classList.remove('hidden');
    return;
  }
  const { options, summary, metrics, feasible } = payload;
  const durationLabel = `${options.duration} min`;
  const rotationLabel = `${options.turnaround ?? 0} min`;
  const pauseLabel = `${options.breakMinutes ?? 0} min`;
  const durationTotalLabel = summary ? humanizeDuration(summary.totalMinutes) : '—';
  const endLabel = summary?.estimatedEnd ?? '—';
  let statusLine = 'Analyse partielle : paramètres incomplets.';
  if (summary?.feasibility) {
    const deltaLabel = humanizeDuration(Math.abs(summary.feasibility.delta || 0));
    if (feasible) {
      statusLine = summary.feasibility.delta != null ? `✓ Le tournoi tient dans le créneau (marge ${deltaLabel}).` : `✓ Le tournoi tient dans le créneau.`;
    } else if (summary.feasibility.delta != null) {
      statusLine = `⚠ Le tournoi dépasse de ${deltaLabel}.`;
    }
  } else if (summary) {
    statusLine = 'Configuration basée sur la durée totale estimée.';
  }
  const analysisHtml = `
    <div class="simulation-analysis">
      <h5>Analyse pédagogique</h5>
      ${buildAnalysisListHTML(metrics)}
      ${buildAnalysisTagHTML(metrics)}
    </div>
  `;
  const feedbackClass = recommendationApplied ? 'show' : '';
  elements.recommendationResult.innerHTML = `
    <h4 class="panel-title warm"><span class="panel-icon warm">🛠</span><span>Configuration recommandée</span></h4>
    <div class="recommendation-grid">
      <div class="metric">
        <span>Matchs</span>
        <strong>${durationLabel}</strong>
      </div>
      <div class="metric">
        <span>Rotation</span>
        <strong>${rotationLabel}</strong>
      </div>
      <div class="metric">
        <span>Pause globale</span>
        <strong>${pauseLabel}</strong>
      </div>
    </div>
    <p class="recommendation-note">${statusLine}</p>
    <p class="recommendation-note">Durée estimée : ${durationTotalLabel} · Fin prévue : ${endLabel}</p>
    ${analysisHtml}
    <div class="recommendation-actions">
      <button class="btn primary" data-action="apply-recommendation">Appliquer cette configuration</button>
      <span class="recommendation-feedback ${feedbackClass}">Configuration appliquée</span>
    </div>
  `;
  elements.recommendationResult.classList.remove('hidden');
}

function buildMatchListHTML(rotation) {
  return rotation.matches
    .map(match => {
      const participants = resolveMatchParticipants(match, state.schedule);
      const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
      match.id = matchId;
      const groupTag = match.groupLabel ? `<span class="match-group-label">${match.groupLabel}</span>` : '';
      return `
      <li>
        <div class="match-label">
          <span>${participants.home} - ${participants.away}</span>
          ${groupTag}
          <span class="field-label">Terrain ${match.field}${match.order > 1 ? ` · slot ${match.order}` : ''}</span>
        </div>
        <div class="score-inputs" aria-label="Score ${participants.home} ${participants.away}">
          <input type="number" min="0" inputmode="numeric" aria-label="Score ${participants.home}" data-rotation="${rotation.number}" data-match-id="${matchId}" data-score-input="home" value="${formatScoreValue(getScoreValue(matchId, 'home'))}" />
          <span>:</span>
          <input type="number" min="0" inputmode="numeric" aria-label="Score ${participants.away}" data-rotation="${rotation.number}" data-match-id="${matchId}" data-score-input="away" value="${formatScoreValue(getScoreValue(matchId, 'away'))}" />
        </div>
      </li>`;
    })
    .join('');
}

function buildFieldsGridHTML(rotation) {
  return rotation.fieldAssignments
    .map(field => {
      const items = field.matches.length
        ? field.matches
            .map(m => {
              const participants = resolveMatchParticipants(m, state.schedule);
              const groupTag = m.groupLabel ? `<span class="match-group-inline">${m.groupLabel}</span>` : '';
              return `<li>${participants.home} - ${participants.away}${m.order > 1 ? ` (slot ${m.order})` : ''} ${groupTag}</li>`;
            })
            .join('')
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
            <div>
              <p class="eyebrow">Rotation ${rotation.number}</p>
              <h3>${rotation.title || `Rotation ${rotation.number}`}</h3>
            </div>
            ${rotation.groupLabel ? `<span class="pill subtle">${rotation.groupLabel}</span>` : ''}
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

function buildTeamEntriesFromSchedule(schedule) {
  if (!schedule || !Array.isArray(schedule.rotations)) return [];
  const map = new Map();
  const register = name => {
    if (!map.has(name)) map.set(name, []);
    return map.get(name);
  };
  const baseNames = schedule.teams && schedule.teams.length ? schedule.teams.map(team => team.name) : getFinalTeamNames();
  baseNames.forEach(name => register(name));
  schedule.rotations.forEach(rotation => {
    rotation.matches.forEach(match => {
      const participants = resolveMatchParticipants(match, schedule);
      if (!participants.home || !participants.away) return;
      const entryBase = {
        rotation: rotation.number,
        field: match.field,
        start: rotation.startLabel,
        group: match.groupLabel || rotation.groupLabel,
        phase: rotation.phase,
        title: rotation.title,
        matchId: match.id,
      };
      register(participants.home).push({ ...entryBase, opponent: participants.away });
      register(participants.away).push({ ...entryBase, opponent: participants.home });
    });
    rotation.byes.forEach(teamName => {
      register(teamName).push({
        bye: true,
        rotation: rotation.number,
        start: rotation.startLabel,
        group: rotation.groupLabel,
        phase: rotation.phase,
        title: rotation.title,
      });
    });
  });
  return Array.from(map.entries())
    .map(([name, matches]) => ({
      name,
      matches: matches.sort((a, b) => a.rotation - b.rotation),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderTeamView(teams) {
  elements.teamView.innerHTML = teams
    .map(team => {
      const list = team.matches
        .map(entry => {
          const isBye = entry.bye;
          const label = isBye ? 'Repos' : entry.opponent;
          const badge = entry.group ? `${entry.group}` : entry.phase === 'finals' ? 'Phase finale' : 'Rotation';
          const details = isBye
            ? `${badge} ${entry.rotation}`
            : `${badge} ${entry.rotation}${entry.field ? ` · Terrain ${entry.field}` : ''}${
                entry.start != null ? ` · ${entry.start}` : ''
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
  if (schedule.format && schedule.format !== 'round-robin') {
    renderGroupRankingCards(schedule);
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

function renderGroupRankingCards(schedule) {
  if (!elements.rankingView) return;
  if (!schedule.groups || !schedule.groups.length) {
    elements.rankingView.innerHTML = '<p>Aucun groupe configuré.</p>';
    return;
  }
  const standings = getGroupStandings(schedule);
  const cards = schedule.groups
    .map(group => {
      const table = (standings && standings.byGroup.get(group.id)) || group.teams.map(name => createBaseStat(name));
      const expected = (group.teams.length * (group.teams.length - 1)) / 2;
      const played = countCompletedGroupMatches(schedule, group.id);
      const complete = played >= expected && expected > 0;
      const rows = table
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
            <h3>${group.label}</h3>
            <span class="ranking-status">${complete ? 'Phase terminée' : `${played}/${expected} match(s)`}</span>
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
            <tbody>${rows}</tbody>
          </table>
        </article>
      `;
    })
    .join('');
  let finalsCard = '';
  if (schedule.format === 'groups-finals') {
    finalsCard = buildFinalsSnapshotCard(schedule);
  }
  elements.rankingView.innerHTML = cards + finalsCard;
}

function countCompletedGroupMatches(schedule, groupId) {
  if (!schedule || !schedule.rotations) return 0;
  let count = 0;
  schedule.rotations.forEach(rotation => {
    rotation.matches.forEach(match => {
      if (match.groupId !== groupId) return;
      const record = state.scores && state.scores[match.id];
      if (record && Number.isFinite(record.home) && Number.isFinite(record.away)) {
        count += 1;
      }
    });
  });
  return count;
}

function buildFinalsSnapshotCard(schedule) {
  if (!schedule.rotations) return '';
  const finals = schedule.rotations.filter(rotation => rotation.phase === 'finals');
  if (!finals.length) return '';
  const matches = finals
    .map(rotation => {
      if (!rotation.matches.length) return '';
      const match = rotation.matches[0];
      const participants = resolveMatchParticipants(match, schedule);
      const record = state.scores && state.scores[match.id];
      const played = record && Number.isFinite(record.home) && Number.isFinite(record.away);
      const score =
        played && record ? `${record.home} - ${record.away}` : '<span class="live-badge info">À jouer</span>';
      return `
        <li>
          <div>
            <strong>${rotation.title}</strong>
            <p>${participants.home} vs ${participants.away}</p>
          </div>
          <span class="final-score">${score}</span>
        </li>
      `;
    })
    .join('');
  return `
    <article class="ranking-card finals-card">
      <header>
        <h3>Phase finale</h3>
        <span class="ranking-status">Suivi en direct</span>
      </header>
      <ul class="finals-list">${matches}</ul>
    </article>
  `;
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
  syncBodyModalState();
}

function hideFinalRankingModal() {
  if (!elements.finalRankingModal) return;
  elements.finalRankingModal.classList.add('hidden');
  syncBodyModalState();
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

function openHelpModal() {
  if (!elements.helpModal) return;
  elements.helpModal.classList.remove('hidden');
  syncBodyModalState();
}

function closeHelpModal() {
  if (!elements.helpModal) return;
  elements.helpModal.classList.add('hidden');
  syncBodyModalState();
}

function syncBodyModalState() {
  const finalOpen = elements.finalRankingModal && !elements.finalRankingModal.classList.contains('hidden');
  const helpOpen = elements.helpModal && !elements.helpModal.classList.contains('hidden');
  const shouldLock = finalOpen || helpOpen;
  document.body.classList.toggle('modal-open', shouldLock);
}

function toggleResultsMorePanel() {
  if (!elements.resultsMorePanel || !elements.resultsMoreToggle) return;
  const willOpen = elements.resultsMorePanel.classList.contains('hidden');
  if (willOpen) {
    closeLiveActionsPanel();
    elements.resultsMorePanel.classList.remove('hidden');
    elements.resultsMoreToggle.setAttribute('aria-expanded', 'true');
  } else {
    closeResultsMorePanel();
  }
}

function toggleLiveActionsPanel() {
  if (!elements.liveActionsPanel || !elements.liveActionsToggle) return;
  const willOpen = elements.liveActionsPanel.classList.contains('hidden');
  if (willOpen) {
    closeResultsMorePanel();
    elements.liveActionsPanel.classList.remove('hidden');
    elements.liveActionsToggle.setAttribute('aria-expanded', 'true');
  } else {
    closeLiveActionsPanel();
  }
}

function closeResultsMorePanel() {
  if (!elements.resultsMorePanel || elements.resultsMorePanel.classList.contains('hidden')) return false;
  elements.resultsMorePanel.classList.add('hidden');
  if (elements.resultsMoreToggle) {
    elements.resultsMoreToggle.setAttribute('aria-expanded', 'false');
  }
  return true;
}

function closeLiveActionsPanel() {
  if (!elements.liveActionsPanel || elements.liveActionsPanel.classList.contains('hidden')) return false;
  elements.liveActionsPanel.classList.add('hidden');
  if (elements.liveActionsToggle) {
    elements.liveActionsToggle.setAttribute('aria-expanded', 'false');
  }
  return true;
}

function closeOverflowPanels() {
  const closedResults = closeResultsMorePanel();
  const closedLive = closeLiveActionsPanel();
  return closedResults || closedLive;
}

function handleGlobalMenuClick(event) {
  if (elements.resultsMorePanel && !elements.resultsMorePanel.classList.contains('hidden')) {
    if (!event.target.closest('.results-tertiary-cta')) {
      closeResultsMorePanel();
    }
  }
  if (elements.liveActionsPanel && !elements.liveActionsPanel.classList.contains('hidden')) {
    if (!event.target.closest('.live-header-actions')) {
      closeLiveActionsPanel();
    }
  }
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
  setLiveTimerPanelEnabled(Boolean(state.schedule && state.options.timer));
  if (!state.schedule) {
    elements.liveRotationTitle.textContent = 'Rotation';
    renderLiveMeta(null);
    elements.liveRotationContent.innerHTML = '<p>Générez un planning avant de lancer les rotations.</p>';
    if (elements.liveStatus) elements.liveStatus.textContent = '';
    if (elements.liveNextBtn) elements.liveNextBtn.disabled = true;
    renderLiveRankingPanel();
    renderLiveRest([]);
    renderNextRotationPreview();
    return;
  }
  const rotation = state.schedule.rotations[state.liveRotationIndex] || state.schedule.rotations[0];
  if (!rotation) {
    elements.liveRotationContent.innerHTML = '<p>Aucune rotation à afficher.</p>';
    if (elements.liveStatus) elements.liveStatus.textContent = '';
    if (elements.liveNextBtn) elements.liveNextBtn.disabled = true;
    renderLiveRest([]);
    renderLiveRankingPanel();
    renderNextRotationPreview();
    return;
  }
  const total = state.schedule.meta.rotationCount;
  const baseTitle = rotation.groupLabel ? `${rotation.groupLabel} · Rotation ${rotation.number}` : `Rotation ${rotation.number}`;
  elements.liveRotationTitle.textContent = `${baseTitle} / ${total}`;
  renderLiveMeta(state.schedule.meta);
  elements.liveRotationContent.dataset.rotation = rotation.number;
  elements.liveRotationContent.innerHTML = buildLiveMatchCards(rotation);
  renderLiveRest(rotation.byes);
  renderNextRotationPreview();
  renderLiveRankingPanel(rotation.number);
  highlightRotation(rotation.number);
  updateLiveControls();
  if (elements.liveModeToggle && elements.liveShell) {
    const label = elements.liveShell.classList.contains('giant-mode') ? 'Quitter le mode écran' : 'Mode écran';
    elements.liveModeToggle.textContent = label;
  }
  renderChronoScreen();
}

function renderLiveMeta(meta) {
  if (!elements.liveMeta) return;
  if (!meta) {
    elements.liveMeta.textContent = '';
    return;
  }
  const parts = [];
  if (meta.formatLabel) parts.push(meta.formatLabel);
  if (meta.groupCount) parts.push(`${meta.groupCount} groupe${meta.groupCount > 1 ? 's' : ''}`);
  if (meta.fieldCount) parts.push(`${meta.fieldCount} terrain${meta.fieldCount > 1 ? 's' : ''}`);
  elements.liveMeta.textContent = parts.join(' • ');
}

function buildLiveMatchCards(rotation) {
  if (!rotation.matches.length) {
    return '<p class="live-empty">Aucun match prévu pour cette rotation.</p>';
  }
  return rotation.matches.map(match => buildLiveMatchCard(rotation, match)).join('');
}

function buildLiveMatchCard(rotation, match) {
  const participants = resolveMatchParticipants(match, state.schedule);
  const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
  match.id = matchId;
  const homeScore = formatScoreValue(getScoreValue(matchId, 'home'));
  const awayScore = formatScoreValue(getScoreValue(matchId, 'away'));
  const complete = isMatchCompleteById(matchId);
  const validated = isMatchValidated(matchId);
  const cardClasses = ['live-match-card'];
  if (validated) {
    cardClasses.push('validated');
  } else {
    cardClasses.push('active');
  }
  const parts = [];
  if (match.field) parts.push(`Terrain ${match.field}`);
  if (match.order > 1) parts.push(`Vague ${match.order}`);
  if (rotation.startLabel) parts.push(rotation.startLabel);
  const badge = parts.length ? parts.join(' · ') : `Rotation ${rotation.number}`;
  const statusText = validated ? 'VALIDÉ' : 'EN COURS';
  const badgeClass = validated ? 'success' : 'info';
  const groupPill = match.groupLabel ? `<span class="group-pill">${match.groupLabel}</span>` : '';
  const actionButtons = `
    <button type="button" class="btn ghost tiny live-validate ${validated ? 'hidden' : ''}" data-validate-match="${matchId}" ${
      complete ? '' : 'disabled'
    }>Valider</button>
    <button type="button" class="btn ghost tiny live-edit ${validated ? '' : 'hidden'}" data-edit-match="${matchId}">Modifier</button>
  `;
  return `
    <article class="${cardClasses.join(' ')}${complete || validated ? '' : ' incomplete'}" data-match-id="${matchId}">
      <header>
        <div class="live-card-meta">
          ${groupPill}
          <span>${badge}</span>
        </div>
        <span class="live-badge ${badgeClass}">${statusText}</span>
      </header>
      <div class="teams">
        ${buildLiveTeamColumn('home', participants.home, homeScore, matchId, { disabled: validated })}
        ${buildLiveTeamColumn('away', participants.away, awayScore, matchId, { disabled: validated })}
      </div>
      <div class="live-card-actions">
        ${actionButtons}
      </div>
    </article>
  `;
}

function buildLiveTeamColumn(side, name, score, matchId, options = {}) {
  const disabled = options.disabled ? 'disabled' : '';
  const minusLabel = `Diminuer le score de ${name}`;
  const plusLabel = `Augmenter le score de ${name}`;
  return `
    <div class="live-team">
      <strong>${name}</strong>
      <div class="live-score-pad">
        <button type="button" class="score-adjust" aria-label="${minusLabel}" data-score-side="${side}" data-score-step="-1" data-match-id="${matchId}" ${disabled}>−</button>
        <input type="number" min="0" inputmode="numeric" aria-label="Score ${name}" data-match-id="${matchId}" data-score-input="${side}" value="${score}" ${disabled} />
        <button type="button" class="score-adjust" aria-label="${plusLabel}" data-score-side="${side}" data-score-step="1" data-match-id="${matchId}" ${disabled}>+</button>
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

function renderNextRotationPreview() {
  if (!elements.liveNextRotation || !elements.liveNextList) return;
  if (!state.schedule) {
    elements.liveNextRotation.classList.add('hidden');
    elements.liveNextList.innerHTML = '';
    if (elements.liveNextLabel) elements.liveNextLabel.textContent = '';
    return;
  }
  const nextRotation = state.schedule.rotations[state.liveRotationIndex + 1];
  if (!nextRotation) {
    elements.liveNextRotation.classList.add('hidden');
    elements.liveNextList.innerHTML = '';
    if (elements.liveNextLabel) elements.liveNextLabel.textContent = '';
    return;
  }
  const total =
    state.schedule.meta && state.schedule.meta.rotationCount
      ? state.schedule.meta.rotationCount
      : state.schedule.rotations.length;
  if (elements.liveNextLabel) {
    const nextLabel = nextRotation.groupLabel
      ? `${nextRotation.groupLabel} · Rotation ${nextRotation.number}`
      : `Rotation ${nextRotation.number}`;
    elements.liveNextLabel.textContent = `${nextLabel} / ${total}`;
  }
  const cards = nextRotation.matches.length
    ? nextRotation.matches
        .map(match => {
          const participants = resolveMatchParticipants(match, state.schedule);
          const metaParts = [];
          if (match.field) metaParts.push(`Terrain ${match.field}`);
          if (match.order > 1) metaParts.push(`Vague ${match.order}`);
          const meta = metaParts.length ? metaParts.join(' · ') : 'Organisation en cours';
          const groupLabel = match.groupLabel || nextRotation.groupLabel;
          return `
            <article class="live-next-card">
              ${groupLabel ? `<span class="eyebrow">${groupLabel}</span>` : ''}
              <span class="meta">${meta}</span>
              <strong>${participants.home}</strong>
              <span class="vs">vs</span>
              <strong>${participants.away}</strong>
            </article>
          `;
        })
        .join('')
    : '<p class="live-next-empty">Aucun match planifié.</p>';
  elements.liveNextList.innerHTML = cards;
  elements.liveNextRotation.classList.remove('hidden');
}

function renderChronoScreen() {
  if (!elements.chronoRotationLabel) return;
  if (!state.schedule || !state.schedule.rotations.length) {
    elements.chronoRotationLabel.textContent = 'Rotation -- / --';
    if (elements.chronoMatchMeta) {
      elements.chronoMatchMeta.textContent = 'Générez un planning puis activez le chronomètre pour utiliser ce mode.';
    }
    if (elements.chronoMatches) {
      elements.chronoMatches.innerHTML = '<p class="chrono-empty">Aucun match à afficher.</p>';
    }
    if (elements.chronoRest) {
      elements.chronoRest.classList.add('hidden');
      elements.chronoRest.textContent = '';
    }
    setChronoNextAvailability(false);
    return;
  }
  const maxIndex = state.schedule.rotations.length - 1;
  const safeIndex = clampNumber(state.liveRotationIndex, 0, maxIndex, 0);
  const rotation = state.schedule.rotations[safeIndex];
  if (!rotation) {
    setChronoNextAvailability(false);
    return;
  }
  const total =
    state.schedule.meta && state.schedule.meta.rotationCount
      ? state.schedule.meta.rotationCount
      : state.schedule.rotations.length;
  const labelBase = rotation.groupLabel ? `${rotation.groupLabel} · Rotation ${rotation.number}` : `Rotation ${rotation.number}`;
  elements.chronoRotationLabel.textContent = `${labelBase} / ${total}`;
  const missing = countMissingScores(rotation.number);
  const isComplete = rotation.matches.length > 0 && missing === 0;
  const isLast = rotation.number === total;
  const metaParts = [];
  if (rotation.startLabel) metaParts.push(rotation.startLabel);
  if (rotation.durationLabel) metaParts.push(rotation.durationLabel);
  metaParts.push(isComplete ? 'Scores complets' : `${missing} score(s) à saisir`);
  if (!state.options.timer) metaParts.push('Chrono désactivé');
  if (elements.chronoMatchMeta) {
    elements.chronoMatchMeta.textContent = metaParts.filter(Boolean).join(' • ');
  }
  if (elements.chronoMatches) {
    elements.chronoMatches.innerHTML = rotation.matches.length
      ? rotation.matches.map(match => buildChronoMatchSnapshot(rotation, match)).join('')
      : '<p class="chrono-empty">Aucun match planifié pour cette rotation.</p>';
  }
  const byes = Array.isArray(rotation.byes) ? rotation.byes : [];
  if (elements.chronoRest) {
    if (byes.length) {
      elements.chronoRest.textContent = `Repos : ${byes.join(', ')}`;
      elements.chronoRest.classList.remove('hidden');
    } else {
      elements.chronoRest.classList.add('hidden');
      elements.chronoRest.textContent = '';
    }
  }
  setChronoNextAvailability(Boolean(!isLast && isComplete));
}

function buildChronoMatchSnapshot(rotation, match) {
  const participants = resolveMatchParticipants(match, state.schedule);
  const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
  match.id = matchId;
  const homeScore = getScoreValue(matchId, 'home');
  const awayScore = getScoreValue(matchId, 'away');
  const hasScore = Number.isFinite(homeScore) && Number.isFinite(awayScore);
  const score = hasScore ? `${homeScore} - ${awayScore}` : '--';
  const details = [];
  if (match.field) details.push(`Terrain ${match.field}`);
  if (match.order > 1) details.push(`Vague ${match.order}`);
  const groupLabel = match.groupLabel ? `${match.groupLabel} · ` : '';
  const label = `${groupLabel}${details.length ? details.join(' · ') : `Rotation ${rotation.number}`}`;
  return `
    <article class="chrono-match-card">
      <span class="label">${label}</span>
      <div class="teams">
        <strong>${participants.home}</strong>
        <span class="chrono-score">${score}</span>
        <strong>${participants.away}</strong>
      </div>
    </article>
  `;
}

function setChronoPanelEnabled(enabled) {
  [elements.chronoStartBtn, elements.chronoPauseBtn, elements.chronoResetBtn].forEach(btn => {
    if (!btn) return;
    btn.disabled = !enabled;
  });
  if (screens.chrono) {
    screens.chrono.classList.toggle('chrono-disabled', !enabled);
  }
}

function setChronoNextAvailability(available) {
  if (!elements.chronoNextBtn) return;
  elements.chronoNextBtn.disabled = !available;
}

function validateMatch(matchId) {
  if (!isMatchCompleteById(matchId)) {
    alert('Complétez le score avant de valider ce match.');
    return;
  }
  setMatchValidated(matchId, true);
  persistState();
  updateMatchCompletionState(matchId);
  renderChronoScreen();
}

function unlockValidatedMatch(matchId) {
  const confirmEdit = window.confirm('Modifier ce score validé ?');
  if (!confirmEdit) return;
  setMatchValidated(matchId, false);
  persistState();
  updateMatchCompletionState(matchId);
  renderChronoScreen();
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
    const rotationLabel = rotation && rotation.groupLabel ? `${rotation.groupLabel} · Rotation ${rotationNumber}` : `Rotation ${rotationNumber}`;
    const status = isComplete
      ? `${rotationLabel} / ${total} validée`
      : `${rotationLabel} / ${total} · ${missing} score(s) à saisir`;
    elements.liveStatus.textContent = status;
  }
  setChronoNextAvailability(Boolean(state.schedule && !isLast && isComplete));
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
    const participants = resolveMatchParticipants(match, state.schedule);
    const key = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
    return isMatchCompleteById(key);
  });
}

function computeRankingSnapshot(schedule, uptoRotation) {
  const stats = new Map();
  (schedule.teams || []).forEach(team => stats.set(team.name, createBaseStat(team.name)));
  let complete = true;
  schedule.rotations.forEach(rotation => {
    if (rotation.number > uptoRotation) return;
    rotation.matches.forEach(match => {
      const participants = resolveMatchParticipants(match, schedule);
      if (!participants.home || !participants.away) {
        complete = false;
        return;
      }
      const key = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
      const record = state.scores && state.scores[key];
      if (!record || !Number.isFinite(record.home) || !Number.isFinite(record.away)) {
        complete = false;
        return;
      }
      applyMatchStats(stats, participants.home, participants.away, record.home, record.away);
    });
  });
  const table = Array.from(stats.values()).map(entry => ({
    ...entry,
    goalDiff: entry.goalsFor - entry.goalsAgainst,
  }));
  table.sort(compareStatsRows);
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

function compareStatsRows(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.name.localeCompare(b.name);
}

function invalidateStandingsCache() {
  standingsCache = null;
}

function getGroupStandings(schedule) {
  if (!schedule || !schedule.groups || !schedule.groups.length) return null;
  if (!standingsCache) {
    standingsCache = computeGroupStandings(schedule);
  }
  return standingsCache;
}

function computeGroupStandings(schedule) {
  const byGroup = new Map();
  const runnerUps = [];
  schedule.groups.forEach(group => {
    const stats = new Map();
    group.teams.forEach(name => stats.set(name, createBaseStat(name)));
    schedule.rotations.forEach(rotation => {
      rotation.matches.forEach(match => {
        if (match.groupId !== group.id) return;
        const record = state.scores && state.scores[match.id];
        if (!record || !Number.isFinite(record.home) || !Number.isFinite(record.away)) return;
        applyMatchStats(stats, match.home, match.away, record.home, record.away);
      });
    });
    const table = Array.from(stats.values()).map(entry => ({
      ...entry,
      goalDiff: entry.goalsFor - entry.goalsAgainst,
    }));
    table.sort(compareStatsRows);
    byGroup.set(group.id, table);
    if (table[1]) {
      runnerUps.push({ groupId: group.id, ...table[1] });
    }
  });
  runnerUps.forEach(entry => {
    entry.goalDiff = entry.goalsFor - entry.goalsAgainst;
  });
  runnerUps.sort(compareStatsRows);
  return {
    byGroup,
    runnerUps,
    bestRunnerUp: runnerUps[0] || null,
  };
}

function findMatchById(schedule, matchId) {
  if (!schedule || !matchId) return null;
  for (const rotation of schedule.rotations) {
    const found = rotation.matches.find(match => match.id === matchId);
    if (found) return found;
  }
  return null;
}

function resolveSeedName(seed, schedule) {
  if (!seed || !schedule) return null;
  if (seed.type === 'group') {
    const standings = getGroupStandings(schedule);
    if (!standings) return null;
    const table = standings.byGroup.get(seed.groupId);
    if (!table) return null;
    const target = table[seed.position - 1];
    return target ? target.name : null;
  }
  if (seed.type === 'bestRunnerUp') {
    const standings = getGroupStandings(schedule);
    if (!standings || !standings.bestRunnerUp) return null;
    return standings.bestRunnerUp.name;
  }
  if (seed.type === 'matchWinner' || seed.type === 'matchLoser') {
    const targetMatch = findMatchById(schedule, seed.matchId);
    if (!targetMatch) return null;
    const record = state.scores && state.scores[seed.matchId];
    if (!record || !Number.isFinite(record.home) || !Number.isFinite(record.away)) return null;
    if (record.home === record.away) return null;
    const participants = resolveMatchParticipants(targetMatch, schedule);
    if (!participants.home || !participants.away) return null;
    const homeWins = record.home > record.away;
    if (seed.type === 'matchWinner') {
      return homeWins ? participants.home : participants.away;
    }
    return homeWins ? participants.away : participants.home;
  }
  return null;
}

function resolveMatchParticipants(match, schedule) {
  if (!match) return { home: '', away: '' };
  const fallbackGroups = schedule ? schedule.groups : [];
  let home = match.home;
  let away = match.away;
  if (match.seedHome) {
    home =
      resolveSeedName(match.seedHome, schedule) ||
      match.placeholderHome ||
      describeSeed(match.seedHome, fallbackGroups);
  }
  if (match.seedAway) {
    away =
      resolveSeedName(match.seedAway, schedule) ||
      match.placeholderAway ||
      describeSeed(match.seedAway, fallbackGroups);
  }
  return { home, away };
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
    renderChronoScreen();
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

function setLiveTimerPanelEnabled(enabled) {
  if (!elements.liveTimerPanel) return;
  elements.liveTimerPanel.classList.toggle('disabled', !enabled);
  if (!enabled) {
    elements.liveTimerPanel.classList.remove('running');
    elements.liveTimerPanel.classList.remove('ended');
  }
  if (elements.liveTimerHint) {
    elements.liveTimerHint.classList.toggle('hidden', enabled);
  }
  [elements.liveStartBtn, elements.livePauseBtn, elements.liveTimerResetBtn].forEach(btn => {
    if (!btn) return;
    btn.disabled = !enabled;
  });
}

function openTimerPanel() {
  if (!elements.timerWidget || !timerUiState.available) return;
  timerUiState.expanded = true;
  elements.timerWidget.classList.remove('hidden');
  updateTimerFabVisibility();
}

function closeTimerPanel(options = {}) {
  if (!elements.timerWidget) return;
  timerUiState.expanded = false;
  elements.timerWidget.classList.add('hidden');
  if (!options.silent) {
    updateTimerFabVisibility();
  }
}

function updateTimerFabVisibility() {
  if (!elements.timerFab) return;
  const shouldShow = timerUiState.available && !timerUiState.expanded;
  elements.timerFab.classList.toggle('hidden', !shouldShow);
}

function handleLiveClick(event) {
  const validateButton = event.target.closest('[data-validate-match]');
  if (validateButton) {
    const matchId = validateButton.dataset.validateMatch;
    if (matchId) validateMatch(matchId);
    return;
  }
  const editButton = event.target.closest('[data-edit-match]');
  if (editButton) {
    const matchId = editButton.dataset.editMatch;
    if (matchId) unlockValidatedMatch(matchId);
    return;
  }
  const adjustButton = event.target.closest('.score-adjust');
  if (adjustButton) {
    adjustScore(adjustButton);
  }
}

function adjustScore(button) {
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
  if (!isMatchCompleteById(matchId) && isMatchValidated(matchId)) {
    setMatchValidated(matchId, false);
  }
  invalidateStandingsCache();
  syncScoreInputs(matchId, side, value);
  persistState();
  if (state.schedule) {
    renderRankingView(state.schedule);
    renderLiveRankingPanel();
    updateLiveControls();
    renderChronoScreen();
    const teamsView = buildTeamEntriesFromSchedule(state.schedule);
    state.schedule.teams = teamsView;
    renderTeamView(teamsView);
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
  const validated = isMatchValidated(matchId);
  document.querySelectorAll(`.live-match-card[data-match-id="${matchId}"]`).forEach(card => {
    card.classList.toggle('validated', validated);
    card.classList.toggle('active', !validated);
    card.classList.toggle('incomplete', !validated && !complete);
    const badge = card.querySelector('.live-badge');
    if (badge) {
      badge.textContent = validated ? 'VALIDÉ' : 'EN COURS';
      badge.classList.toggle('success', validated);
      badge.classList.toggle('info', !validated);
    }
    const validateBtn = card.querySelector('.live-validate');
    if (validateBtn) {
      validateBtn.disabled = !complete || validated;
      validateBtn.classList.toggle('hidden', validated);
    }
    const editBtn = card.querySelector('.live-edit');
    if (editBtn) {
      editBtn.disabled = !validated;
      editBtn.classList.toggle('hidden', !validated);
    }
  });
  toggleMatchInputs(matchId, validated);
}

function toggleMatchInputs(matchId, disabled) {
  document
    .querySelectorAll(`.live-match-card[data-match-id="${matchId}"] .score-adjust`)
    .forEach(button => {
      button.disabled = disabled;
    });
  document
    .querySelectorAll(`.live-match-card[data-match-id="${matchId}"] input[data-score-input]`)
    .forEach(input => {
      input.disabled = disabled;
    });
}

function countMissingScores(rotationNumber) {
  if (!state.schedule) return 0;
  const rotation = state.schedule.rotations.find(r => r.number === rotationNumber);
  if (!rotation) return 0;
  return rotation.matches.reduce((acc, match) => {
    const participants = resolveMatchParticipants(match, state.schedule);
    const key = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
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
  [elements.livePauseBtn, elements.liveStartBtn, elements.liveTimerResetBtn].forEach(btn => {
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
  const formatted = formatSeconds(timerState.remainingSeconds);
  if (elements.timerDisplay) {
    elements.timerDisplay.textContent = formatted;
  }
  if (elements.liveTimerDisplay) {
    elements.liveTimerDisplay.textContent = formatted;
  }
  if (elements.chronoDisplay) {
    elements.chronoDisplay.textContent = formatted;
  }
  const running = Boolean(timerState.intervalId);
  const ended = timerState.remainingSeconds === 0;
  const label = statusOverride || (ended ? 'Terminé' : running ? 'En cours' : 'En pause');
  if (elements.liveTimerState) {
    elements.liveTimerState.textContent = label;
  }
  if (elements.chronoStateLabel) {
    elements.chronoStateLabel.textContent = label;
  }
  if (elements.liveTimerPanel) {
    elements.liveTimerPanel.classList.toggle('running', running);
    elements.liveTimerPanel.classList.toggle('ended', ended);
  }
  if (screens.chrono) {
    screens.chrono.classList.toggle('running', running);
    screens.chrono.classList.toggle('ended', ended);
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
  const format = getTournamentType();
  if (format === 'round-robin') {
    return buildSinglePoolSchedule(teams, options);
  }
  const groups = distributeIntoGroups(teams, { finals: format === 'groups-finals' });
  if (!groups.length || groups.length === 1) {
    return buildSinglePoolSchedule(teams, options);
  }
  return buildGroupedSchedule(groups, teams, options, { finals: format === 'groups-finals' });
}

function buildSinglePoolSchedule(teams, options) {
  const rounds = createRoundRobinPairs(teams);
  const entries = rounds.map((round, index) => ({
    phase: 'single',
    matches: round.matches.map(match => ({ ...match })),
    byes: [...round.byes],
    title: `Rotation ${index + 1}`,
  }));
  return assembleSchedule(entries, teams, options, {
    format: 'round-robin',
    formatLabel: TOURNAMENT_MODES['round-robin'].label,
    groups: [],
  });
}

function buildGroupedSchedule(groups, allTeams, options, extras = {}) {
  const groupedRounds = groups.map(group => ({
    ...group,
    rounds: createRoundRobinPairs(group.teams),
  }));
  const groupEntries = buildParallelEntries(groupedRounds, options);
  let finalEntries = [];
  if (extras.finals && groups.length >= 2) {
    finalEntries = buildFinalEntries(groups);
  }
  return assembleSchedule([...groupEntries, ...finalEntries], allTeams, options, {
    format: extras.finals ? 'groups-finals' : 'groups',
    formatLabel: extras.finals ? TOURNAMENT_MODES['groups-finals'].label : TOURNAMENT_MODES.groups.label,
    groups,
    finals: finalEntries.length ? { matches: finalEntries.length } : null,
  });
}

function assembleSchedule(entries, teams, options, metaExtras) {
  const teamMap = new Map();
  teams.forEach(name => teamMap.set(name, []));
  const fieldCount = clampNumber(options.fields, 1, 16, 2);
  const rotations = [];
  let clock = parseTime(options.startTime);
  const rotationDuration = options.duration;
  let totalMatches = 0;
  entries.forEach((entry, rotationIndex) => {
    const number = rotationIndex + 1;
    const matches = entry.matches.map((match, index) => {
      const copy = { ...match };
      if (!copy.id) {
        const fallbackHome = copy.home || describeSeed(copy.seedHome, metaExtras.groups);
        const fallbackAway = copy.away || describeSeed(copy.seedAway, metaExtras.groups);
        copy.id = buildMatchKey(number, fallbackHome || `Equipe${index + 1}`, fallbackAway || `Equipe${index + 2}`);
      }
      return copy;
    });
    const fieldAssignments = Array.from({ length: fieldCount }, (_, fieldIndex) => ({
      label: `Terrain ${fieldIndex + 1}`,
      matches: [],
    }));
    matches.forEach((match, matchIndex) => {
      const fieldIndex = matchIndex % fieldCount;
      const slot = Math.floor(matchIndex / fieldCount) + 1;
      match.field = fieldIndex + 1;
      match.order = slot;
      fieldAssignments[fieldIndex].matches.push(match);
      if (match.home && match.away) {
        const homeList = teamMap.get(match.home);
        const awayList = teamMap.get(match.away);
        const payload = {
          opponent: match.away,
          rotation: number,
          field: match.field,
          start: clock,
          group: match.groupLabel || entry.groupLabel,
          phase: match.phase || entry.phase,
        };
        if (homeList) homeList.push(payload);
        if (awayList) {
          awayList.push({
            opponent: match.home,
            rotation: number,
            field: match.field,
            start: clock,
            group: match.groupLabel || entry.groupLabel,
            phase: match.phase || entry.phase,
          });
        }
      }
      totalMatches += 1;
    });
    (entry.byes || []).forEach(teamName => {
      const ref = teamMap.get(teamName);
      if (ref) {
        ref.push({
          bye: true,
          rotation: number,
          start: clock,
          group: entry.groupLabel,
          phase: entry.phase,
        });
      }
    });
    const startLabel = clock != null ? formatTime(clock) : null;
    const endLabel = clock != null ? formatTime(clock + rotationDuration) : null;
    rotations.push({
      number,
      phase: entry.phase || 'single',
      groupId: entry.groupId || null,
      groupLabel: entry.groupLabel || null,
      title: entry.title || `Rotation ${number}`,
      matches,
      byes: entry.byes || [],
      startLabel,
      durationLabel: `${rotationDuration} min${endLabel ? ` · fin ${endLabel}` : ''}`,
      fieldAssignments,
    });
    if (clock != null) clock += rotationDuration;
  });
  const meta = {
    teamCount: teams.length,
    rotationCount: entries.length,
    matchCount: totalMatches,
    fieldCount,
    estimatedDuration: null,
    endTime: null,
    formatLabel: metaExtras.formatLabel,
    groupCount: metaExtras.groups ? metaExtras.groups.length : 0,
  };
  return {
    format: metaExtras.format,
    rotations,
    teams: Array.from(teamMap.entries()).map(([name, matches]) => ({ name, matches })),
    meta,
    groups: metaExtras.groups || [],
    finals: metaExtras.finals || null,
  };
}

function distributeIntoGroups(teamNames, options = {}) {
  if (!Array.isArray(teamNames) || !teamNames.length) return [];
  const teams = [...teamNames];
  const minGroups = options.finals
    ? Math.min(2, teams.length)
    : teams.length >= 4
    ? Math.min(2, teams.length)
    : 1;
  const maxGroups = options.finals ? Math.min(4, teams.length) : Math.min(6, teams.length);
  const preferSize = 4;
  const candidates = [];
  for (let groupCount = minGroups; groupCount <= Math.max(minGroups, maxGroups); groupCount += 1) {
    if (!groupCount) continue;
    const base = Math.floor(teams.length / groupCount);
    if (options.finals && groupCount < 2) continue;
    if (!base) continue;
    const remainder = teams.length % groupCount;
    const sizes = Array(groupCount).fill(base);
    for (let i = 0; i < remainder; i += 1) {
      sizes[i] += 1;
    }
    if (sizes.some(size => size < 2)) {
      continue;
    }
    const maxSize = Math.max(...sizes);
    const minSize = Math.min(...sizes);
    const imbalance = maxSize - minSize;
    const penalty =
      sizes.reduce((acc, size) => acc + Math.abs(size - preferSize), 0) + imbalance * (imbalance > 1 ? 3 : 1);
    candidates.push({ groupCount, sizes, imbalance, penalty });
  }
  if (!candidates.length) {
    return [
      {
        id: 'group-0',
        label: 'Groupe A',
        teams,
      },
    ];
  }
  const balanced = candidates.filter(entry => entry.imbalance <= 1);
  const pool = balanced.length ? balanced : candidates;
  pool.sort((a, b) => {
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return a.groupCount - b.groupCount;
  });
  const selection = pool[0];
  const result = [];
  let cursor = 0;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  selection.sizes.forEach((size, index) => {
    const slice = teams.slice(cursor, cursor + size);
    cursor += size;
    result.push({
      id: `group-${index}`,
      label: `Groupe ${alphabet[index] || String.fromCharCode(65 + index)}`,
      teams: slice,
    });
  });
  return result;
}

function buildParallelEntries(groupedRounds, options) {
  const entries = [];
  if (!groupedRounds.length) return entries;
  const fieldCount = clampNumber(options.fields, 1, 16, 2);
  const maxRounds = Math.max(...groupedRounds.map(group => group.rounds.length));
  let rotationCounter = 0;
  for (let roundIndex = 0; roundIndex < maxRounds; roundIndex += 1) {
    const combinedMatches = [];
    const combinedByes = [];
    let slotMax = 0;
    groupedRounds.forEach(group => {
      const round = group.rounds[roundIndex];
      if (!round) return;
      slotMax = Math.max(slotMax, round.matches.length);
      round.byes.forEach(team => combinedByes.push(team));
    });
    for (let slot = 0; slot < slotMax; slot += 1) {
      groupedRounds.forEach(group => {
        const round = group.rounds[roundIndex];
        if (!round) return;
        const match = round.matches[slot];
        if (!match) return;
        combinedMatches.push({
          ...match,
          groupId: group.id,
          groupLabel: group.label,
          phase: 'groups',
        });
      });
    }
    if (!combinedMatches.length && !combinedByes.length) continue;
    if (!combinedMatches.length && combinedByes.length) {
      rotationCounter += 1;
      entries.push({
        phase: 'groups',
        title: `Rotation ${rotationCounter}`,
        matches: [],
        byes: combinedByes,
        groupId: null,
        groupLabel: null,
      });
      continue;
    }
    let chunkIndex = 0;
    while (chunkIndex < combinedMatches.length) {
      rotationCounter += 1;
      const slice = combinedMatches.slice(chunkIndex, chunkIndex + fieldCount);
      entries.push({
        phase: 'groups',
        title: `Rotation ${rotationCounter}`,
        matches: slice,
        byes: combinedByes,
        groupId: null,
        groupLabel: null,
      });
      chunkIndex += fieldCount;
    }
  }
  return entries;
}

function buildFinalEntries(groups) {
  const entries = [];
  if (groups.length === 2) {
    entries.push({
      phase: 'finals',
      title: 'Demi-finale 1',
      matches: [
        {
          id: 'sf1',
          phase: 'finals',
          seedHome: { type: 'group', groupId: groups[0].id, position: 1 },
          seedAway: { type: 'group', groupId: groups[1].id, position: 2 },
          placeholderHome: `1er ${groups[0].label}`,
          placeholderAway: `2e ${groups[1].label}`,
        },
      ],
    });
    entries.push({
      phase: 'finals',
      title: 'Demi-finale 2',
      matches: [
        {
          id: 'sf2',
          phase: 'finals',
          seedHome: { type: 'group', groupId: groups[1].id, position: 1 },
          seedAway: { type: 'group', groupId: groups[0].id, position: 2 },
          placeholderHome: `1er ${groups[1].label}`,
          placeholderAway: `2e ${groups[0].label}`,
        },
      ],
    });
    entries.push({
      phase: 'finals',
      title: 'Match pour la 3e place',
      matches: [
        {
          id: 'small-final',
          phase: 'finals',
          seedHome: { type: 'matchLoser', matchId: 'sf1', label: 'Demi-finale 1' },
          seedAway: { type: 'matchLoser', matchId: 'sf2', label: 'Demi-finale 2' },
          placeholderHome: 'Perdant demi-finale 1',
          placeholderAway: 'Perdant demi-finale 2',
        },
      ],
    });
    entries.push({
      phase: 'finals',
      title: 'Finale',
      matches: [
        {
          id: 'final',
          phase: 'finals',
          seedHome: { type: 'matchWinner', matchId: 'sf1', label: 'Demi-finale 1' },
          seedAway: { type: 'matchWinner', matchId: 'sf2', label: 'Demi-finale 2' },
          placeholderHome: 'Vainqueur demi-finale 1',
          placeholderAway: 'Vainqueur demi-finale 2',
        },
      ],
    });
    return entries;
  }
  if (groups.length === 3) {
    entries.push({
      phase: 'finals',
      title: 'Demi-finale 1',
      matches: [
        {
          id: 'sf1',
          phase: 'finals',
          seedHome: { type: 'group', groupId: groups[0].id, position: 1 },
          seedAway: { type: 'bestRunnerUp', position: 2 },
          placeholderHome: `1er ${groups[0].label}`,
          placeholderAway: 'Meilleur 2e',
        },
      ],
    });
    entries.push({
      phase: 'finals',
      title: 'Demi-finale 2',
      matches: [
        {
          id: 'sf2',
          phase: 'finals',
          seedHome: { type: 'group', groupId: groups[1].id, position: 1 },
          seedAway: { type: 'group', groupId: groups[2].id, position: 1 },
          placeholderHome: `1er ${groups[1].label}`,
          placeholderAway: `1er ${groups[2].label}`,
        },
      ],
    });
    entries.push({
      phase: 'finals',
      title: 'Match pour la 3e place',
      matches: [
        {
          id: 'small-final',
          phase: 'finals',
          seedHome: { type: 'matchLoser', matchId: 'sf1', label: 'Demi-finale 1' },
          seedAway: { type: 'matchLoser', matchId: 'sf2', label: 'Demi-finale 2' },
          placeholderHome: 'Perdant demi-finale 1',
          placeholderAway: 'Perdant demi-finale 2',
        },
      ],
    });
    entries.push({
      phase: 'finals',
      title: 'Finale',
      matches: [
        {
          id: 'final',
          phase: 'finals',
          seedHome: { type: 'matchWinner', matchId: 'sf1', label: 'Demi-finale 1' },
          seedAway: { type: 'matchWinner', matchId: 'sf2', label: 'Demi-finale 2' },
          placeholderHome: 'Vainqueur demi-finale 1',
          placeholderAway: 'Vainqueur demi-finale 2',
        },
      ],
    });
    return entries;
  }
  entries.push({
    phase: 'finals',
    title: 'Demi-finale 1',
    matches: [
      {
          id: 'sf1',
          phase: 'finals',
          seedHome: { type: 'group', groupId: groups[0].id, position: 1 },
          seedAway: { type: 'group', groupId: groups[3].id, position: 1 },
          placeholderHome: `1er ${groups[0].label}`,
          placeholderAway: `1er ${groups[3].label}`,
      },
    ],
  });
  entries.push({
    phase: 'finals',
    title: 'Demi-finale 2',
    matches: [
      {
          id: 'sf2',
          phase: 'finals',
          seedHome: { type: 'group', groupId: groups[1].id, position: 1 },
          seedAway: { type: 'group', groupId: groups[2].id, position: 1 },
          placeholderHome: `1er ${groups[1].label}`,
          placeholderAway: `1er ${groups[2].label}`,
      },
    ],
  });
  entries.push({
    phase: 'finals',
    title: 'Match pour la 3e place',
    matches: [
      {
          id: 'small-final',
          phase: 'finals',
          seedHome: { type: 'matchLoser', matchId: 'sf1', label: 'Demi-finale 1' },
          seedAway: { type: 'matchLoser', matchId: 'sf2', label: 'Demi-finale 2' },
          placeholderHome: 'Perdant demi-finale 1',
          placeholderAway: 'Perdant demi-finale 2',
      },
    ],
  });
  entries.push({
    phase: 'finals',
    title: 'Finale',
    matches: [
      {
          id: 'final',
          phase: 'finals',
          seedHome: { type: 'matchWinner', matchId: 'sf1', label: 'Demi-finale 1' },
          seedAway: { type: 'matchWinner', matchId: 'sf2', label: 'Demi-finale 2' },
          placeholderHome: 'Vainqueur demi-finale 1',
          placeholderAway: 'Vainqueur demi-finale 2',
      },
    ],
  });
  return entries.map(entry => ({
    ...entry,
    matches: entry.matches.map(match => ({ ...match, groupLabel: 'Phase finale' })),
  }));
}

function createRoundRobinPairs(list) {
  if (!list.length) return [];
  let working = [...list];
  if (working.length % 2 === 1) {
    working.push('Exempt');
  }
  const rounds = [];
  const rotationCount = working.length - 1;
  const matchesPerRotation = working.length / 2;
  for (let round = 0; round < rotationCount; round += 1) {
    const matches = [];
    const byes = [];
    for (let i = 0; i < matchesPerRotation; i += 1) {
      const home = working[i];
      const away = working[working.length - 1 - i];
      if (home === 'Exempt' && away === 'Exempt') continue;
      if (home === 'Exempt') {
        if (away !== 'Exempt') byes.push(away);
        continue;
      }
      if (away === 'Exempt') {
        byes.push(home);
        continue;
      }
      matches.push({ home, away });
    }
    rounds.push({ matches, byes });
    const pivot = working[0];
    const rest = working.slice(1);
    rest.unshift(rest.pop());
    working = [pivot, ...rest];
  }
  return rounds;
}

function describeSeed(seed, groups = []) {
  if (!seed) return '';
  if (seed.type === 'group') {
    const group = groups.find(item => item.id === seed.groupId);
    const ordinal = seed.position === 1 ? '1er' : `${seed.position}e`;
    return `${ordinal} ${group ? group.label : 'groupe'}`;
  }
  if (seed.type === 'bestRunnerUp') {
    return 'Meilleur 2e';
  }
  if (seed.type === 'matchWinner') {
    return `Vainqueur ${seed.label || ''}`.trim();
  }
  if (seed.type === 'matchLoser') {
    return `Perdant ${seed.label || ''}`.trim();
  }
  return '';
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

function computeTimeSummary(schedule, options) {
  if (!schedule || !options) return null;
  const rotations = Array.isArray(schedule.rotations) ? schedule.rotations.length : 0;
  const matchCount = schedule.meta ? schedule.meta.matchCount : 0;
  const matchVolume = matchCount * options.duration;
  const rotationBlock = rotations * options.duration;
  const rotationGaps = Math.max(rotations - 1, 0) * options.turnaround;
  const pauseMinutes = Math.max(0, options.breakMinutes || 0);
  const totalMinutes = rotationBlock + rotationGaps + pauseMinutes;
  const startMinutes = parseTime(options.startTime);
  const estimatedEnd = startMinutes != null ? formatTime(startMinutes + totalMinutes) : null;
  let available = null;
  if (Number.isFinite(options.availableDuration) && options.availableDuration > 0) {
    available = options.availableDuration;
  } else if (options.endTime && startMinutes != null) {
    const desiredEnd = parseTime(options.endTime);
    if (desiredEnd != null) {
      let diff = desiredEnd - startMinutes;
      if (diff < 0) diff += 24 * 60;
      available = diff;
    }
  }
  let feasibility = null;
  if (available != null) {
    const delta = available - totalMinutes;
    feasibility = { ok: delta >= 0, delta };
  }
  return {
    matchVolume,
    rotationGaps,
    pauseMinutes,
    totalMinutes,
    estimatedEnd,
    feasibility,
  };
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

function isMatchValidated(matchId) {
  return Boolean(state.validatedMatches && state.validatedMatches[matchId]);
}

function setMatchValidated(matchId, flag) {
  if (!state.validatedMatches) state.validatedMatches = {};
  if (flag) {
    state.validatedMatches[matchId] = true;
  } else {
    delete state.validatedMatches[matchId];
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
      turnaround: 2,
      breakMinutes: 0,
      availableDuration: null,
      endTime: '',
      timer: false,
      sound: true,
      vibration: true,
    },
    schedule: null,
    generatedAt: null,
    scores: {},
    liveRotationIndex: 0,
    validatedMatches: {},
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
  const allowedModes = Object.keys(TOURNAMENT_MODES);
  merged.tournamentType = allowedModes.includes(source.tournamentType) ? source.tournamentType : base.tournamentType;
  merged.participants = clampNumber(Number(merged.participants), 2, 32, base.participants);
  const optionSource = { ...base.options, ...(source.options || {}) };
  optionSource.fields = clampNumber(Number(optionSource.fields), 1, 16, base.options.fields);
  optionSource.duration = clampNumber(Number(optionSource.duration), 1, 180, base.options.duration);
  optionSource.startTime = optionSource.startTime || base.options.startTime;
  optionSource.turnaround = clampNumber(Number(optionSource.turnaround), 0, 60, base.options.turnaround);
  optionSource.breakMinutes = clampNumber(Number(optionSource.breakMinutes), 0, 600, base.options.breakMinutes);
  optionSource.availableDuration =
    Number.isFinite(optionSource.availableDuration) && optionSource.availableDuration > 0
      ? clampNumber(Number(optionSource.availableDuration), 0, 1440, optionSource.availableDuration)
      : null;
  optionSource.endTime = optionSource.endTime || '';
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
  const validatedMatches = {};
  if (isPlainObject(source.validatedMatches)) {
    Object.entries(source.validatedMatches).forEach(([key, value]) => {
      if (value) validatedMatches[key] = true;
    });
  }
  merged.validatedMatches = validatedMatches;
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
  syncModeSelection();
  elements.summaryGrid.innerHTML = '';
  elements.rotationView.innerHTML = '';
  elements.teamView.innerHTML = '';
  elements.rankingView.innerHTML = '';
  elements.resultSubtitle.textContent = 'Aucun planning pour le moment.';
  updatePrintHeader(null);
  setActiveView('rotations');
  renderTimeIndicator(null);
  updateMatchInsight(null);
  setLiveModeAvailability(false);
  elements.regenerateBtn.disabled = true;
  timerController.hide();
  hideFinalRankingModal();
  invalidateStandingsCache();
  goTo('landing');
}

function setLiveModeAvailability(enabled) {
  if (!elements.startLiveBtn) return;
  elements.startLiveBtn.disabled = !enabled;
  const rotationNumber =
    state.schedule && state.schedule.rotations[state.liveRotationIndex]
      ? state.schedule.rotations[state.liveRotationIndex].number
      : 1;
  if (enabled) {
    elements.startLiveBtn.textContent =
      state.liveRotationIndex > 0 ? `Reprendre le live (Rotation ${rotationNumber})` : 'Démarrer le live';
  } else {
    elements.startLiveBtn.textContent = 'Démarrer le live';
  }
  if (elements.resultsPrimaryHint) {
    if (!enabled) {
      elements.resultsPrimaryHint.textContent = 'Générez un planning pour activer le mode live.';
    } else if (state.liveRotationIndex > 0) {
      elements.resultsPrimaryHint.textContent = `Reprenez directement à la rotation ${rotationNumber} ou ajustez les scores.`;
    } else {
      elements.resultsPrimaryHint.textContent = 'Passez en mode live pour piloter les rotations et les scores.';
    }
  }
  if (elements.returnLiveBtn) {
    elements.returnLiveBtn.disabled = !enabled;
  }
  if (elements.liveChronoBtn) {
    elements.liveChronoBtn.disabled = !enabled;
  }
}
  const perFieldNumber =
    Number.isFinite(totalMatches) && Number.isFinite(totalFields) && totalFields > 0
      ? totalMatches / totalFields
      : null;
  const perFieldLabel = formatMatchesDisplay(perFieldNumber);
