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

const ROLE_KEYS = ['arbitre', 'table', 'coach'];
const ROLE_LABELS = {
  arbitre: 'Arbitre',
  table: 'Table de marque',
  coach: 'Coach',
};
const DEFAULT_ROLE_SETTINGS = {
  enabled: false,
  arbitre: true,
  table: false,
  coach: false,
  coachMode: 'disabled',
};

function getPracticeLabels(practiceType = state.practiceType || 'sport-co') {
  const map = {
    'sport-co': { singular: 'équipe', plural: 'équipes' },
    raquette: { singular: 'participant', plural: 'participants' },
  };
  return map[practiceType] || map['sport-co'];
}

function formatParticipantLabel(options = {}) {
  const { plural = false, capitalized = false, practiceType = state.practiceType || 'sport-co' } = options;
  const labels = getPracticeLabels(practiceType);
  const base = plural ? labels.plural : labels.singular;
  return capitalized ? base.charAt(0).toUpperCase() + base.slice(1) : base;
}

function getFieldLabels() {
  return { singular: 'terrain', plural: 'terrains' };
}

function formatFieldLabel(options = {}) {
  const { plural = false, capitalized = false, practiceType = state.practiceType || 'sport-co' } = options;
  const labels = getFieldLabels(practiceType);
  const base = plural ? labels.plural : labels.singular;
  return capitalized ? base.charAt(0).toUpperCase() + base.slice(1) : base;
}

function getPracticeTypeFromMeta(meta) {
  if (meta && meta.practiceType) return meta.practiceType;
  return state.practiceType || 'sport-co';
}

const LETTER_REGEX = /\p{L}/u;
const COMMON_FIRST_NAMES = new Set(
  [
    'leo',
    'léo',
    'lea',
    'léa',
    'ines',
    'inès',
    'emma',
    'noah',
    'lena',
    'léna',
    'luna',
    'maelys',
    'maëlys',
    'marie',
    'julie',
    'julien',
    'camille',
    'manon',
    'romain',
    'paul',
    'arthur',
    'nathan',
    'theo',
    'théo',
    'hugo',
    'maxime',
    'antoine',
    'alexandre',
    'anais',
    'anaïs',
    'chloe',
    'chloé',
    'jean',
    'louis',
    'baptiste',
    'emilie',
    'émilie',
    'clara',
    'juliette',
    'axel',
    'lou',
    'maël',
    'mael',
    'enzo',
    'nina',
    'gael',
    'gaël',
    'sarah',
    'eva',
    'éva',
    'tom',
    'lise',
    'romane',
    'justine',
    'quentin',
    'lucas',
    'luca',
    'ines',
  ].map(name => name.toLowerCase())
);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeDiacritics(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isAllCapsWord(word) {
  if (!word) return false;
  const letters = removeDiacritics(word).replace(/[^A-Za-z]/g, '');
  if (!letters) return false;
  return letters === letters.toUpperCase();
}

function capitalizeComposite(value) {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(/([\s\-'])/u)
    .map(segment => {
      if (!segment) return '';
      if (/^[\s\-']$/u.test(segment)) return segment;
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasLetters(value) {
  return LETTER_REGEX.test(value || '');
}

function computeFirstNameScore(token) {
  if (!token) return 0;
  const normalized = token.toLowerCase();
  let score = 0;
  if (COMMON_FIRST_NAMES.has(normalized)) score += 2.5;
  if (token.includes('-')) score += 0.75;
  if (/[àáâäãåçéèêëîïôöùûüÿ]/i.test(token)) score += 0.6;
  if (/[aeiouy]$/i.test(normalized)) score += 0.4;
  if (normalized.length <= 4) score += 0.3;
  if (isAllCapsWord(token)) score -= 1;
  return score;
}

function determineNameOrder(firstToken, lastToken) {
  const firstUpper = isAllCapsWord(firstToken);
  const lastUpper = isAllCapsWord(lastToken);
  if (firstUpper && !lastUpper) return 'last-first';
  if (!firstUpper && lastUpper) return 'first-last';
  const firstScore = computeFirstNameScore(firstToken);
  const lastScore = computeFirstNameScore(lastToken);
  if (lastScore - firstScore >= 0.4) return 'last-first';
  return 'first-last';
}

function formatRaquetteDisplayName(raw) {
  if (!raw) return '';
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const shortPattern = /^([\p{L}\-'\s]+)\s+([\p{L}])\.$/u;
  const shortMatch = cleaned.match(shortPattern);
  if (shortMatch) {
    const prettyFirst = capitalizeComposite(shortMatch[1]);
    const initial = shortMatch[2].toUpperCase();
    return `${prettyFirst} ${initial}.`;
  }
  const tokens = cleaned.split(' ').filter(Boolean);
  const alphaTokens = tokens.filter(hasLetters);
  if (alphaTokens.length < 2) {
    return capitalizeComposite(cleaned);
  }
  let order = 'first-last';
  if (tokens.length >= 2) {
    order = determineNameOrder(tokens[0], tokens[tokens.length - 1]);
  }
  let firstParts;
  let lastPart;
  if (order === 'last-first') {
    lastPart = tokens[0];
    firstParts = tokens.slice(1);
  } else {
    lastPart = tokens[tokens.length - 1];
    firstParts = tokens.slice(0, -1);
  }
  if (!firstParts.length) {
    firstParts = [lastPart];
    lastPart = tokens[0];
  }
  const firstName = capitalizeComposite(firstParts.join(' '));
  const normalizedLast = capitalizeComposite(lastPart);
  const lastInitialMatch = normalizedLast.match(/\p{L}/u);
  if (!lastInitialMatch) return firstName;
  const lastInitial = removeDiacritics(lastInitialMatch[0]).charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function formatNameForPractice(name, practiceType, index, fallbackLabel) {
  const trimmed = (name || '').trim();
  if (!trimmed) return '';
  if (practiceType === 'raquette') {
    const fallbackPattern = new RegExp(`^${escapeRegExp(fallbackLabel)}\\s+\\d+$`, 'i');
    if (fallbackPattern.test(trimmed)) return trimmed;
    const formatted = formatRaquetteDisplayName(trimmed);
    return formatted || trimmed;
  }
  return trimmed;
}

function getRoleSettings() {
  const source = state.options && state.options.roleSettings ? state.options.roleSettings : DEFAULT_ROLE_SETTINGS;
  return {
    enabled: Boolean(source.enabled),
    arbitre: Boolean(source.arbitre),
    table: Boolean(source.table),
    coach: Boolean(source.coach),
    coachMode: source.coachMode === 'self' || source.coachMode === 'rest' ? source.coachMode : 'disabled',
  };
}

function getActiveRestRoles() {
  const settings = getRoleSettings();
  if (!settings.enabled) return [];
  const roles = [];
  if (settings.arbitre) roles.push('arbitre');
  if (settings.table) roles.push('table');
  if (settings.coach && settings.coachMode === 'rest') roles.push('coach');
  return roles;
}

const AUTO_SELECT_IDS = [
  'quickParticipants',
  'quickFields',
  'quickDuration',
  'fieldCount',
  'matchDuration',
  'scoreTarget',
  'rotationBuffer',
  'breakDuration',
  'availableDuration',
];

function setupAutoSelectInputs() {
  AUTO_SELECT_IDS.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('focus', () => {
      requestAnimationFrame(() => {
        input.select();
      });
    });
  });
}

function formatRestRole(roleKey) {
  return ROLE_LABELS[roleKey] || 'Rôle';
}

function buildRestRoleHint() {
  const roles = getActiveRestRoles();
  if (!roles.length) return '';
  const labels = roles.map(formatRestRole).join(' · ');
  return `Rôles proposés : ${labels}`;
}

const elements = {
  stepper: document.getElementById('stepper'),
  stepItems: document.querySelectorAll('.step'),
  startFlow: document.getElementById('startFlow'),
  resumeFlow: document.getElementById('resumeFlow'),
  quickModeBtn: document.getElementById('quickModeBtn'),
  quickForm: document.getElementById('quickForm'),
  quickParticipants: document.getElementById('quickParticipants'),
  quickFields: document.getElementById('quickFields'),
  quickDuration: document.getElementById('quickDuration'),
  quickStartTime: document.getElementById('quickStartTime'),
  quickPractice: document.getElementById('quickPractice'),
  quickRoleReferee: document.getElementById('quickRoleReferee'),
  quickRoleTable: document.getElementById('quickRoleTable'),
  quickGenerateBtn: document.getElementById('quickGenerateBtn'),
  modeCards: document.querySelectorAll('.mode-card[data-mode]'),
  navButtons: document.querySelectorAll('[data-nav]'),
  printTopBtn: document.getElementById('printTopBtn'),
  countMinus: document.getElementById('countMinus'),
  countPlus: document.getElementById('countPlus'),
  teamCountDisplay: document.getElementById('teamCountDisplay'),
  teamCountSlider: document.getElementById('teamCountSlider'),
  countTitle: document.getElementById('countTitle'),
  teamFields: document.getElementById('teamFields'),
  teamTitle: document.getElementById('teamTitle'),
  teamSubtitle: document.getElementById('teamSubtitle'),
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
  schedulingModeInputs: document.querySelectorAll('input[name="schedulingMode"]'),
  practiceTypeSelect: document.getElementById('practiceType'),
  matchModeSelect: document.getElementById('matchMode'),
  scoreTargetInput: document.getElementById('scoreTarget'),
  matchDurationField: document.getElementById('matchDurationField'),
  scoreTargetField: document.getElementById('scoreTargetField'),
  simulateBtn: document.getElementById('simulateBtn'),
  simulationResult: document.getElementById('simulationResult'),
  resetOptionsBtn: document.getElementById('resetOptionsBtn'),
  resultsProjectionBtn: document.getElementById('resultsProjectionBtn'),
  resultsChronoBtn: document.getElementById('resultsChronoBtn'),
  resetFeedback: document.getElementById('resetFeedback'),
  timerToggle: document.getElementById('timerToggle'),
  soundToggle: document.getElementById('soundToggle'),
  vibrationToggle: document.getElementById('vibrationToggle'),
  roleToggle: document.getElementById('roleToggle'),
  roleOptions: document.getElementById('roleOptions'),
  roleCheckboxes: document.querySelectorAll('[data-role-choice]'),
  coachRoleMode: document.getElementById('coachRoleMode'),
  coachModeRow: document.getElementById('coachModeRow'),
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
  teamTabButton: document.getElementById('teamTabButton'),
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
  liveFieldBoard: document.getElementById('liveFieldBoard'),
  liveShell: document.getElementById('liveShell'),
  liveActionsToggle: document.getElementById('liveActionsToggle'),
  liveActionsPanel: document.getElementById('liveActionsPanel'),
  liveChronoBtn: document.getElementById('liveChronoBtn'),
  liveRankingPanel: document.getElementById('liveRankingPanel'),
  liveRankingTable: document.getElementById('liveRankingTable'),
  liveRankingTitle: document.getElementById('liveRankingTitle'),
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
  projectionRotation: document.getElementById('projectionRotation'),
  projectionTimer: document.getElementById('projectionTimer'),
  projectionFields: document.getElementById('projectionFields'),
  projectionNext: document.getElementById('projectionNext'),
  projectionRest: document.getElementById('projectionRest'),
  projectionBackBtn: document.getElementById('projectionBackBtn'),
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
  setupAutoSelectInputs();
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
  if (elements.quickModeBtn) {
    elements.quickModeBtn.addEventListener('click', () => goTo('quick'));
  }

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
  elements.teamFields.addEventListener(
    'blur',
    event => {
      if (!event.target.matches('input[data-index]')) return;
      if (state.practiceType !== 'raquette') return;
      const idx = Number(event.target.dataset.index);
      const fallbackLabel = formatParticipantLabel({ practiceType: state.practiceType, capitalized: true });
      const formatted = formatNameForPractice(event.target.value, state.practiceType, idx, fallbackLabel);
      state.teamNames[idx] = formatted;
      event.target.value = formatted;
      persistState();
    },
    true
  );
  if (elements.quickGenerateBtn) {
    elements.quickGenerateBtn.addEventListener('click', handleQuickGenerate);
  }

  elements.autoFillTeams.addEventListener('click', () => {
    const pool = [
      'Aigles', 'Falcons', 'Titans', 'Lynx', 'Comètes', 'Spartiates', 'Orcas', 'Phoenix', 'Pumas', 'Vikings',
      'Dragons', 'Mistral', 'Tornades', 'Mambas', 'Corsaires', 'Renards', 'Tempêtes', 'Condors', 'Mustangs', 'Guépards',
      'Hurricanes', 'Bisons', 'Loutres', 'Nomades', 'Jets', 'Panthers', 'Sharks', 'Coyotes', 'Raptors', 'Tigers', 'Wolves', 'Bulls',
    ];
    const fallbackLabel = formatParticipantLabel({ practiceType: state.practiceType, capitalized: true });
    state.teamNames = ensureTeamListLength(
      state.teamNames.map((_, index) => pool[index] || `${fallbackLabel} ${index + 1}`),
      state.participants,
      state.practiceType
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
  if (elements.schedulingModeInputs && elements.schedulingModeInputs.length) {
    elements.schedulingModeInputs.forEach(input => {
      input.addEventListener('change', event => {
        if (!event.target.checked) return;
        const value = event.target.value === 'optimise_terrains' ? 'optimise_terrains' : 'pedagogique';
        state.options.schedulingMode = value;
        persistState();
      });
    });
  }

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
  if (elements.practiceTypeSelect) {
    elements.practiceTypeSelect.addEventListener('change', event => {
      state.practiceType = event.target.value || 'sport-co';
      persistState();
      buildTeamFields(state.participants);
      updateTeamScreenCopy();
      updateCountScreenCopy();
    });
  }
  if (elements.matchModeSelect) {
    elements.matchModeSelect.addEventListener('change', event => {
      state.options.matchMode = event.target.value || 'time';
      persistState();
      syncScoreFieldVisibility();
    });
  }
  if (elements.scoreTargetInput) {
    elements.scoreTargetInput.addEventListener('input', event => {
      state.options.scoreTarget = clampNumber(Number(event.target.value), 1, 200, state.options.scoreTarget ?? 11);
      event.target.value = state.options.scoreTarget;
      persistState();
    });
  }

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
  if (elements.roleToggle) {
    elements.roleToggle.addEventListener('change', event => {
      state.options.roleSettings = {
        ...getRoleSettings(),
        enabled: Boolean(event.target.checked),
      };
      updateRoleControlsState();
      persistState();
    });
  }
  if (elements.roleCheckboxes && elements.roleCheckboxes.length) {
    elements.roleCheckboxes.forEach(input => {
      input.addEventListener('change', () => {
        const settings = { ...getRoleSettings(), [input.value]: Boolean(input.checked) };
        if (!settings.coach) {
          settings.coachMode = 'disabled';
        } else if (settings.coach && settings.coachMode === 'disabled') {
          settings.coachMode = 'self';
        }
        state.options.roleSettings = settings;
        updateRoleControlsState();
        persistState();
      });
    });
  }
  if (elements.coachRoleMode) {
    elements.coachRoleMode.addEventListener('change', event => {
      const settings = { ...getRoleSettings(), coachMode: event.target.value };
      state.options.roleSettings = settings;
      updateRoleControlsState();
      persistState();
    });
  }

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
      closeLiveActionsPanel();
      openProjectionScreen();
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
  if (elements.resultsProjectionBtn) {
    elements.resultsProjectionBtn.addEventListener('click', () => {
      if (!state.schedule) return;
      openProjectionScreen();
    });
  }
  if (elements.resultsChronoBtn) {
    elements.resultsChronoBtn.addEventListener('click', () => {
      if (!state.schedule) return;
      goTo('chrono');
      renderChronoScreen();
    });
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
  if (elements.projectionBackBtn) {
    elements.projectionBackBtn.addEventListener('click', () => {
      closeProjectionScreen();
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
  document.body.classList.toggle('mode-projection', screen === 'projection');
  document.body.classList.toggle('mode-chrono', screen === 'chrono');
  if (elements.liveModeToggle && screen !== 'projection') {
    elements.liveModeToggle.textContent = 'Mode projection';
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
  state.teamNames = ensureTeamListLength(state.teamNames, next, state.practiceType);
  renderParticipants();
  buildTeamFields(next);
  persistState();
}

function buildTeamFields(count) {
  elements.teamFields.innerHTML = '';
  state.teamNames = ensureTeamListLength(state.teamNames, count, state.practiceType);
  state.teamNames.forEach((name, index) => {
    const label = document.createElement('label');
    label.className = 'field';
    const span = document.createElement('span');
    const participantLabel = formatParticipantLabel({ capitalized: true });
    span.textContent = `${participantLabel} ${index + 1}`;
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = `${participantLabel} ${index + 1}`;
    input.value = name;
    input.dataset.index = index;
    label.append(span, input);
    elements.teamFields.appendChild(label);
  });
  updateTeamScreenCopy();
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
  if (elements.schedulingModeInputs && elements.schedulingModeInputs.length) {
    const mode = state.options.schedulingMode || 'pedagogique';
    elements.schedulingModeInputs.forEach(input => {
      input.checked = input.value === mode;
    });
  }
  if (elements.practiceTypeSelect) {
    elements.practiceTypeSelect.value = state.practiceType || 'sport-co';
  }
  if (elements.matchModeSelect) {
    elements.matchModeSelect.value = state.options.matchMode || 'time';
  }
  if (elements.scoreTargetInput) {
    elements.scoreTargetInput.value = state.options.scoreTarget ?? 11;
  }
  syncScoreFieldVisibility();
  updateTeamScreenCopy();
  updateCountScreenCopy();
  updateRoleControlsState();
}

function getFinalTeamNames() {
  return ensureTeamListLength(state.teamNames, state.participants, state.practiceType).map((name, index) => {
    const trimmed = name.trim();
    const participantLabel = formatParticipantLabel({ capitalized: true });
    return trimmed || `${participantLabel} ${index + 1}`;
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
  state.teamNames = ensureTeamListLength(candidates, state.participants, state.practiceType);
  buildTeamFields(state.participants);
  elements.teamBulkInput.value = '';
  persistState();
}

function handleGenerate() {
  const teams = getFinalTeamNames();
  if (teams.length < 2) {
    alert(`Ajoutez au moins deux ${formatParticipantLabel({ plural: true })}.`);
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
    state.schedule.meta.practiceType = state.practiceType;
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
  const practiceType = getPracticeTypeFromMeta(meta);
  const participantLabel = formatParticipantLabel({
    practiceType,
    plural: true,
    capitalized: true,
  });
  const fieldLabel = formatFieldLabel({
    practiceType,
    plural: true,
    capitalized: true,
  });
  const summary = meta.timeSummary;
  const primaryCards = [
    { label: participantLabel, value: meta.teamCount },
    { label: fieldLabel, value: meta.fieldCount },
    { label: 'Durée tournoi', value: summary ? humanizeDuration(summary.totalMinutes) : '-' },
    { label: 'Fin prévue', value: summary?.estimatedEnd || '-' },
  ];
  const detailItems = [
    { label: 'Format', value: meta.formatLabel || TOURNAMENT_MODES[getTournamentType()].label },
    { label: 'Matchs', value: meta.matchCount },
  ];
  if (meta.groupCount && meta.groupCount > 1) {
    const teamsPerGroup = meta.teamCount && meta.groupCount ? Math.ceil(meta.teamCount / meta.groupCount) : 0;
    detailItems.push({
      label: 'Organisation',
      value: `${meta.groupCount} groupe${meta.groupCount > 1 ? 's' : ''} d’environ ${teamsPerGroup || '-'}`,
    });
  }
  if (summary) {
    detailItems.push(
      { label: 'Volume de jeu', value: humanizeDuration(summary.matchVolume) },
      { label: 'Transitions', value: humanizeDuration(summary.rotationGaps) },
      { label: 'Pauses', value: humanizeDuration(summary.pauseMinutes) }
    );
  }
  const primaryHtml = primaryCards
    .map(
      item => `
        <article class="summary-card summary-card-primary">
          <span>${item.label}</span>
          <strong>${item.value ?? '-'}</strong>
        </article>
      `
    )
    .join('');
  const detailsHtml = detailItems
    .map(
      item => `
        <li>
          <span>${item.label}</span>
          <strong>${item.value ?? '-'}</strong>
        </li>
      `
    )
    .join('');
  const detailsCard = `
    <details class="summary-details-card">
      <summary>Détails du tournoi</summary>
      <ul class="summary-details-list">
        ${detailsHtml}
      </ul>
    </details>
  `;
  const analysisMetrics = buildPedagogyMetrics(meta, summary, meta.optionsSnapshot || state.options);
  const analysisCard = `
    <article class="summary-card analysis-card">
      <span>Analyse pédagogique</span>
      ${buildAnalysisListHTML(analysisMetrics)}
      ${buildAnalysisTagHTML(analysisMetrics)}
    </article>
  `;
  elements.summaryGrid.innerHTML = `
    <div class="summary-primary-grid">
      ${primaryHtml}
    </div>
    ${detailsCard}
    ${analysisCard}
  `;
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
  const practiceLabel = formatParticipantLabel({
    practiceType: getPracticeTypeFromMeta(meta),
    plural: meta.teamCount > 1,
    capitalized: true,
  });
  if (meta.teamCount) parts.push(`${meta.teamCount} ${practiceLabel}`);
  if (meta.rotationCount) parts.push(`${meta.rotationCount} rotation${meta.rotationCount > 1 ? 's' : ''}`);
  if (meta.fieldCount) {
    const fieldLabel = formatFieldLabel({
      practiceType: getPracticeTypeFromMeta(meta),
      plural: meta.fieldCount > 1,
      capitalized: true,
    });
    parts.push(`${meta.fieldCount} ${fieldLabel}`);
  }
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
  const practiceType = getPracticeTypeFromMeta(schedule.meta);
  const pluralLabel = formatParticipantLabel({ plural: true, practiceType });
  const singularLabel = formatParticipantLabel({ practiceType });
  if (!schedule.groups || !schedule.groups.length || format === 'round-robin') {
    const teamCount = schedule.meta ? schedule.meta.teamCount : state.participants;
    const perTeam = Math.max(teamCount - 1, 0);
    const lines = [`Chaque ${singularLabel} jouera ${formatMatchCount(perTeam)}.`];
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
      lines.push(`Chaque ${singularLabel} jouera au moins ${formatMatchCount(perTeamBase)} pendant la phase de groupes.`);
    } else {
      lines.push(`Chaque ${singularLabel} jouera entre ${minCount} et ${maxCount} matchs pendant la phase de groupes.`);
    }
    lines.push(`Les ${pluralLabel} qualifié·es disputeront ensuite la phase finale.`);
    return { lines, perTeam: Math.max(perTeamBase, 1) };
  }
  if (uniform) {
    const perTeam = Math.max(minCount, 0);
    const lines = [`Chaque ${singularLabel} jouera ${formatMatchCount(perTeam)} dans sa phase de groupe.`];
    return { lines, perTeam: Math.max(perTeam, 1) };
  }
  const lines = [`Chaque ${singularLabel} jouera entre ${minCount} et ${maxCount} matchs selon son groupe.`];
  const avg = (minCount + maxCount) / 2 || 1;
  return { lines, perTeam: Math.max(avg, 1) };
}

function handleSimulationRequest() {
  if (!elements.simulationResult) return;
  const teams = getFinalTeamNames();
  if (teams.length < 2) {
    renderSimulationResult({
      error: `Ajoutez au moins deux ${formatParticipantLabel({ plural: true })} pour lancer la simulation.`,
    });
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
  const practiceType = getPracticeTypeFromMeta(meta);
  const singularParticipant = formatParticipantLabel({ practiceType });
  const singularParticipantTitle = formatParticipantLabel({ practiceType, capitalized: true });
  const pluralParticipants = formatParticipantLabel({ practiceType, plural: true });
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
  const fieldWord = formatFieldLabel({ practiceType });
  const perFieldLine = perFieldSentence ? `<p>Chaque ${fieldWord} accueillera environ ${perFieldSentence}.</p>` : '';
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
          <p>Chaque ${singularParticipant} jouera environ ${perTeamSentence}.</p>
          ${perFieldLine}
          <p>Temps de jeu moyen par ${singularParticipant} : ${timePerTeamLabel}.</p>
          <p>Durée totale estimée : ${durationMinutesLabel}.</p>
        `;
      } else {
        statusMarkup = `<p class="simulation-status alert">⚠ Le tournoi dépasse de ${deltaLabel}.</p>`;
        detailMarkup = `
          <p>Chaque ${singularParticipant} jouera environ ${perTeamSentence}.</p>
          ${perFieldLine}
          <p>Temps de jeu moyen par ${singularParticipant} : ${timePerTeamLabel}.</p>
        `;
        suggestionsHtml = `
          <div class="simulation-suggestions">
            <p>Solutions possibles :</p>
            <ul>
              <li>Réduire la durée des matchs</li>
              <li>Ajouter un terrain</li>
              <li>Réduire le nombre de ${pluralParticipants}</li>
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
        <span>Matchs par ${singularParticipantTitle}</span>
        <strong>${perTeamLabel}</strong>
      </div>
      <div class="simulation-metric">
        <span>Matchs par ${fieldWord}</span>
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

function handleQuickGenerate(event) {
  if (event) event.preventDefault();
  if (!elements.quickParticipants) return;
  const participants = clampNumber(Number(elements.quickParticipants.value) || state.participants, 2, 32, 8);
  const fields = clampNumber(Number(elements.quickFields.value) || state.options.fields, 1, 16, 2);
  const duration = clampNumber(Number(elements.quickDuration.value) || state.options.duration, 1, 60, 7);
  const startTime = elements.quickStartTime?.value || state.options.startTime;
  const practice = elements.quickPractice?.value || state.practiceType || 'sport-co';
  const quickRoles = {
    arbitre: Boolean(elements.quickRoleReferee?.checked),
    table: Boolean(elements.quickRoleTable?.checked),
    coach: false,
  };
  const quickRolesEnabled = quickRoles.arbitre || quickRoles.table || quickRoles.coach;
  state.practiceType = practice;
  state.participants = participants;
  state.options.fields = fields;
  state.options.duration = duration;
  state.options.startTime = startTime;
  state.options.matchMode = 'time';
  state.options.scoreTarget = state.options.scoreTarget ?? 11;
  state.options.roleSettings = {
    ...getRoleSettings(),
    enabled: quickRolesEnabled,
    arbitre: quickRolesEnabled ? quickRoles.arbitre : false,
    table: quickRolesEnabled ? quickRoles.table : false,
    coach: quickRolesEnabled ? quickRoles.coach : false,
    coachMode: quickRolesEnabled && quickRoles.coach ? 'self' : 'disabled',
  };
  state.teamNames = ensureTeamListLength([], participants, practice);
  updateTeamScreenCopy();
  updateCountScreenCopy();
  renderParticipants();
  buildTeamFields(participants);
  syncOptionInputs();
  persistState();
  const teams = getFinalTeamNames();
  if (teams.length < 2) {
    alert(`Ajoutez au moins deux ${formatParticipantLabel({ plural: true })} pour lancer la génération EPS.`);
    return;
  }
  const schedule = generateSchedule(teams, state.options);
  renderResults(schedule, { resetScores: true });
  goTo('results');
}

function handleRecommendationRequest() {
  if (!elements.recommendationResult) return;
  const teams = getFinalTeamNames();
  if (teams.length < 2) {
    renderRecommendationResult({
      error: `Ajoutez au moins deux ${formatParticipantLabel({ plural: true })} pour analyser une configuration.`,
    });
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

function syncScoreFieldVisibility() {
  if (!elements.matchDurationField || !elements.scoreTargetField) return;
  const mode = state.options.matchMode || 'time';
  const showScoreTarget = mode === 'score';
  elements.scoreTargetField.classList.toggle('hidden', !showScoreTarget);
}

function updateTeamScreenCopy() {
  const pluralLabel = formatParticipantLabel({ plural: true, capitalized: true });
  const singularLabel = formatParticipantLabel({ capitalized: true });
  if (elements.teamTitle) {
    elements.teamTitle.textContent = `Noms des ${pluralLabel}`;
  }
  if (elements.teamSubtitle) {
    elements.teamSubtitle.textContent = `Personnalisez chaque ${singularLabel.toLowerCase()}. Laissez vide pour garder un nom par défaut.`;
  }
  if (elements.teamBulkInput) {
    elements.teamBulkInput.placeholder = `${singularLabel} A\n${singularLabel} B\n${singularLabel} C`;
  }
  if (elements.teamTabButton) {
    elements.teamTabButton.textContent = `Par ${singularLabel}`;
  }
}

function updateCountScreenCopy() {
  if (!elements.countTitle) return;
  const neutralLabel = 'Nombre d’équipes / participants';
  const neutralAction = 'd’équipes / participants';
  elements.countTitle.textContent = neutralLabel;
  if (elements.countMinus) {
    elements.countMinus.setAttribute('aria-label', `Moins ${neutralAction}`);
  }
  if (elements.countPlus) {
    elements.countPlus.setAttribute('aria-label', `Plus ${neutralAction}`);
  }
  if (elements.teamCountSlider) {
    elements.teamCountSlider.setAttribute('aria-label', `Ajuster ${neutralAction}`);
  }
}

function updateRoleControlsState() {
  const settings = getRoleSettings();
  if (elements.roleToggle) {
    elements.roleToggle.checked = settings.enabled;
  }
  if (elements.roleOptions) {
    elements.roleOptions.classList.toggle('disabled', !settings.enabled);
  }
  if (elements.roleCheckboxes && elements.roleCheckboxes.length) {
    elements.roleCheckboxes.forEach(input => {
      const key = input.value;
      input.checked = settings[key];
      input.disabled = !settings.enabled;
    });
  }
  if (elements.coachRoleMode) {
    elements.coachRoleMode.value = settings.coachMode;
    const disabled = !settings.enabled || !settings.coach;
    elements.coachRoleMode.disabled = disabled;
    if (elements.coachModeRow) {
      elements.coachModeRow.classList.toggle('disabled', disabled);
    }
  }
  syncQuickRoleInputs(settings);
}

function syncQuickRoleInputs(settings = getRoleSettings()) {
  const enabled = Boolean(settings.enabled);
  if (elements.quickRoleReferee) {
    elements.quickRoleReferee.checked = enabled && Boolean(settings.arbitre);
  }
  if (elements.quickRoleTable) {
    elements.quickRoleTable.checked = enabled && Boolean(settings.table);
  }
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
  state.options.schedulingMode = defaults.schedulingMode;
  state.options.roleSettings = { ...DEFAULT_ROLE_SETTINGS };
  timerState.baseSeconds = state.options.duration * 60;
  if (elements.fieldCount) elements.fieldCount.value = state.options.fields;
  if (elements.matchDuration) elements.matchDuration.value = state.options.duration;
  if (elements.rotationBuffer) elements.rotationBuffer.value = state.options.turnaround;
  if (elements.breakDuration) elements.breakDuration.value = state.options.breakMinutes;
  if (elements.availableDuration) elements.availableDuration.value = state.options.availableDuration ?? '';
  if (elements.startTime) elements.startTime.value = state.options.startTime;
  if (elements.endTime) elements.endTime.value = state.options.endTime || '';
  if (elements.schedulingModeInputs && elements.schedulingModeInputs.length) {
    elements.schedulingModeInputs.forEach(input => {
      input.checked = input.value === state.options.schedulingMode;
    });
  }
  updateRoleControlsState();
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

function buildMatchListHTML(rotation, practiceType, roleAssignments) {
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
  return rotation.matches
    .map(match => {
      const participants = resolveMatchParticipants(match, state.schedule);
      const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
      match.id = matchId;
      const groupTag = match.groupLabel ? `<span class="match-group-label">${match.groupLabel}</span>` : '';
      const fieldText = match.field ? `${fieldLabel} ${match.field}` : 'Organisation en cours';
      const roles = renderRoleLines(roleAssignments?.get(matchId));
      return `
      <li>
        <div class="match-label">
          <span>${participants.home} - ${participants.away}</span>
          ${groupTag}
          <span class="field-label">${fieldText}</span>
        </div>
        <div class="score-inputs" aria-label="Score ${participants.home} ${participants.away}">
          <input type="number" min="0" inputmode="numeric" aria-label="Score ${participants.home}" data-rotation="${rotation.number}" data-match-id="${matchId}" data-score-input="home" value="${formatScoreValue(getScoreValue(matchId, 'home'))}" />
          <span>:</span>
          <input type="number" min="0" inputmode="numeric" aria-label="Score ${participants.away}" data-rotation="${rotation.number}" data-match-id="${matchId}" data-score-input="away" value="${formatScoreValue(getScoreValue(matchId, 'away'))}" />
        </div>
        ${roles || ''}
      </li>`;
    })
    .join('');
}

function buildFieldsGridHTML(rotation, practiceType, roleAssignments) {
  return rotation.fieldAssignments
    .map((field, index) => {
      const fieldTitle = formatFieldLabel({ practiceType, capitalized: true });
      const header = `${fieldTitle} ${index + 1}`;
      const items = field.matches.length
        ? field.matches
            .map(m => {
              const participants = resolveMatchParticipants(m, state.schedule);
              const groupTag = m.groupLabel ? `<span class="match-group-inline">${m.groupLabel}</span>` : '';
              const matchId = m.id || buildMatchKey(rotation.number, participants.home, participants.away);
              const roles = renderRoleLines(roleAssignments?.get(matchId));
              return `<li>${participants.home} - ${participants.away} ${groupTag}${roles || ''}</li>`;
            })
            .join('')
        : '<li>Aucun match</li>';
      return `<div class="field-card"><h4>${header}</h4><ul>${items}</ul></div>`;
    })
    .join('');
}

function buildRestBadgesHTML(rotation, practiceType, roleAssignments) {
  const waiting = filterRestTeams(rotation.byes || [], roleAssignments);
  if (!waiting.length) return '';
  const badges = waiting.map(team => `<span class="rest-badge">${team}</span>`).join('');
  const pluralLabel = formatParticipantLabel({ practiceType, plural: true, capitalized: true });
  return `<div class="rest-badges" aria-label="${pluralLabel} au repos">${badges}</div>`;
}

function renderRotationView(rotations) {
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  elements.rotationView.innerHTML = rotations
    .map(rotation => {
      const roleAssignments = computeRoleAssignments(rotation);
      const matches = buildMatchListHTML(rotation, practiceType, roleAssignments);
      const byes = buildRestBadgesHTML(rotation, practiceType, roleAssignments);
      const fieldsGrid = buildFieldsGridHTML(rotation, practiceType, roleAssignments);
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
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
  elements.teamView.innerHTML = teams
    .map(team => {
      const list = team.matches
        .map(entry => {
          const isBye = entry.bye;
          const label = isBye ? 'En attente' : entry.opponent;
          const badge = entry.group ? `${entry.group}` : entry.phase === 'finals' ? 'Phase finale' : 'Rotation';
          const details = isBye
            ? `${badge} ${entry.rotation}`
            : `${badge} ${entry.rotation}${entry.field ? ` · ${fieldLabel} ${entry.field}` : ''}${
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
  const practiceType = getPracticeTypeFromMeta(schedule.meta);
  const columnLabel = formatParticipantLabel({ practiceType, capitalized: true });
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
                <th>${columnLabel}</th>
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
  const practiceType = getPracticeTypeFromMeta(schedule.meta);
  const columnLabel = formatParticipantLabel({ practiceType, capitalized: true });
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
                <th>${columnLabel}</th>
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
    if (elements.liveRankingTitle) {
      elements.liveRankingTitle.textContent = 'Pos · Équipe · Pts';
    }
    return;
  }
  const practiceType = getPracticeTypeFromMeta(state.schedule.meta);
  const columnLabel = formatParticipantLabel({ practiceType, capitalized: true });
  if (elements.liveRankingTitle) {
    elements.liveRankingTitle.textContent = `Pos · ${columnLabel} · Pts`;
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
          <th>${columnLabel}</th>
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
  const confirmed = window.confirm(
    'Êtes-vous sûr de vouloir terminer le tournoi ? Les matchs non complétés resteront affichés comme incomplets.'
  );
  if (!confirmed) return;
  timerController.pause();
  const finalRotation =
    (state.schedule.meta && state.schedule.meta.rotationCount) || state.schedule.rotations.length || 1;
  showFinalRankingModal(finalRotation);
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
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const columnLabel = formatParticipantLabel({ practiceType, capitalized: true });
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
          <th>${columnLabel}</th>
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
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const columnLabel = formatParticipantLabel({ practiceType, capitalized: true });
  const header = ['Pos', columnLabel, 'Points', 'Joués', 'G', 'N', 'P', 'BP', 'BC', 'Diff'].join(';');
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
    renderLiveFieldBoard(null);
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
    renderLiveFieldBoard(null);
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
  const roleAssignments = computeRoleAssignments(rotation);
  elements.liveRotationContent.innerHTML = buildLiveMatchCards(rotation, roleAssignments);
  renderLiveFieldBoard(rotation, roleAssignments);
  renderLiveRest(rotation.byes, roleAssignments);
  renderNextRotationPreview();
  renderLiveRankingPanel(rotation.number);
  highlightRotation(rotation.number);
  updateLiveControls();
  if (elements.liveModeToggle) {
    elements.liveModeToggle.textContent = 'Mode projection';
  }
  renderChronoScreen();
  renderProjectionScreen();
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
  if (meta.fieldCount) {
    const fieldLabel = formatFieldLabel({
      practiceType: getPracticeTypeFromMeta(meta),
      plural: meta.fieldCount > 1,
      capitalized: true,
    });
    parts.push(`${meta.fieldCount} ${fieldLabel}`);
  }
  elements.liveMeta.textContent = parts.join(' • ');
}

function buildLiveMatchCards(rotation, roleAssignments) {
  if (!rotation.matches.length) {
    return '<p class="live-empty">Aucun match prévu pour cette rotation.</p>';
  }
  return rotation.matches.map(match => buildLiveMatchCard(rotation, match, roleAssignments)).join('');
}

function buildLiveMatchCard(rotation, match, roleAssignments) {
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
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
  if (match.field) parts.push(`${fieldLabel} ${match.field}`);
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
  const roleLines = renderRoleLines(roleAssignments?.get(matchId));
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
      ${roleLines || ''}
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

function renderLiveRest(byes = [], roleAssignments) {
  if (!elements.liveRestNotice) return;
  const waiting = filterRestTeams(byes || [], roleAssignments);
  const roleTeams = collectRoleTeams(roleAssignments);
  const hasWaiting = waiting.length > 0;
  const hasRoles = roleTeams.arbitre.length || roleTeams.table.length || roleTeams.coach.length;
  if (!hasWaiting && !hasRoles) {
    elements.liveRestNotice.classList.add('hidden');
    elements.liveRestNotice.textContent = '';
    return;
  }
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const waitingLabel = waiting.length > 1
    ? `${formatParticipantLabel({ practiceType, plural: true, capitalized: true })} en attente`
    : `${formatParticipantLabel({ practiceType, capitalized: true })} en attente`;
  const waitingBlock = hasWaiting ? `<strong>${waitingLabel} :</strong> ${waiting.join(', ')}` : '';
  const roleBlock = buildRoleSummaryMarkup(roleTeams);
  const hintBlock = buildRestRoleHint();
  elements.liveRestNotice.innerHTML = `${waitingBlock}${roleBlock}${hintBlock}`;
  elements.liveRestNotice.classList.remove('hidden');
}

function computeRoleAssignments(rotation) {
  if (!rotation || !state.schedule) return null;
  const settings = getRoleSettings();
  if (!settings.enabled) return null;
  const matches = rotation.matches.map(match => {
    const participants = resolveMatchParticipants(match, state.schedule);
    const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
    match.id = matchId;
    return { participants, id: matchId };
  });
  if (!matches.length) return null;
  const assignments = new Map();
  const restPool = Array.isArray(rotation.byes) ? [...rotation.byes] : [];
  const usedTeams = new Set();
  const takeRestTeam = () => {
    if (!restPool.length) return null;
    let index = restPool.findIndex(team => !usedTeams.has(team));
    if (index === -1) index = 0;
    const [team] = restPool.splice(index, 1);
    usedTeams.add(team);
    return team;
  };
  const attachRole = (matchId, key, value) => {
    if (!value) return;
    const bucket = assignments.get(matchId) || {};
    bucket[key] = value;
    assignments.set(matchId, bucket);
  };
  const restRoleOrder = [];
  if (settings.arbitre) restRoleOrder.push({ key: 'arbitre', offset: 0 });
  if (settings.table) restRoleOrder.push({ key: 'table', offset: 1 });
  if (settings.coach && settings.coachMode === 'rest') restRoleOrder.push({ key: 'coach', offset: 2 });
  restRoleOrder.forEach(role => {
    if (!restPool.length) return;
    let pointer = role.offset % matches.length;
    for (let assigned = 0; assigned < matches.length && restPool.length; assigned += 1) {
      const entry = matches[pointer];
      const team = takeRestTeam();
      if (!team) break;
      if (role.key === 'coach') {
        attachRole(entry.id, 'coach', { mode: 'rest', team });
      } else {
        attachRole(entry.id, role.key, team);
      }
      pointer = (pointer + 1) % matches.length;
    }
  });
  if (settings.coach && settings.coachMode === 'self') {
    matches.forEach(entry => {
      attachRole(entry.id, 'coach', { mode: 'self', teams: [entry.participants.home, entry.participants.away] });
    });
  }
  return assignments.size ? assignments : null;
}

function collectRoleTeams(roleAssignments) {
  const buckets = {
    arbitre: [],
    table: [],
    coach: [],
  };
  if (!roleAssignments || !roleAssignments.size) return buckets;
  roleAssignments.forEach(roleData => {
    if (roleData.arbitre) buckets.arbitre.push(roleData.arbitre);
    if (roleData.table) buckets.table.push(roleData.table);
    if (roleData.coach) {
      if (roleData.coach.mode === 'self' && Array.isArray(roleData.coach.teams)) {
        roleData.coach.teams.forEach(team => buckets.coach.push(team));
      } else if (roleData.coach.team) {
        buckets.coach.push(roleData.coach.team);
      }
    }
  });
  return {
    arbitre: Array.from(new Set(buckets.arbitre)),
    table: Array.from(new Set(buckets.table)),
    coach: Array.from(new Set(buckets.coach)),
  };
}

function filterRestTeams(base = [], roleAssignments) {
  if (!roleAssignments || !roleAssignments.size) return base;
  const roleTeams = new Set();
  roleAssignments.forEach(roleData => {
    if (roleData.arbitre) roleTeams.add(roleData.arbitre);
    if (roleData.table) roleTeams.add(roleData.table);
    if (roleData.coach) {
      if (roleData.coach.mode === 'self' && Array.isArray(roleData.coach.teams)) {
        roleData.coach.teams.forEach(team => roleTeams.add(team));
      } else if (roleData.coach.team) {
        roleTeams.add(roleData.coach.team);
      }
    }
  });
  return base.filter(team => !roleTeams.has(team));
}

function buildRoleSummaryMarkup(roleTeams) {
  if (!roleTeams) return '';
  const parts = [];
  if (roleTeams.arbitre.length) {
    parts.push(`<span class="rest-role-line"><strong>${ROLE_LABELS.arbitre} :</strong> ${roleTeams.arbitre.join(', ')}</span>`);
  }
  if (roleTeams.table.length) {
    parts.push(`<span class="rest-role-line"><strong>${ROLE_LABELS.table} :</strong> ${roleTeams.table.join(', ')}</span>`);
  }
  if (roleTeams.coach.length) {
    parts.push(`<span class="rest-role-line"><strong>${ROLE_LABELS.coach} :</strong> ${roleTeams.coach.join(', ')}</span>`);
  }
  return parts.length ? `<div class="rest-role-summary">${parts.join('')}</div>` : '';
}

function renderRoleLines(roleData) {
  if (!roleData || !Object.keys(roleData).length) return '';
  const parts = [];
  if (roleData.arbitre) {
    parts.push(`<span class="role-line"><span class="role-chip">${ROLE_LABELS.arbitre}</span>${roleData.arbitre}</span>`);
  }
  if (roleData.table) {
    parts.push(`<span class="role-line"><span class="role-chip">${ROLE_LABELS.table}</span>${roleData.table}</span>`);
  }
  if (roleData.coach) {
    if (roleData.coach.mode === 'self' && Array.isArray(roleData.coach.teams)) {
      parts.push(
        `<span class="role-line"><span class="role-chip">${ROLE_LABELS.coach}</span>${roleData.coach.teams.join(
          ' / '
        )}</span>`
      );
    } else if (roleData.coach.team) {
      parts.push(
        `<span class="role-line"><span class="role-chip">${ROLE_LABELS.coach}</span>${roleData.coach.team}</span>`
      );
    }
  }
  return parts.length ? `<div class="role-lines">${parts.join('')}</div>` : '';
}

function renderLiveFieldBoard(rotation, roleAssignments) {
  if (!elements.liveFieldBoard) return;
  if (!rotation || !rotation.matches || !rotation.matches.length) {
    const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
    const pluralFields = formatFieldLabel({ practiceType, plural: true });
    elements.liveFieldBoard.innerHTML = `<p class="live-board-empty">Aucun match sur les ${pluralFields} pour cette rotation.</p>`;
    return;
  }
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
  const board = new Map();
  rotation.matches.forEach(match => {
    const participants = resolveMatchParticipants(match, state.schedule);
    const key = match.field ? `${fieldLabel} ${match.field}` : 'À affecter';
    if (!board.has(key)) board.set(key, []);
    const groupTag = match.groupLabel ? match.groupLabel : rotation.groupLabel;
    const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
    const roles = renderRoleLines(roleAssignments?.get(matchId));
    board.get(key).push({
      label: `${participants.home} vs ${participants.away}`,
      group: groupTag,
      roles,
    });
  });
  const cards = Array.from(board.entries())
    .sort((a, b) => {
      const extract = key => {
        const match = key.match(/(\d+)/);
        return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
      };
      return extract(a[0]) - extract(b[0]);
    })
    .map(([key, list]) => {
      const lines = list
        .map(entry => {
          const groupLine = entry.group ? `<span class="match-group-inline">${entry.group}</span>` : '';
          return `<div class="field-match-line"><p>${entry.label} ${groupLine}</p>${entry.roles || ''}</div>`;
        })
        .join('');
      return `<article><h4>${key}</h4>${lines}</article>`;
    })
    .join('');
  elements.liveFieldBoard.innerHTML = cards;
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
  const practiceType = getPracticeTypeFromMeta(state.schedule.meta);
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
  const roleAssignments = computeRoleAssignments(nextRotation);
  const cards = nextRotation.matches.length
    ? nextRotation.matches
        .map(match => {
          const participants = resolveMatchParticipants(match, state.schedule);
          const meta = match.field ? `${fieldLabel} ${match.field}` : 'Organisation en cours';
          const groupLabel = match.groupLabel || nextRotation.groupLabel;
          const roles = renderRoleLines(roleAssignments?.get(match.id || buildMatchKey(nextRotation.number, participants.home, participants.away)));
          return `
            <article class="live-next-card">
              ${groupLabel ? `<span class="eyebrow">${groupLabel}</span>` : ''}
              <span class="meta">${meta}</span>
              <strong>${participants.home}</strong>
              <span class="vs">vs</span>
              <strong>${participants.away}</strong>
              ${roles}
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
  const roleAssignments = computeRoleAssignments(rotation);
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
      ? rotation.matches.map(match => buildChronoMatchSnapshot(rotation, match, roleAssignments)).join('')
      : '<p class="chrono-empty">Aucun match planifié pour cette rotation.</p>';
  }
  const byes = Array.isArray(rotation.byes) ? rotation.byes : [];
  if (elements.chronoRest) {
    const waiting = filterRestTeams(byes, roleAssignments);
    const roleTeams = collectRoleTeams(roleAssignments);
    const hasRoles = Boolean(roleTeams.arbitre.length || roleTeams.table.length || roleTeams.coach.length);
    if (waiting.length || hasRoles) {
      const waitingLine = waiting.length
        ? `<span class="rest-waiting-line"><strong>Équipes en attente :</strong> ${waiting.join(', ')}</span>`
        : '<span class="rest-waiting-line"><strong>Aucune équipe en attente.</strong></span>';
      const roleSummary = hasRoles ? buildRoleSummaryMarkup(roleTeams) : '';
      const hintText = hasRoles ? buildRestRoleHint() : '';
      const hint = hintText ? `<span class="rest-role-hint">${hintText}</span>` : '';
      elements.chronoRest.innerHTML = `${waitingLine}${roleSummary}${hint}`;
      elements.chronoRest.classList.remove('hidden');
    } else {
      elements.chronoRest.classList.add('hidden');
      elements.chronoRest.textContent = '';
    }
  }
  setChronoNextAvailability(Boolean(!isLast && isComplete));
}

function openProjectionScreen() {
  if (!state.schedule) return;
  renderProjectionScreen();
  goTo('projection');
}

function renderProjectionScreen() {
  if (!elements.projectionRotation || !elements.projectionFields) return;
  if (!state.schedule || !state.schedule.rotations.length) {
    elements.projectionRotation.textContent = 'Rotation -- / --';
    elements.projectionFields.innerHTML = '<p class="projection-empty">Générez un planning pour activer la projection.</p>';
    if (elements.projectionNext) {
      elements.projectionNext.innerHTML = '';
      elements.projectionNext.classList.add('hidden');
    }
    if (elements.projectionRest) {
      elements.projectionRest.innerHTML = '';
      elements.projectionRest.classList.add('hidden');
    }
    return;
  }
  const rotation = state.schedule.rotations[state.liveRotationIndex] || state.schedule.rotations[0];
  const total = state.schedule.meta.rotationCount || state.schedule.rotations.length;
  const practiceType = getPracticeTypeFromMeta(state.schedule.meta);
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
  const roleAssignments = computeRoleAssignments(rotation);
  const rotationLabel = rotation.groupLabel
    ? `${rotation.groupLabel} · Rotation ${rotation.number}`
    : `Rotation ${rotation.number}`;
  elements.projectionRotation.textContent = `${rotationLabel} / ${total}`;
  if (rotation.matches.length) {
    const board = new Map();
    rotation.matches.forEach(match => {
      const participants = resolveMatchParticipants(match, state.schedule);
      const key = match.field ? `${fieldLabel} ${match.field}` : 'À affecter';
      if (!board.has(key)) board.set(key, []);
      const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
      match.id = matchId;
      const roles = renderRoleLines(roleAssignments?.get(matchId));
      const groupTag = match.groupLabel || rotation.groupLabel;
      const meta = groupTag ? `<span>${groupTag}</span>` : '';
      board
        .get(key)
        .push(
          `<div class="projection-match"><p>${participants.home} vs ${participants.away}${meta}</p>${roles || ''}</div>`
        );
    });
    const cards = Array.from(board.entries())
      .sort((a, b) => {
        const extract = value => {
          const match = value.match(/(\d+)/);
          return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
        };
        return extract(a[0]) - extract(b[0]);
      })
      .map(
        ([label, lines]) => `
          <article class="projection-field in-play">
            <div class="projection-field-head">
              <h3>${label}</h3>
              <span class="state-pill live">En jeu</span>
            </div>
            ${lines.join('')}
          </article>
        `
      )
      .join('');
    elements.projectionFields.innerHTML = cards;
  } else {
    elements.projectionFields.innerHTML = '<p class="projection-empty">Aucun match pour cette rotation.</p>';
  }
  if (elements.projectionNext) {
    const next = state.schedule.rotations[state.liveRotationIndex + 1];
    if (next) {
      const nextLabel = next.groupLabel ? `${next.groupLabel} · Rotation ${next.number}` : `Rotation ${next.number}`;
      const nextAssignments = computeRoleAssignments(next);
      const list = next.matches.length
        ? next.matches
            .map(match => {
              const participants = resolveMatchParticipants(match, state.schedule);
              const matchId = match.id || buildMatchKey(next.number, participants.home, participants.away);
              match.id = matchId;
              const slot = match.field ? `${fieldLabel} ${match.field}` : 'À organiser';
              const groupTag = match.groupLabel || next.groupLabel;
              const roles = renderRoleLines(nextAssignments?.get(matchId));
              const meta = groupTag ? `${groupTag} · ${slot}` : slot;
              return `<div class="projection-next-card"><span class="meta">${meta}</span><strong>${participants.home}</strong><span class="vs">vs</span><strong>${participants.away}</strong>${roles || ''}</div>`;
            })
            .join('')
        : '<p class="projection-empty">Prochaine rotation en préparation.</p>';
      elements.projectionNext.innerHTML = `
        <header>
          <div class="projection-section-meta">
            <h4>Prochaine rotation</h4>
            <span>${nextLabel} / ${total}</span>
          </div>
          <span class="state-pill next">À venir</span>
        </header>
        <div class="projection-next-list">${list}</div>
      `;
      elements.projectionNext.classList.remove('hidden');
    } else {
      elements.projectionNext.innerHTML = '';
      elements.projectionNext.classList.add('hidden');
    }
  }
  if (elements.projectionRest) {
    const byes = Array.isArray(rotation.byes) ? rotation.byes : [];
    const waiting = filterRestTeams(byes, roleAssignments);
    const roleTeams = collectRoleTeams(roleAssignments);
    const hasRoles = Boolean(roleTeams.arbitre.length || roleTeams.table.length || roleTeams.coach.length);
    if (waiting.length || hasRoles) {
      const waitingList = waiting.length
        ? `<p class="rest-waiting-line"><strong>Équipes en attente :</strong></p><ul class="projection-await-list">${waiting
            .map(team => `<li>${team}</li>`)
            .join('')}</ul>`
        : '<p class="rest-waiting-line">Toutes les équipes sont mobilisées sur les rôles.</p>';
      const roleSummary = hasRoles ? buildRoleSummaryMarkup(roleTeams) : '';
      const hintText = hasRoles ? buildRestRoleHint() : '';
      const hint = hintText ? `<p class="rest-role-hint">${hintText}</p>` : '';
      const headerMeta = waiting.length ? `${waiting.length} disponible${waiting.length > 1 ? 's' : ''}` : 'Mobilisation complète';
      const stateLabel = waiting.length ? 'Disponibles' : 'Mobilisées';
      elements.projectionRest.innerHTML = `
        <header>
          <div class="projection-section-meta">
            <h4>Équipes hors match</h4>
            <span>${headerMeta}</span>
          </div>
          <span class="state-pill rest">${stateLabel}</span>
        </header>
        ${waitingList}
        ${roleSummary}
        ${hint}
      `;
      elements.projectionRest.classList.remove('hidden');
    } else {
      elements.projectionRest.innerHTML = '';
      elements.projectionRest.classList.add('hidden');
    }
  }
  if (elements.projectionTimer) {
    elements.projectionTimer.textContent = formatSeconds(timerState.remainingSeconds || timerState.baseSeconds);
  }
}

function closeProjectionScreen() {
  goTo('live');
  renderLiveRotation();
}

function buildChronoMatchSnapshot(rotation, match, roleAssignments) {
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
  const participants = resolveMatchParticipants(match, state.schedule);
  const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
  match.id = matchId;
  const homeScore = getScoreValue(matchId, 'home');
  const awayScore = getScoreValue(matchId, 'away');
  const hasScore = Number.isFinite(homeScore) && Number.isFinite(awayScore);
  const score = hasScore ? `${homeScore} - ${awayScore}` : '--';
  const details = [];
  if (match.field) details.push(`${fieldLabel} ${match.field}`);
  const groupLabel = match.groupLabel ? `${match.groupLabel} · ` : '';
  const label = `${groupLabel}${details.length ? details.join(' · ') : `Rotation ${rotation.number}`}`;
  const roles = renderRoleLines(roleAssignments?.get(matchId));
  return `
    <article class="chrono-match-card">
      <span class="label">${label}</span>
      <div class="teams">
        <strong>${participants.home}</strong>
        <span class="chrono-score">${score}</span>
        <strong>${participants.away}</strong>
      </div>
      ${roles || ''}
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
    elements.liveFinishBtn.disabled = !state.schedule;
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
  if (elements.projectionTimer) {
    elements.projectionTimer.textContent = formatted;
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
  const fieldCount = clampNumber(options.fields, 1, 16, 2);
  const rotations = [];
  let clock = parseTime(options.startTime);
  const rotationDuration = options.duration;
  let totalMatches = 0;
  let rotationNumber = 1;
  entries.forEach(entry => {
    const matches = entry.matches.map((match, index) => {
      const copy = { ...match };
      if (!copy.id) {
        const fallbackHome = copy.home || describeSeed(copy.seedHome, metaExtras.groups);
        const fallbackAway = copy.away || describeSeed(copy.seedAway, metaExtras.groups);
        const placeholderLabel = formatParticipantLabel({ practiceType: state.practiceType, capitalized: true });
        copy.id = buildMatchKey(
          rotationNumber,
          fallbackHome || `${placeholderLabel} ${index + 1}`,
          fallbackAway || `${placeholderLabel} ${index + 2}`
        );
      }
      return copy;
    });
    matches.forEach((match, matchIndex) => {
      match.field = (matchIndex % fieldCount) + 1;
      match.order = Math.floor(matchIndex / fieldCount) + 1;
      totalMatches += 1;
    });
    const slotCount = matches.reduce((max, match) => Math.max(max, match.order || 1), 1);
    for (let slot = 1; slot <= slotCount; slot += 1) {
      const slotMatches = matches
        .filter(match => match.order === slot)
        .map(match => ({ ...match, order: 1 }));
      if (!slotMatches.length) continue;
      const slotByes = buildSlotByes(entry.byes || [], matches, slot);
      const slotFields = Array.from({ length: fieldCount }, (_, fieldIndex) => ({
        label: `Terrain ${fieldIndex + 1}`,
        matches: slotMatches.filter(match => match.field === fieldIndex + 1),
      }));
      const startLabel = clock != null ? formatTime(clock) : null;
      const endLabel = clock != null ? formatTime(clock + rotationDuration) : null;
      rotations.push({
        number: rotationNumber,
        phase: entry.phase || 'single',
        groupId: entry.groupId || null,
        groupLabel: entry.groupLabel || null,
        title: `Rotation ${rotationNumber}`,
        matches: slotMatches,
        byes: slotByes,
        startLabel,
        durationLabel: `${rotationDuration} min${endLabel ? ` · fin ${endLabel}` : ''}`,
        fieldAssignments: slotFields,
      });
      rotationNumber += 1;
      if (clock != null) clock += rotationDuration;
    }
  });
  const meta = {
    teamCount: teams.length,
    rotationCount: rotations.length,
    matchCount: totalMatches,
    fieldCount,
    estimatedDuration: null,
    endTime: null,
    formatLabel: metaExtras.formatLabel,
    groupCount: metaExtras.groups ? metaExtras.groups.length : 0,
  };
  const schedule = {
    format: metaExtras.format,
    rotations,
    teams: [],
    meta,
    groups: metaExtras.groups || [],
    finals: metaExtras.finals || null,
  };
  const schedulingMode = options.schedulingMode === 'optimise_terrains' ? 'optimise_terrains' : 'pedagogique';
  schedule.meta.schedulingMode = schedulingMode;
  if (schedulingMode === 'optimise_terrains') {
    const optimizedRotations = buildOptimizedRotationsFromBaseline(schedule, teams, options);
    if (optimizedRotations && optimizedRotations.length) {
      schedule.rotations = optimizedRotations;
      schedule.meta.rotationCount = optimizedRotations.length;
    }
  }
  return schedule;
}

function buildOptimizedRotationsFromBaseline(schedule, teams, options) {
  const baseRotations = Array.isArray(schedule.rotations) ? schedule.rotations : [];
  if (!baseRotations.length) return null;
  const fieldCount = clampNumber(Number(options.fields) || 0, 1, 16, 1);
  if (!fieldCount) return null;
  const pending = [];
  baseRotations.forEach(rotation => {
    rotation.matches.forEach(match => {
      const clone = { ...match };
      const participants = resolveMatchParticipants(clone, schedule);
      const entry = {
        match: clone,
        meta: {
          phase: rotation.phase,
          title: rotation.title,
          groupId: rotation.groupId,
          groupLabel: match.groupLabel || rotation.groupLabel || null,
        },
        homeName: participants.home,
        awayName: participants.away,
      };
      clone.groupLabel = entry.meta.groupLabel;
      clone.field = null;
      clone.order = 1;
      pending.push(entry);
    });
  });
  if (!pending.length) return null;
  const teamSet = new Set();
  if (Array.isArray(teams)) {
    teams.forEach(name => {
      if (name) teamSet.add(name);
    });
  }
  pending.forEach(entry => {
    if (entry.homeName && entry.homeName !== 'Exempt') teamSet.add(entry.homeName);
    if (entry.awayName && entry.awayName !== 'Exempt') teamSet.add(entry.awayName);
  });
  const teamList = Array.from(teamSet).filter(Boolean).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  if (!teamList.length) return null;
  const remainingCounts = new Map(teamList.map(name => [name, 0]));
  const ensureCount = name => {
    if (!name || name === 'Exempt') return;
    if (!remainingCounts.has(name)) {
      remainingCounts.set(name, 0);
    }
  };
  pending.forEach(entry => {
    ensureCount(entry.homeName);
    ensureCount(entry.awayName);
    if (entry.homeName && entry.homeName !== 'Exempt') {
      remainingCounts.set(entry.homeName, (remainingCounts.get(entry.homeName) || 0) + 1);
    }
    if (entry.awayName && entry.awayName !== 'Exempt') {
      remainingCounts.set(entry.awayName, (remainingCounts.get(entry.awayName) || 0) + 1);
    }
  });
  const lastPlayed = new Map();
  const optimizedRotations = [];
  let rotationNumber = 1;
  let clock = parseTime(options.startTime);
  const duration = clampNumber(Number(options.duration) || 0, 1, 180, 12);
  while (pending.length) {
    const batch = selectOptimizedBatch(pending, fieldCount, lastPlayed, rotationNumber, remainingCounts);
    if (!batch.length) break;
    const playingTeams = new Set();
    batch.forEach(entry => {
      if (entry.homeName && entry.homeName !== 'Exempt') playingTeams.add(entry.homeName);
      if (entry.awayName && entry.awayName !== 'Exempt') playingTeams.add(entry.awayName);
    });
    const activeTeams = teamList.filter(team => {
      const remaining = remainingCounts.get(team) || 0;
      return remaining > 0 || playingTeams.has(team);
    });
    const byes = activeTeams.filter(team => !playingTeams.has(team));
    const startLabel = clock != null ? formatTime(clock) : null;
    const endLabel = clock != null ? formatTime(clock + duration) : null;
    const durationLabel = `${duration} min${endLabel ? ` · fin ${endLabel}` : ''}`;
    const fieldAssignments = Array.from({ length: fieldCount }, (_, index) => ({
      label: `Terrain ${index + 1}`,
      matches: [],
    }));
    batch.forEach((entry, idx) => {
      const match = entry.match;
      match.field = idx + 1;
      match.order = 1;
      fieldAssignments[idx].matches.push(match);
    });
    playingTeams.forEach(team => {
      if (!remainingCounts.has(team)) return;
      remainingCounts.set(team, Math.max(0, (remainingCounts.get(team) || 0) - 1));
      lastPlayed.set(team, rotationNumber);
    });
    const rotationPhase = derivePhaseFromBatch(batch);
    const rotationGroupLabel = deriveGroupLabelFromBatch(batch);
    const rotationTitle = deriveTitleFromBatch(batch, rotationNumber);
    optimizedRotations.push({
      number: rotationNumber,
      phase: rotationPhase,
      groupLabel: rotationGroupLabel,
      title: rotationTitle,
      matches: batch.map(entry => entry.match),
      byes,
      startLabel,
      durationLabel,
      fieldAssignments,
    });
    rotationNumber += 1;
    if (clock != null) clock += duration;
  }
  return optimizedRotations;
}

function selectOptimizedBatch(pending, fieldCount, lastPlayed, rotationNumber, remainingCounts) {
  const usedTeams = new Set();
  const batch = [];
  while (batch.length < fieldCount) {
    const candidateIndex = findOptimizedCandidateIndex(pending, usedTeams, lastPlayed, rotationNumber, remainingCounts);
    if (candidateIndex === -1) break;
    const [entry] = pending.splice(candidateIndex, 1);
    batch.push(entry);
    if (entry.homeName) usedTeams.add(entry.homeName);
    if (entry.awayName) usedTeams.add(entry.awayName);
  }
  if (!batch.length && pending.length) {
    batch.push(pending.shift());
  }
  return batch;
}

function findOptimizedCandidateIndex(pending, usedTeams, lastPlayed, rotationNumber, remainingCounts) {
  let bestIndex = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < pending.length; i += 1) {
    const entry = pending[i];
    const home = entry.homeName;
    const away = entry.awayName;
    if (!home || !away || home === 'Exempt' || away === 'Exempt') continue;
    if (usedTeams.has(home) || usedTeams.has(away)) continue;
    const score = scoreMatchCandidate(home, away, lastPlayed, rotationNumber, remainingCounts);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function scoreMatchCandidate(home, away, lastPlayed, rotationNumber, remainingCounts) {
  const homeGap = computeRestGap(lastPlayed.get(home), rotationNumber);
  const awayGap = computeRestGap(lastPlayed.get(away), rotationNumber);
  let score = Math.min(homeGap, 10) + Math.min(awayGap, 10);
  if (homeGap <= 1) score -= 4;
  if (awayGap <= 1) score -= 4;
  if (homeGap <= 0 || awayGap <= 0) score -= 50;
  const remaining =
    (remainingCounts.get(home) || 0) + (remainingCounts.get(away) || 0);
  score += remaining * 0.2;
  return score;
}

function computeRestGap(lastRotation, currentRotation) {
  if (lastRotation === undefined) return currentRotation + 5;
  return currentRotation - lastRotation;
}

function derivePhaseFromBatch(batch) {
  const phases = Array.from(new Set(batch.map(entry => entry.meta.phase).filter(Boolean)));
  if (phases.length === 1) return phases[0];
  return phases[0] || 'single';
}

function deriveGroupLabelFromBatch(batch) {
  const labels = Array.from(new Set(batch.map(entry => entry.meta.groupLabel).filter(Boolean)));
  return labels.length === 1 ? labels[0] : null;
}

function deriveTitleFromBatch(batch, rotationNumber) {
  const titles = Array.from(new Set(batch.map(entry => entry.meta.title).filter(Boolean)));
  if (titles.length === 1) return titles[0];
  return `Rotation ${rotationNumber}`;
}

function buildSlotByes(entryByes, matches, slot) {
  const resting = new Set(entryByes);
  matches.forEach(match => {
    if (match.order !== slot) {
      if (match.home) resting.add(match.home);
      if (match.away) resting.add(match.away);
    }
  });
  return Array.from(resting);
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

function ensureTeamListLength(list, length, practiceType = 'sport-co') {
  const fallbackLabel = formatParticipantLabel({ practiceType, capitalized: true });
  const current = [...list];
  while (current.length < length) {
    current.push(`${fallbackLabel} ${current.length + 1}`);
  }
  const slice = current.slice(0, length);
  return slice.map((name, index) => {
    const base = (typeof name === 'string' && name.trim()) || `${fallbackLabel} ${index + 1}`;
    return formatNameForPractice(base, practiceType, index, fallbackLabel);
  });
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
    practiceType: 'sport-co',
    participants: 8,
    teamNames: ensureTeamListLength([], 8, 'sport-co'),
    options: {
      fields: 2,
      duration: 12,
      startTime: '09:00',
      turnaround: 2,
      breakMinutes: 0,
      availableDuration: null,
      endTime: '',
      matchMode: 'time',
      scoreTarget: 11,
      timer: false,
      sound: true,
      vibration: true,
      schedulingMode: 'pedagogique',
      roleSettings: { ...DEFAULT_ROLE_SETTINGS },
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
  const allowedPractices = ['sport-co', 'raquette'];
  merged.practiceType = allowedPractices.includes(source.practiceType) ? source.practiceType : base.practiceType;
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
  const allowedSchedulingModes = ['pedagogique', 'optimise_terrains'];
  optionSource.schedulingMode = allowedSchedulingModes.includes(optionSource.schedulingMode)
    ? optionSource.schedulingMode
    : 'pedagogique';
  const legacyRoles = Array.isArray(optionSource.restRoles) ? optionSource.restRoles : null;
  const storedRoles = optionSource.roleSettings || {};
  const mergedRoles = {
    enabled:
      storedRoles.enabled ??
      (optionSource.restRolesEnabled !== undefined ? Boolean(optionSource.restRolesEnabled) : DEFAULT_ROLE_SETTINGS.enabled),
    arbitre:
      storedRoles.arbitre ??
      (legacyRoles ? legacyRoles.includes('arbitre') || legacyRoles.includes('observateur') : DEFAULT_ROLE_SETTINGS.arbitre),
    table:
      storedRoles.table ??
      (legacyRoles ? legacyRoles.includes('table') : DEFAULT_ROLE_SETTINGS.table),
    coach:
      storedRoles.coach ??
      (legacyRoles ? legacyRoles.includes('coach') : DEFAULT_ROLE_SETTINGS.coach),
    coachMode: storedRoles.coachMode || DEFAULT_ROLE_SETTINGS.coachMode,
  };
  if (!mergedRoles.coach) {
    mergedRoles.coachMode = 'disabled';
  } else if (!['self', 'rest'].includes(mergedRoles.coachMode)) {
    mergedRoles.coachMode = 'self';
  }
  optionSource.roleSettings = mergedRoles;
  delete optionSource.restRoles;
  delete optionSource.restRolesEnabled;
  merged.options = optionSource;
  const incomingNames = Array.isArray(source.teamNames) ? source.teamNames : base.teamNames;
  merged.teamNames = ensureTeamListLength(incomingNames, merged.participants, merged.practiceType);
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
