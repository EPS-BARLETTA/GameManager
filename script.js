const STORAGE_KEY = 'poule-suite-state-v1';
const STEP_ORDER = ['type', 'count', 'teams', 'options', 'results'];
const SCREEN_TO_STEP = {
  type: 'type',
  count: 'count',
  teams: 'teams',
  options: 'options',
  results: 'results',
};

function getMaxAccessibleStepIndex(screen = state.currentScreen) {
  if (state.schedule) return STEP_ORDER.length - 1;
  const stepKey = SCREEN_TO_STEP[screen];
  const activeIndex = STEP_ORDER.indexOf(stepKey);
  return activeIndex >= 0 ? activeIndex : -1;
}
const UNIVERSES = {
  sportco: {
    id: 'sportco',
    label: 'Sports collectifs',
    badge: 'Mode Sports collectifs',
    baseline: 'Handball · Basket · Futsal · Rugby à toucher',
    themeClass: 'theme-sportco',
    practiceType: 'sport-co',
    modeIds: ['sportco-championnat', 'sportco-worldcup'],
  },
  raquettes: {
    id: 'raquettes',
    label: 'Raquettes',
    badge: 'Mode Raquettes',
    baseline: 'Badminton · Tennis de table · Pickleball',
    themeClass: 'theme-raquettes',
    practiceType: 'raquette',
    modeIds: ['raquettes-poule', 'raquettes-montee-descente', 'raquettes-defi', 'raquettes-ronde-suisse'],
  },
};
const MODE_DEFINITIONS = {
  'sportco-championnat': {
    id: 'sportco-championnat',
    universe: 'sportco',
    label: 'Championnat',
    description: 'Toutes les équipes se rencontrent avec estimation du temps et rôles sociaux.',
    tournamentType: 'round-robin',
    practiceType: 'sport-co',
    badge: 'Championnat EPS',
  },
  'sportco-worldcup': {
    id: 'sportco-worldcup',
    universe: 'sportco',
    label: 'Coupe du monde',
    description: 'Phase de poules équilibrées puis phase finale automatique.',
    tournamentType: 'groups-finals',
    practiceType: 'sport-co',
    badge: 'Coupe du monde',
  },
  'raquettes-poule': {
    id: 'raquettes-poule',
    universe: 'raquettes',
    label: 'Poule',
    description: 'Tous les joueurs se rencontrent avec estimation du temps.',
    tournamentType: 'round-robin',
    practiceType: 'raquette',
    badge: 'Poule raquettes',
  },
  'raquettes-montee-descente': {
    id: 'raquettes-montee-descente',
    universe: 'raquettes',
    label: 'Montée-descente',
    description: 'Le gagnant monte, le perdant descend, arbitrage configurable.',
    tournamentType: 'ladder',
    practiceType: 'raquette',
    badge: 'Montée / descente',
  },
  'raquettes-defi': {
    id: 'raquettes-defi',
    universe: 'raquettes',
    label: 'Défi',
    description: 'Classement vivant avec défis dans une fenêtre configurable de positions.',
    tournamentType: 'challenge',
    practiceType: 'raquette',
    badge: 'Mode Défi',
  },
  'raquettes-ronde-suisse': {
    id: 'raquettes-ronde-suisse',
    universe: 'raquettes',
    label: 'Ronde Suisse',
    description: 'Appariement par niveau de points, idéal pour classer rapidement sans élimination.',
    tournamentType: 'swiss',
    practiceType: 'raquette',
    badge: 'Ronde Suisse',
  },
};
const TOURNAMENT_MODES = {
  'round-robin': { label: 'Poule unique' },
  groups: { label: 'Groupes' },
  'groups-finals': { label: 'Groupes + finales' },
  ladder: { label: 'Montée-descente' },
  challenge: { label: 'Défi' },
  swiss: { label: 'Ronde Suisse' },
};
const STATUS_TYPES = {
  active: { key: 'active', label: 'Actif', cssClass: 'status-active' },
  unavailable: { key: 'unavailable', label: 'Indisponible', cssClass: 'status-unavailable' },
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
  arbitre: false,
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

function getFieldLabels(practiceType = state.practiceType || 'sport-co') {
  const map = {
    'sport-co': { singular: 'terrain', plural: 'terrains' },
    raquette: { singular: 'terrain', plural: 'terrains' },
  };
  return map[practiceType] || map['sport-co'];
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

function getUniverseDefinition(universeId) {
  return UNIVERSES[universeId] || null;
}

function getModeDefinition(modeId) {
  return MODE_DEFINITIONS[modeId] || null;
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
  ].map(name => name.toLowerCase())
);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  'modeParticipantsInput',
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
  landingSportcoBtn: document.getElementById('landingSportcoBtn'),
  landingRaquettesBtn: document.getElementById('landingRaquettesBtn'),
  resumeFlow: document.getElementById('resumeFlow'),
  landingSessionsList: document.getElementById('landingSessionsList'),
  landingSessionsHint: document.getElementById('landingSessionsHint'),
  challengeClassSelect: document.getElementById('challengeClassSelect'),
  challengeClassCreateBtn: document.getElementById('challengeClassCreateBtn'),
  challengeClassResumeBtn: document.getElementById('challengeClassResumeBtn'),
  challengeClassManagerHint: document.getElementById('challengeClassManagerHint'),
  toolsImportJsonBtn: document.getElementById('toolsImportJsonBtn'),
  toolsImportJsonBtnLanding: document.getElementById('toolsImportJsonBtnLanding'),
  toolsExportJsonBtn: document.getElementById('toolsExportJsonBtn'),
  toolsExportCsvBtn: document.getElementById('toolsExportCsvBtn'),
  toolsJsonImportFile: document.getElementById('toolsJsonImportFile'),
  sessionSaveFeedback: document.getElementById('sessionSaveFeedback'),
  quickModeBtn: document.getElementById('quickModeBtn'),
  openHelpFromLanding: document.getElementById('openHelpFromLanding'),
  quickForm: document.getElementById('quickForm'),
  quickParticipants: document.getElementById('quickParticipants'),
  quickFields: document.getElementById('quickFields'),
  quickDuration: document.getElementById('quickDuration'),
  quickStartTime: document.getElementById('quickStartTime'),
  quickPractice: document.getElementById('quickPractice'),
  quickRoleReferee: document.getElementById('quickRoleReferee'),
  quickRoleTable: document.getElementById('quickRoleTable'),
  quickGenerateBtn: document.getElementById('quickGenerateBtn'),
  modeCardsGrid: document.getElementById('modeCardsGrid'),
  modeScreenTitle: document.getElementById('modeScreenTitle'),
  modeScreenSubtitle: document.getElementById('modeScreenSubtitle'),
  modeStepEyebrow: document.getElementById('modeStepEyebrow'),
  modeFootnote: document.getElementById('modeFootnote'),
  modeNextBtn: document.getElementById('modeNextBtn'),
  modeOptionsEyebrow: document.getElementById('modeOptionsEyebrow'),
  modeOptionsTitle: document.getElementById('modeOptionsTitle'),
  modeOptionsDescription: document.getElementById('modeOptionsDescription'),
  modePracticeChip: document.getElementById('modePracticeChip'),
  modeParticipantsInput: document.getElementById('modeParticipantsInput'),
  modeParticipantsLabel: document.getElementById('modeParticipantsLabel'),
  modeFieldBlocks: document.querySelectorAll('[data-mode-field]'),
  toolsToggle: document.getElementById('toolsToggle'),
  toolsMenu: document.getElementById('toolsMenu'),
  navButtons: document.querySelectorAll('[data-nav]'),
  printTopBtn: document.getElementById('printTopBtn'),
  universeBadge: document.getElementById('universeBadge'),
  modeBadge: document.getElementById('modeBadge'),
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
  teamRankingImport: document.getElementById('teamRankingImport'),
  fieldCount: document.getElementById('fieldCount'),
  matchDuration: document.getElementById('matchDuration'),
  startTime: document.getElementById('startTime'),
  rotationBuffer: document.getElementById('rotationBuffer'),
  breakDuration: document.getElementById('breakDuration'),
  availableDuration: document.getElementById('availableDuration'),
  availableDurationField: document.getElementById('availableDurationField'),
  endTime: document.getElementById('endTime'),
  endTimeField: document.getElementById('endTimeField'),
  schedulingModeField: document.getElementById('schedulingModeField'),
  schedulingModeInputs: document.querySelectorAll('input[name="schedulingMode"]'),
  practiceTypeSelect: document.getElementById('practiceType'),
  matchModeSelect: document.getElementById('matchMode'),
  scoreTargetInput: document.getElementById('scoreTarget'),
  matchDurationField: document.getElementById('matchDurationField'),
  scoreTargetField: document.getElementById('scoreTargetField'),
  worldCupGroupCount: document.getElementById('worldCupGroupCount'),
  ladderSettings: document.getElementById('ladderSettings'),
  ladderModeSwitch: document.getElementById('ladderModeSwitch'),
  ladderModeButtons: document.querySelectorAll('[data-ladder-mode]'),
  ladderModeHelp: document.getElementById('ladderModeHelp'),
  ladderSessionModeSwitch: document.getElementById('ladderSessionModeSwitch'),
  ladderSessionModeButtons: document.querySelectorAll('[data-ladder-session-mode]'),
  ladderSessionModeHelp: document.getElementById('ladderSessionModeHelp'),
  ladderRotationLimitField: document.getElementById('ladderRotationLimitField'),
  ladderRotationLimit: document.getElementById('ladderRotationLimit'),
  ladderCourtModeSwitch: document.getElementById('ladderCourtModeSwitch'),
  ladderCourtModeButtons: document.querySelectorAll('[data-ladder-court-mode]'),
  ladderCourtModeHelp: document.getElementById('ladderCourtModeHelp'),
  ladderRefereePlacementField: document.getElementById('ladderRefereePlacementField'),
  ladderRefereePlacement: document.getElementById('ladderRefereePlacement'),
  ladderManualPlacementField: document.getElementById('ladderManualPlacementField'),
  ladderManualPlacementGrid: document.getElementById('ladderManualPlacementGrid'),
  ladderSummaryCard: document.getElementById('ladderSummaryCard'),
  ladderRefereeField: document.getElementById('ladderRefereeField'),
  ladderFreeField: document.getElementById('ladderFreeField'),
  ladderRefereeCourts: document.getElementById('ladderRefereeCourts'),
  ladderFreeCourts: document.getElementById('ladderFreeCourts'),
  simulateBtn: document.getElementById('simulateBtn'),
  simulationResult: document.getElementById('simulationResult'),
  resetOptionsBtn: document.getElementById('resetOptionsBtn'),
  resultsProjectionBtn: document.getElementById('resultsProjectionBtn'),
  resultsChronoBtn: document.getElementById('resultsChronoBtn'),
  contextTabs: document.getElementById('contextTabs'),
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
  saveSessionBtn: document.getElementById('saveSessionBtn'),
  resetAppBtn: document.getElementById('resetAppBtn'),
  rotationView: document.getElementById('rotationView'),
  teamView: document.getElementById('teamView'),
  rankingView: document.getElementById('rankingView'),
  resultsScreen: document.querySelector('.screen[data-screen="results"]'),
  resultsModeSwitch: document.getElementById('resultsModeSwitch'),
  resultsModeButtons: document.querySelectorAll('[data-results-mode-target]'),
  resultsModeNote: document.getElementById('resultsModeNote'),
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
  liveCurrentRotationCard: document.getElementById('liveCurrentRotationCard'),
  liveCurrentRotationBtn: document.getElementById('liveCurrentRotationBtn'),
  liveRotationContent: document.getElementById('liveRotationContent'),
  currentRotationMatchesAnchor: document.getElementById('currentRotationMatchesAnchor'),
  liveFieldBoard: document.getElementById('liveFieldBoard'),
  liveLadderSecondary: document.getElementById('liveLadderSecondary'),
  liveScorePanel: document.getElementById('liveScorePanel'),
  liveShell: document.getElementById('liveShell'),
  liveActionsToggle: document.getElementById('liveActionsToggle'),
  liveActionsPanel: document.getElementById('liveActionsPanel'),
  liveChronoBtn: document.getElementById('liveChronoBtn'),
  liveRankingPanel: document.getElementById('liveRankingPanel'),
  liveRankingTable: document.getElementById('liveRankingTable'),
  liveRankingTitle: document.getElementById('liveRankingTitle'),
  liveRestNotice: document.getElementById('liveRestNotice'),
  liveScoreEyebrow: document.getElementById('liveScoreEyebrow'),
  liveScoreTitle: document.getElementById('liveScoreTitle'),
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
  finalSessionSavePanel: document.getElementById('finalSessionSavePanel'),
  finalRankingCloseBtn: document.getElementById('finalRankingCloseBtn'),
  finalRankingCsvBtn: document.getElementById('finalRankingCsvBtn'),
  finalRankingOkBtn: document.getElementById('finalRankingOkBtn'),
  finalRankingLiveBtn: document.getElementById('finalRankingLiveBtn'),
  rankingButtons: document.querySelectorAll('[data-open-ranking]'),
  rankingModal: document.getElementById('rankingModal'),
  rankingModalBody: document.getElementById('rankingModalBody'),
  rankingModalClose: document.getElementById('rankingModalClose'),
  ladderPilotModal: document.getElementById('ladderPilotModal'),
  ladderPilotTitle: document.getElementById('ladderPilotTitle'),
  ladderPilotMeta: document.getElementById('ladderPilotMeta'),
  ladderPilotBody: document.getElementById('ladderPilotBody'),
  ladderPilotCloseBtn: document.getElementById('ladderPilotCloseBtn'),
  ladderPilotBackBtn: document.getElementById('ladderPilotBackBtn'),
  ladderPilotSaveBtn: document.getElementById('ladderPilotSaveBtn'),
  ladderPilotNextBtn: document.getElementById('ladderPilotNextBtn'),
  ladderPilotFinishBtn: document.getElementById('ladderPilotFinishBtn'),
  ladderPilotRankingBtn: document.getElementById('ladderPilotRankingBtn'),
  swissPilotScreen: document.getElementById('swissPilotScreen'),
  swissPilotTitle: document.getElementById('swissPilotTitle'),
  swissPilotMeta: document.getElementById('swissPilotMeta'),
  swissPilotBody: document.getElementById('swissPilotBody'),
  swissPilotCloseBtn: document.getElementById('swissPilotCloseBtn'),
  swissPilotBackBtn: document.getElementById('swissPilotBackBtn'),
  swissPilotSaveBtn: document.getElementById('swissPilotSaveBtn'),
  swissPilotExportBtn: document.getElementById('swissPilotExportBtn'),
  challengeModal: document.getElementById('challengeModal'),
  challengeForm: document.getElementById('challengeForm'),
  challengeDialogInfo: document.getElementById('challengeDialogInfo'),
  statusBtn: document.getElementById('statusBtn'),
  statusModal: document.getElementById('statusModal'),
  statusModalClose: document.getElementById('statusModalClose'),
  statusList: document.getElementById('statusList'),
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
  projectionRanking: document.getElementById('projectionRanking'),
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
const uiState = {
  resultsMode: 'read',
};
let latestRecommendation = null;
let recommendationApplied = false;
let resetFeedbackTimeout = null;
let _challengeAutoReset = null;
let _challengeSelectedId = null;
let challengeEditContext = null;
let rankingReturnScreen = null;
let sessionSaveFeedbackTimeout = null;
const MIN_TURNAROUND_MINUTES = 1;
const IDEAL_TURNAROUND_MINUTES = 2;
let challengeIdSeed = 0;
const APP_SAVE_TYPE = 'gamemanager-save';
const APP_SAVE_VERSION = 1;
const APP_SESSIONS_KEY = 'gamemanager-sessions-v1';

function generateChallengePlayerId() {
  challengeIdSeed += 1;
  return challengeIdSeed;
}

function getChallengeRange() {
  return clampNumber(Number(state.options.challengeRange) || 5, 1, 10, 5);
}

function getSessionName(source = state) {
  const optionSource = source?.options || {};
  return String(optionSource.sessionName || optionSource.challengeClassName || '').trim();
}

function syncSessionNameOnState(targetState, nextName) {
  if (!targetState) return '';
  targetState.options = targetState.options || {};
  const trimmed = String(nextName || '').trim();
  targetState.options.sessionName = trimmed;
  targetState.options.challengeClassName = trimmed;
  return trimmed;
}

function hasChallengeClassName() {
  return Boolean(getSessionName());
}

function updateGenerateButtonState() {
  if (!elements.generateBtn) return;
  const requiresClass = state.activeModeId === 'raquettes-defi';
  const disabled = requiresClass && !hasChallengeClassName();
  elements.generateBtn.disabled = disabled;
  elements.generateBtn.title = disabled ? 'Renseignez une classe ou un groupe pour sauvegarder ce classement.' : '';
}

function triggerDownload({ content, type, filename }) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getAppSaveFilename(extension = 'json') {
  const today = new Date().toISOString().slice(0, 10);
  const sessionSlug = getSessionName()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return `${sessionSlug ? `${sessionSlug}_` : ''}gamemanager_${today}.${extension}`;
}

function getSessionStatusKey(schedule = state.schedule) {
  if (!schedule) return 'configuration';
  if (schedule.meta?.sessionEnded) return 'finished';
  return 'in-progress';
}

function doesActiveModeMatchSchedule(schedule = state.schedule) {
  if (!schedule) return false;
  const expectedFormat = MODE_DEFINITIONS[state.activeModeId]?.tournamentType;
  const expectedPractice = MODE_DEFINITIONS[state.activeModeId]?.practiceType;
  const actualPractice = schedule.meta?.practiceType || getPracticeTypeFromMeta(schedule.meta);
  return (!expectedFormat || expectedFormat === schedule.format) && (!expectedPractice || expectedPractice === actualPractice);
}

function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function ensureCurrentSessionMetadata(options = {}) {
  const forceNew = Boolean(options.forceNew);
  if (forceNew || !state.sessionId) {
    state.sessionId = generateSessionId();
  }
  if (forceNew || !state.sessionCreatedAt) {
    state.sessionCreatedAt = new Date().toISOString();
  }
}

function buildAppSaveSnapshot() {
  ensureCurrentSessionMetadata();
  const sessionName = getSessionName();
  const savedAt = new Date().toISOString();
  return {
    type: APP_SAVE_TYPE,
    version: APP_SAVE_VERSION,
    id: state.sessionId,
    savedAt,
    createdAt: state.sessionCreatedAt || savedAt,
    updatedAt: savedAt,
    sessionName,
    mode: state.activeModeId,
    universe: state.universeId,
    participantCount: state.participants,
    status: getSessionStatusKey(state.schedule),
    className: sessionName,
    state: {
      ...state,
      options: {
        ...state.options,
        sessionName,
        challengeClassName: sessionName,
      },
    },
    viewState: {
      resultsMode: uiState.resultsMode,
      finalRankingSnapshot,
    },
  };
}

function exportAppStateJson() {
  if (!state.schedule) {
    alert('Aucune séance à sauvegarder pour le moment.');
    return;
  }
  const payload = buildAppSaveSnapshot();
  triggerDownload({
    content: JSON.stringify(payload, null, 2),
    type: 'application/json',
    filename: getAppSaveFilename('json'),
  });
}

function loadStoredSessions() {
  try {
    const raw = localStorage.getItem(APP_SESSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(entry => entry && entry.type === APP_SAVE_TYPE && entry.state);
  } catch (error) {
    console.warn('Impossible de charger les séances locales', error);
    return [];
  }
}

function saveStoredSessions(entries) {
  localStorage.setItem(APP_SESSIONS_KEY, JSON.stringify(entries));
}

function upsertStoredSessionSnapshot(snapshot) {
  if (!snapshot?.id) return;
  const nextSessions = loadStoredSessions().filter(entry => entry.id !== snapshot.id);
  nextSessions.push(snapshot);
  saveStoredSessions(nextSessions);
}

function getStoredSessionById(sessionId) {
  return loadStoredSessions().find(entry => entry.id === sessionId) || null;
}

function listStoredSessions() {
  return loadStoredSessions().sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.savedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.savedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

function removeStoredSession(sessionId) {
  saveStoredSessions(loadStoredSessions().filter(entry => entry.id !== sessionId));
}

function exportStoredSessionSnapshot(snapshot) {
  if (!snapshot?.state) return;
  const sessionName = String(snapshot.sessionName || snapshot.className || '').trim();
  const today = new Date().toISOString().slice(0, 10);
  const sessionSlug = sessionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  triggerDownload({
    content: JSON.stringify(snapshot, null, 2),
    type: 'application/json',
    filename: `${sessionSlug ? `${sessionSlug}_` : ''}gamemanager_${today}.json`,
  });
}

function getSessionModeLabel(snapshot) {
  const modeId = snapshot?.mode || snapshot?.state?.activeModeId;
  return MODE_DEFINITIONS[modeId]?.label || snapshot?.state?.schedule?.meta?.formatLabel || 'Séance';
}

function getSessionUniverseLabel(snapshot) {
  const universeId = snapshot?.universe || snapshot?.state?.universeId;
  return UNIVERSES[universeId]?.label || 'Univers';
}

function getSessionStatusLabel(snapshot) {
  return snapshot?.status === 'finished' ? 'Terminé' : snapshot?.state?.schedule ? 'En cours' : 'Configuration';
}

function saveCurrentSessionSnapshot() {
  if (!state.schedule) return null;
  const snapshot = buildAppSaveSnapshot();
  upsertStoredSessionSnapshot(snapshot);
  return snapshot;
}

function renderLandingSessions() {
  if (!elements.landingSessionsList || !elements.landingSessionsHint) return;
  const sessions = listStoredSessions().slice(0, 8);
  if (!sessions.length) {
    elements.landingSessionsHint.textContent = 'Aucune séance locale enregistrée pour le moment.';
    elements.landingSessionsList.innerHTML =
      '<p class="landing-session-empty">Générez une première séance pour la retrouver ici automatiquement.</p>';
    return;
  }
  elements.landingSessionsHint.textContent = `${sessions.length} séance(s) récente(s) sur cet appareil.`;
  elements.landingSessionsList.innerHTML = sessions
    .map(snapshot => {
      const sessionName = String(snapshot.sessionName || snapshot.className || '').trim() || 'Séance sans nom';
      const updatedAt = snapshot.updatedAt || snapshot.savedAt || snapshot.createdAt;
      const stamp = updatedAt
        ? new Date(updatedAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })
        : 'date inconnue';
      const participantCount = Number(snapshot.participantCount || snapshot.state?.participants || 0);
      return `
        <article class="landing-session-card">
          <div class="landing-session-copy">
            <strong>${escapeHtml(sessionName)} · ${escapeHtml(getSessionModeLabel(snapshot))} · ${escapeHtml(stamp)}</strong>
            <span class="landing-session-meta">${escapeHtml(getSessionUniverseLabel(snapshot))} · ${participantCount} participant(s) · ${escapeHtml(getSessionStatusLabel(snapshot))}</span>
          </div>
          <div class="landing-session-actions">
            <button type="button" class="btn primary small" data-session-action="resume" data-session-id="${snapshot.id}">Reprendre</button>
            <button type="button" class="btn ghost small" data-session-action="rename" data-session-id="${snapshot.id}">Renommer</button>
            <button type="button" class="btn ghost small" data-session-action="export" data-session-id="${snapshot.id}">Exporter JSON</button>
            <button type="button" class="btn ghost small" data-session-action="delete" data-session-id="${snapshot.id}">Supprimer</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function showSessionSaveFeedback(message = 'Séance sauvegardée sur cet iPad') {
  if (!elements.sessionSaveFeedback) return;
  elements.sessionSaveFeedback.textContent = message;
  elements.sessionSaveFeedback.classList.remove('hidden');
  if (sessionSaveFeedbackTimeout) {
    clearTimeout(sessionSaveFeedbackTimeout);
  }
  sessionSaveFeedbackTimeout = window.setTimeout(() => {
    elements.sessionSaveFeedback.classList.add('hidden');
  }, 2200);
}

function ensureSessionNameBeforeSave() {
  const existing = getSessionName();
  if (existing) return existing;
  const response = window.prompt('Nom de la classe / du groupe ?', '');
  const trimmed = String(response || '').trim();
  if (!trimmed) {
    alert('Renseignez une classe ou un groupe pour sauvegarder cette séance.');
    return null;
  }
  syncSessionNameOnState(state, trimmed);
  syncOptionInputs();
  return trimmed;
}

function saveSessionLocally(options = {}) {
  if (!state.schedule) {
    alert('Aucune séance à sauvegarder pour le moment.');
    return false;
  }
  const sessionName = ensureSessionNameBeforeSave();
  if (!sessionName) return false;
  ensureCurrentSessionMetadata();
  syncSessionNameOnState(state, sessionName);
  persistState();
  if (typeof options.afterSave === 'function') {
    options.afterSave();
  }
  showSessionSaveFeedback('Séance sauvegardée sur cet iPad');
  return true;
}

function buildSessionSavePanelMarkup(scope = 'results') {
  const sessionName = getSessionName();
  return `
    <section class="session-save-panel panel-card" data-session-save-panel="${scope}">
      <header class="session-save-panel-head">
        <div>
          <p class="eyebrow">Sauvegarder la séance</p>
          <h4>Sauvegarder la séance</h4>
        </div>
      </header>
      <div class="session-save-panel-body">
        <label class="field">
          <span>Classe / groupe</span>
          <input type="text" value="${escapeHtml(sessionName)}" data-session-name-input placeholder="ex : 6A, 5B, AS Badminton" />
          <div class="field-hint hidden" data-session-name-hint>Nom requis pour retrouver cette séance</div>
        </label>
        <div class="session-save-panel-actions">
          <button type="button" class="btn success" data-session-panel-action="save">Sauvegarder la séance</button>
          <button type="button" class="btn secondary" data-session-panel-action="export-json">Exporter sauvegarde JSON</button>
          <button type="button" class="btn secondary" data-session-panel-action="export-csv">Exporter CSV</button>
        </div>
      </div>
    </section>
  `;
}

function renderFinalSessionSavePanel() {
  if (!elements.finalSessionSavePanel || !state.schedule) return;
  elements.finalSessionSavePanel.innerHTML = buildSessionSavePanelMarkup('final-modal');
}

function appendRankingSessionSavePanel() {
  if (!elements.rankingView || !state.schedule) return;
  elements.rankingView.insertAdjacentHTML('beforeend', buildSessionSavePanelMarkup('ranking-view'));
}

function handleSessionSavePanelAction(event) {
  const actionButton = event.target.closest('[data-session-panel-action]');
  if (!actionButton) return false;
  const panel = actionButton.closest('[data-session-save-panel]');
  if (!panel) return false;
  const input = panel.querySelector('[data-session-name-input]');
  const hint = panel.querySelector('[data-session-name-hint]');
  const sessionName = String(input?.value || '').trim();
  if (hint) {
    hint.classList.add('hidden');
  }
  if (actionButton.dataset.sessionPanelAction === 'save') {
    if (!sessionName) {
      if (hint) hint.classList.remove('hidden');
      if (input) input.focus();
      return true;
    }
    saveSessionLocally({
      sessionName,
      afterSave: () => {
        renderChallengeClassManager();
        if (input) input.value = getSessionName();
      },
    });
    return true;
  }
  if (actionButton.dataset.sessionPanelAction === 'export-json') {
    if (sessionName) {
      syncSessionNameOnState(state, sessionName);
      syncOptionInputs();
      persistState();
    }
    exportAppStateJson();
    return true;
  }
  if (actionButton.dataset.sessionPanelAction === 'export-csv') {
    if (sessionName) {
      syncSessionNameOnState(state, sessionName);
      syncOptionInputs();
      persistState();
    }
    exportCurrentCsv();
    return true;
  }
  return false;
}

function exportCurrentCsv() {
  if (!state.schedule) {
    alert('Aucun planning généré pour exporter un CSV.');
    return;
  }
  if (state.schedule.format === 'challenge') {
    exportChallengeRankingCsv();
    return;
  }
  if (state.schedule.format === 'swiss') {
    exportSwissRankingCsv();
    return;
  }
  downloadFinalRankingCsv();
}

function getChallengeClassStorageKey(className) {
  const safe = String(className || '').trim().toLowerCase();
  return safe || null;
}

function saveChallengeClassSnapshot() {
  if (!state.schedule?.challenge || !getSessionName()) return;
  saveCurrentSessionSnapshot();
  renderChallengeClassManager();
}

function loadChallengeClassSnapshot(className) {
  const safe = getChallengeClassStorageKey(className);
  if (!safe) return null;
  const session = listStoredSessions().find(
    entry => entry.mode === 'raquettes-defi' && String(entry.sessionName || entry.className || '').trim().toLowerCase() === safe
  );
  if (!session?.state?.schedule?.challenge) return null;
  return {
    type: 'poulemanager-challenge-class',
    version: 1,
    className: session.sessionName || session.className,
    savedAt: session.updatedAt || session.savedAt || null,
    challenge: session.state.schedule.challenge,
    session,
  };
}

function saveCurrentChallengeClass() {
  if (!state.schedule?.challenge) return;
  saveSessionLocally({
    afterSave: () => {
      renderChallengeClassManager();
      renderChallengeBoard(state.schedule);
    },
  });
}

function promptForChallengeClassName(initialValue = '') {
  const response = window.prompt('Nom de la classe / du groupe ?', initialValue);
  const trimmed = String(response || '').trim();
  if (!trimmed) {
    alert('Renseignez une classe ou un groupe pour sauvegarder ce classement.');
    return null;
  }
  return trimmed;
}

function setChallengeClassName(nextName) {
  const trimmed = String(nextName || '').trim();
  if (!trimmed) return false;
  syncSessionNameOnState(state, trimmed);
  persistState();
  syncOptionInputs();
  renderChallengeClassManager();
  updateGenerateButtonState();
  if (state.schedule?.challenge) {
    saveChallengeClassSnapshot();
    renderChallengeBoard(state.schedule);
  }
  return true;
}

function restoreChallengeClassSnapshotData(data) {
  if (!data.challenge || !data.challenge.order) {
    alert('Fichier invalide');
    return false;
  }
  const names = Array.isArray(data.challenge?.names) && data.challenge.names.length
    ? data.challenge.names.slice()
    : Array.isArray(data.challenge?.roster)
      ? data.challenge.roster.map(player => player.name).filter(Boolean)
      : [];
  if (!names.length) {
    alert('Fichier invalide');
    return false;
  }
  applyModeDefinition('raquettes-defi', { skipNavigation: true });
  syncSessionNameOnState(state, String(data.className || getSessionName() || '').trim());
  state.participants = names.length;
  state.teamNames = ensureTeamListLength(names, names.length, 'raquette');
  state.entityStatuses = ensureEntityStatusLength([], names.length);
  renderParticipants();
  buildTeamFields(names.length);
  syncOptionInputs();
  const schedule = buildChallengeBoard(names, state.options);
  schedule.challenge = data.challenge;
  ensureChallengeRoster(schedule);
  state.schedule = schedule;
  saveChallengeClassSnapshot();
  persistState();
  renderResults(schedule, { resetScores: true });
  renderChallengeClassManager();
  goTo('results');
  renderChallengeBoard(schedule);
  renderRankingView(schedule);
  renderLiveRankingForChallenge();
  return true;
}

function listChallengeClassSnapshots() {
  return listStoredSessions()
    .filter(entry => entry.mode === 'raquettes-defi' && String(entry.sessionName || entry.className || '').trim())
    .map(entry => ({
      key: entry.id,
      className: String(entry.sessionName || entry.className || '').trim(),
      savedAt: entry.updatedAt || entry.savedAt || null,
    }))
    .sort((a, b) => String(a.className).localeCompare(String(b.className), 'fr', { sensitivity: 'base' }));
}

function renderChallengeClassManager() {
  const select = elements.challengeClassSelect;
  if (!select) return;
  const entries = listChallengeClassSnapshots();
  const currentClass = getSessionName();
  if (!entries.length) {
    select.innerHTML = '<option value="">Aucune classe sauvegardée</option>';
    select.disabled = true;
    if (elements.challengeClassManagerHint) {
      elements.challengeClassManagerHint.textContent = 'Aucune classe sauvegardée localement pour le moment.';
    }
    if (elements.challengeClassResumeBtn) {
      elements.challengeClassResumeBtn.disabled = true;
    }
    return;
  }
  select.disabled = false;
  select.innerHTML = entries
    .map(entry => {
      const stamp = entry.savedAt
        ? new Date(entry.savedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
        : 'sauvegarde locale';
      const selected = currentClass && currentClass.toLowerCase() === entry.className.toLowerCase() ? 'selected' : '';
      return `<option value="${escapeHtml(entry.className)}" ${selected}>${escapeHtml(entry.className)} · ${escapeHtml(stamp)}</option>`;
    })
    .join('');
  if (elements.challengeClassManagerHint) {
    elements.challengeClassManagerHint.textContent = `${entries.length} classe(s) disponible(s) localement.`;
  }
  if (elements.challengeClassResumeBtn) {
    elements.challengeClassResumeBtn.disabled = false;
  }
}

function updateSaveActionsState() {
  const hasSchedule = Boolean(state.schedule);
  if (elements.toolsExportJsonBtn) {
    elements.toolsExportJsonBtn.classList.toggle('hidden', !hasSchedule);
  }
  if (elements.toolsExportCsvBtn) {
    elements.toolsExportCsvBtn.classList.toggle('hidden', !hasSchedule);
  }
  if (elements.printTopBtn) {
    elements.printTopBtn.classList.toggle('hidden', !hasSchedule);
  }
  renderLandingSessions();
}

function restoreAppSaveState(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    alert('Fichier invalide');
    return;
  }
  if (snapshot.type === 'poulemanager-challenge-class') {
    restoreChallengeClassSnapshotData(snapshot);
    updateSaveActionsState();
    return;
  }
  if (snapshot.type !== APP_SAVE_TYPE || !snapshot.state) {
    alert('Fichier invalide');
    return;
  }

  const importedState = sanitizeState(snapshot.state);
  const savedScreen = importedState.currentScreen;
  const savedLiveRotationIndex = Number.isInteger(importedState.liveRotationIndex) ? importedState.liveRotationIndex : 0;
  state = importedState;
  syncSessionNameOnState(state, snapshot.sessionName || snapshot.className || getSessionName(state));
  state.sessionId = snapshot.id || state.sessionId || generateSessionId();
  state.sessionCreatedAt = snapshot.createdAt || snapshot.savedAt || state.sessionCreatedAt || new Date().toISOString();
  uiState.resultsMode = snapshot.viewState?.resultsMode === 'pilot' ? 'pilot' : 'read';
  finalRankingSnapshot = snapshot.viewState?.finalRankingSnapshot || null;
  invalidateStandingsCache();
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  renderChallengeClassManager();
  updateSaveActionsState();
  updateTheme(state.universeId);
  renderModeCards();
  updateModeScreenCopy();
  setResultsMode(uiState.resultsMode);

  if (state.schedule) {
    renderResults(state.schedule, { preserveTimestamp: true });
    state.liveRotationIndex = clampNumber(
      savedLiveRotationIndex,
      0,
      Math.max((state.schedule.rotations?.length || 1) - 1, 0),
      0
    );
    renderLiveRankingPanel(state.schedule.rotations[state.liveRotationIndex]?.number || 1);
    renderChronoScreen();
    persistState();
    if (savedScreen === 'ladder-pilot' && isLadderLiveMode(state.schedule)) {
      openLadderPilotModal();
    } else if (savedScreen === 'swiss-pilot' && state.schedule.format === 'swiss') {
      goTo('swiss-pilot');
      renderSwissPilotScreen();
    } else if (['live', 'projection', 'chrono', 'results', 'options', 'teams', 'count', 'type', 'landing'].includes(savedScreen)) {
      goTo(savedScreen === 'landing' ? 'results' : savedScreen);
      if (savedScreen === 'live') {
        renderLiveRotation();
      } else if (savedScreen === 'projection') {
        openProjectionScreen();
      } else if (savedScreen === 'chrono') {
        renderChronoScreen();
      }
    } else {
      goTo('results');
    }
  } else {
    persistState();
    goTo(['landing', 'type', 'count', 'teams', 'options'].includes(savedScreen) ? savedScreen : 'landing');
  }
  updateSaveActionsState();
}

async function importAppStateJson(file) {
  if (!file) return;
  try {
    const raw = await file.text();
    const data = JSON.parse(raw);
    restoreAppSaveState(data);
  } catch (error) {
    alert('Erreur import');
  }
}

function openChallengeClassCreationFlow() {
  const className = window.prompt('Nom de la classe / du groupe ?');
  const trimmed = String(className || '').trim();
  if (!trimmed) return;
  applyModeDefinition('raquettes-defi', { skipNavigation: true });
  syncSessionNameOnState(state, trimmed);
  state.sessionId = null;
  state.sessionCreatedAt = null;
  state.schedule = null;
  state.generatedAt = null;
  state.scores = {};
  state.validatedMatches = {};
  state.teamNames = ensureTeamListLength([], state.participants, 'raquette');
  state.entityStatuses = ensureEntityStatusLength([], state.participants);
  persistState();
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  renderModeCards();
  updateModeScreenCopy();
  renderChallengeClassManager();
  updateSaveActionsState();
  goTo('count');
}

function resumeChallengeClass(className) {
  const trimmed = String(className || '').trim();
  const data = loadChallengeClassSnapshot(trimmed);
  if (!data) {
    alert('Aucune sauvegarde trouvée pour cette classe.');
    return;
  }
  if (data.session) {
    restoreAppSaveState(data.session);
    alert(`Classe ${trimmed} reprise`);
    return;
  }
  const challengeData = data.challenge;
  const names = Array.isArray(challengeData?.names) && challengeData.names.length
    ? challengeData.names.slice()
    : Array.isArray(challengeData?.roster)
      ? challengeData.roster.map(player => player.name).filter(Boolean)
      : [];
  if (!names.length) {
    alert('Sauvegarde invalide');
    return;
  }
  applyModeDefinition('raquettes-defi', { skipNavigation: true });
  syncSessionNameOnState(state, trimmed);
  state.participants = names.length;
  state.teamNames = ensureTeamListLength(names, names.length, 'raquette');
  state.entityStatuses = ensureEntityStatusLength([], names.length);
  renderParticipants();
  buildTeamFields(names.length);
  syncOptionInputs();
  const schedule = buildChallengeBoard(names, state.options);
  schedule.challenge = challengeData;
  ensureChallengeRoster(schedule);
  renderResults(schedule, { resetScores: true });
  renderChallengeClassManager();
  updateSaveActionsState();
  goTo('results');
  alert(`Classe ${trimmed} reprise`);
}

const timerController = {
  prepare() {
    timerState.baseSeconds = state.options.duration * 60;
    timerState.remainingSeconds = timerState.baseSeconds;
    timerState.totalRotations = state.schedule ? getLadderRotationTotal(state.schedule) || state.schedule.rotations.length : 0;
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
  initializeStepperInteractivity();
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  renderChallengeClassManager();
  updateSaveActionsState();
  setupAutoSelectInputs();
  updateTheme(state.universeId);
  renderModeCards();
  updateModeScreenCopy();
  setResultsMode(uiState.resultsMode);
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
  if (elements.toolsToggle) {
    elements.toolsToggle.addEventListener('click', event => {
      event.preventDefault();
      toggleToolsMenu();
    });
  }
  if (elements.toolsMenu) {
    elements.toolsMenu.addEventListener('click', event => {
      const item = event.target.closest('.tools-item');
      if (item) {
        closeToolsMenu();
      }
    });
  }
  if (elements.landingSportcoBtn) {
    elements.landingSportcoBtn.addEventListener('click', () => enterUniverse('sportco'));
  }
  if (elements.landingRaquettesBtn) {
    elements.landingRaquettesBtn.addEventListener('click', () => enterUniverse('raquettes'));
  }
  if (elements.resumeFlow) {
    elements.resumeFlow.addEventListener('click', handleResume);
  }
  if (elements.landingSessionsList) {
    elements.landingSessionsList.addEventListener('click', event => {
      const actionButton = event.target.closest('[data-session-action]');
      if (!actionButton) return;
      const sessionId = actionButton.dataset.sessionId;
      const action = actionButton.dataset.sessionAction;
      const snapshot = getStoredSessionById(sessionId);
      if (!snapshot) {
        alert('Cette séance n’est plus disponible localement.');
        renderLandingSessions();
        return;
      }
      if (action === 'resume') {
        restoreAppSaveState(snapshot);
        return;
      }
      if (action === 'rename') {
        const nextName = window.prompt('Nouveau nom de classe / groupe ?', snapshot.sessionName || snapshot.className || '');
        const trimmed = String(nextName || '').trim();
        if (!trimmed) return;
        snapshot.sessionName = trimmed;
        snapshot.className = trimmed;
        if (snapshot.state?.options) {
          snapshot.state.options.sessionName = trimmed;
          snapshot.state.options.challengeClassName = trimmed;
        }
        upsertStoredSessionSnapshot(snapshot);
        if (state.sessionId === snapshot.id) {
          syncSessionNameOnState(state, trimmed);
          syncOptionInputs();
          persistState();
        } else {
          renderLandingSessions();
        }
        return;
      }
      if (action === 'delete') {
        const confirmed = window.confirm('Supprimer cette séance locale ?');
        if (!confirmed) return;
        removeStoredSession(snapshot.id);
        renderLandingSessions();
        return;
      }
      if (action === 'export') {
        exportStoredSessionSnapshot(snapshot);
      }
    });
  }
  if (elements.challengeClassCreateBtn) {
    elements.challengeClassCreateBtn.addEventListener('click', openChallengeClassCreationFlow);
  }
  if (elements.challengeClassResumeBtn) {
    elements.challengeClassResumeBtn.addEventListener('click', () => {
      const className = elements.challengeClassSelect?.value;
      if (!className) {
        alert('Sélectionnez une classe à reprendre.');
        return;
      }
      resumeChallengeClass(className);
    });
  }
  const openJsonImport = () => {
    elements.toolsJsonImportFile?.click();
  };
  if (elements.toolsImportJsonBtn) {
    elements.toolsImportJsonBtn.addEventListener('click', openJsonImport);
  }
  if (elements.toolsImportJsonBtnLanding) {
    elements.toolsImportJsonBtnLanding.addEventListener('click', openJsonImport);
  }
  if (elements.toolsJsonImportFile) {
    elements.toolsJsonImportFile.addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (!file) return;
      importAppStateJson(file);
      event.target.value = '';
    });
  }
  if (elements.toolsExportJsonBtn) {
    elements.toolsExportJsonBtn.addEventListener('click', exportAppStateJson);
  }
  if (elements.toolsExportCsvBtn) {
    elements.toolsExportCsvBtn.addEventListener('click', exportCurrentCsv);
  }
  if (elements.saveSessionBtn) {
    elements.saveSessionBtn.addEventListener('click', () => {
      saveSessionLocally();
    });
  }
  if (elements.ladderPilotSaveBtn) {
    elements.ladderPilotSaveBtn.addEventListener('click', () => {
      saveSessionLocally();
    });
  }
  if (elements.swissPilotSaveBtn) {
    elements.swissPilotSaveBtn.addEventListener('click', () => {
      saveSessionLocally();
    });
  }
  if (elements.openHelpFromLanding) {
    elements.openHelpFromLanding.addEventListener('click', openHelpModal);
  }
  if (elements.quickModeBtn) {
    elements.quickModeBtn.addEventListener('click', () => goTo('quick'));
  }

  if (elements.modeCardsGrid) {
    elements.modeCardsGrid.addEventListener('click', event => {
      const target = event.target.closest('[data-mode-id]');
      if (!target) return;
      handleModeSelection(target.dataset.modeId);
    });
    elements.modeCardsGrid.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target.closest('[data-mode-id]');
      if (!target) return;
      event.preventDefault();
      handleModeSelection(target.dataset.modeId);
    });
  }
  if (elements.modeNextBtn) {
    elements.modeNextBtn.addEventListener('click', () => {
      if (!state.activeModeId) return;
      goTo('count');
    });
  }

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
  if (elements.modeParticipantsInput) {
    elements.modeParticipantsInput.addEventListener('input', event => updateParticipants(Number(event.target.value)));
  }

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
    if (state.options.ladder) {
      normalizeLadderOptions(state.options.ladder.mode);
    }
    if (elements.ladderRefereeCourts) {
      elements.ladderRefereeCourts.value = state.options.ladder.refereeCourts || 0;
    }
    if (elements.ladderFreeCourts) {
      elements.ladderFreeCourts.value = state.options.ladder.freeCourts || 0;
    }
    updateLadderSettingsVisibility();
    persistState();
  });

  elements.matchDuration.addEventListener('input', event => {
    state.options.duration = clampNumber(Number(event.target.value), 1, 180, state.options.duration);
    event.target.value = state.options.duration;
    updateLadderSettingsVisibility();
    persistState();
    timerState.baseSeconds = state.options.duration * 60;
  });

  const challengeRangeInput = document.getElementById('challengeRange');
  if (challengeRangeInput) {
    challengeRangeInput.addEventListener('input', event => {
      state.options.challengeRange = clampNumber(Number(event.target.value), 1, 10, 5);
      event.target.value = state.options.challengeRange;
      persistState();
      if (isChallengeModeActive()) renderChallengeBoard();
    });
  }

  const challengeClassNameInput = document.getElementById('challengeClassName');
  if (challengeClassNameInput) {
    challengeClassNameInput.addEventListener('input', event => {
      syncSessionNameOnState(state, String(event.target.value || '').trim());
      persistState();
      updateGenerateButtonState();
      if (isChallengeModeActive()) renderChallengeBoard();
    });
  }

  elements.startTime.addEventListener('input', event => {
    state.options.startTime = event.target.value;
    updateLadderSettingsVisibility();
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
  if (elements.worldCupGroupCount) {
    elements.worldCupGroupCount.addEventListener('change', event => {
      const requested = Number(event.target.value);
      state.options.worldCupGroupCount = clampNumber(requested, 2, 4, state.options.worldCupGroupCount || 2);
      event.target.value = state.options.worldCupGroupCount;
      persistState();
    });
  }
  if (elements.ladderRefereeCourts) {
    elements.ladderRefereeCourts.addEventListener('input', event => {
      const value = clampNumber(Number(event.target.value), 0, state.options.fields, 0);
      state.options.ladder = state.options.ladder || { mode: 'free', courtMode: 'optimized', refereeCourts: 0, freeCourts: 0 };
      state.options.ladder.refereeCourts = value;
      if (state.options.ladder.mode === 'mixed') {
        state.options.ladder.freeCourts = Math.max(state.options.fields - value, 0);
      } else {
        state.options.ladder.mode = inferLadderMode(
          state.options.fields,
          value,
          Math.max(state.options.fields - value, 0)
        );
        state.options.ladder.freeCourts = Math.max(state.options.fields - value, 0);
      }
      event.target.value = value;
      updateLadderSettingsVisibility();
      persistState();
    });
  }
  if (elements.ladderFreeCourts) {
    elements.ladderFreeCourts.addEventListener('input', event => {
      const value = clampNumber(Number(event.target.value), 0, state.options.fields, 0);
      state.options.ladder = state.options.ladder || { mode: 'free', courtMode: 'optimized', refereeCourts: 0, freeCourts: 0 };
      state.options.ladder.freeCourts = value;
      if (state.options.ladder.mode === 'mixed') {
        state.options.ladder.refereeCourts = Math.max(state.options.fields - value, 0);
      } else {
        state.options.ladder.mode = inferLadderMode(
          state.options.fields,
          state.options.ladder.refereeCourts,
          value
        );
      }
      event.target.value = value;
      updateLadderSettingsVisibility();
      persistState();
    });
  }
  if (elements.ladderModeButtons && elements.ladderModeButtons.length) {
    elements.ladderModeButtons.forEach(button => {
      button.addEventListener('click', () => setLadderMode(button.dataset.ladderMode));
    });
  }
  if (elements.ladderSessionModeButtons && elements.ladderSessionModeButtons.length) {
    elements.ladderSessionModeButtons.forEach(button => {
      button.addEventListener('click', () => setLadderSessionMode(button.dataset.ladderSessionMode));
    });
  }
  if (elements.ladderCourtModeButtons && elements.ladderCourtModeButtons.length) {
    elements.ladderCourtModeButtons.forEach(button => {
      button.addEventListener('click', () => setLadderCourtMode(button.dataset.ladderCourtMode));
    });
  }
  if (elements.ladderRefereePlacement) {
    elements.ladderRefereePlacement.addEventListener('change', event => {
      setLadderRefereePlacement(event.target.value);
    });
  }
  if (elements.ladderManualPlacementGrid) {
    elements.ladderManualPlacementGrid.addEventListener('change', event => {
      const input = event.target.closest('[data-ladder-manual-field]');
      if (!input) return;
      toggleManualLadderRefereeField(Number(input.dataset.ladderManualField), Boolean(input.checked));
    });
  }
  if (elements.ladderRotationLimit) {
    elements.ladderRotationLimit.addEventListener('change', event => {
      const fallback = getDefaultLimitedLadderRotationCount(state.participants, state.options.fields);
      const value = clampNumber(Number(event.target.value) || fallback, 1, 999, fallback);
      state.options.ladder = {
        ...(state.options.ladder || {}),
        sessionMode: 'limited',
        rotationLimit: value,
      };
      event.target.value = value;
      updateLadderSettingsVisibility();
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
  if (elements.teamRankingImport) {
    elements.teamRankingImport.addEventListener('change', handleTeamRankingImport);
  }

  elements.printBtn.addEventListener('click', () => window.print());
  elements.printTopBtn.addEventListener('click', () => window.print());
  if (elements.resultsMoreToggle) {
    elements.resultsMoreToggle.addEventListener('click', toggleResultsMorePanel);
  }
  if (elements.startLiveBtn) {
    elements.startLiveBtn.addEventListener('click', () => {
      if (state.schedule?.format === 'swiss') {
        openSwissPilotScreen();
        return;
      }
      if (isLadderLiveMode(state.schedule)) {
        openLadderPilotModal();
        return;
      }
      startLiveMode();
    });
  }
  if (elements.liveActionsToggle) {
    elements.liveActionsToggle.addEventListener('click', toggleLiveActionsPanel);
  }
  if (elements.liveCurrentRotationBtn) {
    elements.liveCurrentRotationBtn.addEventListener('click', () => {
      if (isLadderLiveMode(state.schedule)) {
        openLadderPilotModal();
        return;
      }
      focusCurrentLadderRotation();
    });
  }

  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => setActiveView(btn.dataset.view));
  });

  elements.timerControls.forEach(btn => {
    btn.addEventListener('click', () => handleTimerControl(btn.dataset.timer));
  });
  if (elements.timerRanking) {
    elements.timerRanking.addEventListener('click', () => {
      if (!state.schedule) return;
      openRankingModal();
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
  if (elements.liveFieldBoard) {
    elements.liveFieldBoard.addEventListener('input', handleScoreInput);
    elements.liveFieldBoard.addEventListener('click', handleLiveClick);
  }
  if (elements.liveCurrentRotationCard) {
    elements.liveCurrentRotationCard.addEventListener('click', handleLiveClick);
  }
  if (elements.ladderPilotBody) {
    elements.ladderPilotBody.addEventListener('input', handleScoreInput);
    elements.ladderPilotBody.addEventListener('click', handleLiveClick);
  }
  if (elements.rotationView) {
    elements.rotationView.addEventListener('click', handleRotationViewClick);
  }
  if (elements.swissPilotBody) {
    elements.swissPilotBody.addEventListener('click', handleRotationViewClick);
  }
  if (elements.liveRestNotice) {
    elements.liveRestNotice.addEventListener('click', handleLiveClick);
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
      if (handleSessionSavePanelAction(event)) return;
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
  if (elements.rankingButtons && elements.rankingButtons.length) {
    elements.rankingButtons.forEach(btn => {
      btn.addEventListener('click', toggleRankingModal);
    });
  }
  if (elements.rankingModalClose) {
    elements.rankingModalClose.addEventListener('click', closeRankingModal);
  }
  if (elements.rankingModal) {
    elements.rankingModal.addEventListener('click', event => {
      if (event.target === elements.rankingModal) {
        closeRankingModal();
      }
    });
  }
  if (elements.ladderPilotCloseBtn) {
    elements.ladderPilotCloseBtn.addEventListener('click', closeLadderPilotModal);
  }
  if (elements.ladderPilotBackBtn) {
    elements.ladderPilotBackBtn.addEventListener('click', closeLadderPilotModal);
  }
  if (elements.ladderPilotRankingBtn) {
    elements.ladderPilotRankingBtn.addEventListener('click', () => {
      rankingReturnScreen = 'ladder-pilot';
      openRankingModal();
    });
  }
  if (elements.ladderPilotNextBtn) {
    elements.ladderPilotNextBtn.addEventListener('click', advanceLadderPilotRotation);
  }
  if (elements.ladderPilotFinishBtn) {
    elements.ladderPilotFinishBtn.addEventListener('click', handleLiveFinish);
  }
  if (elements.swissPilotCloseBtn) {
    elements.swissPilotCloseBtn.addEventListener('click', closeSwissPilotScreen);
  }
  if (elements.swissPilotBackBtn) {
    elements.swissPilotBackBtn.addEventListener('click', closeSwissPilotScreen);
  }
  if (elements.swissPilotExportBtn) {
    elements.swissPilotExportBtn.addEventListener('click', exportSwissRankingCsv);
  }
  if (elements.resultsScreen) {
    elements.resultsScreen.addEventListener('click', event => {
      handleSessionSavePanelAction(event);
    });
  }
  if (elements.statusBtn) {
    elements.statusBtn.addEventListener('click', openStatusModal);
  }
  if (elements.statusModalClose) {
    elements.statusModalClose.addEventListener('click', closeStatusModal);
  }
  if (elements.statusModal) {
    elements.statusModal.addEventListener('click', event => {
      if (event.target === elements.statusModal) {
        closeStatusModal();
      }
    });
  }
  if (elements.challengeForm) {
    elements.challengeForm.addEventListener('submit', handleChallengeFormSubmit);
  }
  if (elements.challengeModal) {
    elements.challengeModal.addEventListener('click', event => {
      if (event.target === elements.challengeModal) {
        closeChallengeDialog();
        return;
      }
      handleChallengeDialogAction(event);
    });
  }
  if (elements.statusList) {
    elements.statusList.addEventListener('click', event => {
      const button = event.target.closest('[data-status-index]');
      if (!button) return;
      const index = Number(button.dataset.statusIndex);
      if (!Number.isInteger(index)) return;
      setEntityStatus(index, button.dataset.statusValue);
    });
  }
  if (elements.rotationView) {
    elements.rotationView.addEventListener('click', handleChallengeClick);
    elements.rotationView.addEventListener('dblclick', handleChallengeDoubleClick);
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
  if (elements.contextTabs) {
    elements.contextTabs.addEventListener('click', event => {
      const target = event.target.closest('[data-context]');
      if (!target) return;
      handleContextTab(target.dataset.context);
    });
  }
  if (elements.resultsModeSwitch) {
    elements.resultsModeSwitch.addEventListener('click', event => {
      const btn = event.target.closest('[data-results-mode-target]');
      if (!btn) return;
      setResultsMode(btn.dataset.resultsModeTarget);
      if (btn.dataset.resultsModeTarget === 'pilot' && state.schedule?.format === 'swiss') {
        openSwissPilotScreen();
        return;
      }
      if (btn.dataset.resultsModeTarget === 'pilot' && isLadderLiveMode(state.schedule)) {
        openLadderPilotModal();
      }
    });
  }
  if (elements.recommendBtn) {
    elements.recommendBtn.addEventListener('click', handleRecommendationRequest);
  }
  if (elements.recommendationResult) {
    elements.recommendationResult.addEventListener('click', event => {
      const applyBtn = event.target.closest('[data-action="apply-recommendation"]');
      if (applyBtn) {
        applyRecommendedConfiguration(applyBtn.dataset.strategyId);
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
    if (elements.challengeModal && !elements.challengeModal.classList.contains('hidden')) {
      closeChallengeDialog();
      handled = true;
    }
    if (state.currentScreen === 'ladder-pilot') {
      closeLadderPilotModal();
      handled = true;
    }
    if (state.currentScreen === 'swiss-pilot') {
      closeSwissPilotScreen();
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

function initializeStepperInteractivity() {
  if (!elements.stepItems || !elements.stepItems.forEach) return;
  elements.stepItems.forEach(item => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '-1');
    item.setAttribute('aria-disabled', 'true');
    item.addEventListener('click', () => {
      handleStepperNavigation(item.dataset.step);
    });
    item.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handleStepperNavigation(item.dataset.step);
    });
  });
}

function handleStepperNavigation(step) {
  if (!STEP_ORDER.includes(step)) return;
  const targetIndex = STEP_ORDER.indexOf(step);
  const maxAccessibleIndex = getMaxAccessibleStepIndex();
  if (targetIndex < 0 || targetIndex > maxAccessibleIndex) return;
  if (step === 'results' && !state.schedule) return;
  goTo(step);
}

function handleResume() {
  const stored = loadState();
  if (!stored) return;
  state = sanitizeState(stored);
  invalidateStandingsCache();
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  renderChallengeClassManager();
  updateSaveActionsState();
  updateTheme(state.universeId);
  renderModeCards();
  updateModeScreenCopy();
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
  updateLadderModeUiState();
}

function updateLadderModeUiState(screen = state.currentScreen) {
  const isLadderMode = state.activeModeId === 'raquettes-montee-descente';
  document.body.classList.toggle('ladder-mode', isLadderMode);
  if (screen) {
    document.body.dataset.screen = screen;
  } else {
    delete document.body.dataset.screen;
  }
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
  updateLadderModeUiState(screen);
  updateStepper(screen);
  togglePrintButton(screen === 'results');
  if (screen === 'chrono') {
    renderChronoScreen();
  }
  if (screen === 'ladder-pilot') {
    renderLadderPilotModal();
  }
  if (screen === 'swiss-pilot') {
    renderSwissPilotScreen();
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
  const maxAccessibleIndex = getMaxAccessibleStepIndex(screen);
  elements.stepItems.forEach(item => {
    const idx = STEP_ORDER.indexOf(item.dataset.step);
    const isDone = idx < activeIndex;
    const isCurrent = idx === activeIndex;
    const isAccessible = idx >= 0 && idx <= maxAccessibleIndex;
    item.classList.toggle('active', idx <= activeIndex);
    item.classList.toggle('done', isDone);
    item.classList.toggle('current', isCurrent);
    item.classList.toggle('step-disabled', !isAccessible);
    item.classList.toggle('step-clickable', isAccessible);
    item.setAttribute('aria-disabled', isAccessible ? 'false' : 'true');
    item.setAttribute('tabindex', isAccessible ? '0' : '-1');
  });
}

function togglePrintButton(visible) {
  elements.printTopBtn.classList.toggle('hidden', !visible);
  elements.printBtn.disabled = !visible;
}

function renderParticipants() {
  elements.teamCountDisplay.textContent = state.participants;
  elements.teamCountSlider.value = state.participants;
  if (elements.modeParticipantsInput) {
    elements.modeParticipantsInput.value = state.participants;
  }
}

function getTournamentType() {
  const allowed = Object.keys(TOURNAMENT_MODES);
  if (!allowed.includes(state.tournamentType)) {
    state.tournamentType = 'round-robin';
  }
  return state.tournamentType;
}

function renderModeCards() {
  if (!elements.modeCardsGrid) return;
  const universe = UNIVERSES[state.universeId] || UNIVERSES.sportco;
  const cards = universe.modeIds
    .map(modeId => {
      const definition = MODE_DEFINITIONS[modeId];
      if (!definition) return '';
      const isActive = state.activeModeId === modeId;
      const badge = definition.badge ? `<span class="pill">${definition.badge}</span>` : '';
      return `
        <article class="mode-card ${isActive ? 'active' : ''}" role="button" tabindex="0" data-mode-id="${modeId}">
          <div>
            <strong>${definition.label}</strong>
            <p>${definition.description}</p>
          </div>
          ${badge}
        </article>
      `;
    })
    .join('');
  elements.modeCardsGrid.innerHTML = cards;
  if (elements.modeNextBtn) {
    elements.modeNextBtn.disabled = !state.activeModeId;
  }
}

function updateModeScreenCopy() {
  const universe = UNIVERSES[state.universeId] || UNIVERSES.sportco;
  const mode = MODE_DEFINITIONS[state.activeModeId];
  if (elements.modeScreenTitle) {
    elements.modeScreenTitle.textContent = universe.label;
  }
  if (elements.modeScreenSubtitle) {
    elements.modeScreenSubtitle.textContent = universe.baseline;
  }
  if (elements.modeFootnote) {
    elements.modeFootnote.textContent = mode
      ? `Mode sélectionné : ${mode.label} · ${mode.description}`
      : 'Choisissez un mode pour passer au paramétrage.';
  }
  if (elements.modeStepEyebrow) {
    elements.modeStepEyebrow.textContent = `Étape 1 · ${universe.label}`;
  }
  updateModeBadges();
  updateModeContextPanel();
}

function updateLadderSettingsVisibility() {
  if (!elements.ladderSettings) return;
  const isLadder = state.tournamentType === 'ladder';
  elements.ladderSettings.classList.toggle('hidden', !isLadder);
  if (elements.ladderModeSwitch) {
    elements.ladderModeSwitch.classList.toggle('hidden', !isLadder);
  }
  if (elements.availableDurationField) {
    elements.availableDurationField.classList.toggle('hidden', isLadder);
  }
  if (elements.endTimeField) {
    elements.endTimeField.classList.toggle('hidden', isLadder);
  }
  if (elements.schedulingModeField) {
    elements.schedulingModeField.classList.toggle('hidden', isLadder);
  }
  if (!isLadder) {
    if (elements.generateBtn) {
      elements.generateBtn.textContent = 'Générer le planning';
    }
    return;
  }
  normalizeLadderOptions(state.options.ladder?.mode);
  const ladderMode = getLadderMode();
  const summary = computeLadderSetupSummary(state.participants, state.options.fields, state.options);
  const courtUsage = resolveLadderCourtUsage(state.participants, state.options.fields, getLadderCourtMode());
  state.options.ladder = {
    ...(state.options.ladder || {}),
    refereeCourts: summary.refereeCourts,
    freeCourts: summary.freeCourts,
  };
  if (elements.ladderRefereeField) {
    elements.ladderRefereeField.classList.toggle('hidden', ladderMode === 'free');
  }
  if (elements.ladderFreeField) {
    elements.ladderFreeField.classList.add('hidden');
  }
  if (elements.ladderRefereePlacementField) {
    elements.ladderRefereePlacementField.classList.toggle('hidden', ladderMode === 'free');
  }
  if (elements.ladderRefereePlacement) {
    elements.ladderRefereePlacement.value = normalizeLadderRefereePlacement(state.options.ladder?.refereePlacement);
  }
  if (elements.ladderManualPlacementField) {
    const showManual = ladderMode !== 'free' && normalizeLadderRefereePlacement(state.options.ladder?.refereePlacement) === 'manual';
    elements.ladderManualPlacementField.classList.toggle('hidden', !showManual);
    if (showManual) {
      renderLadderManualPlacementGrid();
    }
  }
  if (elements.ladderModeButtons && elements.ladderModeButtons.forEach) {
    elements.ladderModeButtons.forEach(button => {
      const active = button.dataset.ladderMode === ladderMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  if (elements.ladderModeHelp) {
    const helpCopy = {
      free: 'Mode rapide : tous les terrains tournent en autonomie, idéal quand vous pilotez la séance seul.',
      arbiter: 'Mode encadré : l’app met en avant les terrains arbitrés et les transitions d’arbitrage.',
      mixed: 'Mode hybride : vous combinez terrains arbitrés et terrains autonomes dans la même séance.',
    };
    elements.ladderModeHelp.textContent = helpCopy[ladderMode] || helpCopy.free;
  }
  const sessionMode = getLadderSessionMode();
  const rotationLimit = getLadderRotationLimit(state.options, state.participants, state.options.fields);
  if (elements.ladderSessionModeButtons && elements.ladderSessionModeButtons.forEach) {
    elements.ladderSessionModeButtons.forEach(button => {
      const active = button.dataset.ladderSessionMode === sessionMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  if (elements.ladderSessionModeHelp) {
    elements.ladderSessionModeHelp.textContent =
      sessionMode === 'limited'
        ? `La séance s’arrêtera automatiquement après ${rotationLimit} rotation${rotationLimit > 1 ? 's' : ''}.`
        : 'La séance reste ouverte : vous continuez les rotations tant que vous voulez, puis vous terminez manuellement.';
  }
  if (elements.ladderRotationLimitField) {
    elements.ladderRotationLimitField.classList.toggle('hidden', sessionMode !== 'limited');
  }
  if (elements.ladderRotationLimit) {
    elements.ladderRotationLimit.value = rotationLimit ?? getDefaultLimitedLadderRotationCount(state.participants, state.options.fields);
  }
  if (elements.ladderCourtModeButtons && elements.ladderCourtModeButtons.forEach) {
    elements.ladderCourtModeButtons.forEach(button => {
      const active = button.dataset.ladderCourtMode === courtUsage.courtMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  if (elements.ladderCourtModeHelp) {
    elements.ladderCourtModeHelp.textContent =
      courtUsage.courtMode === 'max'
        ? `L’app utilisera jusqu’à ${courtUsage.activeCourts} terrain${courtUsage.activeCourts > 1 ? 's' : ''} sur un maximum réel de ${courtUsage.maxCourts}.`
        : `Mode optimisé : ${courtUsage.activeCourts} terrain${courtUsage.activeCourts > 1 ? 's' : ''} utilisés, avec des joueurs conservés en attente. Maximum réel : ${courtUsage.maxCourts}.`;
  }
  if (elements.ladderSummaryCard) {
    const summaryLines = [
      `<strong>${state.participants}</strong> élèves`,
      `<strong>${summary.activeCourts}</strong> terrain${summary.activeCourts > 1 ? 's' : ''} actif${summary.activeCourts > 1 ? 's' : ''}`,
      `<strong>${summary.refereeCourts}</strong> terrain${summary.refereeCourts > 1 ? 's' : ''} avec arbitre`,
      `<strong>${summary.freeCourts}</strong> terrain${summary.freeCourts > 1 ? 's' : ''} sans arbitre`,
      `<strong>${summary.waitingPlayers}</strong> élève${summary.waitingPlayers > 1 ? 's' : ''} en attente`,
      `<strong>${summary.refereePlayers}</strong> arbitre${summary.refereePlayers > 1 ? 's' : ''} mobilisé${summary.refereePlayers > 1 ? 's' : ''}`,
      `<strong>${state.options.duration}</strong> min par match`,
    ];
    const tips = summary.tips.slice(0, 2).map(line => `<p class="ladder-summary-tip">${line}</p>`).join('');
    elements.ladderSummaryCard.innerHTML = `
      <div class="ladder-summary-top">
        <span class="ladder-summary-pill">${formatLadderModeLabel(ladderMode)}</span>
        <span class="ladder-summary-pill">${sessionMode === 'limited' ? `${rotationLimit} rotations` : 'Session libre'}</span>
        <span class="ladder-summary-pill">${formatLadderCourtModeLabel(courtUsage.courtMode)}</span>
        <span>${state.options.startTime || '09:00'}</span>
      </div>
      <div class="ladder-summary-grid">
        ${summaryLines.map(line => `<p>${line}</p>`).join('')}
      </div>
      ${tips}
      <p class="ladder-summary-cta">Lancer la montée-descente</p>
    `;
  }
  if (elements.generateBtn) {
    elements.generateBtn.textContent = 'Lancer la montée-descente';
  }
}

function inferLadderMode(fields, refereeCourts, freeCourts) {
  if (refereeCourts > 0 && freeCourts > 0) return 'mixed';
  if (refereeCourts > 0) return 'arbiter';
  return 'free';
}

function normalizeLadderRefereePlacement(value) {
  const allowed = ['top', 'spread', 'bottom', 'manual'];
  return allowed.includes(value) ? value : 'top';
}

function normalizeManualRefereeFields(list, maxField = state.options?.fields || 16) {
  if (!Array.isArray(list)) return [];
  const limit = Math.max(1, Number(maxField) || 1);
  return Array.from(
    new Set(
      list
        .map(value => Number(value))
        .filter(value => Number.isInteger(value) && value >= 1 && value <= limit)
    )
  ).sort((a, b) => a - b);
}

function formatLadderModeLabel(mode) {
  const labels = {
    free: 'Sans arbitre',
    arbiter: 'Avec arbitres',
    mixed: 'Mixte',
  };
  return labels[mode] || labels.free;
}

function getLadderCourtMode() {
  const courtMode = state.options.ladder?.courtMode;
  return courtMode === 'max' ? 'max' : 'optimized';
}

function formatLadderCourtModeLabel(mode) {
  return mode === 'max' ? 'Maximum de terrains' : 'Optimisé';
}

function getDefaultLimitedLadderRotationCount(
  playerCount = state.participants,
  configuredCourts = state.options.fields,
  courtMode = state.options?.ladder?.courtMode
) {
  const safePlayers = Math.max(2, Number(playerCount) || 2);
  const usage = resolveLadderCourtUsage(safePlayers, configuredCourts, courtMode);
  return Math.max(3, Math.ceil((safePlayers - 1) / Math.max(1, usage.activeCourts)) + 1);
}

function getLadderSessionMode(source = state.options) {
  return source?.ladder?.sessionMode === 'limited' ? 'limited' : 'open';
}

function getLadderRotationLimit(source = state.options, playerCount = state.participants, configuredCourts = state.options.fields) {
  if (getLadderSessionMode(source) !== 'limited') return null;
  const fallback = getDefaultLimitedLadderRotationCount(playerCount, configuredCourts, source?.ladder?.courtMode);
  return clampNumber(Number(source?.ladder?.rotationLimit) || fallback, 1, 999, fallback);
}

function isLadderOpenSession(schedule = state.schedule) {
  return (schedule?.meta?.sessionMode || getLadderSessionMode()) !== 'limited';
}

function isLadderSessionEnded(schedule = state.schedule) {
  return Boolean(schedule?.meta?.sessionEnded);
}

function getLadderRotationTotal(schedule = state.schedule) {
  if (!schedule || schedule.format !== 'ladder') return schedule?.meta?.rotationCount || schedule?.rotations?.length || null;
  if (isLadderOpenSession(schedule)) return null;
  return schedule.meta?.rotationLimit || schedule.meta?.rotationCount || schedule.rotations.length;
}

function formatLadderRotationLabel(rotation, schedule = state.schedule) {
  if (!rotation) return 'Rotation';
  const base = rotation.groupLabel ? `${rotation.groupLabel} · Rotation ${rotation.number}` : `Rotation ${rotation.number}`;
  const total = getLadderRotationTotal(schedule);
  return total ? `${base} / ${total}` : base;
}

function formatLadderSessionLabel(schedule = state.schedule) {
  return isLadderOpenSession(schedule) ? 'Session libre' : 'Session limitée';
}

function calculateLadderMaxCourts(playerCount) {
  return Math.floor(playerCount / 2);
}

function calculateOptimizedLadderCourts(playerCount, configuredCourts) {
  const maxCourts = calculateLadderMaxCourts(playerCount);
  const safeConfigured = clampNumber(Number(configuredCourts) || 1, 1, 16, 1);
  if (playerCount <= 8) {
    return Math.min(safeConfigured, maxCourts);
  }
  let reservePlayers = playerCount >= 12 ? Math.floor(playerCount * 0.25) : 2;
  if (reservePlayers % 2 !== 0) reservePlayers += 1;
  reservePlayers = Math.min(Math.max(reservePlayers, 2), Math.max(0, playerCount - 2));
  const activePlayers = Math.max(2, playerCount - reservePlayers);
  const optimizedCourts = Math.max(1, Math.floor(activePlayers / 2));
  return Math.min(safeConfigured, maxCourts, optimizedCourts);
}

function resolveLadderCourtUsage(playerCount, configuredCourts, courtMode = getLadderCourtMode()) {
  const safePlayers = Math.max(0, Number(playerCount) || 0);
  const safeConfigured = clampNumber(Number(configuredCourts) || 1, 1, 16, 1);
  const maxCourts = Math.max(1, calculateLadderMaxCourts(safePlayers));
  const activeCourts =
    courtMode === 'max'
      ? Math.min(safeConfigured, maxCourts)
      : calculateOptimizedLadderCourts(safePlayers, safeConfigured);
  return {
    courtMode,
    configuredCourts: safeConfigured,
    maxCourts,
    activeCourts,
  };
}

function resolveLadderCourtDistribution(activeCourts, ladderOptions = {}) {
  const totalCourts = Math.max(1, Number(activeCourts) || 1);
  const mode = ladderOptions.mode || 'free';
  if (mode === 'free') {
    return { refereeCourts: 0, freeCourts: totalCourts };
  }
  if (mode === 'arbiter') {
    return { refereeCourts: totalCourts, freeCourts: 0 };
  }
  const requestedReferee = Math.min(Math.max(Number(ladderOptions.refereeCourts) || 0, 0), totalCourts);
  const refereeCourts = requestedReferee > 0 ? requestedReferee : Math.max(1, Math.floor(totalCourts / 2));
  return {
    refereeCourts,
    freeCourts: Math.max(totalCourts - refereeCourts, 0),
  };
}

function getLadderMode() {
  const ladder = state.options.ladder || {};
  return ladder.mode || inferLadderMode(state.options.fields, ladder.refereeCourts || 0, ladder.freeCourts || 0);
}

function normalizeLadderOptions(requestedMode = getLadderMode()) {
  const fields = clampNumber(Number(state.options.fields) || 1, 1, 16, 1);
  const ladder = state.options.ladder || {
    mode: 'free',
    sessionMode: 'open',
    rotationLimit: null,
    courtMode: 'optimized',
    refereePlacement: 'top',
    manualRefereeFields: [],
    refereeCourts: 0,
    freeCourts: fields,
  };
  let mode = ['free', 'arbiter', 'mixed'].includes(requestedMode) ? requestedMode : inferLadderMode(fields, ladder.refereeCourts, ladder.freeCourts);
  let refereeCourts = clampNumber(Number(ladder.refereeCourts) || 0, 0, fields, 0);
  let freeCourts = clampNumber(Number(ladder.freeCourts) || 0, 0, fields, 0);
  const sessionMode = ladder.sessionMode === 'limited' ? 'limited' : 'open';
  const rotationLimit = sessionMode === 'limited' ? getLadderRotationLimit({ ladder }, state.participants, fields) : null;
  const refereePlacement = normalizeLadderRefereePlacement(ladder.refereePlacement);
  const manualRefereeFields = normalizeManualRefereeFields(ladder.manualRefereeFields, fields);
  if (mode === 'free') {
    refereeCourts = 0;
    freeCourts = fields;
  } else if (mode === 'arbiter') {
    refereeCourts = Math.max(refereeCourts || fields, 1);
    refereeCourts = clampNumber(refereeCourts, 1, fields, fields);
    freeCourts = Math.max(fields - refereeCourts, 0);
    if (freeCourts > 0) {
      mode = 'mixed';
    }
  } else {
    if (fields <= 1) {
      mode = 'arbiter';
      refereeCourts = 1;
      freeCourts = 0;
    } else {
      if (refereeCourts <= 0 || refereeCourts >= fields) {
        refereeCourts = Math.max(1, Math.floor(fields / 2));
      }
      freeCourts = fields - refereeCourts;
    }
  }
  state.options.ladder = {
    ...ladder,
    mode,
    sessionMode,
    rotationLimit,
    refereePlacement,
    manualRefereeFields,
    refereeCourts,
    freeCourts,
    courtMode: getLadderCourtMode(),
  };
}

function setLadderMode(mode) {
  normalizeLadderOptions(mode);
  if (elements.ladderRefereeCourts) {
    elements.ladderRefereeCourts.value = state.options.ladder.refereeCourts;
  }
  if (elements.ladderFreeCourts) {
    elements.ladderFreeCourts.value = state.options.ladder.freeCourts;
  }
  updateLadderSettingsVisibility();
  persistState();
}

function setLadderCourtMode(mode) {
  state.options.ladder = {
    ...(state.options.ladder || {}),
    courtMode: mode === 'max' ? 'max' : 'optimized',
  };
  updateLadderSettingsVisibility();
  persistState();
}

function selectSpreadFieldNumbers(totalCourts, count) {
  if (count <= 0 || totalCourts <= 0) return [];
  if (count === 1) return [1];
  const values = [];
  for (let index = 0; index < count; index += 1) {
    const field = Math.round((index * (totalCourts - 1)) / Math.max(count - 1, 1)) + 1;
    values.push(field);
  }
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function getRequestedLadderRefereeCount(totalCourts, ladderOptions = {}, mode = ladderOptions.mode || getLadderMode()) {
  if (mode === 'free' || totalCourts <= 0) return 0;
  if (ladderOptions.refereePlacement === 'manual') {
    return normalizeManualRefereeFields(ladderOptions.manualRefereeFields, totalCourts).length;
  }
  if (mode === 'arbiter') return totalCourts;
  const requested = clampNumber(Number(ladderOptions.refereeCourts) || 0, 0, totalCourts, 0);
  return requested > 0 ? requested : Math.max(1, Math.floor(totalCourts / 2));
}

function selectLadderRefereeFields(totalCourts, ladderOptions = {}, mode = ladderOptions.mode || getLadderMode(), forcedCount = null) {
  if (mode === 'free' || totalCourts <= 0) return [];
  const count = forcedCount == null ? getRequestedLadderRefereeCount(totalCourts, ladderOptions, mode) : Math.max(0, Math.min(totalCourts, forcedCount));
  const placement = normalizeLadderRefereePlacement(ladderOptions.refereePlacement);
  if (placement === 'manual') {
    return normalizeManualRefereeFields(ladderOptions.manualRefereeFields, totalCourts).slice(0, count || undefined);
  }
  if (placement === 'bottom') {
    return Array.from({ length: count }, (_, index) => totalCourts - count + index + 1);
  }
  if (placement === 'spread') {
    const spread = selectSpreadFieldNumbers(totalCourts, count);
    if (spread.length === count) return spread;
  }
  return Array.from({ length: count }, (_, index) => index + 1);
}

function computeLadderSetupSummary(playerCount = state.participants, configuredCourts = state.options.fields, optionSource = state.options) {
  const safePlayers = Math.max(0, Number(playerCount) || 0);
  const safeConfiguredCourts = clampNumber(Number(configuredCourts) || 1, 1, 16, 1);
  const ladderOptions = optionSource?.ladder || {};
  const mode = ['free', 'arbiter', 'mixed'].includes(ladderOptions.mode) ? ladderOptions.mode : getLadderMode();
  const courtUsage = resolveLadderCourtUsage(safePlayers, safeConfiguredCourts, ladderOptions.courtMode);
  let activeCourts = courtUsage.activeCourts;
  const requestedReferees = getRequestedLadderRefereeCount(activeCourts, ladderOptions, mode);
  while (activeCourts > 0 && 2 * activeCourts + Math.min(requestedReferees, activeCourts) > safePlayers) {
    activeCourts -= 1;
  }
  const refereeCourts = Math.min(
    selectLadderRefereeFields(activeCourts, ladderOptions, mode, requestedReferees).length,
    Math.max(safePlayers - activeCourts * 2, 0),
    activeCourts
  );
  const refereeFields = selectLadderRefereeFields(activeCourts, ladderOptions, mode, refereeCourts);
  const playingPlayers = activeCourts * 2;
  const refereePlayers = refereeCourts;
  const waitingPlayers = Math.max(safePlayers - playingPlayers - refereePlayers, 0);
  const simpleCourts = Math.min(safeConfiguredCourts, Math.floor(safePlayers / 2));
  const extraPlayers = Math.max(safePlayers - simpleCourts * 2, 0);
  const tips = [];
  if (safeConfiguredCourts > simpleCourts) {
    tips.push(
      `${safePlayers} élèves pour ${safeConfiguredCourts} terrains : ${simpleCourts} match${simpleCourts > 1 ? 's' : ''} simultané${simpleCourts > 1 ? 's' : ''} possible${simpleCourts > 1 ? 's' : ''}.`
    );
  }
  if (extraPlayers > 0) {
    const possibleRefCourts = Math.min(extraPlayers, safeConfiguredCourts);
    tips.push(
      `${extraPlayers} élève${extraPlayers > 1 ? 's' : ''} disponible${extraPlayers > 1 ? 's' : ''} : vous pouvez créer ${possibleRefCourts} terrain${possibleRefCourts > 1 ? 's' : ''} avec arbitre.`
    );
  }
  if (waitingPlayers > 0) {
    tips.push(`${waitingPlayers} élève${waitingPlayers > 1 ? 's' : ''} en attente.`);
  } else if (refereePlayers > 0) {
    tips.push(`${refereePlayers} terrain${refereePlayers > 1 ? 's' : ''} avec arbitre intégré${refereePlayers > 1 ? 's' : ''}.`);
  } else {
    tips.push('Configuration équilibrée.');
  }
  if (2 * activeCourts + requestedReferees > safePlayers) {
    tips.push("Pas assez d'élèves pour utiliser tous les terrains demandés avec arbitre : l'app réduit automatiquement les terrains actifs.");
  }
  return {
    mode,
    activeCourts,
    configuredCourts: safeConfiguredCourts,
    maxCourts: courtUsage.maxCourts,
    courtMode: courtUsage.courtMode,
    refereeCourts,
    freeCourts: Math.max(activeCourts - refereeCourts, 0),
    refereeFields,
    playingPlayers,
    refereePlayers,
    waitingPlayers,
    simpleCourts,
    extraPlayers,
    tips,
  };
}

function renderLadderManualPlacementGrid() {
  if (!elements.ladderManualPlacementGrid) return;
  const totalCourts = clampNumber(Number(state.options.fields) || 1, 1, 16, 1);
  const selected = new Set(normalizeManualRefereeFields(state.options.ladder?.manualRefereeFields, totalCourts));
  elements.ladderManualPlacementGrid.innerHTML = Array.from({ length: totalCourts }, (_, index) => {
    const field = index + 1;
    return `
      <label class="ladder-manual-option">
        <input type="checkbox" data-ladder-manual-field="${field}" ${selected.has(field) ? 'checked' : ''} />
        <span>Terrain ${field}</span>
      </label>
    `;
  }).join('');
}

function setLadderRefereePlacement(value) {
  state.options.ladder = {
    ...(state.options.ladder || {}),
    refereePlacement: normalizeLadderRefereePlacement(value),
  };
  updateLadderSettingsVisibility();
  persistState();
}

function toggleManualLadderRefereeField(fieldNumber, enabled) {
  const totalCourts = clampNumber(Number(state.options.fields) || 1, 1, 16, 1);
  const current = new Set(normalizeManualRefereeFields(state.options.ladder?.manualRefereeFields, totalCourts));
  if (enabled) {
    current.add(fieldNumber);
  } else {
    current.delete(fieldNumber);
  }
  state.options.ladder = {
    ...(state.options.ladder || {}),
    refereePlacement: 'manual',
    manualRefereeFields: Array.from(current).sort((a, b) => a - b),
    refereeCourts: current.size,
  };
  updateLadderSettingsVisibility();
  persistState();
}

function parseDelimitedRankingRows(raw) {
  return raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(/[;,]/).map(part => part.trim()));
}

function extractImportedRankingNames(raw) {
  const rows = parseDelimitedRankingRows(raw);
  if (!rows.length) return [];
  const firstRow = rows[0];
  const normalizedHeader = firstRow.map(value => value.toLowerCase());
  const nameColumn = normalizedHeader.findIndex(value => value === 'nom' || value === 'name');
  const hasHeader = nameColumn !== -1 || normalizedHeader.includes('rang') || normalizedHeader.includes('rank');
  const sourceRows = hasHeader ? rows.slice(1) : rows;
  const candidates = sourceRows
    .map(columns => {
      if (columns.length === 1) return columns[0];
      if (nameColumn !== -1) return columns[nameColumn];
      const nonNumeric = columns.find(value => value && !/^\d+$/.test(value));
      return nonNumeric || columns[0];
    })
    .map(value => value?.replace(/^"|"$/g, '').trim())
    .filter(Boolean);
  return Array.from(new Set(candidates));
}

function applyImportedLadderNames(names) {
  if (!Array.isArray(names) || names.length < 2) {
    alert('Import impossible : au moins deux noms ordonnés sont nécessaires.');
    return;
  }
  applyModeDefinition('raquettes-montee-descente', { skipNavigation: true });
  state.participants = clampNumber(names.length, 2, 32, names.length);
  state.teamNames = ensureTeamListLength(names, state.participants, 'raquette');
  state.entityStatuses = ensureEntityStatusLength([], state.participants);
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  persistState();
  const schedule = generateSchedule(getFinalTeamNames(), state.options);
  renderResults(schedule, { resetScores: true });
  if (isLadderLiveMode(schedule)) {
    openLadderPilotModal();
  } else {
    goTo('results');
  }
}

function applyImportedSwissNames(names) {
  if (!Array.isArray(names) || names.length < 2) {
    alert('Import impossible : au moins deux noms ordonnés sont nécessaires.');
    return;
  }
  applyModeDefinition('raquettes-ronde-suisse', { skipNavigation: true });
  state.participants = clampNumber(names.length, 2, 32, names.length);
  state.teamNames = ensureTeamListLength(names, state.participants, 'raquette');
  state.entityStatuses = ensureEntityStatusLength([], state.participants);
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  persistState();
  const schedule = generateSchedule(getFinalTeamNames(), state.options);
  renderResults(schedule, { resetScores: true });
  goTo('results');
}

async function handleTeamRankingImport(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  try {
    const raw = await file.text();
    const names = extractImportedRankingNames(raw);
    if (state.activeModeId === 'raquettes-ronde-suisse') {
      applyImportedSwissNames(names);
    } else {
      applyImportedLadderNames(names);
    }
  } catch (error) {
    console.error('Import ladder impossible', error);
    alert("Impossible d'importer ce fichier.");
  } finally {
    event.target.value = '';
  }
}

function setLadderSessionMode(mode) {
  const sessionMode = mode === 'limited' ? 'limited' : 'open';
  const defaultLimit = getDefaultLimitedLadderRotationCount(state.participants, state.options.fields);
  state.options.ladder = {
    ...(state.options.ladder || {}),
    sessionMode,
    rotationLimit: sessionMode === 'limited' ? getLadderRotationLimit(state.options, state.participants, state.options.fields) || defaultLimit : null,
  };
  updateLadderSettingsVisibility();
  persistState();
}

function updateModeBadges() {
  if (elements.universeBadge) {
    const universe = UNIVERSES[state.universeId];
    elements.universeBadge.textContent = universe ? universe.badge : 'Univers à choisir';
  }
  if (elements.modeBadge) {
    const mode = MODE_DEFINITIONS[state.activeModeId];
    elements.modeBadge.textContent = mode ? mode.badge : 'Mode non sélectionné';
  }
}

function updateModeContextPanel() {
  const mode = MODE_DEFINITIONS[state.activeModeId];
  const universe = UNIVERSES[state.universeId];
  if (elements.modeOptionsTitle) {
    elements.modeOptionsTitle.textContent = mode ? mode.label : 'Choisissez un mode';
  }
  if (elements.modeOptionsDescription) {
    elements.modeOptionsDescription.textContent = mode
      ? mode.description
      : 'Sélectionnez un mode pour afficher les réglages ciblés.';
  }
  if (elements.modeOptionsEyebrow) {
    elements.modeOptionsEyebrow.textContent = universe ? universe.label : 'Univers';
  }
  if (elements.modePracticeChip) {
    elements.modePracticeChip.textContent = universe ? universe.badge : 'Mode';
  }
  updateModeParticipantsLabel();
  updateModeFieldVisibility();
}

function updateModeParticipantsLabel() {
  if (!elements.modeParticipantsLabel) return;
  const practice = state.practiceType || 'sport-co';
  elements.modeParticipantsLabel.textContent = practice === 'sport-co' ? 'Nombre d’équipes' : 'Nombre de joueurs';
}

function updateModeFieldVisibility() {
  if (!elements.modeFieldBlocks || !elements.modeFieldBlocks.forEach) return;
  const activeId = state.activeModeId;
  elements.modeFieldBlocks.forEach(node => {
    const targetsAttr = node.dataset.modeField || 'all';
    const targets = targetsAttr
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);
    const show = !targets.length || targets.includes('all') || targets.includes(activeId);
    node.classList.toggle('hidden', !show);
  });
}

function setResultsMode(mode) {
  if (!elements.resultsScreen) return;
  const next = mode === 'pilot' ? 'pilot' : 'read';
  uiState.resultsMode = next;
  elements.resultsScreen.dataset.resultsMode = next;
  if (elements.resultsModeButtons && elements.resultsModeButtons.forEach) {
    elements.resultsModeButtons.forEach(btn => {
      const target = btn.dataset.resultsModeTarget === 'pilot' ? 'pilot' : 'read';
      btn.classList.toggle('active', target === next);
      btn.setAttribute('aria-pressed', target === next ? 'true' : 'false');
    });
  }
  updateResultsModeNote();
}

function updateResultsModeNote() {
  if (!elements.resultsModeNote) return;
  if (uiState.resultsMode === 'read') {
    elements.resultsModeNote.textContent = 'Passez en mode « Pilotage » pour ajuster les rotations ou accéder aux actions avancées.';
  } else {
    if (state.schedule?.format === 'swiss') {
      elements.resultsModeNote.textContent = 'Mode Pilotage : ouvre la page dédiée de saisie de la ronde suisse en cours.';
      return;
    }
    elements.resultsModeNote.textContent = isLadderLiveMode(state.schedule)
      ? 'Mode Pilotage : ouvre la console de saisie dédiée de la rotation en cours.'
      : 'Mode Pilotage : toutes les actions de préparation et de saisie sont visibles ci-dessous.';
  }
}

function enterUniverse(universeId) {
  const universe = UNIVERSES[universeId];
  if (!universe) return;
  state.universeId = universeId;
  updateTheme(universeId);
  const availableModes = universe.modeIds || [];
  const hasActiveMode = availableModes.includes(state.activeModeId);
  if (!hasActiveMode && availableModes.length) {
    applyModeDefinition(availableModes[0], { skipNavigation: true });
  } else {
    renderModeCards();
    updateModeScreenCopy();
  }
  persistState();
  goTo('type');
}

function handleModeSelection(modeId) {
  const applied = applyModeDefinition(modeId);
  if (!applied) return;
  if (elements.modeNextBtn) {
    elements.modeNextBtn.disabled = false;
    elements.modeNextBtn.focus();
  }
  setTimeout(() => goTo('count'), 120);
}

function applyModeDefinition(modeId, options = {}) {
  const definition = MODE_DEFINITIONS[modeId];
  if (!definition) return false;
  const previousPractice = state.practiceType;
  state.activeModeId = definition.id;
  state.universeId = definition.universe;
  state.practiceType = definition.practiceType;
  if (TOURNAMENT_MODES[definition.tournamentType]) {
    state.tournamentType = definition.tournamentType;
  }
  updateTheme(state.universeId);
  renderModeCards();
  updateModeScreenCopy();
  updateModeBadges();
  updateLadderSettingsVisibility();
  updateLadderModeUiState();
  if (previousPractice !== state.practiceType) {
    state.teamNames = ensureTeamListLength(state.teamNames, state.participants, state.practiceType);
    state.entityStatuses = ensureEntityStatusLength(state.entityStatuses, state.participants);
    updateTeamScreenCopy();
    updateCountScreenCopy();
    buildTeamFields(state.participants);
  }
  persistState();
  updateGenerateButtonState();
  if (!options.skipNavigation && elements.modeNextBtn) {
    elements.modeNextBtn.disabled = false;
  }
  return true;
}

function updateTheme(universeId) {
  document.body.classList.remove('theme-sportco', 'theme-raquettes');
  const universe = UNIVERSES[universeId];
  if (universe && universe.themeClass) {
    document.body.classList.add(universe.themeClass);
  }
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
  updateLadderSettingsVisibility();
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
    input.id = `teamName-${index + 1}`;
    input.name = `teamName-${index + 1}`;
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
  const challengeClassNameInput = document.getElementById('challengeClassName');
  if (challengeClassNameInput) {
    challengeClassNameInput.value = getSessionName();
  }
  const challengeRangeInput = document.getElementById('challengeRange');
  if (challengeRangeInput) {
    challengeRangeInput.value = state.options.challengeRange ?? 5;
  }
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
  if (elements.worldCupGroupCount) {
    elements.worldCupGroupCount.value = state.options.worldCupGroupCount ?? 2;
  }
  if (elements.ladderRefereeCourts) {
    elements.ladderRefereeCourts.value = state.options.ladder?.refereeCourts ?? 0;
  }
  if (elements.ladderFreeCourts) {
    elements.ladderFreeCourts.value = state.options.ladder?.freeCourts ?? 0;
  }
  if (elements.ladderRotationLimit) {
    elements.ladderRotationLimit.value = getLadderRotationLimit(state.options, state.participants, state.options.fields) ?? getDefaultLimitedLadderRotationCount(state.participants, state.options.fields);
  }
  if (elements.ladderRefereePlacement) {
    elements.ladderRefereePlacement.value = normalizeLadderRefereePlacement(state.options.ladder?.refereePlacement);
  }
  renderLadderManualPlacementGrid();
  updateLadderSettingsVisibility();
  if (elements.modeParticipantsInput) {
    elements.modeParticipantsInput.value = state.participants;
  }
  syncScoreFieldVisibility();
  updateTeamScreenCopy();
  updateCountScreenCopy();
  updateRoleControlsState();
  updateModeContextPanel();
  updateGenerateButtonState();
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
  try {
    if (state.activeModeId === 'raquettes-defi' && !hasChallengeClassName()) {
      alert('Renseignez une classe ou un groupe pour sauvegarder ce classement.');
      updateGenerateButtonState();
      return;
    }
    const teams = getFinalTeamNames();
    if (teams.length < 2) {
      alert(`Ajoutez au moins deux ${formatParticipantLabel({ plural: true })}.`);
      return;
    }
    state.teamNames = teams;
    buildTeamFields(state.participants);
    const schedule = generateSchedule(teams, state.options);
    if (!state.schedule || state.schedule.format !== schedule.format || !state.sessionId) {
      ensureCurrentSessionMetadata({ forceNew: true });
    }
    renderResults(schedule, { resetScores: true });
    if (isLadderLiveMode(schedule)) {
      openLadderPilotModal();
      return;
    }
    goTo('results');
  } catch (error) {
    console.error('Erreur lors du lancement du tournoi', error);
    alert('Impossible de lancer le tournoi. Ouvrez la console pour voir l’erreur.');
  }
}

function renderResults(schedule, options = {}) {
  const preserveTimestamp = Boolean(options.preserveTimestamp);
  const resetScores = Boolean(options.resetScores);
  const isChallenge = schedule?.format === 'challenge';
  const isLadder = isLadderLiveMode(schedule);
  const isSwiss = schedule?.format === 'swiss';
  if (resetScores) {
    state.scores = {};
    state.validatedMatches = {};
    if (isLadder) {
      state.entityStatuses = ensureEntityStatusLength([], state.participants);
      state.statusLog = [];
    }
  }
  state.schedule = schedule;
  hydrateScheduleForSpecialModes(state.schedule);
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
  toggleChallengeLayout(isChallenge);
  toggleLadderResultsLayout(isLadder);
  if (isChallenge) {
    renderChallengeBoard(schedule);
    saveChallengeClassSnapshot();
  } else if (isSwiss) {
    renderSwissBoard(schedule);
  } else {
    renderRotationView(schedule.rotations);
  }
  const teamEntries = buildTeamEntriesFromSchedule(schedule);
  schedule.teams = teamEntries;
  renderTeamView(teamEntries);
  renderRankingView(schedule);
  renderLiveRankingPanel(schedule.rotations[state.liveRotationIndex]?.number || 1);
  const defaultRotation = Number.isInteger(state.liveRotationIndex) ? state.liveRotationIndex + 1 : 1;
  const maxRotation =
    getLadderRotationTotal(state.schedule) ||
    (state.schedule && state.schedule.meta && state.schedule.meta.rotationCount) ||
    state.schedule?.rotations?.length ||
    1;
  const highlightTarget = Math.min(maxRotation, Math.max(1, defaultRotation));
  highlightRotation(highlightTarget);
  setActiveView('rotations');
  elements.regenerateBtn.disabled = false;
  setLiveModeAvailability(true);
  handleTimerVisibility();
  renderChronoScreen();
  updateSaveActionsState();
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
  const analysisMetrics = buildPedagogyMetrics(meta, summary, meta.optionsSnapshot || state.options);
  const openEstimate = analysisMetrics?.kind === 'ladder-open-estimated' ? getOpenLadderSessionEstimate(meta.optionsSnapshot || state.options) : null;
  const primaryCards = [
    { label: participantLabel, value: meta.teamCount },
    { label: fieldLabel, value: meta.fieldCount },
    {
      label:
        analysisMetrics?.kind === 'ladder-open-per-rotation'
          ? 'Cycle de rotation'
          : analysisMetrics?.kind === 'ladder-open-estimated'
            ? 'Séance estimée'
            : 'Durée tournoi',
      value:
        analysisMetrics?.kind === 'ladder-open-estimated'
          ? openEstimate?.estimatedTotalMinutes != null
            ? humanizeDuration(openEstimate.estimatedTotalMinutes)
            : '-'
          : summary
            ? humanizeDuration(summary.totalMinutes)
            : '-',
    },
    {
      label:
        analysisMetrics?.kind === 'ladder-open-per-rotation'
          ? 'Statut séance'
          : analysisMetrics?.kind === 'ladder-open-estimated'
            ? 'Fin estimée'
            : 'Fin prévue',
      value:
        analysisMetrics?.kind === 'ladder-open-per-rotation'
          ? 'Libre'
          : analysisMetrics?.kind === 'ladder-open-estimated'
            ? openEstimate?.estimatedEnd || '—'
            : summary?.estimatedEnd || '-',
    },
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
  if (meta.format === 'ladder' && meta.sessionMode === 'open') {
    parts.push('session libre');
  } else if (meta.rotationCount) {
    parts.push(`${meta.rotationCount} rotation${meta.rotationCount > 1 ? 's' : ''}`);
  }
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

function toggleChallengeLayout(enabled) {
  if (!elements.resultsScreen) return;
  elements.resultsScreen.classList.toggle('results-challenge', Boolean(enabled));
  if (!enabled) {
    clearChallengeHighlights();
    resetChallengeSelection();
    clearChallengeEditContext();
    closeChallengeDialog();
  }
}

function toggleLadderResultsLayout(enabled) {
  if (!elements.resultsScreen) return;
  elements.resultsScreen.classList.toggle('results-ladder-simplified', Boolean(enabled));
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
  if (format === 'ladder' || format === 'challenge' || format === 'swiss') {
    return null;
  }
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
  const rotationCount = meta.format === 'ladder' && meta.sessionMode === 'open' ? 'Libre' : totalRotations ?? '-';
  const analysisMetrics = buildPedagogyMetrics(meta, summary, state.options);
  const openEstimate = analysisMetrics?.kind === 'ladder-open-estimated' ? getOpenLadderSessionEstimate(state.options) : null;
  const durationLabel =
    analysisMetrics?.kind === 'ladder-open-estimated'
      ? openEstimate?.estimatedTotalMinutes != null
        ? humanizeDuration(openEstimate.estimatedTotalMinutes)
        : '-'
      : summary
        ? humanizeDuration(summary.totalMinutes)
        : '-';
  const durationMinutesLabel = summary ? `${Math.round(summary.totalMinutes)} min` : '-';
  const endLabel =
    analysisMetrics?.kind === 'ladder-open-estimated' ? openEstimate?.estimatedEnd ?? '—' : summary?.estimatedEnd ?? '—';
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
        <span>${
          analysisMetrics?.kind === 'ladder-open-per-rotation'
            ? 'Cycle de rotation'
            : analysisMetrics?.kind === 'ladder-open-estimated'
              ? 'Séance estimée'
              : 'Durée du tournoi'
        }</span>
        <strong>${durationLabel}</strong>
      </div>
      <div class="simulation-metric">
        <span>${
          analysisMetrics?.kind === 'ladder-open-per-rotation'
            ? 'Statut séance'
            : analysisMetrics?.kind === 'ladder-open-estimated'
              ? 'Fin estimée'
              : 'Fin prévue'
        }</span>
        <strong>${analysisMetrics?.kind === 'ladder-open-per-rotation' ? 'Libre' : endLabel}</strong>
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
  const quickMode = practice === 'raquette' ? 'raquettes-poule' : 'sportco-championnat';
  if (MODE_DEFINITIONS[quickMode]) {
    state.activeModeId = quickMode;
    state.universeId = MODE_DEFINITIONS[quickMode].universe;
  }
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
  renderModeCards();
  updateModeScreenCopy();
  persistState();
  const teams = getFinalTeamNames();
  if (teams.length < 2) {
    alert(`Ajoutez au moins deux ${formatParticipantLabel({ plural: true })} pour lancer la génération EPS.`);
    return;
  }
  const schedule = generateSchedule(teams, state.options);
  renderResults(schedule, { resetScores: true });
  if (isLadderLiveMode(schedule)) {
    openLadderPilotModal();
    return;
  }
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
  const practice = state.practiceType || 'sport-co';
  const isSportCo = practice === 'sport-co';
  const label = isSportCo ? 'Nombre d’équipes' : 'Nombre de participants';
  const actionLabel = isSportCo ? 'd’équipes' : 'de participants';
  elements.countTitle.textContent = label;
  if (elements.countMinus) {
    elements.countMinus.setAttribute('aria-label', `Moins ${actionLabel}`);
  }
  if (elements.countPlus) {
    elements.countPlus.setAttribute('aria-label', `Plus ${actionLabel}`);
  }
  if (elements.teamCountSlider) {
    elements.teamCountSlider.setAttribute('aria-label', `Ajuster ${actionLabel}`);
  }
  updateModeParticipantsLabel();
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
  if (meta.format === 'ladder') {
    const teamCount = Number(meta.teamCount);
    const duration = Number(options?.duration);
    if (!Number.isFinite(teamCount) || teamCount <= 0 || !Number.isFinite(duration) || duration <= 0) {
      return null;
    }
    const sessionMode = meta.sessionMode === 'limited' ? 'limited' : 'open';
    const totalMatchCount = Number(meta.matchCount);
    const limitedRotationCount = Number(meta.rotationCount) || Number(meta.rotationLimit) || 0;
    const rotationsForAverage = sessionMode === 'limited' && limitedRotationCount > 0 ? limitedRotationCount : 1;
    const matchesPerRotation = Number.isFinite(totalMatchCount) ? totalMatchCount / rotationsForAverage : null;
    const activePlayersPerRotation =
      matchesPerRotation != null ? Math.min(teamCount, Math.max(0, matchesPerRotation * 2)) : null;
    const restingPlayersPerRotation =
      activePlayersPerRotation != null ? Math.max(teamCount - activePlayersPerRotation, 0) : null;
    const timePerActivePlayer = duration;
    const averageTimePerPlayerPerRotation =
      activePlayersPerRotation != null ? (activePlayersPerRotation / teamCount) * duration : null;
    const engagementPerRotation =
      activePlayersPerRotation != null ? (activePlayersPerRotation / teamCount) * 100 : null;

    if (sessionMode === 'open') {
      const estimate = getOpenLadderSessionEstimate(options);
      if (estimate.rotationEstimate != null && estimate.rotationEstimate > 0) {
        const totalActiveSlots = Number.isFinite(activePlayersPerRotation) ? activePlayersPerRotation * estimate.rotationEstimate : null;
        const matchesPerTeam = totalActiveSlots != null ? totalActiveSlots / teamCount : null;
        const timePerTeam = matchesPerTeam != null ? matchesPerTeam * duration : null;
        const totalMinutes = estimate.estimatedTotalMinutes;
        const waitTime =
          Number.isFinite(totalMinutes) && Number.isFinite(matchesPerTeam) && matchesPerTeam > 0
            ? Math.max(totalMinutes / matchesPerTeam - duration, 0)
            : null;
        const engagement =
          Number.isFinite(totalMinutes) && totalMinutes > 0 && Number.isFinite(timePerTeam) ? (timePerTeam / totalMinutes) * 100 : null;
        const indicator = classifyLadderPerRotationLevel(engagementPerRotation);
        return {
          kind: 'ladder-open-estimated',
          teamCount,
          sessionMode,
          rotationEstimate: estimate.rotationEstimate,
          matchesPerRotation,
          activePlayersPerRotation,
          restingPlayersPerRotation,
          timePerActivePlayer,
          averageTimePerPlayerPerRotation,
          engagementPerRotation,
          matchesPerTeam,
          timePerTeam,
          waitTime,
          engagement,
          minMatchesPerPlayer: totalActiveSlots != null ? Math.floor(totalActiveSlots / teamCount) : null,
          maxMatchesPerPlayer: totalActiveSlots != null ? Math.ceil(totalActiveSlots / teamCount) : null,
          indicator,
          guidance: buildLadderPedagogyGuidance({
            restingPlayersPerRotation,
            engagement: engagementPerRotation,
            perRotation: true,
          }),
        };
      }
      const indicator = classifyLadderPerRotationLevel(engagementPerRotation);
      return {
        kind: 'ladder-open-per-rotation',
        teamCount,
        sessionMode,
        matchesPerRotation,
        activePlayersPerRotation,
        restingPlayersPerRotation,
        timePerActivePlayer,
        averageTimePerPlayerPerRotation,
        engagementPerRotation,
        timePerTeam: averageTimePerPlayerPerRotation,
        waitTime: null,
        engagement: engagementPerRotation,
        indicator,
        guidance: buildLadderPedagogyGuidance({
          restingPlayersPerRotation,
          engagement: engagementPerRotation,
          perRotation: true,
        }),
      };
    }

    const matchesPerTeam = Number.isFinite(totalMatchCount) ? (totalMatchCount * 2) / teamCount : null;
    const timePerTeam = matchesPerTeam != null ? matchesPerTeam * duration : null;
    const totalMinutes = Number(summary?.totalMinutes);
    let waitTime = null;
    if (Number.isFinite(totalMinutes) && Number.isFinite(matchesPerTeam) && matchesPerTeam > 0) {
      waitTime = Math.max(totalMinutes / matchesPerTeam - duration, 0);
    }
    let engagement = null;
    if (Number.isFinite(totalMinutes) && totalMinutes > 0 && Number.isFinite(timePerTeam)) {
      engagement = (timePerTeam / totalMinutes) * 100;
    }
    const totalActiveSlots = Number.isFinite(activePlayersPerRotation) ? activePlayersPerRotation * rotationsForAverage : null;
    const indicator = classifyEngagementLevel(engagement);
    return {
      kind: 'ladder-limited',
      teamCount,
      sessionMode,
      rotationCount: rotationsForAverage,
      matchesPerRotation,
      activePlayersPerRotation,
      restingPlayersPerRotation,
      timePerActivePlayer,
      averageTimePerPlayerPerRotation,
      engagementPerRotation,
      matchesPerTeam,
      timePerTeam,
      waitTime,
      engagement,
      minMatchesPerPlayer: totalActiveSlots != null ? Math.floor(totalActiveSlots / teamCount) : null,
      maxMatchesPerPlayer: totalActiveSlots != null ? Math.ceil(totalActiveSlots / teamCount) : null,
      indicator,
      guidance: buildLadderPedagogyGuidance({
        restingPlayersPerRotation,
        engagement,
        perRotation: false,
      }),
    };
  }
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

function getOpenLadderSessionEstimate(options) {
  const availableInfo = getAvailableWindow(options || {});
  const availableMinutes = availableInfo.availableMinutes;
  const duration = Number(options?.duration);
  if (availableMinutes == null || !Number.isFinite(duration) || duration <= 0) {
    return { ...availableInfo, rotationEstimate: null, estimatedTotalMinutes: null, estimatedEnd: null };
  }
  const turnaround = Math.max(Number(options?.turnaround) || 0, 0);
  const breakMinutes = Math.max(Number(options?.breakMinutes) || 0, 0);
  const usableMinutes = Math.max(availableMinutes - breakMinutes, 0);
  if (usableMinutes < duration) {
    return { ...availableInfo, rotationEstimate: 0, estimatedTotalMinutes: breakMinutes, estimatedEnd: null };
  }
  const rotationEstimate = Math.max(1, Math.floor((usableMinutes + turnaround) / (duration + turnaround)));
  const estimatedTotalMinutes = rotationEstimate * duration + Math.max(rotationEstimate - 1, 0) * turnaround + breakMinutes;
  const estimatedEnd = availableInfo.startMinutes != null ? formatTime(availableInfo.startMinutes + estimatedTotalMinutes) : null;
  return { ...availableInfo, rotationEstimate, estimatedTotalMinutes, estimatedEnd };
}

function classifyLadderPerRotationLevel(value) {
  if (!Number.isFinite(value)) {
    return { label: 'Rendement moteur non évalué', level: 'neutral' };
  }
  if (value >= 85) {
    return { label: 'Très bon rendement moteur', level: 'high' };
  }
  if (value >= 70) {
    return { label: 'Rendement moteur correct', level: 'medium' };
  }
  return { label: 'Rendement moteur faible', level: 'low' };
}

function buildLadderPedagogyGuidance({ restingPlayersPerRotation, engagement, perRotation }) {
  const lines = [];
  if (Number(restingPlayersPerRotation) === 1) {
    lines.push("Un joueur est au repos à chaque rotation : pensez à faire tourner l'élève en attente à chaque cycle.");
  } else if (Number(restingPlayersPerRotation) > 1) {
    lines.push('Pensez à faire tourner les élèves au repos à chaque cycle.');
  }
  if (Number(restingPlayersPerRotation) >= 3) {
    lines.push("Beaucoup d'attente : augmentez le nombre de terrains, réduisez le nombre de joueurs actifs ou passez en rotations limitées.");
  }
  if (!Number.isFinite(engagement)) {
    return lines;
  }
  const highThreshold = perRotation ? 85 : 40;
  const lowThreshold = perRotation ? 70 : 25;
  if (engagement >= highThreshold) {
    lines.push('Très bon rendement moteur.');
  } else if (engagement < lowThreshold) {
    lines.push(
      perRotation
        ? 'Engagement moteur faible : augmentez le nombre de terrains ou réduisez le temps de rotation.'
        : "Augmentez le nombre de terrains ou réduisez le temps d'attente."
    );
  }
  return lines;
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

function formatPedagogyMinutesLabel(value) {
  if (!Number.isFinite(value) || value < 0) return '—';
  if (Math.abs(value - Math.round(value)) < 0.05) {
    return `${Math.round(value)} min`;
  }
  if (value < 60) {
    return `${value.toFixed(1).replace('.', ',')} min`;
  }
  return humanizeDuration(Math.round(value));
}

function formatEngagementPercent(value) {
  if (!Number.isFinite(value)) return '—';
  return `${Math.round(value)}%`;
}

function buildAnalysisListHTML(metrics) {
  if (!metrics) return '<ul class="analysis-list"><li>Données insuffisantes.</li></ul>';
  if (metrics.kind === 'ladder-open-per-rotation') {
    const guidance = (metrics.guidance || []).map(line => `<li>${line}</li>`).join('');
    return `
      <ul class="analysis-list">
        <li>Session libre — indicateurs par rotation</li>
        <li>Joueurs actifs / total : ${Math.round(metrics.activePlayersPerRotation || 0)} / ${metrics.teamCount}</li>
        <li>Joueurs au repos par rotation : ${Math.round(metrics.restingPlayersPerRotation || 0)}</li>
        <li>Temps de jeu joueur actif : ${formatPedagogyMinutesLabel(metrics.timePerActivePlayer)}</li>
        <li>Temps moyen par joueur : ${formatPedagogyMinutesLabel(metrics.averageTimePerPlayerPerRotation)} par rotation</li>
        <li>Engagement moteur par rotation : ${formatEngagementPercent(metrics.engagementPerRotation)}</li>
      </ul>
      ${guidance ? `<p><strong>Guidage enseignant</strong></p><ul class="analysis-list">${guidance}</ul>` : ''}
    `;
  }
  if (metrics.kind === 'ladder-open-estimated') {
    const distribution =
      metrics.minMatchesPerPlayer != null && metrics.maxMatchesPerPlayer != null
        ? `Répartition estimée : ${metrics.minMatchesPerPlayer}-${metrics.maxMatchesPerPlayer} matchs par joueur`
        : null;
    const guidance = (metrics.guidance || []).map(line => `<li>${line}</li>`).join('');
    return `
      <ul class="analysis-list">
        <li>Session libre — estimation sur ${metrics.rotationEstimate} rotations possibles</li>
        <li>Joueurs actifs / total : ${Math.round(metrics.activePlayersPerRotation || 0)} / ${metrics.teamCount}</li>
        <li>Joueurs au repos par rotation : ${Math.round(metrics.restingPlayersPerRotation || 0)}</li>
        <li>Temps de jeu joueur actif : ${formatPedagogyMinutesLabel(metrics.timePerActivePlayer)}</li>
        <li>Temps moyen par joueur : ${formatPedagogyMinutesLabel(metrics.averageTimePerPlayerPerRotation)} par rotation</li>
        <li>Matchs estimés par joueur : ${formatMatchesDisplay(metrics.matchesPerTeam)}</li>
        <li>Temps de jeu estimé par joueur : ${formatPedagogyMinutesLabel(metrics.timePerTeam)}</li>
        <li>Engagement moteur estimé : ${formatEngagementPercent(metrics.engagement)}</li>
        ${distribution ? `<li>${distribution}</li>` : ''}
      </ul>
      ${guidance ? `<p><strong>Guidage enseignant</strong></p><ul class="analysis-list">${guidance}</ul>` : ''}
    `;
  }
  if (metrics.kind === 'ladder-limited') {
    const distribution =
      metrics.minMatchesPerPlayer != null && metrics.maxMatchesPerPlayer != null
        ? `${metrics.minMatchesPerPlayer}-${metrics.maxMatchesPerPlayer} matchs / joueur`
        : '—';
    const guidance = (metrics.guidance || []).map(line => `<li>${line}</li>`).join('');
    return `
      <ul class="analysis-list">
        <li>Session limitée : ${metrics.rotationCount} rotations prévues</li>
        <li>Matchs moyens par joueur : ${formatMatchesDisplay(metrics.matchesPerTeam)}</li>
        <li>Temps de jeu moyen par joueur : ${formatPedagogyMinutesLabel(metrics.timePerTeam)}</li>
        <li>Temps moyen d'attente : ${formatPedagogyMinutesLabel(metrics.waitTime)}</li>
        <li>Engagement moteur estimé : ${formatEngagementPercent(metrics.engagement)}</li>
        <li>Répartition estimée : ${distribution}</li>
        ${guidance}
      </ul>
    `;
  }
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

function buildPracticeStatsHTML(metrics, practiceStats) {
  if (metrics?.kind === 'ladder-open-per-rotation') {
    return `
      <ul class="practice-stats">
        <li><span>Session libre</span><strong>Indicateurs par rotation</strong></li>
        <li><span>Joueurs actifs / total</span><strong>${Math.round(metrics.activePlayersPerRotation || 0)} / ${metrics.teamCount}</strong></li>
        <li><span>Joueurs au repos</span><strong>${Math.round(metrics.restingPlayersPerRotation || 0)}</strong></li>
        <li><span>Temps joueur actif</span><strong>${formatPedagogyMinutesLabel(metrics.timePerActivePlayer)}</strong></li>
        <li><span>Temps moyen / joueur</span><strong>${formatPedagogyMinutesLabel(metrics.averageTimePerPlayerPerRotation)} / rotation</strong></li>
        <li><span>Engagement / rotation</span><strong>${formatEngagementPercent(metrics.engagementPerRotation)}</strong></li>
      </ul>
    `;
  }
  if (metrics?.kind === 'ladder-open-estimated') {
    return `
      <ul class="practice-stats">
        <li><span>Session libre</span><strong>Estimation sur ${metrics.rotationEstimate} rotations</strong></li>
        <li><span>Joueurs actifs / total</span><strong>${Math.round(metrics.activePlayersPerRotation || 0)} / ${metrics.teamCount}</strong></li>
        <li><span>Joueurs au repos</span><strong>${Math.round(metrics.restingPlayersPerRotation || 0)}</strong></li>
        <li><span>Temps joueur actif</span><strong>${formatPedagogyMinutesLabel(metrics.timePerActivePlayer)}</strong></li>
        <li><span>Temps moyen / joueur</span><strong>${formatPedagogyMinutesLabel(metrics.averageTimePerPlayerPerRotation)} / rotation</strong></li>
        <li><span>Engagement estimé</span><strong>${formatEngagementPercent(metrics.engagement)}</strong></li>
      </ul>
    `;
  }
  if (metrics?.kind === 'ladder-limited') {
    const distribution =
      metrics.minMatchesPerPlayer != null && metrics.maxMatchesPerPlayer != null
        ? `${metrics.minMatchesPerPlayer}-${metrics.maxMatchesPerPlayer} matchs`
        : '—';
    return `
      <ul class="practice-stats">
        <li><span>Rotations prévues</span><strong>${metrics.rotationCount}</strong></li>
        <li><span>Matchs moyens / joueur</span><strong>${formatMatchesDisplay(metrics.matchesPerTeam)}</strong></li>
        <li><span>Temps moyen / joueur</span><strong>${formatPedagogyMinutesLabel(metrics.timePerTeam)}</strong></li>
        <li><span>Attente moyenne</span><strong>${formatPedagogyMinutesLabel(metrics.waitTime)}</strong></li>
        <li><span>Engagement estimé</span><strong>${formatEngagementPercent(metrics.engagement)}</strong></li>
        <li><span>Répartition min/max</span><strong>${distribution}</strong></li>
      </ul>
    `;
  }
  const practiceTotalLabel = practiceStats?.practiceTotal != null ? `${humanizeDuration(practiceStats.practiceTotal)} (cumulées)` : '—';
  const practicePerTeamLabel = practiceStats?.practicePerTeam != null ? formatMinutesLabel(practiceStats.practicePerTeam) : '—';
  const waitLabel = practiceStats?.waitTime != null ? formatMinutesLabel(practiceStats.waitTime) : '—';
  const engagementLabel = practiceStats?.engagement != null ? formatEngagementPercent(practiceStats.engagement) : '—';
  const marginLabel = formatMarginLabel(practiceStats?.margin);
  return `
    <ul class="practice-stats">
      <li><span>Temps de pratique total</span><strong>${practiceTotalLabel}</strong></li>
      <li><span>Temps moyen par équipe</span><strong>${practicePerTeamLabel}</strong></li>
      <li><span>Attente moyenne</span><strong>${waitLabel}</strong></li>
      <li><span>Engagement moteur</span><strong>${engagementLabel}</strong></li>
      <li><span>Marge restante</span><strong>${marginLabel}</strong></li>
    </ul>
  `;
}

function applyRecommendedConfiguration(strategyId = null) {
  if (!latestRecommendation || !latestRecommendation.strategies) return;
  let target =
    (strategyId && latestRecommendation.strategies.find(entry => entry.id === strategyId)) ||
    latestRecommendation.strategies.find(entry => entry.id === latestRecommendation.bestStrategyId) ||
    latestRecommendation.strategies[0];
  if (!target) return;
  const { duration, turnaround, breakMinutes } = target.options;
  let hasChange = false;
  if (Number.isFinite(duration)) {
    state.options.duration = clampNumber(duration, 1, 180, duration);
    elements.matchDuration.value = state.options.duration;
    timerState.baseSeconds = state.options.duration * 60;
    hasChange = true;
  }
  if (Number.isFinite(turnaround)) {
    state.options.turnaround = clampNumber(turnaround, MIN_RECOMMENDED_TURNAROUND, 60, MIN_RECOMMENDED_TURNAROUND);
    elements.rotationBuffer.value = state.options.turnaround;
    hasChange = true;
  }
  if (Number.isFinite(breakMinutes)) {
    state.options.breakMinutes = clampNumber(breakMinutes, MIN_RECOMMENDED_BREAK, 600, MIN_RECOMMENDED_BREAK);
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
  state.options.matchMode = defaults.matchMode;
  state.options.scoreTarget = defaults.scoreTarget;
  state.options.worldCupGroupCount = defaults.worldCupGroupCount;
  state.options.timer = defaults.timer;
  state.options.sound = defaults.sound;
  state.options.vibration = defaults.vibration;
  state.options.roleSettings = { ...DEFAULT_ROLE_SETTINGS };
  state.options.ladder = {
    mode: defaults.ladder?.mode ?? 'free',
    courtMode: defaults.ladder?.courtMode ?? 'optimized',
    refereeCourts: defaults.ladder?.refereeCourts ?? 0,
    freeCourts: defaults.ladder?.freeCourts ?? 0,
  };
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
  if (elements.matchModeSelect) {
    elements.matchModeSelect.value = state.options.matchMode;
  }
  if (elements.scoreTargetInput) {
    elements.scoreTargetInput.value = state.options.scoreTarget;
  }
  if (elements.worldCupGroupCount) {
    elements.worldCupGroupCount.value = state.options.worldCupGroupCount;
  }
  if (elements.timerToggle) {
    elements.timerToggle.checked = state.options.timer;
  }
  if (elements.soundToggle) {
    elements.soundToggle.checked = state.options.sound;
  }
  if (elements.vibrationToggle) {
    elements.vibrationToggle.checked = state.options.vibration;
  }
  if (elements.ladderRefereeCourts) {
    elements.ladderRefereeCourts.value = state.options.ladder.refereeCourts;
  }
  if (elements.ladderFreeCourts) {
    elements.ladderFreeCourts.value = state.options.ladder.freeCourts;
  }
  updateLadderSettingsVisibility();
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

const RECOMMENDATION_PROFILES = [
  {
    id: 'practice',
    label: 'Optimisé pratique',
    description: 'Maximise le temps de jeu et l’engagement moteur.',
    weights: { engagement: 0.5, practice: 0.3, wait: 0.1, margin: 0.1 },
    bias: 'lowTurnaround',
  },
  {
    id: 'balanced',
    label: 'Équilibré',
    description: 'Compromis entre intensité et respiration.',
    weights: { engagement: 0.4, practice: 0.25, wait: 0.2, margin: 0.15 },
    bias: 'balanced',
  },
  {
    id: 'comfort',
    label: 'Confort terrain',
    description: 'Plus de rotation/pause pour encadrer sereinement.',
    weights: { engagement: 0.3, practice: 0.2, wait: 0.3, margin: 0.2 },
    bias: 'highTurnaround',
  },
];

const MIN_RECOMMENDED_TURNAROUND = 1;
const IDEAL_RECOMMENDED_TURNAROUND = 2;
const MAX_RECOMMENDED_TURNAROUND = 5;
const MIN_RECOMMENDED_BREAK = 0;
const DEFAULT_RECOMMENDED_BREAK = 5;

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

function getAvailableWindow(options) {
  const startMinutes = parseTime(options.startTime);
  const availableDurationInput =
    Number.isFinite(options.availableDuration) && options.availableDuration > 0 ? options.availableDuration : null;
  let availableMinutes = availableDurationInput;
  let endMinutes = null;
  if (availableMinutes == null && options.endTime && startMinutes != null) {
    const parsedEnd = parseTime(options.endTime);
    if (parsedEnd != null) {
      endMinutes = parsedEnd;
      let diff = parsedEnd - startMinutes;
      if (diff <= 0) diff += 24 * 60;
      availableMinutes = diff;
    }
  }
  const label = availableMinutes != null ? humanizeDuration(availableMinutes) : 'Non renseigné';
  return { availableMinutes, startMinutes, endMinutes, label };
}

function buildDurationCandidates(availableMinutes) {
  const base = [4, 5, 6, 7, 8, 9, 10, 12, 15];
  if (availableMinutes && availableMinutes < 60) {
    return base.filter(value => value <= 10);
  }
  if (availableMinutes && availableMinutes > 140) {
    return [...base, 18];
  }
  return base;
}

function buildTurnaroundCandidates(availableMinutes) {
  if (availableMinutes && availableMinutes < 60) return [MIN_RECOMMENDED_TURNAROUND, IDEAL_RECOMMENDED_TURNAROUND];
  if (availableMinutes && availableMinutes > 140) return [1, 2, 3, 4, MAX_RECOMMENDED_TURNAROUND];
  if (availableMinutes && availableMinutes > 100) return [1, 2, 3, 4];
  return [1, 2, 3];
}

function buildBreakCandidates(availableMinutes) {
  if (!availableMinutes || availableMinutes < 55) return [0, 3, 5];
  if (availableMinutes < 90) return [0, 5, 8];
  if (availableMinutes < 130) return [0, 5, 10];
  return [0, 5, 10, 15];
}

function buildPracticeStats(meta, summary, metrics, availableInfo, options) {
  const matchCount = Number(meta?.matchCount);
  const duration = Number(options?.duration);
  const practiceTotal =
    Number.isFinite(matchCount) && Number.isFinite(duration) ? Math.max(matchCount * duration, 0) : null;
  const practicePerTeam = metrics?.timePerTeam ?? null;
  const waitTime = metrics?.waitTime ?? null;
  const engagement = metrics?.engagement ?? null;
  const margin = summary?.feasibility ? summary.feasibility.delta : null;
  const durationEstimate = summary?.totalMinutes ?? null;
  return {
    practiceTotal,
    practicePerTeam,
    waitTime,
    engagement,
    margin,
    durationEstimate,
    availableMinutes: availableInfo.availableMinutes,
    availableLabel: availableInfo.label,
    matchCount,
  };
}

function scoreRecommendationCandidate(profile, context) {
  const { summary, metrics, practiceStats, options } = context;
  const feasible = summary?.feasibility ? summary.feasibility.ok : true;
  const engagement = clamp01((metrics?.engagement ?? 0) / 100);
  const practicePerTeam = practiceStats.practicePerTeam ?? 0;
  const availableMinutes = practiceStats.availableMinutes;
  const rotationMinutes = Math.max(Number(options.turnaround) || MIN_RECOMMENDED_TURNAROUND, MIN_RECOMMENDED_TURNAROUND);
  const breakMinutes = Math.max(Number(options.breakMinutes) || 0, MIN_RECOMMENDED_BREAK);
  const practiceNorm = availableMinutes
    ? clamp01(practicePerTeam / Math.max(availableMinutes * 0.65, 1))
    : clamp01(practicePerTeam / 45);
  const wait = practiceStats.waitTime ?? 0;
  const waitNorm = 1 - clamp01(wait / (profile.id === 'comfort' ? 18 : 12));
  const margin = practiceStats.margin;
  let marginNorm = 0.5;
  if (margin != null && availableMinutes) {
    if (margin >= 0) {
      marginNorm = 1 - clamp01(margin / Math.max(availableMinutes * 0.5, 1));
    } else {
      marginNorm = Math.max(0, 1 + margin / Math.max(availableMinutes * 0.3, 1));
    }
  }
  const utilization =
    availableMinutes && Number.isFinite(practiceStats.durationEstimate)
      ? clamp01(practiceStats.durationEstimate / Math.max(availableMinutes, 1))
      : 0;
  const rotationCloseness = 1 - clamp01(Math.abs(rotationMinutes - IDEAL_RECOMMENDED_TURNAROUND) / MAX_RECOMMENDED_TURNAROUND);
  const zeroBreakPenalty =
    breakMinutes === 0 && availableMinutes && margin != null && margin > 5
      ? 0.05 + clamp01(margin / Math.max(availableMinutes, 1)) * 0.05
      : 0;
  const rotationFloorPenalty = rotationMinutes <= MIN_RECOMMENDED_TURNAROUND ? 0.05 : 0;
  const rotationBonus = rotationCloseness * 0.03;
  const utilizationBonus = utilization * 0.05;
  const breakBonus = breakMinutes >= DEFAULT_RECOMMENDED_BREAK && margin != null && margin >= 5 ? 0.02 : 0;
  let score =
    profile.weights.engagement * engagement +
    profile.weights.practice * practiceNorm +
    profile.weights.wait * waitNorm +
    profile.weights.margin * marginNorm;
  if (profile.bias === 'lowTurnaround') {
    score += clamp01(1 - rotationMinutes / 4) * 0.05;
  } else if (profile.bias === 'highTurnaround') {
    score += clamp01(rotationMinutes / 4) * 0.05;
  }
  score += utilizationBonus + rotationBonus + breakBonus;
  score -= zeroBreakPenalty + rotationFloorPenalty;
  if (!feasible) {
    score -= 0.5;
  }
  return score;
}

function formatMarginLabel(margin) {
  if (margin == null) return '—';
  const prefix = margin >= 0 ? '+' : '−';
  return `${prefix}${humanizeDuration(Math.abs(margin))}`;
}

function computeRecommendedConfiguration(teams) {
  const availableInfo = getAvailableWindow(state.options);
  const durationCandidates = buildDurationCandidates(availableInfo.availableMinutes);
  const turnaroundCandidates = buildTurnaroundCandidates(availableInfo.availableMinutes);
  const breakCandidates = buildBreakCandidates(availableInfo.availableMinutes);
  const profileResults = new Map();
  let candidateFound = false;
  for (const duration of durationCandidates) {
    for (const turnaround of turnaroundCandidates) {
      for (const breakMinutes of breakCandidates) {
        const candidateOptions = {
          ...state.options,
          duration,
          turnaround: Math.max(turnaround, MIN_RECOMMENDED_TURNAROUND),
          breakMinutes: Math.max(breakMinutes, MIN_RECOMMENDED_BREAK),
        };
        let schedule;
        try {
          schedule = generateSchedule(teams, candidateOptions);
        } catch (error) {
          console.warn('Simulation recommandée impossible', error);
          continue;
        }
        if (!schedule || !schedule.meta) continue;
        candidateFound = true;
        const summary = computeTimeSummary(schedule, candidateOptions);
        const metrics = buildPedagogyMetrics(schedule.meta, summary, candidateOptions);
        const practiceStats = buildPracticeStats(schedule.meta, summary, metrics, availableInfo, candidateOptions);
        const feasible = Boolean(summary?.feasibility ? summary.feasibility.ok : true);
        const context = { summary, metrics, practiceStats, options: candidateOptions };
        RECOMMENDATION_PROFILES.forEach(profile => {
          const score = scoreRecommendationCandidate(profile, context);
          const current = profileResults.get(profile.id);
          const shouldReplace =
            !current ||
            (!current.feasible && feasible) ||
            (current.feasible === feasible && score > current.score);
          if (shouldReplace) {
            profileResults.set(profile.id, {
              id: profile.id,
              label: profile.label,
              description: profile.description,
              options: candidateOptions,
              summary,
              metrics,
              practiceStats,
              feasible,
              score,
            });
          }
        });
      }
    }
  }
  if (!candidateFound) return null;
  const strategies = RECOMMENDATION_PROFILES.map(profile => profileResults.get(profile.id)).filter(Boolean);
  if (!strategies.length) return null;
  const feasibleStrategies = strategies.filter(entry => entry.feasible);
  let bestStrategy =
    feasibleStrategies.find(entry => entry.id === 'practice') ||
    feasibleStrategies.sort((a, b) => b.score - a.score)[0] ||
    strategies.find(entry => entry.id === 'practice');
  if (!bestStrategy) {
    bestStrategy = strategies.sort((a, b) => b.score - a.score)[0];
  }
  return {
    available: availableInfo,
    bestStrategyId: bestStrategy.id,
    strategies,
  };
}

function renderRecommendationResult(payload) {
  if (!elements.recommendationResult) return;
  if (payload.error) {
    elements.recommendationResult.innerHTML = `<h4>Configuration recommandée</h4><p>${payload.error}</p>`;
    elements.recommendationResult.classList.remove('hidden');
    return;
  }
  const strategies = payload.strategies || [];
  if (!strategies.length) {
    elements.recommendationResult.innerHTML = `<h4>Configuration recommandée</h4><p>Aucune combinaison exploitable.</p>`;
    elements.recommendationResult.classList.remove('hidden');
    return;
  }
  const primary = strategies.find(entry => entry.id === payload.bestStrategyId) || strategies[0];
  const secondary = strategies.filter(entry => entry.id !== primary.id);
  const primaryOptions = primary.options;
  const availableLabel = payload.available?.label ?? 'Non renseigné';
  const openEstimate = primary.metrics?.kind === 'ladder-open-estimated' ? getOpenLadderSessionEstimate(primaryOptions) : null;
  const durationTotalLabel =
    primary.metrics?.kind === 'ladder-open-estimated'
      ? openEstimate?.estimatedTotalMinutes != null
        ? humanizeDuration(openEstimate.estimatedTotalMinutes)
        : '—'
      : primary.summary
        ? humanizeDuration(primary.summary.totalMinutes)
        : '—';
  const endLabel =
    primary.metrics?.kind === 'ladder-open-estimated' ? openEstimate?.estimatedEnd ?? '—' : primary.summary?.estimatedEnd ?? '—';
  const marginLabel = formatMarginLabel(primary.practiceStats.margin);
  const statusLine = primary.feasible
    ? `✓ Profil ${primary.label} : ajusté au créneau`
    : `⚠ Profil ${primary.label} dépasse le créneau (${marginLabel}).`;
  const feedbackClass = recommendationApplied ? 'show' : '';
  const practiceStatsList = buildPracticeStatsHTML(primary.metrics, primary.practiceStats);
  const secondaryHtml = secondary.length
    ? `
      <div class="recommendation-variants">
        ${secondary
          .map(variant => {
            const variantMargin = formatMarginLabel(variant.practiceStats.margin);
            const variantEngagement = formatEngagementPercent(variant.practiceStats.engagement);
            const variantWait = variant.practiceStats.waitTime != null ? formatMinutesLabel(variant.practiceStats.waitTime) : '—';
            const variantClass = variant.feasible ? 'variant-card' : 'variant-card variant-warning';
            return `
              <article class="${variantClass}">
                <header>
                  <h5>${variant.label}</h5>
                  <span>${variant.feasible ? '✓ tient dans le créneau' : '⚠ dépasse légèrement'}</span>
                </header>
                <p class="variant-meta">Matchs ${variant.options.duration} min · Rotation ${variant.options.turnaround} min · Pause ${variant.options.breakMinutes} min</p>
                <p class="variant-meta">Engagement ${variantEngagement} · Attente ${variantWait} · Marge ${variantMargin}</p>
                <button class="btn ghost small" data-action="apply-recommendation" data-strategy-id="${variant.id}">Appliquer ce profil</button>
              </article>
            `;
          })
          .join('')}
      </div>
    `
    : '';
  elements.recommendationResult.innerHTML = `
    <h4 class="panel-title warm">
      <span class="panel-icon warm">🛠</span>
      <span>Configuration recommandée</span>
    </h4>
    <div class="recommendation-grid">
      <div class="metric">
        <span>Matchs</span>
        <strong>${primaryOptions.duration} min</strong>
      </div>
      <div class="metric">
        <span>Rotation</span>
        <strong>${primaryOptions.turnaround ?? 0} min</strong>
      </div>
      <div class="metric">
        <span>Pause globale</span>
        <strong>${primaryOptions.breakMinutes ?? 0} min</strong>
      </div>
      <div class="metric">
        <span>Créneau dispo</span>
        <strong>${availableLabel}</strong>
      </div>
    </div>
    <p class="recommendation-note">${statusLine}</p>
    <p class="recommendation-note">${
      primary.metrics?.kind === 'ladder-open-per-rotation'
        ? 'Session libre : les indicateurs ci-dessous sont calculés par rotation, pas sur toute la séance.'
        : primary.metrics?.kind === 'ladder-open-estimated'
          ? `Session libre : estimation sur ${primary.metrics.rotationEstimate} rotations possibles · ${durationTotalLabel} · fin estimée ${endLabel}`
          : `Durée estimée : ${durationTotalLabel} · Fin prévue : ${endLabel}`
    }</p>
    ${practiceStatsList}
    <div class="simulation-analysis">
      <h5>Analyse pédagogique</h5>
      ${buildAnalysisListHTML(primary.metrics)}
      ${buildAnalysisTagHTML(primary.metrics)}
    </div>
    <div class="recommendation-actions">
      <button class="btn primary" data-action="apply-recommendation" data-strategy-id="${primary.id}">Appliquer ce profil</button>
      <span class="recommendation-feedback ${feedbackClass}">Configuration appliquée</span>
    </div>
    ${secondaryHtml}
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
      const neutralized = isMatchNeutralized(participants);
      const homeLabel = decorateNameWithStatus(participants.home);
      const awayLabel = decorateNameWithStatus(participants.away);
      const disabledAttr = neutralized ? 'disabled' : '';
      const neutralBadge = neutralized ? `<span class="status-pill unavailable">Indisponible</span>` : '';
      const matchFieldToken = buildFieldToken(matchId);
      return `
      <li>
        <div class="match-label">
          <span class="match-title">${homeLabel} <span class="vs">vs</span> ${awayLabel} ${neutralBadge}</span>
          ${groupTag}
          <span class="field-label">${fieldText}</span>
        </div>
        <div class="score-inputs" aria-label="Score ${participants.home} ${participants.away}">
          <input type="number" min="0" inputmode="numeric" id="results-score-${matchFieldToken}-home" name="results-score-${matchFieldToken}-home" aria-label="Score ${participants.home}" data-rotation="${rotation.number}" data-match-id="${matchId}" data-score-input="home" value="${formatScoreValue(getScoreValue(matchId, 'home'))}" ${disabledAttr} />
          <span>:</span>
          <input type="number" min="0" inputmode="numeric" id="results-score-${matchFieldToken}-away" name="results-score-${matchFieldToken}-away" aria-label="Score ${participants.away}" data-rotation="${rotation.number}" data-match-id="${matchId}" data-score-input="away" value="${formatScoreValue(getScoreValue(matchId, 'away'))}" ${disabledAttr} />
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
      const badge = buildFieldBadgeHtml(index + 1);
      const header = `${fieldTitle} ${index + 1} ${badge}`;
      const items = field.matches.length
        ? field.matches
            .map(m => {
              const participants = resolveMatchParticipants(m, state.schedule);
              const groupTag = m.groupLabel ? `<span class="match-group-inline">${m.groupLabel}</span>` : '';
              const matchId = m.id || buildMatchKey(rotation.number, participants.home, participants.away);
              const roles = renderRoleLines(roleAssignments?.get(matchId));
              const badge = isMatchNeutralized(participants) ? `<span class="status-pill unavailable">Indisponible</span>` : '';
              return `<li>${decorateNameWithStatus(participants.home)} - ${decorateNameWithStatus(participants.away)} ${groupTag}${badge}${roles || ''}</li>`;
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

function buildFieldBadgeHtml(fieldNumber) {
  const profile = getLadderCourtProfile(fieldNumber);
  if (!profile) return '';
  const label = profile === 'arbiter' ? 'Arbitré' : 'Libre';
  return `<span class="field-badge ${profile}">${label}</span>`;
}

function getLadderCourtProfile(fieldNumber) {
  if (!state.schedule || state.schedule.format !== 'ladder') return null;
  if (!Number.isFinite(fieldNumber)) return null;
  const ladder = state.schedule.ladder || {};
  const refereeFields = Array.isArray(ladder.refereeFields) ? ladder.refereeFields : [];
  if (refereeFields.length) {
    return refereeFields.includes(fieldNumber) ? 'arbiter' : 'free';
  }
  const refereeCourts = Number(ladder.refereeCourts) || 0;
  const index = fieldNumber - 1;
  if (index < 0) return null;
  return index < refereeCourts ? 'arbiter' : 'free';
}

function renderRotationView(rotations) {
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const rotationCards = rotations
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
  if (state.schedule?.format === 'ladder') {
    elements.rotationView.innerHTML = `
      ${buildLadderResultsFocusCard()}
      ${rotationCards}
    `;
    return;
  }
  elements.rotationView.innerHTML = rotationCards;
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
  if (schedule.format === 'swiss') {
    const rows = updateSwissRanking(schedule);
    if (!rows.length) {
      elements.rankingView.innerHTML = '<p>Aucun classement Ronde Suisse disponible.</p>';
      appendRankingSessionSavePanel();
      return;
    }
    elements.rankingView.innerHTML = `
      <article class="ranking-card swiss-ranking-card">
        <header>
          <h3>Classement Ronde Suisse</h3>
          <span class="ranking-status">Ronde ${schedule.swiss?.round || 1}</span>
        </header>
        ${buildSwissRankingTable(rows)}
      </article>
    `;
    appendRankingSessionSavePanel();
    return;
  }
  if (schedule.format === 'challenge') {
    renderChallengeRanking(schedule);
    appendRankingSessionSavePanel();
    return;
  }
  if (schedule.format === 'ladder') {
    renderLadderRanking(schedule);
    appendRankingSessionSavePanel();
    return;
  }
  if (schedule.format && schedule.format !== 'round-robin') {
    renderGroupRankingCards(schedule);
    appendRankingSessionSavePanel();
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
  appendRankingSessionSavePanel();
}

function renderLadderRanking(schedule) {
  if (!elements.rankingView) return;
  const rows = computeLadderStandings(schedule);
  if (!rows.length) {
    elements.rankingView.innerHTML = '<p>Aucun classement montée-descente disponible.</p>';
    return;
  }
  const tableRows = rows
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.name}</td>
          <td>${row.played}</td>
          <td>${row.wins}</td>
          <td>${row.losses}</td>
          <td>${row.pointsFor}</td>
          <td>${row.pointsAgainst}</td>
          <td>${row.status}</td>
        </tr>`
    )
    .join('');
  elements.rankingView.innerHTML = `
    <article class="ranking-card ladder-ranking-card">
      <header>
        <h3>Classement Montée-descente</h3>
        <span class="ranking-status">${formatLadderModeLabel(getLadderMode())}</span>
      </header>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>MJ</th>
            <th>G</th>
            <th>P</th>
            <th>PM</th>
            <th>PE</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </article>
  `;
}

function renderChallengeRanking(schedule) {
  if (!elements.rankingView) return;
  const challenge = schedule.challenge;
  if (!challenge) {
    elements.rankingView.innerHTML = '<p>Aucun classement pour le moment.</p>';
    return;
  }
  const rows = buildChallengeRankingRows(schedule)
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.name}</td>
          <td>${row.played}</td>
          <td>${row.points}</td>
          <td>${row.pointsFor}</td>
          <td>${row.pointsAgainst}</td>
        </tr>`
    )
    .join('');
  elements.rankingView.innerHTML = `
    <article class="ranking-card">
      <header>
        <h3>Classement Défi</h3>
        <span class="ranking-status">Mise à jour manuelle</span>
      </header>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Joueur</th>
            <th>MJ</th>
            <th>Pts</th>
            <th>PM</th>
            <th>PE</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </article>
  `;
}

function renderChallengeBoard(schedule = state.schedule) {
  if (!elements.rotationView) return;
  if (!schedule || schedule.format !== 'challenge') {
    elements.rotationView.innerHTML = '';
    return;
  }
  ensureChallengeRoster(schedule);
  const challenge = schedule.challenge;
  const range = getChallengeRange();
  const className = getSessionName();
  const currentSessionSnapshot = state.sessionId ? getStoredSessionById(state.sessionId) : null;
  const lastSavedLabel = currentSessionSnapshot?.updatedAt
    ? new Date(currentSessionSnapshot.updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    : 'Aucune';
  if (!challenge || !challenge.names.length) {
    elements.rotationView.innerHTML =
      '<section class="challenge-shell challenge-clean"><p class="challenge-empty">Ajoutez des participants pour activer le mode Défi.</p></section>';
    return;
  }
  const rows = getChallengePlayers(schedule)
    .map((player, position) => {
      const statusKey = getEntityStatusByName(player.name);
      const isInactive = isEntityInactive(statusKey);
      const safeName = escapeChallengeDataValue(player.name);
      return `
        <article class="challenge-row${isInactive ? ' inactive' : ''}" data-player-id="${player.id}" data-player-position="${position}" data-player-name="${safeName}">
          <span class="challenge-rank">${position + 1}</span>
          <button type="button" class="challenge-name" data-challenge-select data-player-id="${player.id}">
            ${decorateNameWithStatus(player.name)}
          </button>
          <button
            type="button"
            class="challenge-action"
            data-challenge-open
            data-player-id="${player.id}"
            ${isInactive ? 'disabled' : ''}
          >
            Défi
          </button>
        </article>
      `;
    })
    .join('');

  elements.rotationView.innerHTML = `
    <section class="challenge-shell challenge-clean" aria-live="polite">
      <header class="challenge-shell-header">
        <div>
          <p class="eyebrow">Mode Défi</p>
          <h3>Classement · fenêtre ±${range}</h3>
        </div>
        <p class="challenge-shell-hint">
          Touchez un joueur pour voir ses adversaires · Touchez deux fois ou “Défi” pour saisir
        </p>
      </header>
      <div class="challenge-history-card">
        <div>
          <strong>Classe : ${escapeHtml(className || 'Classe non renseignée')}</strong>
          <p class="challenge-history-meta">Dernière sauvegarde : ${escapeHtml(lastSavedLabel)}</p>
        </div>
        <div class="challenge-shell-actions">
          ${
            className
              ? `
                <button type="button" class="btn ghost small" data-challenge-edit-class>Modifier le nom de classe</button>
                <button type="button" class="btn success small" data-challenge-save-class>Sauvegarder la séance</button>
              `
              : '<button type="button" class="btn success small" data-challenge-set-class>Ajouter une classe</button>'
          }
        </div>
      </div>
      ${buildChallengeHistoryBlock(challenge)}
      <div class="challenge-board" id="challengeBoard">
        ${rows}
      </div>
    </section>
  `;
  applyChallengeSelectionState(schedule);
}

function buildChallengeHistoryBlock(challenge) {
  const lastEntry = getLastChallengeHistoryEntry(challenge);
  if (!lastEntry) {
    return `
      <div class="challenge-history-card is-empty">
        <div>
          <strong>Aucun défi validé</strong>
          <p class="challenge-history-meta">Validez un premier résultat pour activer la correction express.</p>
        </div>
        <button class="btn ghost small" data-challenge-edit-last disabled>Modifier</button>
      </div>
    `;
  }
  const challengerName = getChallengePlayerLabel(lastEntry.challengerId, {
    schedule: state.schedule,
    fallbackPosition: lastEntry.challengerPos,
  });
  const opponentName = getChallengePlayerLabel(lastEntry.opponentId, {
    schedule: state.schedule,
    fallbackPosition: lastEntry.opponentPos,
  });
  return `
    <div class="challenge-history-card">
      <div>
        <strong>${escapeHtml(challengerName)}</strong> vs <strong>${escapeHtml(opponentName)}</strong> • ${lastEntry.challengerScore} – ${lastEntry.opponentScore}
        <p class="challenge-history-meta">Validé ${formatChallengeTimestamp(lastEntry.timestamp)}</p>
      </div>
      <button class="btn ghost small" data-challenge-edit-last>Modifier</button>
    </div>
  `;
}

function getLastChallengeHistoryEntry(challenge) {
  if (!challenge || !Array.isArray(challenge.history) || !challenge.history.length) return null;
  return challenge.history[challenge.history.length - 1];
}

function formatChallengeTimestamp(isoString) {
  if (!isoString) return 'il y a un instant';
  try {
    return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return 'il y a un instant';
  }
}

function escapeChallengeDataValue(value) {
  return escapeHtml(value);
}

function createChallengeStats() {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
    pointsFor: 0,
    pointsAgainst: 0,
  };
}

function normalizeChallengeStats(stats) {
  const base = createChallengeStats();
  if (!stats || typeof stats !== 'object') return base;
  return {
    played: Number.isFinite(Number(stats.played)) ? Number(stats.played) : base.played,
    wins: Number.isFinite(Number(stats.wins)) ? Number(stats.wins) : base.wins,
    losses: Number.isFinite(Number(stats.losses)) ? Number(stats.losses) : base.losses,
    draws: Number.isFinite(Number(stats.draws)) ? Number(stats.draws) : base.draws,
    points: Number.isFinite(Number(stats.points)) ? Number(stats.points) : base.points,
    pointsFor: Number.isFinite(Number(stats.pointsFor)) ? Number(stats.pointsFor) : base.pointsFor,
    pointsAgainst: Number.isFinite(Number(stats.pointsAgainst)) ? Number(stats.pointsAgainst) : base.pointsAgainst,
  };
}

function ensureChallengePlayerStats(player) {
  if (!player) return createChallengeStats();
  player.stats = normalizeChallengeStats(player.stats);
  return player.stats;
}

function ensureChallengeRoster(schedule = state.schedule) {
  if (!schedule || schedule.format !== 'challenge' || !schedule.challenge) return;
  const challenge = schedule.challenge;
  challenge.names = Array.isArray(challenge.names) ? challenge.names : (schedule.teams || []).map(team => team.name);
  challenge.range = clampNumber(Number(state.options.challengeRange ?? challenge.range) || 5, 1, 10, 5);
  const previousRoster = Array.isArray(challenge.roster) ? challenge.roster : [];
  const maxExistingId = previousRoster.reduce((max, player) => {
    const value = Number(player?.id);
    return Number.isInteger(value) ? Math.max(max, value) : max;
  }, challengeIdSeed);
  challengeIdSeed = Math.max(challengeIdSeed, maxExistingId);

  const usedIds = new Set();
  const nextRoster = challenge.names.map((name, index) => {
    let previousPlayer =
      previousRoster.find(
        candidate => candidate && !usedIds.has(Number(candidate.id)) && Number.isInteger(Number(candidate.id)) && candidate.name === name
      ) || null;
    if (!previousPlayer) {
      const direct = previousRoster[index];
      if (direct && !usedIds.has(Number(direct.id)) && Number.isInteger(Number(direct.id))) {
        previousPlayer = direct;
      }
    }
    const id = previousPlayer ? Number(previousPlayer.id) : generateChallengePlayerId();
    usedIds.add(id);
    return {
      id,
      name,
      stats: normalizeChallengeStats(previousPlayer?.stats),
    };
  });

  challenge.roster = nextRoster;
  const rosterIds = nextRoster.map(player => player.id);
  const rosterIdSet = new Set(rosterIds);
  const normalizedOrder = [];
  const seen = new Set();
  if (Array.isArray(challenge.order)) {
    challenge.order.forEach(entry => {
      const id = Number(entry);
      if (!Number.isInteger(id) || !rosterIdSet.has(id) || seen.has(id)) return;
      normalizedOrder.push(id);
      seen.add(id);
    });
  }
  rosterIds.forEach(id => {
    if (!seen.has(id)) {
      normalizedOrder.push(id);
      seen.add(id);
    }
  });
  challenge.order = normalizedOrder;
  challenge.history = Array.isArray(challenge.history) ? challenge.history.slice(-20) : [];
}

function getChallengeOrder(schedule = state.schedule) {
  ensureChallengeRoster(schedule);
  const order = Array.isArray(schedule?.challenge?.order) ? schedule.challenge.order : [];
  return order.map(Number).filter(Number.isInteger);
}

function getChallengePosition(playerId, schedule = state.schedule) {
  const id = Number(playerId);
  if (!Number.isInteger(id)) return -1;
  return getChallengeOrder(schedule).indexOf(id);
}

function getChallengePositionMap(schedule = state.schedule) {
  const map = new Map();
  getChallengeOrder(schedule).forEach((playerId, index) => map.set(playerId, index));
  return map;
}

function getChallengeRoster(schedule = state.schedule) {
  ensureChallengeRoster(schedule);
  return Array.isArray(schedule?.challenge?.roster) ? schedule.challenge.roster : [];
}

function getChallengePlayerMap(schedule = state.schedule) {
  const map = new Map();
  getChallengeRoster(schedule).forEach(player => {
    const id = Number(player?.id);
    if (!Number.isInteger(id)) return;
    map.set(id, player);
  });
  return map;
}

function getChallengePlayerById(playerId, schedule = state.schedule) {
  const id = Number(playerId);
  if (!Number.isInteger(id)) return null;
  return getChallengePlayerMap(schedule).get(id) || null;
}

function getChallengePlayerName(playerId, schedule = state.schedule) {
  return getChallengePlayerById(playerId, schedule)?.name || 'Participant';
}

function getChallengePlayerLabel(playerId, options = {}) {
  const schedule = options.schedule || state.schedule;
  const player = getChallengePlayerById(playerId, schedule);
  if (player?.name) return player.name;
  if (Number.isInteger(options.fallbackPosition)) {
    const fallbackBase = formatParticipantLabel({
      practiceType: getPracticeTypeFromMeta(schedule?.meta),
      capitalized: true,
    });
    return `${fallbackBase} ${options.fallbackPosition + 1}`;
  }
  return 'Participant';
}

function getChallengePlayers(schedule = state.schedule) {
  const order = getChallengeOrder(schedule);
  const playerMap = getChallengePlayerMap(schedule);
  return order.map(id => playerMap.get(id)).filter(Boolean);
}

function getChallengeNames(schedule = state.schedule) {
  ensureChallengeRoster(schedule);
  return Array.isArray(schedule?.challenge?.names) ? schedule.challenge.names : [];
}

function buildChallengeRankingRows(schedule = state.schedule) {
  return getChallengePlayers(schedule).map(player => {
    const stats = ensureChallengePlayerStats(player);
    return {
      id: player.id,
      name: player.name,
      played: stats.played,
      points: stats.points,
      pointsFor: stats.pointsFor,
      pointsAgainst: stats.pointsAgainst,
      wins: stats.wins,
      draws: stats.draws,
      losses: stats.losses,
      goalDiff: stats.pointsFor - stats.pointsAgainst,
    };
  });
}

function restoreChallengePlayerStats(playerId, statsSnapshot, schedule = state.schedule) {
  const player = getChallengePlayerById(playerId, schedule);
  if (!player) return;
  player.stats = normalizeChallengeStats(statsSnapshot);
}

function applyChallengeScoreToStats(challengerPlayer, opponentPlayer, challengerScore, opponentScore) {
  const challengerStats = ensureChallengePlayerStats(challengerPlayer);
  const opponentStats = ensureChallengePlayerStats(opponentPlayer);
  challengerStats.played += 1;
  opponentStats.played += 1;
  challengerStats.pointsFor += challengerScore;
  challengerStats.pointsAgainst += opponentScore;
  opponentStats.pointsFor += opponentScore;
  opponentStats.pointsAgainst += challengerScore;
  if (challengerScore > opponentScore) {
    challengerStats.wins += 1;
    challengerStats.points += 3;
    opponentStats.losses += 1;
  } else if (challengerScore < opponentScore) {
    opponentStats.wins += 1;
    opponentStats.points += 3;
    challengerStats.losses += 1;
  } else {
    challengerStats.draws += 1;
    opponentStats.draws += 1;
    challengerStats.points += 1;
    opponentStats.points += 1;
  }
}

function applyChallengeSelectionState(schedule = state.schedule) {
  const board = document.getElementById('challengeBoard');
  if (!board) return;
  board.querySelectorAll('.challenge-row').forEach(row => row.classList.remove('selected', 'highlight', 'challenge-out-of-range'));
  if (!Number.isInteger(_challengeSelectedId)) return;
  const selectedPlayer = getChallengePlayerById(_challengeSelectedId, schedule);
  if (!selectedPlayer || isEntityInactive(getEntityStatusByName(selectedPlayer.name))) {
    _challengeSelectedId = null;
    return;
  }
  const selectedPosition = getChallengePosition(_challengeSelectedId, schedule);
  if (selectedPosition < 0) {
    _challengeSelectedId = null;
    return;
  }
  const range = getChallengeRange();
  const start = Math.max(0, selectedPosition - range);
  const end = Math.min(getChallengeOrder(schedule).length - 1, selectedPosition + range);
  board.querySelectorAll('.challenge-row').forEach(row => {
    const playerId = Number(row.dataset.playerId);
    const position = getChallengePosition(playerId, schedule);
    if (!Number.isInteger(playerId) || position < 0) return;
    const player = getChallengePlayerById(playerId, schedule);
    if (player && isEntityInactive(getEntityStatusByName(player.name))) {
      row.classList.add('challenge-out-of-range');
      return;
    }
    if (playerId === _challengeSelectedId) {
      row.classList.add('selected');
      return;
    }
    if (position >= start && position <= end) {
      row.classList.add('highlight');
    } else {
      row.classList.add('challenge-out-of-range');
    }
  });
}

function clearChallengeAutoResetTimer() {
  if (_challengeAutoReset) {
    clearTimeout(_challengeAutoReset);
    _challengeAutoReset = null;
  }
}

function clearChallengeSelection() {
  clearChallengeAutoResetTimer();
  _challengeSelectedId = null;
  const board = document.getElementById('challengeBoard');
  if (!board) return;
  board.querySelectorAll('.challenge-row').forEach(row => row.classList.remove('selected', 'highlight', 'challenge-out-of-range'));
}

function clearChallengeHighlights() {
  clearChallengeSelection();
}

function resetChallengeSelection() {
  clearChallengeSelection();
}

function isChallengeSelectionActive() {
  return Number.isInteger(_challengeSelectedId);
}

function getChallengeOpponents(playerId, schedule = state.schedule) {
  const challengerId = Number(playerId);
  if (!Number.isInteger(challengerId)) return [];
  const challengerPosition = getChallengePosition(challengerId, schedule);
  if (challengerPosition < 0) return [];
  const order = getChallengeOrder(schedule);
  const range = getChallengeRange();
  const start = Math.max(0, challengerPosition - range);
  const end = Math.min(order.length - 1, challengerPosition + range);
  const opponents = [];
  for (let position = start; position <= end; position += 1) {
    const opponentId = Number(order[position]);
    if (!Number.isInteger(opponentId) || opponentId === challengerId) continue;
    const opponent = getChallengePlayerById(opponentId, schedule);
    if (!opponent || isEntityInactive(getEntityStatusByName(opponent.name))) continue;
    opponents.push({
      id: opponentId,
      label: `${position + 1}. ${opponent.name}`,
      position,
    });
  }
  return opponents;
}

function selectChallengePlayer(playerId) {
  const id = Number(playerId);
  if (!Number.isInteger(id)) return;
  const player = getChallengePlayerById(id);
  if (!player || isEntityInactive(getEntityStatusByName(player.name))) return;
  if (_challengeSelectedId === id) {
    clearChallengeSelection();
    openChallengeDialog(id);
    return;
  }
  clearChallengeAutoResetTimer();
  _challengeSelectedId = id;
  applyChallengeSelectionState();
  _challengeAutoReset = setTimeout(() => {
    clearChallengeSelection();
  }, 3000);
}

function getChallengeRowContextFromEventTarget(target) {
  const row = target.closest('.challenge-row');
  if (!row) return null;
  const playerId = Number(row.dataset.playerId);
  if (!Number.isInteger(playerId)) return null;
  const player = getChallengePlayerById(playerId);
  const position = getChallengePosition(playerId);
  if (!player || position < 0) return null;
  return { row, playerId, player, position };
}

function openChallengeDialog(playerId, options = {}) {
  if (!isChallengeModeActive()) return;
  if (!elements.challengeModal || !elements.challengeForm) return;
  ensureChallengeRoster(state.schedule);
  const challengerId = Number(playerId);
  const challenger = getChallengePlayerById(challengerId);
  const position = getChallengePosition(challengerId);
  if (!challenger || position < 0 || isEntityInactive(getEntityStatusByName(challenger.name))) {
    alert('Le joueur sélectionné est introuvable ou indisponible.');
    return;
  }

  const form = elements.challengeForm;
  const select = form.elements.opponentIndex;
  const { presetOpponentId = null, presetScores = null, editContext = null } = options;
  const opponents = getChallengeOpponents(challengerId);
  if (!editContext && !opponents.length) {
    alert(`Aucun adversaire disponible dans la fenêtre ±${getChallengeRange()}.`);
    return;
  }

  form.dataset.playerId = String(challengerId);
  form.dataset.playerPosition = String(position);
  if (form.elements.challengerIndex) {
    form.elements.challengerIndex.value = String(position);
  }
  const challengerScoreLabel = form.querySelector('label[for="challengeChallengerScore"] span');
  const opponentScoreLabel = form.querySelector('label[for="challengeOpponentScore"] span');
  const syncScoreLabels = () => {
    if (challengerScoreLabel) {
      challengerScoreLabel.textContent = `Score ${challenger.name}`;
    }
    if (opponentScoreLabel) {
      const selectedOpponentId = Number(select.value);
      const selectedOpponent = getChallengePlayerById(selectedOpponentId);
      opponentScoreLabel.textContent = `Score ${selectedOpponent?.name || 'adversaire'}`;
    }
  };

  if (editContext) {
    const opponentId = Number(presetOpponentId ?? editContext.opponentId);
    const opponent = getChallengePlayerById(opponentId);
    if (!Number.isInteger(opponentId) || !opponent) {
      alert('Impossible de rouvrir le dernier défi.');
      clearChallengeEditContext();
      return;
    }
    select.disabled = true;
    select.innerHTML = `<option value="${opponentId}">${escapeHtml(opponent.name)}</option>`;
    select.value = String(opponentId);
    form.elements.challengerScore.value = String(Number.isFinite(presetScores?.challenger) ? presetScores.challenger : editContext.challengerScore || 0);
    form.elements.opponentScore.value = String(Number.isFinite(presetScores?.opponent) ? presetScores.opponent : editContext.opponentScore || 0);
    updateChallengeDialogText(`Corriger · ${challenger.name}`, 'Mode correction : ce duel remplacera le précédent.');
    syncScoreLabels();
  } else {
    select.disabled = false;
    select.innerHTML = opponents.map(opponent => `<option value="${opponent.id}">${escapeHtml(opponent.label)}</option>`).join('');
    if (Number.isInteger(Number(presetOpponentId)) && opponents.some(opponent => opponent.id === Number(presetOpponentId))) {
      select.value = String(Number(presetOpponentId));
    } else {
      select.selectedIndex = 0;
    }
    form.elements.challengerScore.value = '0';
    form.elements.opponentScore.value = '0';
    updateChallengeDialogText(`Défi · ${challenger.name}`, `Choisissez un adversaire dans la fenêtre ±${getChallengeRange()} puis validez le score.`);
    syncScoreLabels();
  }

  select.onchange = () => {
    syncScoreLabels();
  };

  clearChallengeAutoResetTimer();
  elements.challengeModal.classList.remove('hidden');
  syncBodyModalState();
}

function handleChallengeClick(event) {
  if (!isChallengeModeActive()) return;
  const setClassBtn = event.target.closest('[data-challenge-set-class]');
  if (setClassBtn) {
    event.preventDefault();
    const nextName = promptForChallengeClassName(getSessionName());
    if (!nextName) return;
    setChallengeClassName(nextName);
    return;
  }
  const editClassBtn = event.target.closest('[data-challenge-edit-class]');
  if (editClassBtn) {
    event.preventDefault();
    const nextName = promptForChallengeClassName(getSessionName());
    if (!nextName) return;
    setChallengeClassName(nextName);
    return;
  }
  const saveClassBtn = event.target.closest('[data-challenge-save-class]');
  if (saveClassBtn) {
    event.preventDefault();
    saveCurrentChallengeClass();
    return;
  }
  const navBtn = event.target.closest('[data-challenge-nav]');
  if (navBtn) {
    event.preventDefault();
    handleChallengeNav(navBtn.dataset.challengeNav);
    return;
  }
  const editBtn = event.target.closest('[data-challenge-edit-last]');
  if (editBtn) {
    event.preventDefault();
    startChallengeHistoryEdit();
    return;
  }
  const openBtn = event.target.closest('[data-challenge-open]');
  if (openBtn) {
    event.preventDefault();
    event.stopPropagation();
    const playerId = Number(openBtn.dataset.playerId);
    const player = getChallengePlayerById(playerId);
    if (!player || isEntityInactive(getEntityStatusByName(player.name))) return;
    clearChallengeSelection();
    openChallengeDialog(playerId);
    return;
  }
  const context = getChallengeRowContextFromEventTarget(event.target);
  const clickTarget = event.target.closest('[data-challenge-select], .challenge-row');
  if (!context || !clickTarget) return;
  if (isEntityInactive(getEntityStatusByName(context.player.name))) return;
  event.preventDefault();
  selectChallengePlayer(context.playerId);
}

function handleChallengeDoubleClick(event) {
  if (!isChallengeModeActive()) return;
  const context = getChallengeRowContextFromEventTarget(event.target);
  const clickTarget = event.target.closest('.challenge-row, .challenge-name');
  if (!context || !clickTarget) return;
  if (isEntityInactive(getEntityStatusByName(context.player.name))) return;
  event.preventDefault();
  clearChallengeSelection();
  openChallengeDialog(context.playerId);
}

function startChallengeHistoryEdit() {
  if (!isChallengeModeActive()) return;
  const lastEntry = getLastChallengeHistoryEntry(state.schedule?.challenge);
  if (!lastEntry) {
    alert('Aucun défi à modifier pour le moment.');
    return;
  }
  challengeEditContext = {
    ...lastEntry,
    orderBefore: Array.isArray(lastEntry.orderBefore) ? [...lastEntry.orderBefore] : null,
  };
  openChallengeDialog(lastEntry.challengerId, {
    presetOpponentId: lastEntry.opponentId,
    presetScores: {
      challenger: lastEntry.challengerScore,
      opponent: lastEntry.opponentScore,
    },
    editContext: challengeEditContext,
  });
}

function closeChallengeDialog() {
  if (!elements.challengeModal || elements.challengeModal.classList.contains('hidden')) return;
  elements.challengeModal.classList.add('hidden');
  clearChallengeEditContext();
  clearChallengeSelection();
  syncBodyModalState();
}

function handleChallengeDialogAction(event) {
  if (!isChallengeModeActive()) return;
  const control = event.target.closest('[data-challenge-action]');
  if (!control) return;
  const action = control.dataset.challengeAction;
  if (action === 'close' || action === 'cancel') {
    event.preventDefault();
    closeChallengeDialog();
  }
}

function handleChallengeNav(action) {
  switch (action) {
    case 'back':
      goTo('options');
      break;
    case 'results':
      goTo('results');
      setResultsMode('read');
      break;
    case 'projection':
      if (!state.schedule) {
        alert('Générez un tournoi pour utiliser la projection.');
        return;
      }
      openProjectionScreen();
      break;
    case 'options':
      goTo('options');
      break;
    default:
      break;
  }
}

function updateChallengeDialogText(titleText, infoText) {
  if (elements.challengeModal) {
    const titleNode = elements.challengeModal.querySelector('#challengeDialogTitle');
    if (titleNode && titleText) {
      titleNode.textContent = titleText;
    }
  }
  if (elements.challengeDialogInfo) {
    elements.challengeDialogInfo.textContent =
      infoText || `Choisissez un adversaire dans la fenêtre ±${getChallengeRange()} puis saisissez le score.`;
  }
}

function exportChallengeRankingCsv() {
  if (!state.schedule || state.schedule.format !== 'challenge') return;
  const rows = buildChallengeRankingRows(state.schedule);
  if (!rows.length) return;
  const header = ['rang', 'nom', 'matchs', 'victoires', 'nuls', 'defaites', 'points', 'points_pour', 'points_contre', 'difference'].join(';');
  const body = rows
    .map((row, index) =>
      [
        index + 1,
        row.name,
        row.played,
        row.wins,
        row.draws,
        row.losses,
        row.points,
        row.pointsFor,
        row.pointsAgainst,
        row.goalDiff,
      ].join(';')
    )
    .join('\n');
  const csv = `\uFEFF${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `defi_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function clearChallengeEditContext() {
  challengeEditContext = null;
  if (elements.challengeForm?.elements?.opponentIndex) {
    elements.challengeForm.elements.opponentIndex.disabled = false;
  }
  if (elements.challengeForm?.elements?.challengerIndex) {
    elements.challengeForm.elements.challengerIndex.value = '';
  }
  if (elements.challengeForm?.dataset) {
    delete elements.challengeForm.dataset.playerId;
    delete elements.challengeForm.dataset.playerPosition;
  }
  updateChallengeDialogText(null, null);
}

function handleChallengeFormSubmit(event) {
  if (!isChallengeModeActive()) return;
  if (!event.target.matches('#challengeForm')) return;
  event.preventDefault();
  const form = event.target;
  const challengerId = Number(form.dataset.playerId);
  const opponentId = Number(form.elements.opponentIndex.value);
  const challenger = getChallengePlayerById(challengerId);
  const opponent = getChallengePlayerById(opponentId);
  if (!challenger || !opponent) {
    alert('Le classement vient de changer. Réessayez.');
    closeChallengeDialog();
    return;
  }
  const challengerPos = getChallengePosition(challengerId);
  const opponentPos = getChallengePosition(opponentId);
  if (challengerPos < 0 || opponentPos < 0 || challengerId === opponentId) {
    alert('Le classement vient de changer. Réessayez.');
    closeChallengeDialog();
    return;
  }
  const range = getChallengeRange();
  if (Math.abs(challengerPos - opponentPos) > range) {
    alert(`Adversaire non autorisé : la fenêtre actuelle est ±${range}.`);
    closeChallengeDialog();
    return;
  }
  const allowedOpponentIds = getChallengeOpponents(challengerId).map(entry => entry.id);
  if (!allowedOpponentIds.includes(opponentId)) {
    alert('Cet adversaire n’est plus disponible pour ce défi.');
    closeChallengeDialog();
    return;
  }
  const challengerScore = Number(form.elements.challengerScore.value);
  const opponentScore = Number(form.elements.opponentScore.value);
  applyChallengeResult(
    {
      challengerId,
      opponentId,
      challengerScore,
      opponentScore,
    },
    { editContext: challengeEditContext ? { ...challengeEditContext } : null }
  );
  saveChallengeClassSnapshot();
  persistState();
  closeChallengeDialog();
  renderChallengeBoard(state.schedule);
  renderRankingView(state.schedule);
  renderLiveRankingForChallenge();
}

function applyChallengeResult(payload, options = {}) {
  if (!isChallengeModeActive()) return;
  ensureChallengeRoster(state.schedule);
  const challenge = state.schedule.challenge;
  challenge.history = Array.isArray(challenge.history) ? challenge.history : [];
  challenge.order = getChallengeOrder(state.schedule);

  const editContext = options.editContext || null;
  if (editContext && Array.isArray(editContext.orderBefore) && challenge.history.length) {
    challenge.order = [...editContext.orderBefore];
    restoreChallengePlayerStats(editContext.challengerId, editContext.challengerStatsBefore);
    restoreChallengePlayerStats(editContext.opponentId, editContext.opponentStatsBefore);
    challenge.history.pop();
  }

  const challengerId = Number(payload.challengerId);
  const opponentId = Number(payload.opponentId);
  const challengerScore = Number(payload.challengerScore);
  const opponentScore = Number(payload.opponentScore);
  const order = [...challenge.order];
  const challengerPos = order.indexOf(challengerId);
  const opponentPos = order.indexOf(opponentId);
  if (
    !Number.isInteger(challengerId) ||
    !Number.isInteger(opponentId) ||
    !Number.isFinite(challengerScore) ||
    !Number.isFinite(opponentScore) ||
    challengerPos < 0 ||
    opponentPos < 0 ||
    challengerPos === opponentPos
  ) {
    return;
  }

  const snapshotBefore = [...order];
  const challengerPlayer = getChallengePlayerById(challengerId);
  const opponentPlayer = getChallengePlayerById(opponentId);
  if (!challengerPlayer || !opponentPlayer) return;

  const challengerStatsBefore = normalizeChallengeStats(challengerPlayer.stats);
  const opponentStatsBefore = normalizeChallengeStats(opponentPlayer.stats);
  applyChallengeScoreToStats(challengerPlayer, opponentPlayer, challengerScore, opponentScore);

  if (challengerScore > opponentScore && opponentPos < challengerPos) {
    order[opponentPos] = challengerId;
    order[challengerPos] = opponentId;
  } else if (challengerScore < opponentScore && opponentPos > challengerPos) {
    order[challengerPos] = opponentId;
    order[opponentPos] = challengerId;
  }

  state.schedule.challenge.order = order;

  challenge.history.unshift({
    challengerId,
    opponentId,
    challengerScore,
    opponentScore,
    challengerPos,
    opponentPos,
    orderBefore: snapshotBefore,
    timestamp: new Date().toISOString(),
    challengerStatsBefore,
    opponentStatsBefore,
  });
  if (challenge.history.length > 20) {
    challenge.history.pop();
  }
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
  if (state.schedule.format === 'ladder') {
    renderLiveRankingForLadder();
    return;
  }
  if (state.schedule.format === 'challenge') {
    renderLiveRankingForChallenge();
    return;
  }
  if (state.schedule.format === 'swiss') {
    const rows = updateSwissRanking(state.schedule);
    if (elements.liveRankingTitle) {
      elements.liveRankingTitle.textContent = 'Rang · Joueur · Pts';
    }
    if (!rows.length) {
      elements.liveRankingTable.innerHTML = '<p>Aucun classement Ronde Suisse disponible.</p>';
      return;
    }
    const body = rows
      .slice(0, Math.min(rows.length, 12))
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${row.points}</td>
            <td>${row.wins}</td>
            <td>${row.played}</td>
          </tr>
        `
      )
      .join('');
    elements.liveRankingTable.innerHTML = `
      <p class="live-ranking-meta">Ronde ${state.schedule.swiss?.round || 1}</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Pts</th>
            <th>G</th>
            <th>MJ</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
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

function renderLiveRankingForLadder() {
  if (!elements.liveRankingTable) return;
  const rows = computeLadderStandings();
  if (!rows.length) {
    elements.liveRankingTable.innerHTML = '<p>Le classement montée-descente s’affichera après la première rotation.</p>';
    return;
  }
  if (elements.liveRankingTitle) {
    elements.liveRankingTitle.textContent = 'Rang · Joueur · MJ';
  }
  const list = rows
    .slice(0, Math.min(rows.length, 12))
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.name}</td>
          <td>${row.played}</td>
          <td>${row.wins}</td>
          <td>${row.losses}</td>
          <td>${row.status}</td>
        </tr>`
    )
    .join('');
  elements.liveRankingTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Joueur</th>
          <th>MJ</th>
          <th>G</th>
          <th>P</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>${list}</tbody>
    </table>
    <p class="live-ranking-note">Vue rapide terrain : touchez “Vue complète” pour le détail.</p>
  `;
}

function renderLiveRankingForChallenge() {
  if (!elements.liveRankingTable) return;
  const rows = buildChallengeRankingRows();
  if (!rows.length) {
    elements.liveRankingTable.innerHTML = '<p>Le classement Défi sera visible après l’ajout de participants.</p>';
    return;
  }
  if (elements.liveRankingTitle) {
    elements.liveRankingTitle.textContent = 'Pos · Joueur · Pts';
  }
  const list = rows
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.name}</td>
          <td>${row.played}</td>
          <td>${row.points}</td>
          <td>${row.pointsFor}</td>
          <td>${row.pointsAgainst}</td>
        </tr>`
    )
    .join('');
  elements.liveRankingTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Joueur</th>
          <th>MJ</th>
          <th>Pts</th>
          <th>PM</th>
          <th>PE</th>
        </tr>
      </thead>
      <tbody>${list}</tbody>
    </table>
    <p class="live-ranking-note">Gestion via le tableau Défi.</p>
  `;
}

function handleLiveFinish() {
  if (!state.schedule) return;
  const finishLabel = isLadderLiveMode(state.schedule) ? 'terminer la montée-descente' : 'terminer le tournoi';
  const confirmed = window.confirm(
    `Êtes-vous sûr de vouloir ${finishLabel} ? Les matchs non complétés resteront affichés comme incomplets.`
  );
  if (!confirmed) return;
  timerController.pause();
  if (isLadderLiveMode(state.schedule)) {
    state.schedule.meta = state.schedule.meta || {};
    state.schedule.meta.sessionEnded = true;
    persistState();
  }
  const finalRotation =
    (state.schedule.rotations[state.liveRotationIndex] && state.schedule.rotations[state.liveRotationIndex].number) ||
    (state.schedule.meta && state.schedule.meta.rotationCount) ||
    state.schedule.rotations.length ||
    1;
  showFinalRankingModal(finalRotation);
}

function showFinalRankingModal(uptoRotation) {
  if (!elements.finalRankingModal || !state.schedule) return;
  goTo('results');
  setActiveView('rankings');
  const upto =
    uptoRotation ||
    (state.schedule.rotations[state.liveRotationIndex] && state.schedule.rotations[state.liveRotationIndex].number) ||
    state.schedule.meta.rotationCount ||
    state.schedule.rotations.length;
  finalRankingSnapshot =
    state.schedule.format === 'ladder'
      ? { kind: 'ladder', table: computeLadderStandings(state.schedule), complete: true, uptoRotation: upto }
      : state.schedule.format === 'swiss'
        ? { kind: 'swiss', table: updateSwissRanking(state.schedule), complete: true, uptoRotation: upto }
      : computeRankingSnapshot(state.schedule, upto);
  renderFinalRankingTable(finalRankingSnapshot, upto);
  renderFinalSessionSavePanel();
  elements.finalRankingModal.classList.remove('hidden');
  syncBodyModalState();
}

function hideFinalRankingModal() {
  if (!elements.finalRankingModal) return;
  elements.finalRankingModal.classList.add('hidden');
  if (elements.finalSessionSavePanel) {
    elements.finalSessionSavePanel.innerHTML = '';
  }
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
  if (state.schedule?.format === 'ladder') {
    const rows = snapshot.table
      .map(
        (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.name}</td>
          <td>${row.played}</td>
          <td>${row.wins}</td>
          <td>${row.losses}</td>
          <td>${row.points}</td>
          <td>${row.pointsFor}</td>
          <td>${row.pointsAgainst}</td>
          <td>${row.status}</td>
        </tr>`
      )
      .join('');
    const note = `Classement final après ${upto} rotation(s).`;
    elements.finalRankingTable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>${columnLabel}</th>
            <th>MJ</th>
            <th>G</th>
            <th>P</th>
            <th>Pts</th>
            <th>PM</th>
            <th>PE</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="note">${note}</p>
    `;
    if (elements.finalRankingCsvBtn) {
      elements.finalRankingCsvBtn.disabled = false;
    }
    return;
  }
  if (state.schedule?.format === 'swiss') {
    const rows = snapshot.table
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${row.points}</td>
            <td>${row.played}</td>
            <td>${row.wins}</td>
            <td>${row.losses}</td>
            <td>${row.bye}</td>
          </tr>`
      )
      .join('');
    elements.finalRankingTable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>${columnLabel}</th>
            <th>Pts</th>
            <th>MJ</th>
            <th>G</th>
            <th>P</th>
            <th>Exempt</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="note">Classement Ronde Suisse après ${upto} ronde(s).</p>
    `;
    if (elements.finalRankingCsvBtn) {
      elements.finalRankingCsvBtn.disabled = false;
    }
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
  if (state.schedule.format === 'swiss') {
    exportSwissRankingCsv();
    return;
  }
  if (!finalRankingSnapshot) {
    const upto =
      (state.schedule.rotations[state.liveRotationIndex] && state.schedule.rotations[state.liveRotationIndex].number) ||
      state.schedule.meta.rotationCount ||
      state.schedule.rotations.length;
    finalRankingSnapshot =
      state.schedule.format === 'ladder'
        ? { kind: 'ladder', table: computeLadderStandings(state.schedule), complete: true, uptoRotation: upto }
        : computeRankingSnapshot(state.schedule, upto);
  }
  if (!finalRankingSnapshot || !finalRankingSnapshot.table.length) return;
  const csv = buildFinalRankingCsv(finalRankingSnapshot);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const today = new Date().toISOString().slice(0, 10);
  link.download =
    state.schedule?.format === 'ladder'
      ? `montee-descente_${today}.csv`
      : state.schedule?.format === 'swiss'
        ? `ronde-suisse_${today}.csv`
        : `classement-final-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildFinalRankingCsv(snapshot) {
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const columnLabel = formatParticipantLabel({ practiceType, capitalized: true });
  if (state.schedule?.format === 'swiss') {
    const playerMap = getSwissPlayerMap(state.schedule);
    const header = ['rang', 'nom', 'points', 'matchs', 'victoires', 'defaites', 'exempt', 'adversaires'].join(';');
    const rows = snapshot.table.map((row, index) => {
      const player = playerMap.get(Number(row.id));
      const opponents = (player?.opponents || [])
        .map(opponentId => playerMap.get(Number(opponentId))?.name)
        .filter(Boolean)
        .join('|');
      return [index + 1, row.name, row.points, row.played, row.wins, row.losses, row.bye, opponents].join(';');
    });
    return [header, ...rows].join('\n');
  }
  if (state.schedule?.format === 'ladder') {
    const duration = state.schedule.meta?.durationMinutes || state.options.duration || '';
    const refereeFields = Array.isArray(state.schedule.ladder?.refereeFields) ? state.schedule.ladder.refereeFields.join('|') : '';
    const date = new Date().toISOString().slice(0, 10);
    const header = ['rang', 'nom', 'terrain_final', 'position', 'matchs', 'victoires', 'defaites', 'date', 'mode', 'duree_match', 'terrains_avec_arbitre'].join(';');
    const rows = snapshot.table.map((row, index) => {
      const terrainFinal = Math.floor(index / 2) + 1;
      const position = index % 2 === 0 ? 'haut' : 'bas';
      return [index + 1, row.name, terrainFinal, position, row.played, row.wins, row.losses, date, 'montee-descente', duration, refereeFields].join(';');
    });
    return [header, ...rows].join('\n');
  }
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

function toggleRankingModal() {
  if (!elements.rankingModal) return;
  const willOpen = elements.rankingModal.classList.contains('hidden');
  if (willOpen) {
    openRankingModal();
  } else {
    closeRankingModal();
  }
}

function openRankingModal() {
  if (!elements.rankingModal) return;
  if (!state.schedule) {
    alert('Générez un planning avant d’ouvrir le classement.');
    return;
  }
  if (!rankingReturnScreen && isLadderPilotModalOpen()) {
    rankingReturnScreen = 'ladder-pilot';
  }
  renderRankingModal();
  elements.rankingModal.classList.remove('hidden');
  syncBodyModalState();
}

function closeRankingModal() {
  if (!elements.rankingModal) return;
  elements.rankingModal.classList.add('hidden');
  syncBodyModalState();
  if (rankingReturnScreen === 'ladder-pilot' && isLadderLiveMode(state.schedule)) {
    rankingReturnScreen = null;
    goTo('ladder-pilot');
    renderLadderPilotModal();
    return;
  }
  rankingReturnScreen = null;
}

function renderRankingModal() {
  if (!elements.rankingModalBody || !state.schedule) return;
  const rows = buildRankingModalRows();
  if (!rows.length) {
    elements.rankingModalBody.innerHTML = '<p>Aucun classement disponible pour le moment.</p>';
    return;
  }
  const practiceType = getPracticeTypeFromMeta(state.schedule.meta);
  const label = formatParticipantLabel({ practiceType, capitalized: true });
  if (state.schedule.format === 'ladder') {
    const tableRows = rows
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${row.name}</td>
            <td>${row.played}</td>
            <td>${row.wins}</td>
            <td>${row.losses}</td>
            <td>${row.pointsFor}</td>
            <td>${row.pointsAgainst}</td>
            <td>${row.status}</td>
          </tr>`
      )
      .join('');
    elements.rankingModalBody.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>${label}</th>
            <th>MJ</th>
            <th>G</th>
            <th>P</th>
            <th>PM</th>
            <th>PE</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    return;
  }
  if (state.schedule.format === 'challenge' && state.schedule.challenge) {
    const tableRows = rows
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${row.name}</td>
            <td>${row.played}</td>
            <td>${row.points}</td>
            <td>${row.pointsFor}</td>
            <td>${row.pointsAgainst}</td>
          </tr>`
      )
      .join('');
    elements.rankingModalBody.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>${label}</th>
            <th>MJ</th>
            <th>Pts</th>
            <th>PM</th>
            <th>PE</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    return;
  }
  if (state.schedule.format === 'swiss' && state.schedule.swiss) {
    const tableRows = rows
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${row.points}</td>
            <td>${row.played}</td>
            <td>${row.wins}</td>
            <td>${row.losses}</td>
            <td>${row.bye}</td>
          </tr>`
      )
      .join('');
    elements.rankingModalBody.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>${label}</th>
            <th>Pts</th>
            <th>MJ</th>
            <th>G</th>
            <th>P</th>
            <th>Exempt</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    return;
  }
  const tableRows = rows
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.name}</td>
          <td>${row.points ?? '–'}</td>
          <td>${row.played ?? '–'}</td>
          <td>${row.wins ?? '–'}</td>
          <td>${row.draws ?? '–'}</td>
          <td>${row.losses ?? '–'}</td>
          <td>${row.goalDiff != null ? (row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff) : '–'}</td>
        </tr>`
    )
    .join('');
  elements.rankingModalBody.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${label}</th>
          <th>Pts</th>
          <th>J</th>
          <th>G</th>
          <th>N</th>
          <th>P</th>
          <th>Diff</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;
}

function buildRankingModalRows() {
  if (!state.schedule) return [];
  if (state.schedule.format === 'ladder' && state.schedule.ladder) {
    return computeLadderStandings(state.schedule);
  }
  if (state.schedule.format === 'challenge' && state.schedule.challenge) {
    return buildChallengeRankingRows(state.schedule);
  }
  if (state.schedule.format === 'swiss' && state.schedule.swiss) {
    return updateSwissRanking(state.schedule);
  }
  if (state.schedule.format === 'round-robin' || !state.schedule.groups?.length) {
    const snapshot = computeRankingSnapshot(state.schedule, state.schedule.meta?.rotationCount || Number.MAX_SAFE_INTEGER);
    return snapshot.table;
  }
  const standings = getGroupStandings(state.schedule);
  if (!standings) return [];
  const allRows = [];
  standings.byGroup.forEach((table, groupId) => {
    table.forEach(entry => {
      allRows.push({
        ...entry,
        name: `${entry.name} (${groupId})`,
      });
    });
  });
  allRows.sort(compareStatsRows);
  return allRows;
}

function openStatusModal() {
  if (!elements.statusModal) return;
  renderStatusList();
  elements.statusModal.classList.remove('hidden');
  syncBodyModalState();
}

function closeStatusModal() {
  if (!elements.statusModal) return;
  elements.statusModal.classList.add('hidden');
  syncBodyModalState();
}

function renderStatusList() {
  if (!elements.statusList) return;
  const names = ensureTeamListLength(state.teamNames, state.participants, state.practiceType);
  state.entityStatuses = ensureEntityStatusLength(state.entityStatuses, names.length);
  if (!names.length) {
    elements.statusList.innerHTML = '<p>Aucune équipe / participant pour le moment.</p>';
    return;
  }
  const rows = names
    .map((name, index) => {
      const statusKey = getEntityStatus(index);
      const chips = Object.values(STATUS_TYPES)
        .map(
          type => `
            <button class="status-chip ${statusKey === type.key ? 'active' : ''}" data-status-index="${index}" data-status-value="${type.key}">
              ${type.label}
            </button>`
        )
        .join('');
      return `
        <div class="status-row ${isEntityInactive(statusKey) ? 'disabled' : ''}">
          <div>
            <p class="status-name">${name}</p>
            <small class="status-state">${formatStatusLabel(statusKey)}</small>
          </div>
          <div class="status-actions">
            ${chips}
          </div>
        </div>
      `;
    })
    .join('');
  elements.statusList.innerHTML = rows;
}

function handleContextTab(context) {
  if (!elements.contextTabs) return;
  elements.contextTabs.querySelectorAll('[data-context]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.context === context);
  });
  if (state.schedule?.format === 'swiss' && (context === 'live' || context === 'projection')) {
    goTo('results');
    setActiveView('rotations');
    alert('La Ronde Suisse se pilote directement dans le planning.');
    return;
  }
  if (context === 'manage') {
    goTo('results');
    setActiveView('rotations');
    return;
  }
  if (context === 'live') {
    if (!state.schedule) {
      alert('Générez un planning avant d’ouvrir le mode live.');
      return;
    }
    goTo('live');
    renderLiveRotation();
    return;
  }
  if (context === 'projection') {
    if (!state.schedule) {
      alert('Créez un tournoi pour lancer la projection.');
      return;
    }
    openProjectionScreen();
  }
}

function syncBodyModalState() {
  const finalOpen = elements.finalRankingModal && !elements.finalRankingModal.classList.contains('hidden');
  const helpOpen = elements.helpModal && !elements.helpModal.classList.contains('hidden');
  const rankingOpen = elements.rankingModal && !elements.rankingModal.classList.contains('hidden');
  const statusOpen = elements.statusModal && !elements.statusModal.classList.contains('hidden');
  const challengeOpen = elements.challengeModal && !elements.challengeModal.classList.contains('hidden');
  const shouldLock = finalOpen || helpOpen || rankingOpen || statusOpen || challengeOpen;
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

function toggleToolsMenu() {
  if (!elements.toolsMenu || !elements.toolsToggle) return;
  const willOpen = elements.toolsMenu.classList.contains('hidden');
  if (willOpen) {
    closeOverflowPanels();
    elements.toolsMenu.classList.remove('hidden');
    elements.toolsToggle.setAttribute('aria-expanded', 'true');
  } else {
    closeToolsMenu();
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

function closeToolsMenu() {
  if (!elements.toolsMenu || elements.toolsMenu.classList.contains('hidden')) return false;
  elements.toolsMenu.classList.add('hidden');
  if (elements.toolsToggle) {
    elements.toolsToggle.setAttribute('aria-expanded', 'false');
  }
  return true;
}

function closeOverflowPanels() {
  const closedResults = closeResultsMorePanel();
  const closedLive = closeLiveActionsPanel();
  const closedTools = closeToolsMenu();
  return closedResults || closedLive || closedTools;
}

function handleGlobalMenuClick(event) {
  const trigger = event.target.closest('.info-trigger');
  const existingTooltip = trigger?.parentElement?.querySelector('.info-tooltip');
  document.querySelectorAll('.info-tooltip').forEach(tooltip => tooltip.remove());
  if (trigger) {
    event.preventDefault();
    if (existingTooltip) return;
    const tip = document.createElement('div');
    tip.className = 'info-tooltip';
    tip.textContent = trigger.dataset.tip || '';
    trigger.parentElement.style.position = 'relative';
    trigger.parentElement.appendChild(tip);
  }
  const toggle = event.target.closest('.collapsible-toggle');
  if (toggle) {
    event.preventDefault();
    const targetId = toggle.dataset.collapsibleTarget;
    if (!targetId) return;
    const body = document.getElementById(targetId);
    if (!body) return;
    const collapsed = body.classList.toggle('collapsed');
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    const icon = toggle.querySelector('.collapsible-icon');
    if (icon) {
      icon.textContent = collapsed ? '▸' : '▾';
    }
  }
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
  if (elements.toolsMenu && !elements.toolsMenu.classList.contains('hidden')) {
    if (!event.target.closest('.topbar-actions')) {
      closeToolsMenu();
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

function isLadderLiveMode(schedule = state.schedule) {
  return Boolean(
    state.activeModeId === 'raquettes-montee-descente' ||
      schedule?.format === 'ladder' ||
      schedule?.rotations?.some(rotation => rotation.matches?.some(match => Array.isArray(match.ladderSlots)))
  );
}

function updateLadderLiveLayout(isLadder) {
  if (!elements.liveShell) return;
  elements.liveShell.classList.toggle('ladder-live-mode', Boolean(isLadder));
  if (elements.liveScorePanel) {
    elements.liveScorePanel.classList.toggle('hidden', Boolean(isLadder));
  }
  if (elements.liveLadderSecondary) {
    elements.liveLadderSecondary.classList.toggle('hidden', !Boolean(isLadder));
  }
}

function isLadderPilotModalOpen() {
  return state.currentScreen === 'ladder-pilot';
}

function isSwissPilotScreenOpen() {
  return state.currentScreen === 'swiss-pilot';
}

function renderLadderPilotModal() {
  if (!elements.ladderPilotBody || !isLadderLiveMode(state.schedule)) return;
  const summary = buildLadderCurrentRotationSummary(state.schedule);
  if (!summary) {
    elements.ladderPilotBody.innerHTML = '<p class="live-empty">Aucune rotation disponible pour le pilotage.</p>';
    if (elements.ladderPilotMeta) elements.ladderPilotMeta.textContent = '';
    if (elements.ladderPilotNextBtn) elements.ladderPilotNextBtn.disabled = true;
    return;
  }
  const rotation = summary.rotation;
  const roleAssignments = computeRoleAssignments(rotation);
  const metaParts = [
    formatLadderRotationLabel(rotation, state.schedule),
    `${summary.activeFields} terrains`,
    `${summary.completed} / ${summary.activeFields} scores saisis`,
  ];
  if (summary.timer) metaParts.push(`Temps restant ${summary.timer}`);
  else if (rotation.durationLabel) metaParts.push(rotation.durationLabel);
  if (elements.ladderPilotMeta) {
    elements.ladderPilotMeta.textContent = metaParts.join(' • ');
  }
  if (elements.ladderPilotTitle) {
    elements.ladderPilotTitle.textContent = formatLadderRotationLabel(rotation, state.schedule);
  }
  const limitedLast = !isLadderOpenSession(state.schedule) && summary.total && rotation.number >= summary.total;
  const nextActionLabel = isLadderSessionEnded(state.schedule)
    ? 'Séance terminée'
    : limitedLast
      ? 'Terminer le tournoi'
      : 'Rotation suivante';
  const nextActionDisabled = summary.stateKey !== 'ready' || isLadderSessionEnded(state.schedule);
  if (elements.ladderPilotNextBtn) {
    elements.ladderPilotNextBtn.disabled = nextActionDisabled;
    elements.ladderPilotNextBtn.textContent = nextActionLabel;
  }
  if (elements.ladderPilotFinishBtn) {
    elements.ladderPilotFinishBtn.disabled = isLadderSessionEnded(state.schedule);
    elements.ladderPilotFinishBtn.textContent = isLadderSessionEnded(state.schedule)
      ? 'Montée-descente terminée'
      : 'Terminer la montée-descente';
  }
  const cards = rotation.matches.map(match => buildLadderPilotCard(rotation, match, roleAssignments)).join('');
  elements.ladderPilotBody.innerHTML = `
    <div class="ladder-focus-card ladder-focus-card-results ladder-pilot-summary-card">
      <div class="ladder-focus-copy">
        <p class="eyebrow">Console EPS</p>
        <h3>${formatLadderRotationLabel(rotation, state.schedule)}</h3>
        <div class="ladder-focus-stats">
          <span class="ladder-summary-pill">${summary.activeFields} terrains utilisés</span>
          <span class="ladder-summary-pill">${summary.completed} matchs saisis / ${summary.activeFields}</span>
          <span class="ladder-summary-pill">${summary.playerCount} joueurs</span>
          <span class="ladder-summary-pill">max possible : ${summary.maxCourts} terrains</span>
        </div>
      </div>
      <div class="ladder-focus-actions">
        <span class="state-pill ${summary.stateKey === 'ready' ? 'live' : 'next'}">${summary.stateLabel}</span>
      </div>
    </div>
    <div class="ladder-pilot-console">
      <div class="ladder-pilot-modal-list">${cards}</div>
      <div class="ladder-pilot-next-cta">
        <button type="button" class="btn primary xl" data-ladder-next-cta ${nextActionDisabled ? 'disabled' : ''}>
          ${nextActionLabel}
        </button>
      </div>
    </div>
  `;
}

function advanceLadderPilotRotation() {
  const progressed = advanceLiveRotation();
  if (
    progressed &&
    isLadderLiveMode(state.schedule) &&
    !(elements.finalRankingModal && !elements.finalRankingModal.classList.contains('hidden'))
  ) {
    openLadderPilotModal();
  }
}

function openLadderPilotModal() {
  if (!isLadderLiveMode(state.schedule) || !elements.ladderPilotModal) return;
  closeOverflowPanels();
  goTo('ladder-pilot');
  try {
    renderLadderPilotModal();
  } catch (error) {
    console.error('Impossible d’ouvrir le pilotage montée-descente', error);
    goTo('results');
    alert('Impossible d’ouvrir le pilotage montée-descente.');
  }
}

function isSwissWinnerResolved(match) {
  if (!match) return false;
  if (match.bye) return true;
  const winnerId = Number(match.winnerId);
  const p1Id = Number(match.p1Id);
  const p2Id = Number(match.p2Id);
  return Number.isInteger(winnerId) && winnerId !== 0 && (winnerId === p1Id || winnerId === p2Id);
}

function renderSwissPilotScreen() {
  if (!elements.swissPilotBody || state.schedule?.format !== 'swiss' || !state.schedule?.swiss) return;
  const schedule = state.schedule;
  const currentRound = schedule.swiss.round || 1;
  const playerMap = getSwissPlayerMap(schedule);
  const remainingCount = (schedule.swiss.currentMatches || []).filter(match => !isSwissWinnerResolved(match)).length;
  const matches = (schedule.swiss.currentMatches || [])
    .map(match => {
      if (match.bye) {
        const player = playerMap.get(Number(match.p1Id));
        if (!player) return '';
        return `
          <article class="swiss-match-card swiss-match-card-bye">
            <header>
              <p class="eyebrow">Exempt</p>
              <h3>${escapeHtml(player.name)}</h3>
            </header>
            <p class="swiss-bye-player">Exemption automatique · +1 point</p>
          </article>
        `;
      }
      const p1 = playerMap.get(Number(match.p1Id));
      const p2 = playerMap.get(Number(match.p2Id));
      if (!p1 || !p2) return '';
      const winnerId = Number(match.winnerId);
      const p1State = winnerId === p1.id ? 'winner' : winnerId === p2.id ? 'loser' : '';
      const p2State = winnerId === p2.id ? 'winner' : winnerId === p1.id ? 'loser' : '';
      return `
        <article class="swiss-match-card ${isSwissWinnerResolved(match) ? 'validated' : ''}" data-swiss-match-id="${match.id}">
          <header>
            <p class="eyebrow">Terrain ${match.field || '—'}</p>
            <h3>Match</h3>
          </header>
          <div class="swiss-match-players">
            <button type="button" class="swiss-player-btn ${p1State}" data-swiss-winner="${p1.id}" data-swiss-match-id="${match.id}">
              <span class="swiss-player-name">${escapeHtml(p1.name)}</span>
              <span class="swiss-player-points">${p1.points} pt${p1.points > 1 ? 's' : ''}</span>
            </button>
            <span class="swiss-versus">VS</span>
            <button type="button" class="swiss-player-btn ${p2State}" data-swiss-winner="${p2.id}" data-swiss-match-id="${match.id}">
              <span class="swiss-player-name">${escapeHtml(p2.name)}</span>
              <span class="swiss-player-points">${p2.points} pt${p2.points > 1 ? 's' : ''}</span>
            </button>
          </div>
        </article>
      `;
    })
    .join('');
  const resolvedCount = (schedule.swiss.currentMatches || []).filter(match => isSwissWinnerResolved(match)).length;
  const totalCount = (schedule.swiss.currentMatches || []).length;
  const canValidate = totalCount > 0 && (schedule.swiss.currentMatches || []).every(match => isSwissWinnerResolved(match));
  if (elements.swissPilotTitle) {
    elements.swissPilotTitle.textContent = `Ronde Suisse — Ronde ${currentRound}`;
  }
  if (elements.swissPilotMeta) {
    elements.swissPilotMeta.textContent = `${resolvedCount} / ${totalCount} match(s) résolus`;
  }
  elements.swissPilotBody.innerHTML = `
    <div class="swiss-shell swiss-pilot-layout">
      <header class="swiss-board-header">
        <div>
          <p class="eyebrow">Ronde Suisse</p>
          <h3>Ronde ${currentRound}</h3>
          <p class="swiss-board-meta">${remainingCount} match(s) restant(s) · ${resolvedCount} / ${totalCount} résolu(s)</p>
        </div>
      </header>
      <div class="swiss-board-layout">
        <section class="swiss-match-list">${matches || '<p class="live-empty">Aucun match pour cette ronde.</p>'}</section>
      </div>
      ${
        canValidate
          ? `
            <section class="swiss-pilot-cta swiss-validation-cta">
              <button type="button" class="btn primary xl" data-swiss-validate-round>
                Valider la ronde et passer à la suivante
              </button>
            </section>
          `
          : ''
      }
    </div>
  `;
}

function openSwissPilotScreen() {
  if (state.schedule?.format !== 'swiss' || !elements.swissPilotScreen) return;
  closeOverflowPanels();
  goTo('swiss-pilot');
  renderSwissPilotScreen();
}

function closeSwissPilotScreen() {
  if (!elements.swissPilotScreen) return;
  goTo('results');
  setActiveView('rotations');
}

function closeLadderPilotModal() {
  goTo('options');
}

function refreshLadderPilotModalIfOpen() {
  if (!isLadderPilotModalOpen()) return;
  renderLadderPilotModal();
}

function renderLiveRotation() {
  if (!elements.liveRotationContent) return;
  setLiveTimerPanelEnabled(Boolean(state.schedule && state.options.timer));
  if (state.schedule) {
    hydrateScheduleForSpecialModes(state.schedule);
  }
  const ladderLiveMode = isLadderLiveMode(state.schedule);
  if (!state.schedule) {
    updateLadderLiveLayout(ladderLiveMode);
    renderLadderCurrentRotationCard();
    elements.liveRotationTitle.textContent = 'Rotation';
    renderLiveMeta(null);
    elements.liveRotationContent.innerHTML = '<p>Générez un planning avant de lancer les rotations.</p>';
    if (elements.liveLadderSecondary) {
      elements.liveLadderSecondary.innerHTML = '';
    }
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
    updateLadderLiveLayout(false);
    renderLadderCurrentRotationCard();
    elements.liveRotationContent.innerHTML = '<p>Aucune rotation à afficher.</p>';
    if (elements.liveLadderSecondary) {
      elements.liveLadderSecondary.innerHTML = '';
    }
    if (elements.liveStatus) elements.liveStatus.textContent = '';
    if (elements.liveNextBtn) elements.liveNextBtn.disabled = true;
    renderLiveFieldBoard(null);
    renderLiveRest([]);
    renderLiveRankingPanel();
    renderNextRotationPreview();
    return;
  }
  elements.liveRotationTitle.textContent = isLadderLiveMode(state.schedule)
    ? formatLadderRotationLabel(rotation, state.schedule)
    : rotation.groupLabel
      ? `${rotation.groupLabel} · Rotation ${rotation.number} / ${state.schedule.meta.rotationCount}`
      : `Rotation ${rotation.number} / ${state.schedule.meta.rotationCount}`;
  renderLiveMeta(state.schedule.meta);
  elements.liveRotationContent.dataset.rotation = rotation.number;
  renderLadderCurrentRotationCard();
  const roleAssignments = computeRoleAssignments(rotation);
  if (ladderLiveMode) {
    updateLadderLiveLayout(true);
    if (elements.liveNowLabel) elements.liveNowLabel.textContent = 'Terrains pilotables';
    if (elements.liveScoreEyebrow) elements.liveScoreEyebrow.textContent = 'Mouvements';
    if (elements.liveScoreTitle) elements.liveScoreTitle.textContent = 'Après validation';
    if (elements.liveLadderSecondary) {
      elements.liveLadderSecondary.innerHTML = `
        <div class="live-ladder-secondary-panel">
          <header class="live-score-header">
            <p class="eyebrow">Mouvements</p>
            <h3>Après validation</h3>
          </header>
          <div class="live-ladder-movements">${buildLadderMovementPanel(rotation, roleAssignments)}</div>
        </div>
      `;
    }
    elements.liveRotationContent.innerHTML = '';
  } else {
    updateLadderLiveLayout(false);
    if (elements.liveNowLabel) elements.liveNowLabel.textContent = 'Terrains en jeu';
    if (elements.liveScoreEyebrow) elements.liveScoreEyebrow.textContent = 'Scores en direct';
    if (elements.liveScoreTitle) elements.liveScoreTitle.textContent = 'Gestion des matchs';
    if (elements.liveLadderSecondary) {
      elements.liveLadderSecondary.innerHTML = '';
    }
    elements.liveRotationContent.innerHTML = buildLiveMatchCards(rotation, roleAssignments);
  }
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
  if (meta.format === 'ladder') {
    parts.push(meta.sessionMode === 'limited' ? `${meta.rotationLimit || meta.rotationCount || 0} rotations` : 'Session libre');
  }
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

function buildLadderMovementPanel(rotation, roleAssignments) {
  const items = computeLadderMovementFeed(state.schedule, rotation, roleAssignments);
  if (!items.length) {
    return `
      <article class="ladder-movement-card">
        <span class="ladder-movement-icon">•</span>
        <div>
          <strong>En attente de résultat</strong>
          <p>Validez un terrain pour afficher les montées, descentes et transitions visibles.</p>
        </div>
      </article>
    `;
  }
  const iconMap = {
    up: '⬆️',
    down: '⬇️',
    arbiter: '🟨',
    play: '▶️',
    rest: '⏸️',
    unavailable: '⛔',
    steady: '•',
  };
  const titleMap = {
    up: 'Monte',
    down: 'Descend',
    arbiter: 'Arbitre',
    play: 'Entre en jeu',
    rest: 'Repos',
    unavailable: 'Indisponible',
    steady: 'Stable',
  };
  return items
    .map(item => {
      const kind = item.type || 'steady';
      return `
        <article class="ladder-movement-card ${kind}">
          <span class="ladder-movement-icon">${iconMap[kind] || '•'}</span>
          <div>
            <strong>${titleMap[kind] || 'Info'}</strong>
            <p>${item.label}</p>
          </div>
        </article>
      `;
    })
    .join('');
}

function buildLiveMatchCard(rotation, match, roleAssignments) {
  const practiceType = getPracticeTypeFromMeta(state.schedule?.meta);
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
  const participants = resolveMatchParticipants(match, state.schedule);
  const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
  match.id = matchId;
  const homeScore = formatScoreValue(getScoreValue(matchId, 'home'));
  const awayScore = formatScoreValue(getScoreValue(matchId, 'away'));
  const neutralized = isMatchNeutralized(participants);
  const complete = neutralized || isMatchCompleteById(matchId);
  const validated = isMatchValidated(matchId);
  const cardClasses = ['live-match-card'];
  if (validated) {
    cardClasses.push('validated');
  } else {
    cardClasses.push('active');
  }
  if (neutralized) {
    cardClasses.push('neutralized');
  }
  const parts = [];
  if (match.field) parts.push(`${fieldLabel} ${match.field}`);
  if (rotation.startLabel) parts.push(rotation.startLabel);
  const badge = parts.length ? parts.join(' · ') : `Rotation ${rotation.number}`;
  const statusText = neutralized ? 'INDISPONIBLE' : validated ? 'VALIDÉ' : 'EN COURS';
  const badgeClass = neutralized ? 'neutral' : validated ? 'success' : 'info';
  const groupPill = match.groupLabel ? `<span class="group-pill">${match.groupLabel}</span>` : '';
  const controlsDisabled = validated || neutralized;
  const actionButtons = `
    <button type="button" class="btn ghost tiny live-validate ${validated || neutralized ? 'hidden' : ''}" data-validate-match="${matchId}" ${
      complete && !neutralized ? '' : 'disabled'
    }>Valider</button>
    <button type="button" class="btn ghost tiny live-edit ${validated && !neutralized ? '' : 'hidden'}" data-edit-match="${matchId}">Modifier</button>
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
        ${buildLiveTeamColumn('home', participants.home, homeScore, matchId, { disabled: controlsDisabled })}
        ${buildLiveTeamColumn('away', participants.away, awayScore, matchId, { disabled: controlsDisabled })}
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
  const matchFieldToken = buildFieldToken(matchId);
  return `
    <div class="live-team">
      <strong>${decorateNameWithStatus(name)}</strong>
      <div class="live-score-pad">
        <button type="button" class="score-adjust" aria-label="${minusLabel}" data-score-side="${side}" data-score-step="-1" data-match-id="${matchId}" ${disabled}>−</button>
        <input type="number" min="0" inputmode="numeric" id="live-score-${matchFieldToken}-${side}" name="live-score-${matchFieldToken}-${side}" aria-label="Score ${name}" data-match-id="${matchId}" data-score-input="${side}" value="${score}" ${disabled} />
        <button type="button" class="score-adjust" aria-label="${plusLabel}" data-score-side="${side}" data-score-step="1" data-match-id="${matchId}" ${disabled}>+</button>
      </div>
    </div>
  `;
}

function renderLiveRest(byes = [], roleAssignments) {
  if (!elements.liveRestNotice) return;
  if (state.schedule?.format === 'ladder') {
    const bench = computeLadderBenchData(state.schedule, getCurrentLadderRotation(state.schedule), roleAssignments);
    const buildStatusButtons = (name, activeLabel = 'Neutraliser', inactiveLabel = 'Réactiver') => {
      const inactive = isEntityInactive(getEntityStatusByName(name));
      const nextStatus = inactive ? STATUS_TYPES.active.key : STATUS_TYPES.unavailable.key;
      const label = inactive ? inactiveLabel : activeLabel;
      return `
        <button type="button" class="btn ghost tiny" data-status-player="${escapeHtml(name)}" data-status-value="${nextStatus}">
          ${label}
        </button>
      `;
    };
    const renderPersonList = (title, names, emptyMessage) => `
      <article class="ladder-bench-card">
        <header>
          <h4>${title}</h4>
          <span>${names.length}</span>
        </header>
        ${
          names.length
            ? `<div class="ladder-bench-list">${names
                .map(
                  name => `
                    <div class="ladder-bench-item">
                      <strong>${name}</strong>
                      ${buildStatusButtons(name)}
                    </div>
                  `
                )
                .join('')}</div>`
            : `<p class="ladder-bench-empty">${emptyMessage}</p>`
        }
      </article>
    `;
    elements.liveRestNotice.innerHTML = `
      <div class="ladder-bench-grid">
        ${renderPersonList('En attente', bench.waiting, 'Aucun joueur en attente.')}
        ${renderPersonList('Prochains entrants', bench.nextEntrants, 'La rotation suivante garde les mêmes joueurs.')}
        ${renderPersonList('Indisponibles', bench.unavailable, 'Aucun joueur neutralisé.')}
      </div>
    `;
    elements.liveRestNotice.classList.remove('hidden');
    return;
  }
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
  if (state.schedule.format === 'ladder') {
    return computeLadderRoleAssignments(rotation);
  }
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

function computeLadderRoleAssignments(rotation) {
  if (!rotation || !state.schedule || state.schedule.format !== 'ladder') return null;
  if (rotation.fieldReferees && typeof rotation.fieldReferees === 'object') {
    const assignments = new Map();
    rotation.matches.forEach(match => {
      const arbiter = rotation.fieldReferees[String(match.field)] || rotation.fieldReferees[match.field];
      if (!arbiter || isEntityInactive(getEntityStatusByName(arbiter))) return;
      const matchId = match.id || buildMatchKey(rotation.number, match.home, match.away);
      match.id = matchId;
      assignments.set(matchId, { arbitre: arbiter });
    });
    if (assignments.size) return assignments;
  }
  const waitingPool = Array.isArray(rotation.byes)
    ? rotation.byes.filter(name => !isEntityInactive(getEntityStatusByName(name)))
    : [];
  const assignments = new Map();
  rotation.matches.forEach(match => {
    const fieldNumber = Number(match.field);
    if (getLadderCourtProfile(fieldNumber) !== 'arbiter') return;
    const arbiter = waitingPool.shift();
    if (!arbiter) return;
    const matchId = match.id || buildMatchKey(rotation.number, match.home, match.away);
    match.id = matchId;
    assignments.set(matchId, { arbitre: arbiter });
  });
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

function buildLadderQuickResult(matchId, outcome) {
  if (!matchId || !outcome) return;
  const presets = {
    home: { home: 1, away: 0 },
    away: { home: 0, away: 1 },
    draw: { home: 1, away: 1 },
  };
  const preset = presets[outcome];
  if (!preset) return;
  setScoreValue(matchId, 'home', preset.home);
  setScoreValue(matchId, 'away', preset.away);
  setMatchValidated(matchId, true);
  invalidateStandingsCache();
  persistState();
  updateMatchCompletionState(matchId);
  syncScoreInputs(matchId, 'home', preset.home);
  syncScoreInputs(matchId, 'away', preset.away);
  if (state.schedule) {
    renderRankingView(state.schedule);
    renderLiveRankingPanel();
    updateLiveControls();
    renderChronoScreen();
    renderProjectionScreen();
    renderLiveRotation();
    const teamsView = buildTeamEntriesFromSchedule(state.schedule);
    state.schedule.teams = teamsView;
    renderTeamView(teamsView);
  }
  refreshLadderPilotModalIfOpen();
}

function getValidatedLadderMatchOutcome(matchId, participants) {
  if (!matchId || !participants || isMatchNeutralized(participants) || !isMatchValidated(matchId)) return null;
  const record = state.scores?.[matchId];
  if (!record || !Number.isFinite(record.home) || !Number.isFinite(record.away) || record.home === record.away) return null;
  return record.home > record.away ? { winner: 'home', loser: 'away' } : { winner: 'away', loser: 'home' };
}

function buildLadderPilotCard(rotation, match, roleAssignments, options = {}) {
  const inlineScoreEditor = Boolean(options.inlineScoreEditor);
  const participants = resolveMatchParticipants(match, state.schedule);
  const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
  match.id = matchId;
  const profile = getLadderCourtProfile(Number(match.field));
  const arbiter = roleAssignments?.get(matchId)?.arbitre || '';
  const neutralized = isMatchNeutralized(participants);
  const validated = isMatchValidated(matchId);
  const homeScore = formatScoreValue(getScoreValue(matchId, 'home'));
  const awayScore = formatScoreValue(getScoreValue(matchId, 'away'));
  const disabledAttr = neutralized ? 'disabled' : '';
  const homeInactive = isEntityInactive(getEntityStatusByName(participants.home));
  const awayInactive = isEntityInactive(getEntityStatusByName(participants.away));
  const editorHiddenClass = inlineScoreEditor ? '' : ' hidden';
  const statusTag = neutralized ? 'Neutralisé' : validated ? 'Validé' : '';
  const toggleLabel = validated ? 'Modifier le score' : 'Entrer le score';
  const profileTagLabel = arbiter ? `Arbitre : ${arbiter}` : profile === 'arbiter' ? 'Avec arbitre' : 'Sans arbitre';
  const validatedOutcome = getValidatedLadderMatchOutcome(matchId, participants);
  const homeResultClass =
    validatedOutcome?.winner === 'home' ? 'result-winner' : validatedOutcome?.loser === 'home' ? 'result-loser' : '';
  const awayResultClass =
    validatedOutcome?.winner === 'away' ? 'result-winner' : validatedOutcome?.loser === 'away' ? 'result-loser' : '';
  return `
    <article class="live-match-card ladder-pilot-card ${validated ? 'validated' : 'active'} ${neutralized ? 'neutralized' : ''}" data-match-id="${matchId}">
      <header class="ladder-pilot-head">
        <div class="ladder-pilot-heading-copy">
          <p class="eyebrow">Terrain ${match.field}</p>
          <h4 class="ladder-player-line">
            <span class="ladder-player-chip ${homeResultClass}">${escapeHtml(participants.home)}</span>
            <span class="ladder-versus">vs</span>
            <span class="ladder-player-chip ${awayResultClass}">${escapeHtml(participants.away)}</span>
          </h4>
        </div>
        <div class="ladder-pilot-tags">
          <span class="state-pill ${profile === 'arbiter' ? 'next' : 'rest'}">${profileTagLabel}</span>
          ${statusTag ? `<span class="state-pill ${neutralized ? 'rest' : 'live'}">${statusTag}</span>` : ''}
        </div>
      </header>
      <div class="ladder-quick-actions">
        <button type="button" class="btn primary" data-ladder-quick="home" data-match-id="${matchId}" ${disabledAttr}>
          Victoire ${participants.home}
        </button>
        <button type="button" class="btn primary" data-ladder-quick="away" data-match-id="${matchId}" ${disabledAttr}>
          Victoire ${participants.away}
        </button>
        <button type="button" class="btn secondary" data-ladder-quick="draw" data-match-id="${matchId}" ${disabledAttr}>
          Match nul
        </button>
      </div>
      <div class="ladder-pilot-secondary">
        <button type="button" class="btn ghost tiny" data-ladder-score-toggle data-match-id="${matchId}" ${disabledAttr}>
          ${toggleLabel}
        </button>
        <div class="ladder-status-actions">
          <button type="button" class="btn ghost tiny" data-status-player="${escapeHtml(participants.home)}" data-status-value="${
          homeInactive ? STATUS_TYPES.active.key : STATUS_TYPES.unavailable.key
        }">
          ${homeInactive ? 'Réactiver' : 'Neutraliser'} · ${participants.home}
          </button>
          <button type="button" class="btn ghost tiny" data-status-player="${escapeHtml(participants.away)}" data-status-value="${
          awayInactive ? STATUS_TYPES.active.key : STATUS_TYPES.unavailable.key
        }">
          ${awayInactive ? 'Réactiver' : 'Neutraliser'} · ${participants.away}
          </button>
        </div>
      </div>
      <div class="ladder-score-editor${editorHiddenClass}" data-ladder-score-editor="${matchId}">
        <div class="teams">
          ${buildLiveTeamColumn('home', participants.home, homeScore, matchId, { disabled: validated || neutralized })}
          ${buildLiveTeamColumn('away', participants.away, awayScore, matchId, { disabled: validated || neutralized })}
        </div>
        <div class="live-card-actions">
          <button type="button" class="btn ghost tiny live-validate ${validated || neutralized ? 'hidden' : ''}" data-validate-match="${matchId}" ${
            neutralized || isMatchCompleteById(matchId) ? '' : 'disabled'
          }>Valider</button>
          <button type="button" class="btn ghost tiny live-edit ${validated && !neutralized ? '' : 'hidden'}" data-edit-match="${matchId}">Modifier</button>
        </div>
      </div>
    </article>
  `;
}

function renderLadderFieldBoard(rotation, roleAssignments) {
  if (!elements.liveFieldBoard) return;
  if (!rotation || !rotation.matches?.length) {
    elements.liveFieldBoard.innerHTML = '<p class="live-board-empty">Aucun terrain actif pour cette rotation.</p>';
    return;
  }
  elements.liveFieldBoard.innerHTML = rotation.matches
    .map(match => buildLadderPilotCard(rotation, match, roleAssignments))
    .join('');
}

function renderLiveFieldBoard(rotation, roleAssignments) {
  if (!elements.liveFieldBoard) return;
  if (isLadderLiveMode(state.schedule)) {
    renderLadderFieldBoard(rotation, roleAssignments);
    return;
  }
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
    const fieldNumber = Number(match.field);
    const key = match.field ? `${fieldLabel} ${match.field}` : 'À affecter';
    if (!board.has(key)) {
      board.set(key, {
        sortKey: Number.isFinite(fieldNumber) ? fieldNumber : Number.MAX_SAFE_INTEGER,
        badge: buildFieldBadgeHtml(fieldNumber),
        matches: [],
      });
    }
    const groupTag = match.groupLabel ? match.groupLabel : rotation.groupLabel;
    const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
    const roles = renderRoleLines(roleAssignments?.get(matchId));
    board.get(key).matches.push({
      label: `${participants.home} vs ${participants.away}`,
      group: groupTag,
      roles,
    });
  });
  const cards = Array.from(board.entries())
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([key, payload]) => {
      const lines = payload.matches
        .map(entry => {
          const groupLine = entry.group ? `<span class="match-group-inline">${entry.group}</span>` : '';
          return `<div class="field-match-line"><p>${entry.label} ${groupLine}</p>${entry.roles || ''}</div>`;
        })
        .join('');
      const badge = payload.badge ? ` ${payload.badge}` : '';
      return `<article><h4>${key}${badge}</h4>${lines}</article>`;
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
  if (elements.liveNextLabel) {
    elements.liveNextLabel.textContent = isLadderLiveMode(state.schedule)
      ? formatLadderRotationLabel(nextRotation, state.schedule)
      : nextRotation.groupLabel
        ? `${nextRotation.groupLabel} · Rotation ${nextRotation.number} / ${state.schedule.meta.rotationCount || state.schedule.rotations.length}`
        : `Rotation ${nextRotation.number} / ${state.schedule.meta.rotationCount || state.schedule.rotations.length}`;
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
  if (state.schedule) {
    hydrateScheduleForSpecialModes(state.schedule);
  }
  if (!state.schedule || !state.schedule.rotations.length) {
    const message =
      state.schedule && state.schedule.format === 'challenge'
        ? 'Le mode Défi ne dispose pas de chronomètre dédié.'
        : 'Générez un planning puis activez le chronomètre pour utiliser ce mode.';
    elements.chronoRotationLabel.textContent = 'Rotation --';
    if (elements.chronoMatchMeta) {
      elements.chronoMatchMeta.textContent = message;
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
  const total = getLadderRotationTotal(state.schedule) || state.schedule.rotations.length;
  elements.chronoRotationLabel.textContent = isLadderLiveMode(state.schedule)
    ? formatLadderRotationLabel(rotation, state.schedule)
    : rotation.groupLabel
      ? `${rotation.groupLabel} · Rotation ${rotation.number} / ${total}`
      : `Rotation ${rotation.number} / ${total}`;
  const missing = countMissingScores(rotation.number);
  const isComplete = rotation.matches.length > 0 && missing === 0;
  const isLast = isLadderOpenSession(state.schedule) ? false : rotation.number === total;
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
  if (state.schedule) {
    hydrateScheduleForSpecialModes(state.schedule);
  }
  if (!state.schedule || !state.schedule.rotations.length) {
    const message =
      state.schedule && state.schedule.format === 'challenge'
        ? 'Le mode Défi utilise le tableau interactif, projection désactivée.'
        : 'Générez un planning pour activer la projection.';
    elements.projectionRotation.textContent = 'Rotation --';
    elements.projectionFields.innerHTML = `<p class="projection-empty">${message}</p>`;
    if (elements.projectionNext) {
      elements.projectionNext.innerHTML = '';
      elements.projectionNext.classList.add('hidden');
    }
    if (elements.projectionRest) {
      elements.projectionRest.innerHTML = '';
      elements.projectionRest.classList.add('hidden');
    }
    if (elements.projectionRanking) {
      elements.projectionRanking.innerHTML = '';
      elements.projectionRanking.classList.add('hidden');
    }
    return;
  }
  const rotation = state.schedule.rotations[state.liveRotationIndex] || state.schedule.rotations[0];
  const total = getLadderRotationTotal(state.schedule) || state.schedule.rotations.length;
  const practiceType = getPracticeTypeFromMeta(state.schedule.meta);
  const fieldLabel = formatFieldLabel({ practiceType, capitalized: true });
  const roleAssignments = computeRoleAssignments(rotation);
  elements.projectionRotation.textContent = isLadderLiveMode(state.schedule)
    ? formatLadderRotationLabel(rotation, state.schedule)
    : rotation.groupLabel
      ? `${rotation.groupLabel} · Rotation ${rotation.number} / ${total}`
      : `Rotation ${rotation.number} / ${total}`;
  if (state.schedule.format === 'ladder') {
    const movementFeed = computeLadderMovementFeed(state.schedule, rotation, roleAssignments);
    const bench = computeLadderBenchData(state.schedule, rotation, roleAssignments);
    const standings = computeLadderStandings(state.schedule).slice(0, 8);
    elements.projectionFields.innerHTML = rotation.matches.length
      ? rotation.matches
          .map(match => {
            const participants = resolveMatchParticipants(match, state.schedule);
            const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
            const arbiter = roleAssignments?.get(matchId)?.arbitre || 'Sans arbitre';
            const profile = getLadderCourtProfile(Number(match.field)) === 'arbiter' ? 'Avec arbitre' : 'Sans arbitre';
            return `
              <article class="projection-field in-play ladder-projection-field">
                <div class="projection-field-head">
                  <h3>Terrain ${match.field}</h3>
                  <span class="state-pill live">${profile}</span>
                </div>
                <div class="projection-match">
                  <p>${participants.home} <span>vs</span> ${participants.away}</p>
                  <div class="ladder-projection-meta">
                    <span>Arbitre : ${arbiter}</span>
                  </div>
                </div>
              </article>
            `;
          })
          .join('')
      : '<p class="projection-empty">Aucun terrain actif.</p>';
    if (elements.projectionNext) {
      elements.projectionNext.innerHTML = `
        <header>
          <div class="projection-section-meta">
            <h4>Mouvements</h4>
            <span>Ce qui change maintenant</span>
          </div>
          <span class="state-pill next">Transitions</span>
        </header>
        <div class="projection-next-list ladder-projection-moves">
          ${
            movementFeed.length
              ? movementFeed
                  .map(item => `<div class="projection-next-card"><strong>${item.label}</strong></div>`)
                  .join('')
              : '<p class="projection-empty">Les mouvements apparaîtront après validation des terrains.</p>'
          }
        </div>
      `;
      elements.projectionNext.classList.remove('hidden');
    }
    if (elements.projectionRest) {
      elements.projectionRest.innerHTML = `
        <header>
          <div class="projection-section-meta">
            <h4>Flux de classe</h4>
            <span>Attente, entrées, indisponibles</span>
          </div>
          <span class="state-pill rest">Organisation</span>
        </header>
        <div class="ladder-projection-rest">
          <p><strong>En attente :</strong> ${bench.waiting.length ? bench.waiting.join(', ') : 'Personne'}</p>
          <p><strong>Prochains entrants :</strong> ${bench.nextEntrants.length ? bench.nextEntrants.join(', ') : 'Aucun changement'}</p>
          <p><strong>Indisponibles :</strong> ${bench.unavailable.length ? bench.unavailable.join(', ') : 'Aucun'}</p>
        </div>
      `;
      elements.projectionRest.classList.remove('hidden');
    }
    if (elements.projectionRanking) {
      elements.projectionRanking.innerHTML = `
        <header>
          <div class="projection-section-meta">
            <h4>Classement résumé</h4>
            <span>Top visible pour la projection</span>
          </div>
          <span class="state-pill live">Classement</span>
        </header>
        <div class="projection-ranking-table">
          <table>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Nom</th>
                <th>MJ</th>
                <th>G</th>
                <th>P</th>
              </tr>
            </thead>
            <tbody>
              ${standings
                .map(
                  (row, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${row.name}</td>
                      <td>${row.played}</td>
                      <td>${row.wins}</td>
                      <td>${row.losses}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
      elements.projectionRanking.classList.remove('hidden');
    }
    if (elements.projectionTimer) {
      elements.projectionTimer.textContent = formatSeconds(timerState.remainingSeconds || timerState.baseSeconds);
    }
    return;
  }
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
  if (elements.projectionRanking) {
    elements.projectionRanking.innerHTML = '';
    elements.projectionRanking.classList.add('hidden');
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
  invalidateStandingsCache();
  persistState();
  updateMatchCompletionState(matchId);
  if (state.schedule) {
    renderRankingView(state.schedule);
    renderLiveRankingPanel();
    updateLiveControls();
    renderProjectionScreen();
    renderLiveRotation();
  }
  renderChronoScreen();
  refreshLadderPilotModalIfOpen();
}

function unlockValidatedMatch(matchId, options = {}) {
  const confirmEdit = options.skipConfirm ? true : window.confirm('Modifier ce score validé ?');
  if (!confirmEdit) return;
  setMatchValidated(matchId, false);
  invalidateStandingsCache();
  persistState();
  updateMatchCompletionState(matchId);
  if (state.schedule) {
    renderRankingView(state.schedule);
    renderLiveRankingPanel();
    updateLiveControls();
    renderProjectionScreen();
    renderLiveRotation();
  }
  renderChronoScreen();
  refreshLadderPilotModalIfOpen();
  if (options.openEditor) {
    toggleLadderScoreEditor(matchId, { forceOpen: true });
  }
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
  const total = getLadderRotationTotal(state.schedule) || state.schedule.rotations.length;
  const missing = countMissingScores(rotationNumber);
  const isComplete = rotation ? missing === 0 && rotation.matches.length > 0 : false;
  const ladderOpen = isLadderLiveMode(state.schedule) && isLadderOpenSession(state.schedule);
  const sessionEnded = isLadderSessionEnded(state.schedule);
  const isLast = ladderOpen ? false : rotationNumber === total;
  if (elements.liveNextBtn) {
    elements.liveNextBtn.disabled = !isComplete || sessionEnded;
    elements.liveNextBtn.textContent =
      sessionEnded
        ? 'Séance terminée'
        : !ladderOpen && isLast
          ? 'Terminer le tournoi'
          : 'Rotation suivante';
  }
  const timerNextBtn = getTimerNextButton();
  if (timerNextBtn) {
    timerNextBtn.disabled = !isComplete || sessionEnded;
  }
  if (elements.liveFinishBtn) {
    elements.liveFinishBtn.disabled = !state.schedule;
  }
  if (elements.liveStatus) {
    const rotationLabel = rotation ? formatLadderRotationLabel(rotation, state.schedule) : `Rotation ${rotationNumber}`;
    const status = isComplete
      ? `${rotationLabel} validée`
      : `${rotationLabel} · ${missing} score(s) à saisir`;
    elements.liveStatus.textContent = status;
  }
  setChronoNextAvailability(Boolean(state.schedule && !sessionEnded && isComplete));
}

function advanceLiveRotation(options = {}) {
  if (!state.schedule) return false;
  if (isLadderLiveMode(state.schedule) && isLadderSessionEnded(state.schedule)) return false;
  const rotation = state.schedule.rotations[state.liveRotationIndex];
  if (!rotation || !isRotationComplete(rotation.number)) return false;
  if (isLadderLiveMode(state.schedule)) {
    const total = getLadderRotationTotal(state.schedule) || state.schedule.rotations.length;
    const isLimitedLast = !isLadderOpenSession(state.schedule) && rotation.number >= total;
    if (isLimitedLast) {
      state.schedule.meta = state.schedule.meta || {};
      state.schedule.meta.sessionEnded = true;
      state.liveRotationIndex = Math.min(state.liveRotationIndex, state.schedule.rotations.length - 1);
      persistState();
      showFinalRankingModal(rotation.number);
      return true;
    }
    if (isLadderOpenSession(state.schedule)) {
      state.schedule.rotations = state.schedule.rotations.slice(0, state.liveRotationIndex + 1);
      appendNextLadderRotation(state.schedule);
    } else if (state.liveRotationIndex >= state.schedule.rotations.length - 1) {
      appendNextLadderRotation(state.schedule);
    }
    state.liveRotationIndex = Math.min(state.liveRotationIndex + 1, state.schedule.rotations.length - 1);
    persistState();
    renderLiveRotation();
    if (state.options.timer && !options.viaTimer && state.schedule) {
      const nextRotationNumber = state.schedule.rotations[state.liveRotationIndex].number;
      timerController.syncRotation(nextRotationNumber);
    }
    setLiveModeAvailability(true);
    return true;
  }
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
    if (isMatchNeutralized(participants)) return true;
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
  const nextRotationCta = event.target.closest('[data-ladder-next-cta]');
  if (nextRotationCta) {
    if (!nextRotationCta.disabled) {
      advanceLadderPilotRotation();
    }
    return;
  }
  const openCurrentButton = event.target.closest('[data-open-current-rotation]');
  if (openCurrentButton) {
    if (isLadderLiveMode(state.schedule)) {
      openLadderPilotModal();
    } else {
      focusCurrentLadderRotation();
    }
    return;
  }
  const closeCurrentButton = event.target.closest('[data-close-current-rotation]');
  if (closeCurrentButton) {
    if (!closeCurrentButton.disabled) {
      advanceLiveRotation();
    }
    return;
  }
  const rankingButton = event.target.closest('[data-open-current-ranking]');
  if (rankingButton) {
    goTo('results');
    setActiveView('rankings');
    return;
  }
  const statusButton = event.target.closest('[data-status-player]');
  if (statusButton) {
    const playerName = statusButton.dataset.statusPlayer || '';
    const statusValue = statusButton.dataset.statusValue || STATUS_TYPES.active.key;
    if (playerName) {
      setEntityStatusByName(playerName, statusValue);
      renderLiveRotation();
    }
    return;
  }
  const quickButton = event.target.closest('[data-ladder-quick]');
  if (quickButton) {
    const matchId = quickButton.dataset.matchId;
    const outcome = quickButton.dataset.ladderQuick;
    buildLadderQuickResult(matchId, outcome);
    return;
  }
  const scoreToggle = event.target.closest('[data-ladder-score-toggle]');
  if (scoreToggle) {
    const matchId = scoreToggle.dataset.matchId;
    if (!matchId) return;
    if (isMatchValidated(matchId)) {
      unlockValidatedMatch(matchId, { skipConfirm: true, openEditor: true });
      return;
    }
    toggleLadderScoreEditor(matchId);
    return;
  }
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
    renderProjectionScreen();
    const teamsView = buildTeamEntriesFromSchedule(state.schedule);
    state.schedule.teams = teamsView;
    renderTeamView(teamsView);
  }
  refreshLadderPilotModalIfOpen();
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
    if (isMatchNeutralized(participants)) {
      return acc;
    }
    const key = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
    return acc + (isMatchCompleteById(key) ? 0 : 1);
  }, 0);
}

function isMatchCompleteById(matchId) {
  if (!state.scores || !state.scores[matchId]) return false;
  const record = state.scores[matchId];
  return Number.isFinite(record.home) && Number.isFinite(record.away);
}

function getLadderScoreToggleLabel(matchId, isOpen = false) {
  if (isOpen) return 'Masquer le score';
  return isMatchValidated(matchId) ? 'Modifier le score' : 'Entrer le score';
}

function findLadderScoreEditors(matchId) {
  return Array.from(document.querySelectorAll('[data-ladder-score-editor]')).filter(
    node => node.dataset.ladderScoreEditor === matchId
  );
}

function findLadderScoreToggleButtons(matchId) {
  return Array.from(document.querySelectorAll('[data-ladder-score-toggle]')).filter(
    node => node.dataset.matchId === matchId
  );
}

function toggleLadderScoreEditor(matchId, options = {}) {
  if (!matchId) return;
  const forceOpen = options.forceOpen === true;
  const forceClose = options.forceClose === true;
  const editors = findLadderScoreEditors(matchId);
  if (!editors.length) return;
  const shouldOpen = forceOpen ? true : forceClose ? false : editors.every(editor => editor.classList.contains('hidden'));
  editors.forEach(editor => {
    editor.classList.toggle('hidden', !shouldOpen);
  });
  findLadderScoreToggleButtons(matchId).forEach(button => {
    button.textContent = getLadderScoreToggleLabel(matchId, shouldOpen);
  });
  if (!shouldOpen) return;
  const focusTarget = editors.find(editor => editor.offsetParent !== null) || editors[0];
  const firstInput = focusTarget?.querySelector('input[data-score-input]');
  if (firstInput && typeof firstInput.focus === 'function') {
    firstInput.focus();
    if (typeof firstInput.select === 'function') {
      firstInput.select();
    }
  }
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
  if (format === 'ladder') {
    return buildLadderSchedule(teams, options);
  }
  if (format === 'challenge') {
    return buildChallengeBoard(teams, options);
  }
  if (format === 'swiss') {
    return initializeSwissMode(teams, options);
  }
  const groupOptions = { finals: format === 'groups-finals' };
  if (format === 'groups-finals') {
    const targetGroups = getWorldCupGroupTarget();
    if (targetGroups) {
      groupOptions.targetGroups = targetGroups;
    }
  }
  const groups = distributeIntoGroups(teams, groupOptions);
  if (!groups.length || groups.length === 1) {
    return buildSinglePoolSchedule(teams, options);
  }
  return buildGroupedSchedule(groups, teams, options, { finals: format === 'groups-finals' });
}

function createLadderRotationEntry(rotationNumber, fieldCount, duration, playerCount) {
  const matches = [];
  const activeCourts = Math.min(fieldCount, Math.floor(Math.max(0, Number(playerCount) || 0) / 2));
  for (let fieldIndex = 0; fieldIndex < activeCourts; fieldIndex += 1) {
    const slotA = fieldIndex * 2;
    const slotB = slotA + 1;
    matches.push({
      id: `ladder-${rotationNumber}-${fieldIndex + 1}`,
      phase: 'ladder',
      ladderSlots: [slotA, slotB],
    });
  }
  return {
    number: rotationNumber,
    phase: 'ladder',
    title: `Rotation ${rotationNumber}`,
    matches,
    byes: [],
    startLabel: null,
    durationLabel: `${duration} min`,
    fieldAssignments: [],
  };
}

function getLadderConfiguredCourts(schedule = state.schedule) {
  return clampNumber(
    Number(schedule?.ladder?.configuredCourts) || Number(schedule?.meta?.configuredCourts) || Number(schedule?.meta?.fieldCount) || 1,
    1,
    16,
    1
  );
}

function buildConfiguredLadderRotation(schedule, currentOrder, nextNumber, previousRotation = null) {
  if (!schedule || schedule.format !== 'ladder' || !schedule.ladder) return null;
  if (previousRotation) {
    return buildNextLadderRotationFromPreviousFieldState(schedule, previousRotation, nextNumber);
  }
  const names = schedule.ladder.names || [];
  const configuredCourts = getLadderConfiguredCourts(schedule);
  const ladderSource = {
    ladder: {
      ...schedule.ladder,
      mode: schedule.ladder.mode || getScheduleLadderMode(schedule),
      courtMode: schedule.ladder.courtMode || getLadderCourtMode(),
      configuredCourts,
    },
  };
  const activeEntries = currentOrder
    .map((playerIndex, orderIndex) => ({
      playerIndex,
      orderIndex,
      name: names[playerIndex] || `Participant ${playerIndex + 1}`,
    }))
    .filter(entry => !isEntityInactive(getEntityStatusByName(entry.name)));
  const summary = computeLadderSetupSummary(activeEntries.length, configuredCourts, ladderSource);
  if (!summary.activeCourts) return null;
  const previousAssignments = previousRotation ? computeLadderRoleAssignments(previousRotation) : null;
  const previousRefByField = new Map();
  if (previousRotation && previousAssignments?.size) {
    previousRotation.matches.forEach(match => {
      const matchId = match.id || buildMatchKey(previousRotation.number, match.home, match.away);
      const arbiter = previousAssignments.get(matchId)?.arbitre;
      if (arbiter && !isEntityInactive(getEntityStatusByName(arbiter))) {
        previousRefByField.set(Number(match.field), arbiter);
      }
    });
  }
  const entryByName = new Map(activeEntries.map(entry => [entry.name, entry]));
  const reservedRefNames = new Set(Array.from(previousRefByField.values()));
  const usedNames = new Set();
  const takeNextEntry = (allowReserved = false) =>
    activeEntries.find(entry => {
      if (usedNames.has(entry.name)) return false;
      if (!allowReserved && reservedRefNames.has(entry.name)) return false;
      return true;
    });
  const matches = [];
  for (let fieldNumber = 1; fieldNumber <= summary.activeCourts; fieldNumber += 1) {
    const players = [];
    const returningRef = summary.refereeFields.includes(fieldNumber) ? previousRefByField.get(fieldNumber) : null;
    if (returningRef && entryByName.has(returningRef) && !usedNames.has(returningRef)) {
      players.push(entryByName.get(returningRef));
      usedNames.add(returningRef);
    }
    while (players.length < 2) {
      const nextEntry = takeNextEntry(false) || takeNextEntry(true);
      if (!nextEntry) break;
      players.push(nextEntry);
      usedNames.add(nextEntry.name);
    }
    if (players.length < 2) break;
    matches.push({
      id: `ladder-${nextNumber}-${fieldNumber}`,
      phase: 'ladder',
      field: fieldNumber,
      order: 1,
      home: players[0].name,
      away: players[1].name,
      ladderSlots: [players[0].orderIndex, players[1].orderIndex],
      explicitPlayers: true,
    });
  }
  const remainingEntries = activeEntries.filter(entry => !usedNames.has(entry.name));
  const fieldReferees = {};
  const orderSnapshot = [];
  summary.refereeFields.forEach(fieldNumber => {
    if (fieldNumber > matches.length) return;
    const nextRef = remainingEntries.shift();
    if (nextRef) {
      fieldReferees[fieldNumber] = nextRef.name;
    }
  });
  const duration = clampNumber(Number(schedule.meta?.durationMinutes) || Number(state.options.duration) || 12, 4, 30, 12);
  matches.forEach(match => {
    const referee = fieldReferees[match.field];
    if (referee) {
      orderSnapshot.push(referee, match.home, match.away);
    } else {
      orderSnapshot.push(match.home, match.away);
    }
  });
  return {
    number: nextNumber,
    phase: 'ladder',
    title: `Rotation ${nextNumber}`,
    matches,
    byes: remainingEntries.map(entry => entry.name),
    fieldReferees,
    refereeFields: [...summary.refereeFields],
    orderSnapshot: [...orderSnapshot, ...remainingEntries.map(entry => entry.name)],
    startLabel: null,
    durationLabel: `${duration} min`,
    fieldAssignments: matches.map(match => ({
      label: `Terrain ${match.field}`,
      matches: [match],
    })),
  };
}

function resolveLadderFieldOutcome(match, schedule = state.schedule) {
  const participants = resolveMatchParticipants(match, schedule);
  const topName = participants.home;
  const bottomName = participants.away;
  const neutralized = isMatchNeutralized(participants);
  const record = state.scores?.[match.id];
  const base = {
    match,
    field: Number(match.field) || 0,
    topName,
    bottomName,
    baseHighName: topName,
    baseLowName: bottomName,
    winnerName: null,
    loserName: null,
    resolved: false,
    status: 'unresolved',
  };
  if (neutralized) {
    return { ...base, status: 'neutralized' };
  }
  if (!record || !Number.isFinite(record.home) || !Number.isFinite(record.away)) {
    return base;
  }
  if (record.home === record.away) {
    return { ...base, status: 'draw' };
  }
  const bottomWins = record.away > record.home;
  return {
    ...base,
    baseHighName: bottomWins ? bottomName : topName,
    baseLowName: bottomWins ? topName : bottomName,
    winnerName: bottomWins ? bottomName : topName,
    loserName: bottomWins ? topName : bottomName,
    resolved: true,
    status: bottomWins ? 'bottom-win' : 'top-win',
  };
}

function computeLadderFieldRoundState(rotation, schedule = state.schedule) {
  const courts = (rotation?.matches || [])
    .map(match => resolveLadderFieldOutcome(match, schedule))
    .filter(Boolean)
    .sort((a, b) => a.field - b.field);
  if (!courts.length) {
    return { courts: [], boundarySwaps: [] };
  }
  const boundarySwaps = courts.slice(0, -1).map((court, index) => {
    const lowerCourt = courts[index + 1];
    const swapped = Boolean(court.resolved && lowerCourt.resolved);
    return {
      upperField: court.field,
      lowerField: lowerCourt.field,
      swapped,
      movingUpName: swapped ? lowerCourt.baseHighName : null,
      movingDownName: swapped ? court.baseLowName : null,
    };
  });
  courts.forEach((court, index) => {
    court.finalHighName = index > 0 && boundarySwaps[index - 1]?.swapped ? courts[index - 1].baseLowName : court.baseHighName;
    court.finalLowName = index < boundarySwaps.length && boundarySwaps[index]?.swapped ? courts[index + 1].baseHighName : court.baseLowName;
  });
  return { courts, boundarySwaps };
}

function buildNextLadderRotationFromPreviousFieldState(schedule, previousRotation, nextNumber) {
  if (!schedule || schedule.format !== 'ladder' || !previousRotation) return null;
  const configuredCourts = getLadderConfiguredCourts(schedule);
  const mode = getScheduleLadderMode(schedule);
  const activeNames = (schedule.ladder?.names || []).filter(name => !isEntityInactive(getEntityStatusByName(name)));
  const ladderSource = {
    ladder: {
      ...schedule.ladder,
      mode,
      courtMode: schedule.ladder.courtMode || getLadderCourtMode(),
      configuredCourts,
    },
  };
  const summary = computeLadderSetupSummary(activeNames.length, configuredCourts, ladderSource);
  const roundState = computeLadderFieldRoundState(previousRotation, schedule);
  const previousAssignments = computeLadderRoleAssignments(previousRotation);
  const previousReferees = new Map();
  previousRotation.matches.forEach(match => {
    const matchId = match.id || buildMatchKey(previousRotation.number, match.home, match.away);
    const referee = previousAssignments?.get(matchId)?.arbitre;
    if (referee && !isEntityInactive(getEntityStatusByName(referee))) {
      previousReferees.set(Number(match.field), referee);
    }
  });
  const requestedRefereeFields = Array.isArray(previousRotation.refereeFields) && previousRotation.refereeFields.length
    ? [...previousRotation.refereeFields]
    : Array.isArray(schedule.ladder?.refereeFields)
      ? [...schedule.ladder.refereeFields]
      : [];
  const targetFieldCount = Math.max(1, Math.min(summary.activeCourts, roundState.courts.length || summary.activeCourts));
  const refereeFieldSet = new Set(
    requestedRefereeFields.filter(field => Number.isInteger(field) && field >= 1 && field <= targetFieldCount && mode !== 'free')
  );

  // Chaque terrain est reconstruit depuis l'état du terrain précédent :
  // arbitre -> joueur du même terrain, gagnant monte, perdant descend, banc complète.
  const nextCourts = Array.from({ length: targetFieldCount }, (_, index) => ({
    field: index + 1,
    hasRefereeSlot: refereeFieldSet.has(index + 1),
    playerCandidates: [],
    refereeCandidate: null,
  }));
  const pushCandidate = (fieldIndex, name, source, priority) => {
    if (fieldIndex < 0 || fieldIndex >= nextCourts.length || !name || isEntityInactive(getEntityStatusByName(name))) return;
    nextCourts[fieldIndex].playerCandidates.push({ name, source, priority });
  };

  roundState.courts.slice(0, targetFieldCount).forEach((court, index) => {
    const nextCourt = nextCourts[index];
    const previousReferee = previousReferees.get(court.field);
    if (nextCourt.hasRefereeSlot && previousReferee) {
      pushCandidate(index, previousReferee, 'prev-referee', 0);
    }

    const winner = court.resolved ? court.winnerName : court.baseHighName;
    const loser = court.resolved ? court.loserName : court.baseLowName;
    const isFirst = index === 0;
    const isLast = index === targetFieldCount - 1;

    if (winner) {
      if (isFirst) {
        if (nextCourt.hasRefereeSlot) {
          nextCourt.refereeCandidate = nextCourt.refereeCandidate || winner;
        } else {
          pushCandidate(index, winner, 'stay-top', 1);
        }
      } else {
        pushCandidate(index - 1, winner, 'winner-up', 3);
      }
    }

    if (loser) {
      if (isLast) {
        if (nextCourt.hasRefereeSlot) {
          nextCourt.refereeCandidate = nextCourt.refereeCandidate || loser;
        } else {
          pushCandidate(index, loser, 'stay-bottom', 4);
        }
      } else {
        pushCandidate(index + 1, loser, 'loser-down', 1);
      }
    }
  });

  const previousBench = Array.isArray(previousRotation.byes)
    ? previousRotation.byes.filter(name => name && !isEntityInactive(getEntityStatusByName(name)))
    : [];
  const usedNames = new Set();
  const overflow = [];
  const fieldReferees = {};
  const matches = [];
  const orderSnapshot = [];

  const consumeCandidate = (candidates, acceptedSources) => {
    const match = candidates.find(candidate => !usedNames.has(candidate.name) && acceptedSources.includes(candidate.source));
    if (!match) return null;
    usedNames.add(match.name);
    return match.name;
  };

  nextCourts.forEach(court => {
    const dedupedCandidates = [];
    const seenCandidateNames = new Set();
    court.playerCandidates
      .sort((a, b) => a.priority - b.priority)
      .forEach(candidate => {
        if (seenCandidateNames.has(candidate.name)) return;
        dedupedCandidates.push(candidate);
        seenCandidateNames.add(candidate.name);
      });
    court.playerCandidates = dedupedCandidates;

    let referee = court.refereeCandidate;
    if (referee && usedNames.has(referee)) {
      referee = null;
    }
    if (referee) {
      usedNames.add(referee);
    } else if (court.hasRefereeSlot) {
      const promotedRef = consumeCandidate(court.playerCandidates, ['winner-up', 'stay-top', 'stay-bottom', 'loser-down']);
      if (promotedRef) {
        referee = promotedRef;
      }
    }

    const players = [];
    const firstPlayer = court.hasRefereeSlot
      ? consumeCandidate(court.playerCandidates, ['prev-referee', 'loser-down', 'winner-up', 'stay-top', 'stay-bottom'])
      : consumeCandidate(court.playerCandidates, ['winner-up', 'stay-top', 'loser-down', 'stay-bottom', 'prev-referee']);
    if (firstPlayer) players.push(firstPlayer);
    const secondPlayer = consumeCandidate(court.playerCandidates, ['loser-down', 'winner-up', 'stay-top', 'stay-bottom', 'prev-referee']);
    if (secondPlayer) players.push(secondPlayer);

    court.playerCandidates.forEach(candidate => {
      if (!usedNames.has(candidate.name)) {
        overflow.push(candidate.name);
      }
    });

    court.players = players;
    court.referee = referee;
  });

  const waitingPool = Array.from(
    new Set([
      ...previousBench,
      ...overflow,
      ...activeNames.filter(name => !usedNames.has(name)),
    ])
  ).filter(name => !usedNames.has(name));

  const takeFromBench = () => {
    while (waitingPool.length) {
      const name = waitingPool.shift();
      if (!name || usedNames.has(name) || isEntityInactive(getEntityStatusByName(name))) continue;
      usedNames.add(name);
      return name;
    }
    return null;
  };

  nextCourts.forEach(court => {
    while (court.players.length < 2) {
      const benchPlayer = takeFromBench();
      if (!benchPlayer) break;
      court.players.push(benchPlayer);
    }
    if (court.hasRefereeSlot && !court.referee) {
      court.referee = takeFromBench();
    }
    if (court.players.length < 2) return;
    matches.push({
      id: `ladder-${nextNumber}-${court.field}`,
      phase: 'ladder',
      field: court.field,
      order: 1,
      home: court.players[0],
      away: court.players[1],
      explicitPlayers: true,
    });
    if (court.referee) {
      fieldReferees[court.field] = court.referee;
      orderSnapshot.push(court.referee, court.players[0], court.players[1]);
    } else {
      orderSnapshot.push(court.players[0], court.players[1]);
    }
  });

  const byes = activeNames.filter(name => !usedNames.has(name));
  const duration = clampNumber(Number(schedule.meta?.durationMinutes) || Number(state.options.duration) || 12, 4, 30, 12);
  return {
    number: nextNumber,
    phase: 'ladder',
    title: `Rotation ${nextNumber}`,
    matches,
    byes,
    fieldReferees,
    refereeFields: Array.from(refereeFieldSet).filter(field => matches.some(match => match.field === field)),
    orderSnapshot: [...orderSnapshot, ...byes],
    startLabel: null,
    durationLabel: `${duration} min`,
    fieldAssignments: matches.map(match => ({
      label: `Terrain ${match.field}`,
      matches: [match],
    })),
  };
}

function getWorldCupGroupTarget() {
  if (!state || !state.options) return null;
  const requested = Number(state.options.worldCupGroupCount);
  if (!Number.isFinite(requested)) return null;
  return clampNumber(requested, 2, 4, 2);
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

function buildLadderSchedule(teams, options) {
  const names = [...teams];
  const configuredCourts = clampNumber(Number(options.fields) || 1, 1, 16, 2);
  const summary = computeLadderSetupSummary(names.length, configuredCourts, { ladder: options?.ladder || state.options.ladder });
  const sessionMode = getLadderSessionMode(options);
  const rotationLimit = getLadderRotationLimit(options, names.length, configuredCourts);
  const duration = clampNumber(Number(options.duration) || 12, 4, 30, 12);
  const schedule = {
    format: 'ladder',
    rotations: [],
    teams: names.map(name => ({ name })),
    meta: {
      format: 'ladder',
      teamCount: names.length,
      rotationCount: sessionMode === 'limited' ? rotationLimit : null,
      sessionMode,
      rotationLimit: sessionMode === 'limited' ? rotationLimit : null,
      sessionEnded: false,
      matchCount: 0,
      fieldCount: summary.activeCourts,
      configuredCourts,
      formatLabel: TOURNAMENT_MODES.ladder.label,
      practiceType: options.practiceType || state.practiceType,
      durationMinutes: duration,
    },
    ladder: {
      names,
      order: names.map((_, index) => index),
      mode: options?.ladder?.mode || getLadderMode(),
      sessionMode,
      rotationLimit: sessionMode === 'limited' ? rotationLimit : null,
      courtMode: options?.ladder?.courtMode || getLadderCourtMode(),
      configuredCourts,
      maxCourts: summary.maxCourts,
      refereeCourts: summary.refereeCourts,
      freeCourts: summary.freeCourts,
      refereePlacement: normalizeLadderRefereePlacement(options?.ladder?.refereePlacement),
      manualRefereeFields: normalizeManualRefereeFields(options?.ladder?.manualRefereeFields, configuredCourts),
      refereeFields: [...summary.refereeFields],
    },
  };
  const initialOrder = names.map((_, index) => index);
  const firstRotation = buildConfiguredLadderRotation(schedule, initialOrder, 1);
  if (firstRotation) {
    schedule.rotations.push(firstRotation);
    schedule.meta.matchCount = firstRotation.matches.length;
  }
  hydrateLadderMatches(schedule);
  return schedule;
}

function buildChallengeBoard(teams, options) {
  const names = [...teams];
  challengeIdSeed = 0;
  const schedule = {
    format: 'challenge',
    rotations: [],
    teams: names.map(name => ({ name })),
    meta: {
      teamCount: names.length,
      rotationCount: 0,
      matchCount: 0,
      fieldCount: clampNumber(Number(options.fields) || 1, 1, 16, 1),
      formatLabel: TOURNAMENT_MODES.challenge.label,
      practiceType: options.practiceType || state.practiceType,
    },
    challenge: {
      names,
      order: [],
      history: [],
    },
  };
  return schedule;
}

function initializeSwissMode(teams, options) {
  const names = [...teams];
  const players = names.map((name, index) => ({
    id: index + 1,
    seed: index,
    name,
    points: 0,
    matches: 0,
    wins: 0,
    losses: 0,
    bye: 0,
    opponents: [],
  }));
  const currentMatches = generateSwissPairings(players, []).map((match, index) => ({
    ...match,
    id: match.bye ? `swiss-bye-1-${match.p1Id}` : `swiss-1-${index + 1}`,
    round: 1,
  }));
  const schedule = {
    format: 'swiss',
    rotations: [],
    teams: names.map(name => ({ name })),
    meta: {
      format: 'swiss',
      teamCount: names.length,
      rotationCount: 1,
      matchCount: currentMatches.filter(match => !match.bye).length,
      fieldCount: Math.max(1, currentMatches.filter(match => !match.bye).length),
      formatLabel: TOURNAMENT_MODES.swiss.label,
      practiceType: options.practiceType || state.practiceType,
      durationMinutes: clampNumber(Number(options.duration) || 12, 1, 180, 12),
    },
    swiss: {
      round: 1,
      players,
      currentMatches,
      history: [],
      ranking: [],
    },
  };
  syncSwissRotations(schedule);
  updateSwissRanking(schedule);
  return schedule;
}

function buildSwissRotation(roundNumber, matches, schedule) {
  const playerMap = new Map((schedule?.swiss?.players || []).map(player => [player.id, player]));
  const duration = clampNumber(Number(schedule?.meta?.durationMinutes) || Number(state.options.duration) || 12, 1, 180, 12);
  const byes = matches
    .filter(match => match.bye)
    .map(match => playerMap.get(match.p1Id)?.name)
    .filter(Boolean);
  return {
    number: roundNumber,
    phase: 'swiss',
    title: `Ronde ${roundNumber}`,
    matches: matches
      .filter(match => !match.bye)
      .map(match => ({
        id: match.id,
        phase: 'swiss',
        field: match.field,
        order: 1,
        home: playerMap.get(match.p1Id)?.name || '',
        away: playerMap.get(match.p2Id)?.name || '',
        swissMatchId: match.id,
        swissIds: [match.p1Id, match.p2Id],
        winnerId: match.winnerId ?? null,
      })),
    byes,
    startLabel: null,
    durationLabel: `${duration} min`,
    fieldAssignments: matches
      .filter(match => !match.bye)
      .map(match => ({
        label: `Terrain ${match.field}`,
        matches: [
          {
            id: match.id,
            phase: 'swiss',
            field: match.field,
            home: playerMap.get(match.p1Id)?.name || '',
            away: playerMap.get(match.p2Id)?.name || '',
          },
        ],
      })),
  };
}

function syncSwissRotations(schedule = state.schedule) {
  if (!schedule || schedule.format !== 'swiss' || !schedule.swiss) return;
  const historyRounds = (schedule.swiss.history || []).map(round => buildSwissRotation(round.round, round.matches || [], schedule));
  const currentRound = buildSwissRotation(schedule.swiss.round || historyRounds.length + 1, schedule.swiss.currentMatches || [], schedule);
  schedule.rotations = [...historyRounds, currentRound];
  schedule.meta = schedule.meta || {};
  schedule.meta.rotationCount = schedule.swiss.round || 1;
  schedule.meta.matchCount = historyRounds.reduce((total, rotation) => total + rotation.matches.length, currentRound.matches.length);
  schedule.meta.fieldCount = Math.max(1, currentRound.matches.length);
  schedule.meta.format = 'swiss';
  schedule.meta.formatLabel = TOURNAMENT_MODES.swiss.label;
}

function buildSwissPreviousMatches(schedule = state.schedule) {
  if (!schedule?.swiss) return [];
  return (schedule.swiss.history || []).flatMap(round => round.matches || []);
}

function generateSwissPairings(players, previousMatches) {
  const previousOpponentMap = new Map();
  (previousMatches || []).forEach(match => {
    if (match?.bye) return;
    const p1Id = Number(match.p1Id);
    const p2Id = Number(match.p2Id);
    if (!Number.isInteger(p1Id) || !Number.isInteger(p2Id)) return;
    if (!previousOpponentMap.has(p1Id)) previousOpponentMap.set(p1Id, new Set());
    if (!previousOpponentMap.has(p2Id)) previousOpponentMap.set(p2Id, new Set());
    previousOpponentMap.get(p1Id).add(p2Id);
    previousOpponentMap.get(p2Id).add(p1Id);
  });

  const activePlayers = players
    .filter(player => player && !isEntityInactive(getEntityStatusByName(player.name)))
    .slice()
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return (a.seed ?? 0) - (b.seed ?? 0);
    });

  const matches = [];
  let pairingPool = [...activePlayers];
  if (pairingPool.length % 2 === 1) {
    const byeCandidates = [...pairingPool].sort((a, b) => {
      if (a.bye !== b.bye) return a.bye - b.bye;
      if (a.points !== b.points) return a.points - b.points;
      if (a.wins !== b.wins) return a.wins - b.wins;
      return (b.seed ?? 0) - (a.seed ?? 0);
    });
    const byePlayer = byeCandidates[0];
    pairingPool = pairingPool.filter(player => player.id !== byePlayer.id);
    matches.push({
      id: `swiss-bye-${(previousMatches?.length || 0) + 1}-${byePlayer.id}`,
      round: 0,
      p1Id: byePlayer.id,
      p2Id: null,
      winnerId: byePlayer.id,
      bye: true,
      field: null,
    });
  }

  let field = 1;
  while (pairingPool.length) {
    const p1 = pairingPool.shift();
    if (!p1) break;
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    pairingPool.forEach((candidate, index) => {
      const alreadyPlayed = previousOpponentMap.get(p1.id)?.has(candidate.id) || false;
      const scoreGap = Math.abs((candidate.points || 0) - (p1.points || 0));
      const pairingScore = alreadyPlayed ? scoreGap + 100 : scoreGap;
      if (pairingScore < bestScore) {
        bestScore = pairingScore;
        bestIndex = index;
      }
    });
    const p2 = bestIndex === -1 ? pairingPool.shift() : pairingPool.splice(bestIndex, 1)[0];
    if (!p2) break;
    matches.push({
      id: `swiss-${(previousMatches?.length || 0) + 1}-${field}`,
      round: 0,
      p1Id: p1.id,
      p2Id: p2.id,
      winnerId: null,
      bye: false,
      field,
    });
    field += 1;
  }
  return matches;
}

function getSwissPlayerMap(schedule = state.schedule) {
  return new Map((schedule?.swiss?.players || []).map(player => [Number(player.id), player]));
}

function computeSwissRankingRows(schedule = state.schedule) {
  if (!schedule?.swiss) return [];
  const rows = (schedule.swiss.players || []).map(player => ({
    id: Number(player.id),
    name: player.name,
    points: Number(player.points) || 0,
    played: Number(player.matches) || 0,
    wins: Number(player.wins) || 0,
    losses: Number(player.losses) || 0,
    bye: Number(player.bye) || 0,
    opponents: Array.isArray(player.opponents) ? [...player.opponents] : [],
    seed: Number(player.seed) || 0,
  }));
  const rowMap = new Map(rows.map(row => [row.id, row]));
  (schedule.swiss.currentMatches || []).forEach(match => {
    if (match.bye) {
      const player = rowMap.get(Number(match.p1Id));
      if (player) {
        player.points += 1;
        player.bye += 1;
      }
      return;
    }
    const p1 = rowMap.get(Number(match.p1Id));
    const p2 = rowMap.get(Number(match.p2Id));
    if (!p1 || !p2 || !isSwissWinnerResolved(match)) return;
    const winnerId = Number(match.winnerId);
    const loserId = winnerId === p1.id ? p2.id : p1.id;
    const winner = rowMap.get(winnerId);
    const loser = rowMap.get(loserId);
    if (!winner || !loser) return;
    winner.points += 1;
    winner.played += 1;
    winner.wins += 1;
    loser.played += 1;
    loser.losses += 1;
  });
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    if (a.bye !== b.bye) return a.bye - b.bye;
    return a.seed - b.seed;
  });
  return rows;
}

function updateSwissRanking(schedule = state.schedule) {
  if (!schedule?.swiss) return [];
  const ranking = computeSwissRankingRows(schedule);
  schedule.swiss.ranking = ranking;
  return ranking;
}

function buildSwissRankingTable(rows, options = {}) {
  const compact = Boolean(options.compact);
  const headers = compact
    ? `
      <tr>
        <th>#</th>
        <th>Nom</th>
        <th>Pts</th>
        <th>MJ</th>
        <th>G</th>
        <th>P</th>
        <th>Exempt</th>
      </tr>
    `
    : `
      <tr>
        <th>#</th>
        <th>Nom</th>
        <th>Pts</th>
        <th>MJ</th>
        <th>G</th>
        <th>P</th>
        <th>Exempt</th>
      </tr>
    `;
  const body = rows
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(row.name)}</td>
          <td>${row.points}</td>
          <td>${row.played}</td>
          <td>${row.wins}</td>
          <td>${row.losses}</td>
          <td>${row.bye}</td>
        </tr>
      `
    )
    .join('');
  return `
    <table>
      <thead>${headers}</thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderSwissBoard(schedule) {
  if (!elements.rotationView || !schedule?.swiss) return;
  const ranking = updateSwissRanking(schedule);
  const playerMap = getSwissPlayerMap(schedule);
  const currentRound = schedule.swiss.round || 1;
  const remainingCount = (schedule.swiss.currentMatches || []).filter(match => !isSwissWinnerResolved(match)).length;
  const matches = (schedule.swiss.currentMatches || [])
    .map(match => {
      if (match.bye) {
        const player = playerMap.get(Number(match.p1Id));
        if (!player) return '';
        return `
          <article class="swiss-match-card swiss-match-card-bye">
            <header>
              <p class="eyebrow">Ronde ${currentRound}</p>
              <h3>Exempt</h3>
            </header>
            <p class="swiss-bye-player">${escapeHtml(player.name)} reçoit +1 point</p>
          </article>
        `;
      }
      const p1 = playerMap.get(Number(match.p1Id));
      const p2 = playerMap.get(Number(match.p2Id));
      if (!p1 || !p2) return '';
      const winnerId = Number(match.winnerId);
      const p1State = winnerId === p1.id ? 'winner' : winnerId === p2.id ? 'loser' : '';
      const p2State = winnerId === p2.id ? 'winner' : winnerId === p1.id ? 'loser' : '';
      return `
        <article class="swiss-match-card ${isSwissWinnerResolved(match) ? 'validated' : ''}" data-swiss-match-id="${match.id}">
          <header>
            <p class="eyebrow">Terrain ${match.field || '—'}</p>
            <h3>Match</h3>
          </header>
          <div class="swiss-match-players">
            <button type="button" class="swiss-player-btn ${p1State}" data-swiss-winner="${p1.id}" data-swiss-match-id="${match.id}">
              <span class="swiss-player-name">${escapeHtml(p1.name)}</span>
              <span class="swiss-player-points">${p1.points} pt${p1.points > 1 ? 's' : ''}</span>
            </button>
            <span class="swiss-versus">VS</span>
            <button type="button" class="swiss-player-btn ${p2State}" data-swiss-winner="${p2.id}" data-swiss-match-id="${match.id}">
              <span class="swiss-player-name">${escapeHtml(p2.name)}</span>
              <span class="swiss-player-points">${p2.points} pt${p2.points > 1 ? 's' : ''}</span>
            </button>
          </div>
        </article>
      `;
    })
    .join('');
  const readyToValidate = (schedule.swiss.currentMatches || []).every(match => isSwissWinnerResolved(match));
  elements.rotationView.innerHTML = `
    <section class="swiss-shell">
      <header class="swiss-board-header">
        <div>
          <p class="eyebrow">Ronde Suisse</p>
          <h3>Ronde ${currentRound}</h3>
          <p class="swiss-board-meta">${remainingCount} match(s) restant(s) · ${schedule.swiss.currentMatches.filter(match => !match.bye).length} match(s) · ${schedule.swiss.currentMatches.filter(match => match.bye).length} exempt(s)</p>
        </div>
      </header>
      <div class="swiss-board-layout">
        <section class="swiss-match-list">${matches || '<p class="live-empty">Aucun match pour cette ronde.</p>'}</section>
        <section class="swiss-ranking-panel">
          <header>
            <p class="eyebrow">Classement live</p>
            <h3>Points et bilan</h3>
          </header>
          ${buildSwissRankingTable(ranking)}
        </section>
      </div>
      ${
        readyToValidate
          ? `
            <section class="swiss-pilot-cta swiss-validation-cta">
              <button type="button" class="btn primary xl" data-swiss-validate-round>
                Valider la ronde et passer à la suivante
              </button>
            </section>
          `
          : ''
      }
    </section>
  `;
}

function setSwissWinner(matchId, winnerId) {
  if (!state.schedule?.swiss) return;
  const match = state.schedule.swiss.currentMatches.find(entry => entry.id === matchId);
  const numericWinnerId = Number(winnerId);
  if (!match || match.bye || !Number.isInteger(numericWinnerId)) return;
  if (![Number(match.p1Id), Number(match.p2Id)].includes(numericWinnerId)) return;
  match.winnerId = numericWinnerId;
  updateSwissRanking(state.schedule);
  persistState();
  renderSwissBoard(state.schedule);
  if (isSwissPilotScreenOpen()) {
    renderSwissPilotScreen();
  }
  renderRankingView(state.schedule);
  renderLiveRankingPanel();
  if (elements.rankingModal && !elements.rankingModal.classList.contains('hidden')) {
    renderRankingModal();
  }
}

function validateSwissRound() {
  if (!state.schedule?.swiss) return;
  const stayInPilot = isSwissPilotScreenOpen();
  const swiss = state.schedule.swiss;
  const playerMap = getSwissPlayerMap(state.schedule);
  const allResolved = (swiss.currentMatches || []).every(match => isSwissWinnerResolved(match));
  if (!allResolved) {
    alert('Choisissez un gagnant sur tous les matchs avant de passer à la ronde suivante.');
    return;
  }
  const committedRound = {
    round: swiss.round,
    matches: (swiss.currentMatches || []).map(match => ({ ...match })),
  };
  committedRound.matches.forEach(match => {
    if (match.bye) {
      const player = playerMap.get(Number(match.p1Id));
      if (player) {
        player.points += 1;
        player.bye += 1;
      }
      return;
    }
    const p1 = playerMap.get(Number(match.p1Id));
    const p2 = playerMap.get(Number(match.p2Id));
    const winnerId = Number(match.winnerId);
    if (!p1 || !p2 || !isSwissWinnerResolved(match)) return;
    const loserId = winnerId === p1.id ? p2.id : p1.id;
    const winner = playerMap.get(winnerId);
    const loser = playerMap.get(loserId);
    if (!winner || !loser) return;
    winner.points += 1;
    winner.matches += 1;
    winner.wins += 1;
    loser.matches += 1;
    loser.losses += 1;
    winner.opponents = [...winner.opponents, loser.id];
    loser.opponents = [...loser.opponents, winner.id];
  });
  swiss.history = [...(swiss.history || []), committedRound];
  swiss.round += 1;
  swiss.currentMatches = generateSwissPairings(swiss.players, buildSwissPreviousMatches(state.schedule)).map((match, index) => ({
    ...match,
    id: match.bye ? `swiss-bye-${swiss.round}-${match.p1Id}` : `swiss-${swiss.round}-${index + 1}`,
    round: swiss.round,
  }));
  syncSwissRotations(state.schedule);
  updateSwissRanking(state.schedule);
  persistState();
  renderResults(state.schedule, { preserveTimestamp: true });
  if (stayInPilot) {
    goTo('swiss-pilot');
    renderSwissPilotScreen();
  }
}

function exportSwissRankingCsv() {
  if (!state.schedule?.swiss) return;
  const ranking = updateSwissRanking(state.schedule);
  if (!ranking.length) return;
  const header = ['rang', 'nom', 'points', 'matchs', 'victoires', 'defaites', 'exempt', 'adversaires'].join(';');
  const playerMap = getSwissPlayerMap(state.schedule);
  const rows = ranking.map((row, index) => {
    const player = playerMap.get(Number(row.id));
    const opponents = (player?.opponents || [])
      .map(opponentId => playerMap.get(Number(opponentId))?.name)
      .filter(Boolean)
      .join(' | ');
    return [index + 1, row.name, row.points, row.played, row.wins, row.losses, row.bye, opponents].join(';');
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ronde-suisse_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

function hydrateLadderMatches(schedule) {
  if (!schedule || schedule.format !== 'ladder' || !schedule.ladder) return;
  const ladder = schedule.ladder;
  const names = ladder.names || [];
  ladder.order = Array.from({ length: names.length }, (_, i) => i);
  const workingOrder = [...ladder.order];
  schedule.rotations.forEach(rotation => {
    const isExplicitRotation = rotation.matches?.every(match => match.explicitPlayers && match.home && match.away);
    if (isExplicitRotation) {
      if (Array.isArray(rotation.orderSnapshot) && rotation.orderSnapshot.length) {
        ladder.order = rotation.orderSnapshot
          .map(name => names.indexOf(name))
          .filter(index => index >= 0);
      }
      rotation.matches.forEach((match, fieldIndex) => {
        match.field = Number(match.field) || fieldIndex + 1;
        match.order = 1;
        if (!match.id) {
          match.id = buildMatchKey(rotation.number, match.home, match.away);
        }
      });
      rotation.fieldAssignments = rotation.matches.map(match => ({
        label: `Terrain ${match.field}`,
        matches: [match],
      }));
      return;
    }
    const usedSlots = new Set();
    rotation.matches.forEach((match, fieldIndex) => {
      const [slotA, slotB] = match.ladderSlots || [fieldIndex * 2, fieldIndex * 2 + 1];
      usedSlots.add(slotA);
      usedSlots.add(slotB);
      const orderA = workingOrder[slotA];
      const orderB = workingOrder[slotB];
      match.field = fieldIndex + 1;
      match.order = 1;
      match.home = names[orderA] || `Participant ${slotA + 1}`;
      match.away = names[orderB] || `Participant ${slotB + 1}`;
    });
    rotation.byes = workingOrder
      .map((index, orderIndex) => ({ index, orderIndex }))
      .filter(({ orderIndex }) => !usedSlots.has(orderIndex))
      .map(({ index }) => names[index] || `Participant ${index + 1}`);
    rotation.fieldAssignments = rotation.matches.map(match => ({
      label: `Terrain ${match.field}`,
      matches: [match],
    }));
    applyLadderRoundResults(workingOrder, rotation.matches, names, schedule);
  });
  ladder.order = workingOrder;
}

function appendNextLadderRotation(schedule = state.schedule) {
  if (!schedule || schedule.format !== 'ladder' || isLadderSessionEnded(schedule)) return null;
  const rotation = buildNextLadderRotationFromCurrentStandings(schedule);
  if (!rotation) return null;
  schedule.rotations.push(rotation);
  schedule.meta.matchCount = (schedule.meta.matchCount || 0) + rotation.matches.length;
  schedule.meta.currentRotationNumber = rotation.number;
  hydrateLadderMatches(schedule);
  return rotation;
}

function computeLadderOrderAfterRotation(schedule = state.schedule, uptoIndex = state.liveRotationIndex) {
  if (!schedule || schedule.format !== 'ladder' || !schedule.ladder) return [];
  const names = schedule.ladder.names || [];
  const workingOrder = Array.from({ length: names.length }, (_, index) => index);
  const safeLimit = clampNumber(Number(uptoIndex) || 0, 0, Math.max(schedule.rotations.length - 1, 0), 0);
  schedule.rotations.slice(0, safeLimit + 1).forEach(rotation => {
    applyLadderRoundResults(workingOrder, rotation.matches, names, schedule);
  });
  return workingOrder;
}

function buildNextLadderRotationFromCurrentStandings(schedule = state.schedule) {
  if (!schedule || schedule.format !== 'ladder' || !schedule.ladder) return null;
  const nextNumber = (schedule.rotations[state.liveRotationIndex]?.number || schedule.rotations.length || 0) + 1;
  return buildConfiguredLadderRotation(schedule, schedule.ladder.order || [], nextNumber, schedule.rotations[state.liveRotationIndex] || null);
}

function ensureLadderOrder(ladder, count) {
  if (!ladder.order || ladder.order.length !== count) {
    ladder.order = Array.from({ length: count }, (_, index) => index);
  }
  return ladder.order;
}

function getScheduleLadderMode(schedule = state.schedule) {
  const ladder = schedule?.ladder || {};
  if (ladder.mode) return ladder.mode;
  if (schedule?.format === 'ladder') {
    return inferLadderMode(schedule.meta?.fieldCount, ladder.refereeCourts || 0, ladder.freeCourts || 0);
  }
  return getLadderMode();
}

function resolveLadderRoundOutcome(match, order, names) {
  const [slotTop, slotBottom] = match.ladderSlots || [];
  if (!Number.isInteger(slotTop) || !Number.isInteger(slotBottom)) return null;
  const topPlayerIndex = order[slotTop];
  const bottomPlayerIndex = order[slotBottom];
  const topName = names[topPlayerIndex] || `Participant ${slotTop + 1}`;
  const bottomName = names[bottomPlayerIndex] || `Participant ${slotBottom + 1}`;
  const participants = { home: topName, away: bottomName };
  if (isMatchNeutralized(participants)) {
    return {
      match,
      field: Number(match.field) || 0,
      slotTop,
      slotBottom,
      topPlayerIndex,
      bottomPlayerIndex,
      topName,
      bottomName,
      baseHighIndex: topPlayerIndex,
      baseLowIndex: bottomPlayerIndex,
      baseHighName: topName,
      baseLowName: bottomName,
      winnerName: null,
      loserName: null,
      resolved: false,
      status: 'neutralized',
    };
  }
  const record = state.scores?.[match.id];
  if (!record || !Number.isFinite(record.home) || !Number.isFinite(record.away)) {
    return {
      match,
      field: Number(match.field) || 0,
      slotTop,
      slotBottom,
      topPlayerIndex,
      bottomPlayerIndex,
      topName,
      bottomName,
      baseHighIndex: topPlayerIndex,
      baseLowIndex: bottomPlayerIndex,
      baseHighName: topName,
      baseLowName: bottomName,
      winnerName: null,
      loserName: null,
      resolved: false,
      status: 'unresolved',
    };
  }
  if (record.home === record.away) {
    return {
      match,
      field: Number(match.field) || 0,
      slotTop,
      slotBottom,
      topPlayerIndex,
      bottomPlayerIndex,
      topName,
      bottomName,
      baseHighIndex: topPlayerIndex,
      baseLowIndex: bottomPlayerIndex,
      baseHighName: topName,
      baseLowName: bottomName,
      winnerName: null,
      loserName: null,
      resolved: false,
      status: 'draw',
    };
  }
  const bottomWins = record.away > record.home;
  return {
    match,
    field: Number(match.field) || 0,
    slotTop,
    slotBottom,
    topPlayerIndex,
    bottomPlayerIndex,
    topName,
    bottomName,
    baseHighIndex: bottomWins ? bottomPlayerIndex : topPlayerIndex,
    baseLowIndex: bottomWins ? topPlayerIndex : bottomPlayerIndex,
    baseHighName: bottomWins ? bottomName : topName,
    baseLowName: bottomWins ? topName : bottomName,
    winnerName: bottomWins ? bottomName : topName,
    loserName: bottomWins ? topName : bottomName,
    resolved: true,
    status: bottomWins ? 'bottom-win' : 'top-win',
  };
}

function computeFreeLadderRoundState(order, matches, names) {
  const courts = (matches || [])
    .map(match => resolveLadderRoundOutcome(match, order, names))
    .filter(Boolean)
    .sort((a, b) => a.slotTop - b.slotTop || a.field - b.field);
  if (!courts.length) {
    return { nextOrder: [...order], courts: [], boundarySwaps: [] };
  }
  const boundarySwaps = courts.slice(0, -1).map((court, index) => {
    const lowerCourt = courts[index + 1];
    const swapped = Boolean(court.resolved && lowerCourt.resolved);
    return {
      upperField: court.field,
      lowerField: lowerCourt.field,
      swapped,
      movingUpName: swapped ? lowerCourt.baseHighName : null,
      movingDownName: swapped ? court.baseLowName : null,
    };
  });
  const nextOrder = [...order];
  courts.forEach((court, index) => {
    const incomingFromUpper = index > 0 && boundarySwaps[index - 1]?.swapped ? courts[index - 1].baseLowIndex : court.baseHighIndex;
    const incomingFromLower =
      index < boundarySwaps.length && boundarySwaps[index]?.swapped ? courts[index + 1].baseHighIndex : court.baseLowIndex;
    court.finalHighIndex = incomingFromUpper;
    court.finalLowIndex = incomingFromLower;
    court.finalHighName = names[incomingFromUpper] || `Participant ${court.slotTop + 1}`;
    court.finalLowName = names[incomingFromLower] || `Participant ${court.slotBottom + 1}`;
    nextOrder[court.slotTop] = incomingFromUpper;
    nextOrder[court.slotBottom] = incomingFromLower;
  });
  return { nextOrder, courts, boundarySwaps };
}

function applyLadderRoundResults(order, matches, names, schedule = state.schedule) {
  const roundState = computeFreeLadderRoundState(order, matches, names);
  roundState.nextOrder.forEach((playerIndex, orderIndex) => {
    order[orderIndex] = playerIndex;
  });
}

function hydrateScheduleForSpecialModes(schedule) {
  if (!schedule) return;
  if (schedule.format === 'ladder') {
    schedule.meta = schedule.meta || {};
    schedule.meta.format = 'ladder';
    schedule.meta.sessionMode = schedule.meta.sessionMode === 'limited' ? 'limited' : getLadderSessionMode();
    schedule.meta.rotationLimit =
      schedule.meta.sessionMode === 'limited'
        ? clampNumber(
            Number(schedule.meta.rotationLimit) || Number(schedule.meta.rotationCount) || schedule.rotations?.length || 1,
            1,
            999,
            schedule.rotations?.length || 1
          )
        : null;
    schedule.meta.rotationCount = schedule.meta.sessionMode === 'limited' ? schedule.meta.rotationLimit : null;
    schedule.meta.sessionEnded = Boolean(schedule.meta.sessionEnded);
    if (!schedule.meta.durationMinutes) {
      schedule.meta.durationMinutes = clampNumber(Number(state.options.duration) || 12, 4, 30, 12);
    }
    if (schedule.ladder) {
      schedule.ladder.configuredCourts = getLadderConfiguredCourts(schedule);
      schedule.ladder.sessionMode = schedule.meta.sessionMode;
      schedule.ladder.rotationLimit = schedule.meta.rotationLimit;
      schedule.ladder.mode = schedule.ladder.mode || inferLadderMode(schedule.meta.fieldCount, schedule.ladder.refereeCourts || 0, schedule.ladder.freeCourts || 0);
      schedule.ladder.refereePlacement = normalizeLadderRefereePlacement(schedule.ladder.refereePlacement);
      schedule.ladder.manualRefereeFields = normalizeManualRefereeFields(
        schedule.ladder.manualRefereeFields,
        schedule.ladder.configuredCourts || schedule.meta.configuredCourts || schedule.meta.fieldCount
      );
      if (!Array.isArray(schedule.ladder.refereeFields)) {
        schedule.ladder.refereeFields = selectLadderRefereeFields(
          schedule.meta.fieldCount || 0,
          schedule.ladder,
          schedule.ladder.mode,
          schedule.ladder.refereeCourts
        );
      }
    }
    hydrateLadderMatches(schedule);
  }
  if (schedule.format === 'challenge') {
    hydrateChallengeBoard(schedule);
  }
  if (schedule.format === 'swiss') {
    schedule.meta = schedule.meta || {};
    schedule.meta.format = 'swiss';
    schedule.meta.formatLabel = TOURNAMENT_MODES.swiss.label;
    if (!schedule.meta.durationMinutes) {
      schedule.meta.durationMinutes = clampNumber(Number(state.options.duration) || 12, 1, 180, 12);
    }
    if (!schedule.swiss) {
      schedule.swiss = {
        round: 1,
        players: (schedule.teams || []).map((team, index) => ({
          id: index + 1,
          seed: index,
          name: team.name,
          points: 0,
          matches: 0,
          wins: 0,
          losses: 0,
          bye: 0,
          opponents: [],
        })),
        currentMatches: [],
        history: [],
        ranking: [],
      };
      schedule.swiss.currentMatches = generateSwissPairings(schedule.swiss.players, []);
    }
    syncSwissRotations(schedule);
    updateSwissRanking(schedule);
  }
}

function hydrateChallengeBoard(schedule) {
  if (!schedule || schedule.format !== 'challenge') return;
  if (!schedule.challenge) {
    schedule.challenge = {
      names: schedule.teams.map(team => team.name),
      order: [],
      range: getChallengeRange(),
      history: [],
    };
  }
  const challenge = schedule.challenge;
  challenge.names = schedule.teams.map(team => team.name);
  challenge.range = clampNumber(Number(challenge.range) || getChallengeRange(), 1, 10, getChallengeRange());
  if (!Array.isArray(challenge.history)) {
    challenge.history = [];
  }
  schedule.meta = schedule.meta || {};
  schedule.meta.fieldCount = clampNumber(Number(schedule.meta.fieldCount) || 1, 1, 16, 1);
  ensureChallengeRoster(schedule);
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
  const requestedGroups = Number(options.targetGroups);
  const targetGroups =
    Number.isFinite(requestedGroups) && requestedGroups > 0 ? clampNumber(requestedGroups, 2, 4, requestedGroups) : null;
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
  let pool = balanced.length ? balanced : candidates;
  pool.sort((a, b) => {
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return a.groupCount - b.groupCount;
  });
  if (targetGroups) {
    const index = pool.findIndex(entry => entry.groupCount === targetGroups);
    if (index > 0) {
      const [targetEntry] = pool.splice(index, 1);
      pool.unshift(targetEntry);
    }
  }
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

function createLadderStat(name) {
  return {
    name,
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    status: 'Attente',
  };
}

function getCurrentLadderRotation(schedule = state.schedule) {
  if (!schedule || schedule.format !== 'ladder') return null;
  return schedule.rotations[state.liveRotationIndex] || schedule.rotations[0] || null;
}

function buildLadderStatusMap(schedule = state.schedule, rotation = getCurrentLadderRotation(schedule), roleAssignments) {
  const map = new Map();
  const names = schedule?.ladder?.names || [];
  names.forEach(name => {
    if (isEntityInactive(getEntityStatusByName(name))) {
      map.set(name, 'Indisponible');
    }
  });
  if (!rotation) return map;
  rotation.matches.forEach(match => {
    const participants = resolveMatchParticipants(match, schedule);
    [participants.home, participants.away].forEach(name => {
      if (name && !map.has(name)) map.set(name, 'Joue');
    });
  });
  const roleTeams = collectRoleTeams(roleAssignments);
  roleTeams.arbitre.forEach(name => {
    if (!map.has(name)) map.set(name, 'Arbitre');
  });
  filterRestTeams(rotation.byes || [], roleAssignments).forEach(name => {
    if (!map.has(name)) map.set(name, 'Repos');
  });
  return map;
}

function computeLadderStandings(schedule = state.schedule) {
  if (!schedule || schedule.format !== 'ladder' || !schedule.ladder) return [];
  hydrateLadderMatches(schedule);
  const names = schedule.ladder.names || [];
  const statsMap = new Map(names.map(name => [name, createLadderStat(name)]));
  schedule.rotations.forEach(rotation => {
    rotation.matches.forEach(match => {
      const participants = resolveMatchParticipants(match, schedule);
      if (isMatchNeutralized(participants)) return;
      const record = state.scores?.[match.id];
      if (!record || !Number.isFinite(record.home) || !Number.isFinite(record.away)) return;
      const home = statsMap.get(participants.home);
      const away = statsMap.get(participants.away);
      if (!home || !away) return;
      home.played += 1;
      away.played += 1;
      home.pointsFor += record.home;
      home.pointsAgainst += record.away;
      away.pointsFor += record.away;
      away.pointsAgainst += record.home;
      if (record.home > record.away) {
        home.wins += 1;
        away.losses += 1;
        home.points += 3;
      } else if (record.away > record.home) {
        away.wins += 1;
        home.losses += 1;
        away.points += 3;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });
  });
  const rotation = getCurrentLadderRotation(schedule);
  const roleAssignments = computeRoleAssignments(rotation);
  const statusMap = buildLadderStatusMap(schedule, rotation, roleAssignments);
  const order = ensureLadderOrder(schedule.ladder, names.length);
  return order.map(index => {
    const name = names[index];
    const row = statsMap.get(name) || createLadderStat(name);
    return {
      ...row,
      goalDiff: row.pointsFor - row.pointsAgainst,
      status: statusMap.get(name) || 'Attente',
    };
  });
}

function computeLadderMovementFeed(schedule = state.schedule, rotation = getCurrentLadderRotation(schedule), roleAssignments) {
  if (!schedule || schedule.format !== 'ladder' || !rotation) return [];
  const feed = [];
  const rotationIndex = Math.max(
    0,
    schedule.rotations.findIndex(entry => entry === rotation || entry.number === rotation.number)
  );
  const roundState = computeLadderFieldRoundState(rotation, schedule);
  roundState.boundarySwaps.forEach(swap => {
    if (!swap?.swapped) return;
    feed.push({ type: 'up', label: `${swap.movingUpName} monte du Terrain ${swap.lowerField} vers le Terrain ${swap.upperField}` });
    feed.push({ type: 'down', label: `${swap.movingDownName} descend du Terrain ${swap.upperField} vers le Terrain ${swap.lowerField}` });
  });
  roundState.courts.forEach(court => {
    if (court.status === 'draw') {
      feed.push({ type: 'steady', label: `${court.topName} et ${court.bottomName} restent sur Terrain ${court.field}` });
    } else if (court.status === 'neutralized') {
      feed.push({ type: 'unavailable', label: `Terrain ${court.field} neutralisé` });
    }
  });
  rotation.matches.forEach(match => {
    const arbiter = roleAssignments?.get(match.id)?.arbitre;
    if (!arbiter) return;
    feed.push({ type: 'arbiter', label: `${arbiter} arbitre sur Terrain ${match.field}` });
    const nextRotation = schedule.rotations[rotationIndex + 1];
    const nextRef = nextRotation?.fieldReferees?.[String(match.field)] || nextRotation?.fieldReferees?.[match.field];
    if (nextRef) {
      feed.push({ type: 'play', label: `${arbiter} jouera sur Terrain ${match.field} à la rotation suivante` });
      feed.push({ type: 'arbiter', label: `${nextRef} arbitrera ensuite sur Terrain ${match.field}` });
    }
  });
  const bench = computeLadderBenchData(schedule, rotation, roleAssignments);
  bench.nextEntrants.forEach(name => {
    feed.push({ type: 'play', label: `${name} entre dans la rotation suivante` });
  });
  bench.waiting.forEach(name => {
    feed.push({ type: 'rest', label: `${name} reste en attente` });
  });
  bench.unavailable.forEach(name => {
    feed.push({ type: 'unavailable', label: `${name} est neutralisé` });
  });
  return feed;
}

function computeLadderBenchData(schedule = state.schedule, rotation = getCurrentLadderRotation(schedule), roleAssignments) {
  if (!schedule || schedule.format !== 'ladder') {
    return { waiting: [], nextEntrants: [], unavailable: [] };
  }
  const waiting = rotation ? filterRestTeams(rotation.byes || [], roleAssignments) : [];
  const unavailable = (schedule.ladder?.names || []).filter(name => isEntityInactive(getEntityStatusByName(name)));
  const currentPlaying = new Set(
    rotation
      ? rotation.matches.flatMap(match => {
          const participants = resolveMatchParticipants(match, schedule);
          return [participants.home, participants.away];
        })
      : []
  );
  const nextRotation = schedule.rotations[state.liveRotationIndex + 1];
  const nextEntrants = nextRotation
    ? Array.from(
        new Set(
          nextRotation.matches.flatMap(match => {
            const participants = resolveMatchParticipants(match, schedule);
            return [participants.home, participants.away];
          })
        )
      ).filter(name => !currentPlaying.has(name))
    : [];
  return { waiting, nextEntrants, unavailable };
}

function buildLadderCurrentRotationSummary(schedule = state.schedule) {
  if (!schedule || !isLadderLiveMode(schedule) || !schedule.rotations?.length) return null;
  const rotation = getCurrentLadderRotation(schedule);
  if (!rotation) return null;
  const total = getLadderRotationTotal(schedule);
  const activeFields = rotation.matches.length;
  const completed = rotation.matches.reduce((count, match) => {
    const participants = resolveMatchParticipants(match, schedule);
    const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
    return count + (isMatchCompleteById(matchId) ? 1 : 0);
  }, 0);
  const validated = rotation.matches.reduce((count, match) => {
    const participants = resolveMatchParticipants(match, schedule);
    const matchId = match.id || buildMatchKey(rotation.number, participants.home, participants.away);
    return count + (isMatchValidated(matchId) ? 1 : 0);
  }, 0);
  const refereeCourts = rotation.matches.filter(match => getLadderCourtProfile(Number(match.field)) === 'arbiter').length;
  const freeCourts = Math.max(0, activeFields - refereeCourts);
  const remaining = Math.max(0, activeFields - completed);
  const stateKey = validated === activeFields && activeFields > 0 ? 'ready' : completed > 0 ? 'active' : 'pending';
  const stateLabelMap = {
    pending: 'En cours',
    active: 'En cours',
    ready: 'Prête à clôturer',
  };
  return {
    rotation,
    total,
    sessionMode: schedule.meta?.sessionMode || 'open',
    playerCount: schedule.ladder?.names?.length || schedule.meta?.teamCount || 0,
    activeFields,
    configuredCourts: schedule.ladder?.configuredCourts || schedule.meta?.fieldCount || activeFields,
    maxCourts: schedule.ladder?.maxCourts || activeFields,
    courtMode: schedule.ladder?.courtMode || 'optimized',
    completed,
    remaining,
    validated,
    refereeCourts,
    freeCourts,
    stateKey,
    stateLabel: isLadderSessionEnded(schedule) ? 'Séance terminée' : stateLabelMap[stateKey] || 'En cours',
    timer: state.options.timer ? formatSeconds(timerState.remainingSeconds || timerState.baseSeconds) : null,
  };
}

function buildLadderResultsFocusCard() {
  const summary = buildLadderCurrentRotationSummary(state.schedule);
  if (!summary) return '';
  return `
    <article class="ladder-focus-card ladder-focus-card-results">
      <div class="ladder-focus-copy">
        <p class="eyebrow">Rotation en cours</p>
      <h3>${formatLadderRotationLabel(summary.rotation, state.schedule)}</h3>
      <div class="ladder-focus-stats">
        <span class="ladder-summary-pill">${summary.activeFields} terrains utilisés</span>
        <span class="ladder-summary-pill">${summary.playerCount} joueurs</span>
        <span class="ladder-summary-pill">max possible : ${summary.maxCourts} terrains</span>
        <span class="ladder-summary-pill">${summary.completed} matchs saisis / ${summary.activeFields}</span>
        <span class="ladder-summary-pill">${summary.refereeCourts} terrains arbitrés</span>
        <span class="ladder-summary-pill">${summary.freeCourts} terrains sans arbitre</span>
      </div>
      </div>
      <div class="ladder-focus-actions">
        <span class="state-pill ${summary.stateKey === 'ready' ? 'live' : 'next'}">${summary.stateLabel}</span>
        <button type="button" class="btn primary xl" data-open-current-rotation>Ouvrir la rotation en cours</button>
        <button type="button" class="btn secondary" data-open-current-ranking>Voir le classement</button>
      </div>
    </article>
  `;
}

function renderLadderCurrentRotationCard() {
  if (!elements.liveCurrentRotationCard) return;
  if (!isLadderLiveMode(state.schedule)) {
    elements.liveCurrentRotationCard.classList.add('hidden');
    elements.liveCurrentRotationCard.innerHTML = '';
    if (elements.liveCurrentRotationBtn) {
      elements.liveCurrentRotationBtn.classList.add('hidden');
    }
    return;
  }
  const summary = buildLadderCurrentRotationSummary(state.schedule);
  if (!summary) {
    elements.liveCurrentRotationCard.classList.add('hidden');
    elements.liveCurrentRotationCard.innerHTML = '';
    if (elements.liveCurrentRotationBtn) {
      elements.liveCurrentRotationBtn.classList.add('hidden');
    }
    return;
  }
  const closeDisabled = summary.stateKey !== 'ready' || isLadderSessionEnded(state.schedule) ? 'disabled' : '';
  const closeLabel =
    !isLadderOpenSession(state.schedule) && summary.total && summary.rotation.number >= summary.total
      ? 'Terminer le tournoi'
      : 'Rotation suivante';
  const timerLine = summary.timer ? `<span class="ladder-summary-pill">Temps restant ${summary.timer}</span>` : '';
  elements.liveCurrentRotationCard.innerHTML = `
      <div class="ladder-focus-copy">
      <p class="eyebrow">Rotation en cours</p>
      <h3>${formatLadderRotationLabel(summary.rotation, state.schedule)}</h3>
      <p class="ladder-focus-lead">Accès direct à la rotation active pour renseigner les terrains sans chercher.</p>
      <div class="ladder-focus-stats">
        <span class="ladder-summary-pill">${summary.activeFields} terrains utilisés</span>
        <span class="ladder-summary-pill">${summary.playerCount} joueurs</span>
        <span class="ladder-summary-pill">max possible : ${summary.maxCourts} terrains</span>
        <span class="ladder-summary-pill">${summary.completed} matchs saisis / ${summary.activeFields}</span>
        <span class="ladder-summary-pill">${summary.refereeCourts} terrains arbitrés</span>
        <span class="ladder-summary-pill">${summary.freeCourts} terrains sans arbitre</span>
        ${timerLine}
      </div>
    </div>
    <div class="ladder-focus-actions">
      <span class="state-pill ${summary.stateKey === 'ready' ? 'live' : 'next'}">${summary.stateLabel}</span>
      <button type="button" class="btn primary xl" data-open-current-rotation>Ouvrir la rotation en cours</button>
      <button type="button" class="btn secondary" data-close-current-rotation ${closeDisabled}>${closeLabel}</button>
      <button type="button" class="btn ghost" data-open-current-ranking>Voir le classement</button>
    </div>
  `;
  elements.liveCurrentRotationCard.classList.remove('hidden');
  if (elements.liveCurrentRotationBtn) {
    elements.liveCurrentRotationBtn.classList.remove('hidden');
  }
}

function focusCurrentLadderRotation(options = {}) {
  const behavior = options.behavior || 'smooth';
  const ensureLive = Boolean(options.ensureLive);
  if (ensureLive && state.schedule) {
    goTo('live');
    renderLiveRotation();
  }
  const scrollToMatches = () => {
    const target =
      elements.liveFieldBoard?.querySelector('.ladder-pilot-card') ||
      elements.currentRotationMatchesAnchor ||
      elements.liveFieldBoard ||
      elements.liveRotationContent;
    if (!target) return;
    target.scrollIntoView({ behavior, block: 'start' });
    window.setTimeout(() => {
      target.scrollIntoView({ behavior, block: 'start' });
      const firstAction =
        target.querySelector('[data-ladder-quick]') ||
        target.querySelector('[data-ladder-score-toggle]') ||
        target.querySelector('[data-status-player]');
      if (firstAction && typeof firstAction.focus === 'function') {
        firstAction.focus({ preventScroll: true });
      }
    }, ensureLive ? 120 : 40);
  };
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(scrollToMatches);
  });
}

function handleRotationViewClick(event) {
  const swissWinnerButton = event.target.closest('[data-swiss-winner]');
  if (swissWinnerButton) {
    const matchId = swissWinnerButton.dataset.swissMatchId;
    const winnerId = Number(swissWinnerButton.dataset.swissWinner);
    if (matchId && Number.isInteger(winnerId)) {
      setSwissWinner(matchId, winnerId);
    }
    return;
  }
  const swissValidateButton = event.target.closest('[data-swiss-validate-round]');
  if (swissValidateButton) {
    validateSwissRound();
    return;
  }
  const openCurrentButton = event.target.closest('[data-open-current-rotation]');
  if (openCurrentButton) {
    if (isLadderLiveMode(state.schedule)) {
      openLadderPilotModal();
    } else {
      focusCurrentLadderRotation({ ensureLive: true });
    }
    return;
  }
  const rankingButton = event.target.closest('[data-open-current-ranking]');
  if (rankingButton) {
    setActiveView('rankings');
  }
}

function setEntityStatusByName(name, statusKey) {
  const index = state.teamNames.findIndex(entry => entry === name);
  if (index === -1) return;
  setEntityStatus(index, statusKey);
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

function buildFieldToken(value) {
  return removeDiacritics(String(value ?? ''))
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
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

function normalizeStatusKey(value) {
  if (value === STATUS_TYPES.unavailable.key) return STATUS_TYPES.unavailable.key;
  if (value === 'injured' || value === 'neutralized') return STATUS_TYPES.unavailable.key;
  return STATUS_TYPES[value] ? value : STATUS_TYPES.active.key;
}

function ensureEntityStatusLength(list, length) {
  const initial = Array.isArray(list) ? [...list] : [];
  while (initial.length < length) {
    initial.push(STATUS_TYPES.active.key);
  }
  return initial.slice(0, length).map(normalizeStatusKey);
}

function getEntityStatus(index) {
  state.entityStatuses = ensureEntityStatusLength(state.entityStatuses, state.participants);
  return state.entityStatuses[index] || STATUS_TYPES.active.key;
}

function getEntityStatusByName(name) {
  if (!name) return STATUS_TYPES.active.key;
  const index = state.teamNames.findIndex(entry => entry === name);
  if (index === -1) return STATUS_TYPES.active.key;
  return getEntityStatus(index);
}

function isEntityInactive(statusKey) {
  return statusKey === STATUS_TYPES.unavailable.key;
}

function formatStatusLabel(statusKey) {
  const type = STATUS_TYPES[statusKey];
  return type ? type.label : STATUS_TYPES.active.label;
}

function decorateNameWithStatus(name) {
  if (!name) return '';
  const status = getEntityStatusByName(name);
  if (!isEntityInactive(status)) return name;
  return `${name} <span class="status-pill ${status}">${formatStatusLabel(status)}</span>`;
}

function isMatchNeutralized(participants) {
  if (!participants) return false;
  return isEntityInactive(getEntityStatusByName(participants.home)) || isEntityInactive(getEntityStatusByName(participants.away));
}

function isChallengeModeActive() {
  return Boolean(state.schedule && state.schedule.format === 'challenge');
}

function setEntityStatus(index, statusKey) {
  const normalized = STATUS_TYPES[statusKey] ? statusKey : STATUS_TYPES.active.key;
  state.entityStatuses = ensureEntityStatusLength(state.entityStatuses, state.participants);
  if (state.entityStatuses[index] === normalized) return;
  state.entityStatuses[index] = normalized;
  state.statusLog.push({ index, status: normalized, at: new Date().toISOString() });
  state.statusLog = state.statusLog.slice(-100);
  persistState();
  renderStatusList();
  if (state.schedule) {
    renderResults(state.schedule, { preserveTimestamp: true });
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function updateResumeButton() {
  const stored = loadState();
  elements.resumeFlow.disabled = !stored;
}

function createDefaultState() {
  const defaultMode = MODE_DEFINITIONS['sportco-championnat'];
  const defaultPractice = defaultMode.practiceType;
  return {
    currentScreen: 'landing',
    lastScreen: 'landing',
    universeId: defaultMode.universe,
    activeModeId: defaultMode.id,
    tournamentType: defaultMode.tournamentType,
    practiceType: defaultPractice,
    sessionId: null,
    sessionCreatedAt: null,
    participants: 8,
    teamNames: ensureTeamListLength([], 8, defaultPractice),
    entityStatuses: [],
    options: {
      fields: 2,
      duration: 12,
      sessionName: '',
      challengeClassName: '',
      challengeRange: 5,
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
      worldCupGroupCount: 2,
      roleSettings: { ...DEFAULT_ROLE_SETTINGS },
      ladder: {
        mode: 'free',
        sessionMode: 'open',
        rotationLimit: null,
        courtMode: 'optimized',
        refereePlacement: 'top',
        manualRefereeFields: [],
        refereeCourts: 0,
        freeCourts: 0,
      },
    },
    schedule: null,
    ladderState: null,
    challengeState: null,
    generatedAt: null,
    scores: {},
    liveRotationIndex: 0,
    validatedMatches: {},
    statusLog: [],
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
  const fallbackMode = MODE_DEFINITIONS['sportco-championnat'];
  const incomingMode = MODE_DEFINITIONS[source.activeModeId];
  merged.activeModeId = incomingMode ? incomingMode.id : fallbackMode.id;
  const inferredUniverse = incomingMode ? incomingMode.universe : fallbackMode.universe;
  merged.universeId = Object.prototype.hasOwnProperty.call(UNIVERSES, source.universeId) ? source.universeId : inferredUniverse;
  const allowedModes = Object.keys(TOURNAMENT_MODES);
  const targetTournament =
    MODE_DEFINITIONS[merged.activeModeId]?.tournamentType && allowedModes.includes(MODE_DEFINITIONS[merged.activeModeId].tournamentType)
      ? MODE_DEFINITIONS[merged.activeModeId].tournamentType
      : source.tournamentType;
  merged.tournamentType = allowedModes.includes(targetTournament) ? targetTournament : base.tournamentType;
  const allowedPractices = ['sport-co', 'raquette'];
  merged.practiceType = MODE_DEFINITIONS[merged.activeModeId]?.practiceType || (allowedPractices.includes(source.practiceType) ? source.practiceType : base.practiceType);
  merged.participants = clampNumber(Number(merged.participants), 2, 32, base.participants);
  const optionSource = { ...base.options, ...(source.options || {}) };
  optionSource.fields = clampNumber(Number(optionSource.fields), 1, 16, base.options.fields);
  optionSource.duration = clampNumber(Number(optionSource.duration), 1, 180, base.options.duration);
  optionSource.sessionName = String(optionSource.sessionName || optionSource.challengeClassName || '').trim();
  optionSource.challengeClassName = optionSource.sessionName;
  optionSource.challengeRange = clampNumber(
    Number.isFinite(Number(optionSource.challengeRange)) ? Number(optionSource.challengeRange) : 5,
    1,
    10,
    5
  );
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
  optionSource.worldCupGroupCount = clampNumber(
    Number.isFinite(Number(optionSource.worldCupGroupCount)) ? Number(optionSource.worldCupGroupCount) : 2,
    2,
    4,
    2
  );
  const allowedSchedulingModes = ['pedagogique', 'optimise_terrains'];
  optionSource.schedulingMode = allowedSchedulingModes.includes(optionSource.schedulingMode)
    ? optionSource.schedulingMode
    : 'pedagogique';
  optionSource.ladder = {
    mode: ['free', 'arbiter', 'mixed'].includes(optionSource?.ladder?.mode) ? optionSource.ladder.mode : 'free',
    sessionMode: optionSource?.ladder?.sessionMode === 'limited' ? 'limited' : 'open',
    rotationLimit:
      Number.isFinite(Number(optionSource?.ladder?.rotationLimit)) && Number(optionSource.ladder.rotationLimit) > 0
        ? clampNumber(Number(optionSource.ladder.rotationLimit), 1, 999, 6)
        : null,
    courtMode: optionSource?.ladder?.courtMode === 'max' ? 'max' : 'optimized',
    refereePlacement: normalizeLadderRefereePlacement(optionSource?.ladder?.refereePlacement),
    manualRefereeFields: normalizeManualRefereeFields(optionSource?.ladder?.manualRefereeFields, optionSource.fields),
    refereeCourts: clampNumber(Number(optionSource?.ladder?.refereeCourts), 0, 16, 0),
    freeCourts: clampNumber(Number(optionSource?.ladder?.freeCourts), 0, 16, 0),
  };
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
  {
    const fields = optionSource.fields;
    let mode = optionSource.ladder.mode;
    let refereeCourts = clampNumber(Number(optionSource.ladder.refereeCourts), 0, fields, 0);
    let freeCourts = clampNumber(Number(optionSource.ladder.freeCourts), 0, fields, 0);
    if (mode === 'free') {
      refereeCourts = 0;
      freeCourts = fields;
    } else if (mode === 'arbiter') {
      refereeCourts = Math.max(refereeCourts || fields, 1);
      refereeCourts = clampNumber(refereeCourts, 1, fields, fields);
      freeCourts = Math.max(fields - refereeCourts, 0);
      if (freeCourts > 0) mode = 'mixed';
    } else {
      if (fields <= 1) {
        mode = 'arbiter';
        refereeCourts = 1;
        freeCourts = 0;
      } else {
        if (refereeCourts <= 0 || refereeCourts >= fields) {
          refereeCourts = Math.max(1, Math.floor(fields / 2));
        }
        freeCourts = fields - refereeCourts;
      }
    }
    optionSource.ladder = {
      mode,
      sessionMode: optionSource.ladder.sessionMode,
      rotationLimit: optionSource.ladder.sessionMode === 'limited' ? optionSource.ladder.rotationLimit : null,
      courtMode: optionSource.ladder.courtMode,
      refereePlacement: optionSource.ladder.refereePlacement,
      manualRefereeFields: normalizeManualRefereeFields(optionSource.ladder.manualRefereeFields, fields),
      refereeCourts,
      freeCourts,
    };
  }
  merged.options = optionSource;
  merged.sessionId = source.sessionId || null;
  merged.sessionCreatedAt = source.sessionCreatedAt || null;
  const incomingNames = Array.isArray(source.teamNames) ? source.teamNames : base.teamNames;
  merged.teamNames = ensureTeamListLength(incomingNames, merged.participants, merged.practiceType);
  merged.entityStatuses = ensureEntityStatusLength(source.entityStatuses, merged.participants);
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
  merged.ladderState = source.ladderState || null;
  merged.challengeState = source.challengeState || null;
  merged.statusLog = Array.isArray(source.statusLog) ? source.statusLog.slice(-50) : [];
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
    const canSnapshotCurrentSession = Boolean(state.schedule && doesActiveModeMatchSchedule());
    if (canSnapshotCurrentSession) {
      ensureCurrentSessionMetadata();
      syncSessionNameOnState(state, getSessionName());
    }
    const snapshot = { ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    if (canSnapshotCurrentSession) {
      upsertStoredSessionSnapshot(buildAppSaveSnapshot());
    }
    updateResumeButton();
    renderLandingSessions();
  } catch (error) {
    console.warn('Sauvegarde impossible', error);
  }
}

function resetApplication() {
  const confirmed = window.confirm('Réinitialiser complètement la configuration et effacer les scores ?');
  if (!confirmed) return;
  challengeIdSeed = 0;
  localStorage.removeItem(STORAGE_KEY);
  state = sanitizeState(createDefaultState());
  persistState();
  renderParticipants();
  buildTeamFields(state.participants);
  syncOptionInputs();
  renderChallengeClassManager();
  updateSaveActionsState();
  updateTheme(state.universeId);
  renderModeCards();
  updateModeScreenCopy();
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
  const hasRotations = Boolean(state.schedule && state.schedule.rotations && state.schedule.rotations.length);
  const ladderMode = isLadderLiveMode(state.schedule);
  const swissMode = state.schedule?.format === 'swiss';
  elements.startLiveBtn.disabled = !enabled || !hasRotations;
  const rotationNumber =
    state.schedule && state.schedule.rotations[state.liveRotationIndex]
      ? state.schedule.rotations[state.liveRotationIndex].number
      : 1;
  if (enabled) {
    if (swissMode) {
      elements.startLiveBtn.textContent =
        state.schedule?.swiss?.round > 1 ? `Ouvrir le pilotage (Ronde ${rotationNumber})` : 'Ouvrir le pilotage';
    } else if (ladderMode) {
      elements.startLiveBtn.textContent =
        state.liveRotationIndex > 0 ? `Ouvrir le pilotage (Rotation ${rotationNumber})` : 'Ouvrir le pilotage';
    } else {
      elements.startLiveBtn.textContent =
        state.liveRotationIndex > 0 ? `Reprendre le live (Rotation ${rotationNumber})` : 'Démarrer le live';
    }
  } else {
    elements.startLiveBtn.textContent = ladderMode ? 'Ouvrir le pilotage' : 'Démarrer le live';
  }
  if (elements.resultsPrimaryHint) {
    if (!enabled) {
      elements.resultsPrimaryHint.textContent = ladderMode
        ? 'Générez un planning pour ouvrir le pilotage.'
        : 'Générez un planning pour activer le mode live.';
    } else if (swissMode) {
      elements.resultsPrimaryHint.textContent = 'La Ronde Suisse se pilote directement dans la liste des matchs de la ronde.';
    } else if (!hasRotations) {
      elements.resultsPrimaryHint.textContent = 'Le mode live est désactivé pour le mode Défi. Utilisez la colonne classement pour gérer vos défis.';
    } else if (ladderMode) {
      elements.resultsPrimaryHint.textContent = 'La saisie des scores se fait directement dans la page de pilotage dédiée.';
    } else if (state.liveRotationIndex > 0) {
      elements.resultsPrimaryHint.textContent = `Reprenez directement à la rotation ${rotationNumber} ou ajustez les scores.`;
    } else {
      elements.resultsPrimaryHint.textContent = 'Passez en mode live pour piloter les rotations et les scores.';
    }
  }
  if (elements.returnLiveBtn) {
    elements.returnLiveBtn.disabled = !enabled || swissMode;
  }
  if (elements.liveChronoBtn) {
    elements.liveChronoBtn.disabled = !enabled || swissMode;
  }
  if (elements.resultsProjectionBtn) {
    elements.resultsProjectionBtn.disabled = swissMode;
  }
  if (elements.resultsChronoBtn) {
    elements.resultsChronoBtn.disabled = swissMode;
  }
  if (elements.rankingButtons && elements.rankingButtons.length) {
    elements.rankingButtons.forEach(btn => {
      btn.disabled = !enabled;
    });
  }
}
