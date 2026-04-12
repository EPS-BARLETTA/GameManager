const STORAGE_KEY = 'poule-suite-state-v1';
const STEP_ORDER = ['type', 'count', 'teams', 'options', 'results'];
const SCREEN_TO_STEP = {
  type: 'type',
  count: 'count',
  teams: 'teams',
  options: 'options',
  results: 'results',
};

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
    modeIds: ['raquettes-poule', 'raquettes-montee-descente', 'raquettes-defi'],
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
    description: 'Classement vivant avec défis dans une fenêtre ±5 places.',
    tournamentType: 'challenge',
    practiceType: 'raquette',
    badge: 'Mode Défi',
  },
};

const STATUS_TYPES = {
  active: { key: 'active', label: 'Actif' },
  unavailable: { key: 'unavailable', label: 'Indisponible' },
};

const state = {
  currentScreen: 'landing',
  currentUniverse: null,
  currentModeId: null,
  practiceType: 'sport-co',
  teamCount: 8,
  teams: [],
  fields: 2,
  matchDuration: 12,
  availableDuration: '',
  startTime: '09:00',
  endTime: '',
  worldCupGroupCount: 2,
  schedulingMode: 'pedagogique',
  ladderRefereeCourts: 0,
  ladderFreeCourts: 0,
  matchMode: 'time',
  scoreTarget: 11,
  rotationBuffer: 2,
  breakDuration: 0,
  timerEnabled: false,
  soundEnabled: true,
  vibrationEnabled: true,
  generated: false,
  ranking: [],
  challengeHighlightTimeout: null,
  currentChallengePlayerId: null,
};

const screens = {};
document.querySelectorAll('[data-screen]').forEach(section => {
  screens[section.dataset.screen] = section;
});

const stepper = document.getElementById('stepper');
const universeBadge = document.getElementById('universeBadge');
const modeBadge = document.getElementById('modeBadge');

const landingSportcoBtn = document.getElementById('landingSportcoBtn');
const landingRaquettesBtn = document.getElementById('landingRaquettesBtn');

const modeCardsGrid = document.getElementById('modeCardsGrid');
const modeNextBtn = document.getElementById('modeNextBtn');
const modeFootnote = document.getElementById('modeFootnote');
const modeScreenTitle = document.getElementById('modeScreenTitle');
const modeScreenSubtitle = document.getElementById('modeScreenSubtitle');

const teamCountDisplay = document.getElementById('teamCountDisplay');
const teamCountSlider = document.getElementById('teamCountSlider');
const countMinus = document.getElementById('countMinus');
const countPlus = document.getElementById('countPlus');
const teamFields = document.getElementById('teamFields');

const modeOptionsEyebrow = document.getElementById('modeOptionsEyebrow');
const modeOptionsTitle = document.getElementById('modeOptionsTitle');
const modeOptionsDescription = document.getElementById('modeOptionsDescription');
const modePracticeChip = document.getElementById('modePracticeChip');
const modeParticipantsLabel = document.getElementById('modeParticipantsLabel');
const modeParticipantsInput = document.getElementById('modeParticipantsInput');
const fieldCount = document.getElementById('fieldCount');
const matchDuration = document.getElementById('matchDuration');
const availableDuration = document.getElementById('availableDuration');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const worldCupGroupCount = document.getElementById('worldCupGroupCount');
const ladderRefereeCourts = document.getElementById('ladderRefereeCourts');
const ladderFreeCourts = document.getElementById('ladderFreeCourts');
const matchMode = document.getElementById('matchMode');
const scoreTarget = document.getElementById('scoreTarget');
const scoreTargetField = document.getElementById('scoreTargetField');
const rotationBuffer = document.getElementById('rotationBuffer');
const breakDuration = document.getElementById('breakDuration');
const timerToggle = document.getElementById('timerToggle');
const soundToggle = document.getElementById('soundToggle');
const vibrationToggle = document.getElementById('vibrationToggle');
const generateBtn = document.getElementById('generateBtn');

const resultSubtitle = document.getElementById('resultSubtitle');
const summaryGrid = document.getElementById('summaryGrid');
const rotationView = document.getElementById('rotationView');
const teamView = document.getElementById('teamView');
const rankingView = document.getElementById('rankingView');

const toolsToggle = document.getElementById('toolsToggle');
const toolsMenu = document.getElementById('toolsMenu');
const statusBtn = document.getElementById('statusBtn');

const rankingModal = document.getElementById('rankingModal');
const rankingModalBody = document.getElementById('rankingModalBody');
const rankingModalClose = document.getElementById('rankingModalClose');
const rankingButtons = Array.from(document.querySelectorAll('[data-open-ranking]'));

const statusModal = document.getElementById('statusModal');
const statusModalClose = document.getElementById('statusModalClose');
const statusList = document.getElementById('statusList');

const challengeModal = document.getElementById('challengeModal');
const challengeModalClose = document.getElementById('challengeModalClose');
const challengeCancelBtn = document.getElementById('challengeCancelBtn');
const challengeValidateBtn = document.getElementById('challengeValidateBtn');
const challengeOpponentSelect = document.getElementById('challengeOpponentSelect');
const challengePlayerScoreInput = document.getElementById('challengePlayerScoreInput');
const challengeOpponentScoreInput = document.getElementById('challengeOpponentScoreInput');
const challengeModalRange = document.getElementById('challengeModalRange');

const tabs = Array.from(document.querySelectorAll('.tab'));
const contextTabs = Array.from(document.querySelectorAll('#contextTabs .view-hub-card'));

function getModeDefinition(modeId) {
  return MODE_DEFINITIONS[modeId] || null;
}

function getUniverseDefinition(universeId) {
  return UNIVERSES[universeId] || null;
}

function formatParticipantLabel({ plural = false, capitalized = false } = {}) {
  const map = state.practiceType === 'raquette'
    ? { singular: 'participant', plural: 'participants' }
    : { singular: 'équipe', plural: 'équipes' };

  const value = plural ? map.plural : map.singular;
  return capitalized ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed || {});
  } catch (error) {
    console.warn('Impossible de charger l’état sauvegardé.', error);
  }
}

function setTheme(universeId) {
  document.body.classList.remove('theme-sportco', 'theme-raquettes');
  const universe = getUniverseDefinition(universeId);
  if (!universe) {
    universeBadge.textContent = 'Univers à choisir';
    modeBadge.textContent = 'Mode non sélectionné';
    return;
  }
  document.body.classList.add(universe.themeClass);
  universeBadge.textContent = universe.badge;
  const mode = getModeDefinition(state.currentModeId);
  modeBadge.textContent = mode ? mode.badge : 'Mode non sélectionné';
}

function showScreen(screenId) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle('active', key === screenId);
  });
  state.currentScreen = screenId;
  if (screenId === 'landing') {
    stepper.classList.add('hidden');
  } else if (SCREEN_TO_STEP[screenId]) {
    stepper.classList.remove('hidden');
    updateStepper(SCREEN_TO_STEP[screenId]);
  }
  saveState();
}

function updateStepper(currentStep) {
  const steps = Array.from(document.querySelectorAll('.step'));
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  steps.forEach(step => {
    const stepIndex = STEP_ORDER.indexOf(step.dataset.step);
    step.classList.toggle('current', step.dataset.step === currentStep);
    step.classList.toggle('done', stepIndex < currentIndex);
  });
}

function closeToolsMenu() {
  toolsMenu.classList.add('hidden');
  toolsToggle.setAttribute('aria-expanded', 'false');
}

function toggleToolsMenu() {
  const isHidden = toolsMenu.classList.contains('hidden');
  toolsMenu.classList.toggle('hidden', !isHidden);
  toolsToggle.setAttribute('aria-expanded', String(isHidden));
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  if (document.querySelectorAll('.modal-overlay:not(.hidden)').length === 0) {
    document.body.classList.remove('modal-open');
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.add('hidden'));
  document.body.classList.remove('modal-open');
}

function renderModeCards() {
  const universe = getUniverseDefinition(state.currentUniverse);
  if (!universe) return;

  modeScreenTitle.textContent = universe.label;
  modeScreenSubtitle.textContent = universe.baseline;
  modeCardsGrid.innerHTML = '';

  universe.modeIds.forEach(modeId => {
    const mode = getModeDefinition(modeId);
    if (!mode) return;

    const button = document.createElement('button');
    button.className = 'mode-card';
    if (state.currentModeId === mode.id) button.classList.add('active');

    button.innerHTML = `
      <div>
        <strong>${mode.label}</strong>
        <p>${mode.description}</p>
      </div>
      <span class="pill subtle">${mode.badge}</span>
    `;

    button.addEventListener('click', () => {
      state.currentModeId = mode.id;
      state.practiceType = mode.practiceType;
      renderModeCards();
      modeNextBtn.disabled = false;
      modeFootnote.textContent = `${mode.label} sélectionné. Vous pouvez passer au paramétrage.`;
      setTheme(state.currentUniverse);
      saveState();
    });

    modeCardsGrid.appendChild(button);
  });

  modeNextBtn.disabled = !state.currentModeId;
}

function renderTeamFields() {
  const targetCount = Number(state.teamCount) || 2;
  if (!Array.isArray(state.teams)) state.teams = [];

  while (state.teams.length < targetCount) {
    state.teams.push({
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${formatParticipantLabel({ capitalized: true })} ${state.teams.length + 1}`,
      status: 'active',
    });
  }

  if (state.teams.length > targetCount) {
    state.teams = state.teams.slice(0, targetCount);
  }

  teamFields.innerHTML = '';
  state.teams.forEach((team, index) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'field';

    const span = document.createElement('span');
    span.textContent = `${formatParticipantLabel({ capitalized: true })} ${index + 1}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = team.name || '';
    input.addEventListener('input', e => {
      team.name = e.target.value.trim() || `${formatParticipantLabel({ capitalized: true })} ${index + 1}`;
      saveState();
    });

    wrapper.appendChild(span);
    wrapper.appendChild(input);
    teamFields.appendChild(wrapper);
  });
}

function renderOptionsScreen() {
  const mode = getModeDefinition(state.currentModeId);
  const universe = getUniverseDefinition(state.currentUniverse);
  if (!mode || !universe) return;

  modeOptionsEyebrow.textContent = universe.label;
  modeOptionsTitle.textContent = mode.label;
  modeOptionsDescription.textContent = mode.description;
  modePracticeChip.textContent = universe.badge;
  modeParticipantsLabel.textContent =
    mode.practiceType === 'raquette' ? 'Nombre de participants' : 'Nombre d’équipes';

  modeParticipantsInput.value = state.teamCount;
  fieldCount.value = state.fields;
  matchDuration.value = state.matchDuration;
  availableDuration.value = state.availableDuration;
  startTime.value = state.startTime || '';
  endTime.value = state.endTime || '';
  worldCupGroupCount.value = String(state.worldCupGroupCount || 2);
  ladderRefereeCourts.value = state.ladderRefereeCourts || 0;
  ladderFreeCourts.value = state.ladderFreeCourts || 0;
  matchMode.value = state.matchMode || 'time';
  scoreTarget.value = state.scoreTarget || 11;
  rotationBuffer.value = state.rotationBuffer || 2;
  breakDuration.value = state.breakDuration || 0;
  timerToggle.checked = !!state.timerEnabled;
  soundToggle.checked = !!state.soundEnabled;
  vibrationToggle.checked = !!state.vibrationEnabled;

  document.querySelectorAll('[data-mode-field]').forEach(node => {
    const values = node.dataset.modeField;
    if (values === 'all') {
      node.classList.remove('hidden');
      return;
    }
    const allowed = values.split(',').map(value => value.trim());
    node.classList.toggle('hidden', !allowed.includes(mode.id));
  });

  scoreTargetField.classList.toggle('hidden', matchMode.value !== 'score');
}

function syncCountUI() {
  teamCountDisplay.textContent = String(state.teamCount);
  teamCountSlider.value = String(state.teamCount);
}

function openRankingModal() {
  renderRankingModal();
  openModal(rankingModal);
}

function renderRankingModal() {
  if (!state.ranking.length) {
    rankingModalBody.innerHTML = `<p class="muted-label">Aucun classement disponible pour le moment.</p>`;
    return;
  }

  rankingModalBody.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pos</th>
          <th>${state.practiceType === 'raquette' ? 'Participant' : 'Équipe'}</th>
          <th>Pts</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        ${state.ranking
          .map(
            row => `
              <tr>
                <td>${row.rank}</td>
                <td>${row.name}</td>
                <td>${row.points ?? 0}</td>
                <td>${row.status === 'unavailable' ? 'Indisponible' : 'Actif'}</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderStatusModal() {
  statusList.innerHTML = '';
  state.teams.forEach(team => {
    const row = document.createElement('div');
    row.className = 'status-row';
    if (team.status === 'unavailable') row.classList.add('disabled');

    row.innerHTML = `
      <div>
        <div class="status-name">${team.name}</div>
        <div class="status-pill ${team.status === 'unavailable' ? 'unavailable' : ''}">
          ${team.status === 'unavailable' ? 'Indisponible' : 'Actif'}
        </div>
      </div>
      <div class="status-actions">
        <button class="status-chip ${team.status === 'active' ? 'active' : ''}" data-status-team="${team.id}" data-status-value="active">Actif</button>
        <button class="status-chip ${team.status === 'unavailable' ? 'active' : ''}" data-status-team="${team.id}" data-status-value="unavailable">Indisponible</button>
      </div>
    `;

    statusList.appendChild(row);
  });

  statusList.querySelectorAll('[data-status-team]').forEach(button => {
    button.addEventListener('click', () => {
      const teamId = button.dataset.statusTeam;
      const value = button.dataset.statusValue;
      const team = state.teams.find(item => item.id === teamId);
      if (!team) return;
      team.status = value;
      recomputeRanking();
      renderStatusModal();
      renderResults();
      saveState();
    });
  });
}

function recomputeRanking() {
  state.ranking = state.teams.map((team, index) => ({
    id: team.id,
    name: team.name,
    points: typeof team.points === 'number' ? team.points : 0,
    status: team.status || 'active',
    rank: index + 1,
  }));

  state.ranking.sort((a, b) => {
    if ((a.status === 'unavailable') !== (b.status === 'unavailable')) {
      return a.status === 'unavailable' ? 1 : -1;
    }
    if ((b.points ?? 0) !== (a.points ?? 0)) {
      return (b.points ?? 0) - (a.points ?? 0);
    }
    return a.name.localeCompare(b.name, 'fr');
  });

  state.ranking.forEach((row, index) => {
    row.rank = index + 1;
  });
}

function renderRotationView() {
  if (!state.generated) {
    rotationView.innerHTML = '';
    return;
  }

  const mode = getModeDefinition(state.currentModeId);
  if (mode?.tournamentType === 'challenge') {
    renderChallengeBoard();
    return;
  }

  rotationView.innerHTML = `
    <article class="rotation-card">
      <div class="rotation-header">
        <div>
          <h3>Tournoi prêt</h3>
          <p class="rotation-meta">${mode ? mode.label : 'Mode'} · ${state.fields} terrain(s) · ${state.teamCount} ${formatParticipantLabel({ plural: true })}</p>
        </div>
      </div>
      <ul class="match-list">
        ${state.teams
          .map(
            team => `
              <li>
                <div class="match-label">
                  <strong>${team.name}</strong>
                  <span class="field-label">${team.status === 'unavailable' ? 'Indisponible' : 'Actif'}</span>
                </div>
              </li>
            `
          )
          .join('')}
      </ul>
    </article>
  `;
}

function renderTeamView() {
  if (!state.generated) {
    teamView.innerHTML = '';
    return;
  }

  teamView.innerHTML = `
    <article class="team-card">
      <h3>${formatParticipantLabel({ plural: true, capitalized: true })}</h3>
      <ul class="team-match-list">
        ${state.teams
          .map(
            team => `
              <li class="${team.status === 'unavailable' ? 'bye' : ''}">
                <strong>${team.name}</strong>
                <span>${team.status === 'unavailable' ? 'Indisponible' : 'Disponible'}</span>
              </li>
            `
          )
          .join('')}
      </ul>
    </article>
  `;
}

function renderRankingView() {
  if (!state.generated) {
    rankingView.innerHTML = '';
    return;
  }

  rankingView.innerHTML = `
    <article class="ranking-card">
      <header>
        <div>
          <p class="eyebrow">Classement</p>
          <h3>Positions actuelles</h3>
        </div>
      </header>
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>${state.practiceType === 'raquette' ? 'Participant' : 'Équipe'}</th>
            <th>Pts</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${state.ranking
            .map(
              row => `
                <tr>
                  <td>${row.rank}</td>
                  <td>${row.name}</td>
                  <td>${row.points ?? 0}</td>
                  <td>${row.status === 'unavailable' ? 'Indisponible' : 'Actif'}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </article>
  `;
}

function getChallengeWindow(playerId) {
  const rankingIndex = state.ranking.findIndex(player => player.id === playerId);
  if (rankingIndex === -1) return [];

  const min = Math.max(0, rankingIndex - 5);
  const max = Math.min(state.ranking.length - 1, rankingIndex + 5);

  return state.ranking.filter((player, index) => {
    if (player.id === playerId) return false;
    if (index < min || index > max) return false;
    return player.status !== 'unavailable';
  });
}

function highlightChallengeWindow(playerId) {
  const windowPlayers = getChallengeWindow(playerId).map(player => player.id);

  document.querySelectorAll('.challenge-row').forEach(row => {
    const rowId = row.dataset.playerId;
    row.classList.toggle('highlight', rowId === playerId || windowPlayers.includes(rowId));
  });

  if (state.challengeHighlightTimeout) {
    clearTimeout(state.challengeHighlightTimeout);
  }

  state.challengeHighlightTimeout = setTimeout(() => {
    document.querySelectorAll('.challenge-row').forEach(row => row.classList.remove('highlight'));
  }, 3000);
}

function openChallengeModal(playerId) {
  const player = state.ranking.find(row => row.id === playerId);
  if (!player || player.status === 'unavailable') return;

  const allowedOpponents = getChallengeWindow(playerId);
  if (!allowedOpponents.length) return;

  state.currentChallengePlayerId = playerId;
  challengeModalRange.textContent = `Défis autorisés pour ${player.name} : ${allowedOpponents.length} joueur(s) dans la fenêtre ±5.`;

  challengeOpponentSelect.innerHTML = allowedOpponents
    .map(
      opponent => `<option value="${opponent.id}">${opponent.rank}. ${opponent.name}</option>`
    )
    .join('');

  challengePlayerScoreInput.value = 0;
  challengeOpponentScoreInput.value = 0;

  openModal(challengeModal);
}

function closeChallengeModal() {
  state.currentChallengePlayerId = null;
  challengeOpponentSelect.innerHTML = '';
  challengePlayerScoreInput.value = 0;
  challengeOpponentScoreInput.value = 0;
  closeModal(challengeModal);
}

function applyChallengeResult() {
  if (!state.currentChallengePlayerId) return;

  const challengerId = state.currentChallengePlayerId;
  const opponentId = challengeOpponentSelect.value;
  const challengerScore = Number(challengePlayerScoreInput.value || 0);
  const opponentScore = Number(challengeOpponentScoreInput.value || 0);

  const challengerIndex = state.ranking.findIndex(player => player.id === challengerId);
  const opponentIndex = state.ranking.findIndex(player => player.id === opponentId);

  if (challengerIndex === -1 || opponentIndex === -1) return;

  if (challengerScore > opponentScore && opponentIndex < challengerIndex) {
    const challenger = state.ranking[challengerIndex];
    state.ranking.splice(challengerIndex, 1);
    state.ranking.splice(opponentIndex, 0, challenger);
    state.ranking.forEach((row, index) => {
      row.rank = index + 1;
    });
  }

  closeChallengeModal();
  renderResults();
  saveState();
}

function renderChallengeBoard() {
  rotationView.innerHTML = `
    <p class="challenge-instructions">
      Cliquez sur un nom pour voir les défis possibles pendant 3 secondes.
      Utilisez « Saisir un défi » pour entrer le score dans une fenêtre centrale.
    </p>
    <div class="challenge-board">
      ${state.ranking
        .map(
          row => `
            <div class="challenge-row ${row.status === 'unavailable' ? 'inactive' : ''}" data-player-id="${row.id}">
              <div class="challenge-rank">${row.rank}</div>
              <button class="challenge-name" type="button" data-challenge-name="${row.id}">
                ${row.name}
              </button>
              <button
                class="challenge-action"
                type="button"
                data-challenge-action="${row.id}"
                ${row.status === 'unavailable' ? 'disabled' : ''}
              >
                Saisir un défi
              </button>
            </div>
          `
        )
        .join('')}
    </div>
  `;

  rotationView.querySelectorAll('[data-challenge-name]').forEach(button => {
    button.addEventListener('click', () => {
      highlightChallengeWindow(button.dataset.challengeName);
    });
  });

  rotationView.querySelectorAll('[data-challenge-action]').forEach(button => {
    button.addEventListener('click', () => {
      openChallengeModal(button.dataset.challengeAction);
    });
  });
}

function renderResults() {
  resultSubtitle.textContent = state.generated
    ? `${state.teamCount} ${formatParticipantLabel({ plural: true })} · ${state.fields} terrain(s)`
    : 'Aucun planning pour le moment.';

  summaryGrid.innerHTML = state.generated
    ? `
      <div class="summary-primary-grid">
        <article class="summary-card summary-card-primary">
          <span>${formatParticipantLabel({ plural: true, capitalized: true })}</span>
          <strong>${state.teamCount}</strong>
        </article>
        <article class="summary-card summary-card-primary">
          <span>Terrains</span>
          <strong>${state.fields}</strong>
        </article>
        <article class="summary-card summary-card-primary">
          <span>Mode</span>
          <strong>${getModeDefinition(state.currentModeId)?.label || '-'}</strong>
        </article>
      </div>
    `
    : '';

  renderRotationView();
  renderTeamView();
  renderRankingView();
  renderRankingModal();
}

function setActiveTab(viewId) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewId);
  });

  rotationView.classList.toggle('hidden', viewId !== 'rotations');
  teamView.classList.toggle('hidden', viewId !== 'teams');
  rankingView.classList.toggle('hidden', viewId !== 'rankings');
}

function setActiveContext(contextId) {
  contextTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.context === contextId);
  });

  if (contextId === 'live') {
    showScreen('live');
    return;
  }

  if (contextId === 'projection') {
    showScreen('projection');
    return;
  }

  showScreen('results');
}

function generateTournament() {
  state.teamCount = Number(modeParticipantsInput.value || state.teamCount || 8);
  state.fields = Number(fieldCount.value || 2);
  state.matchDuration = Number(matchDuration.value || 12);
  state.availableDuration = availableDuration.value || '';
  state.startTime = startTime.value || '';
  state.endTime = endTime.value || '';
  state.worldCupGroupCount = Number(worldCupGroupCount.value || 2);
  state.ladderRefereeCourts = Number(ladderRefereeCourts.value || 0);
  state.ladderFreeCourts = Number(ladderFreeCourts.value || 0);
  state.matchMode = matchMode.value || 'time';
  state.scoreTarget = Number(scoreTarget.value || 11);
  state.rotationBuffer = Number(rotationBuffer.value || 2);
  state.breakDuration = Number(breakDuration.value || 0);
  state.timerEnabled = !!timerToggle.checked;
  state.soundEnabled = !!soundToggle.checked;
  state.vibrationEnabled = !!vibrationToggle.checked;

  if (!Array.isArray(state.teams) || !state.teams.length) {
    state.teams = Array.from({ length: state.teamCount }, (_, index) => ({
      id: `p-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${formatParticipantLabel({ capitalized: true })} ${index + 1}`,
      status: 'active',
      points: 0,
    }));
  }

  while (state.teams.length < state.teamCount) {
    state.teams.push({
      id: `p-${Date.now()}-${state.teams.length}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${formatParticipantLabel({ capitalized: true })} ${state.teams.length + 1}`,
      status: 'active',
      points: 0,
    });
  }

  if (state.teams.length > state.teamCount) {
    state.teams = state.teams.slice(0, state.teamCount);
  }

  state.generated = true;
  recomputeRanking();
  renderResults();
  showScreen('results');
  setActiveTab('rotations');
  saveState();
}

function handleUniverseChoice(universeId) {
  const universe = getUniverseDefinition(universeId);
  if (!universe) return;

  state.currentUniverse = universe.id;
  state.practiceType = universe.practiceType;
  state.currentModeId = null;

  setTheme(universe.id);
  renderModeCards();
  showScreen('type');
  saveState();
}

function wireNavigationButtons() {
  document.querySelectorAll('[data-nav]').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.nav;
      if (!target) return;

      if (target === 'landing') {
        showScreen('landing');
        closeToolsMenu();
        return;
      }

      if (target === 'type') {
        renderModeCards();
      }

      if (target === 'teams') {
        renderTeamFields();
      }

      if (target === 'options') {
        renderOptionsScreen();
      }

      if (target === 'results' && state.generated) {
        renderResults();
      }

      showScreen(target);
    });
  });
}

function wireTabs() {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setActiveTab(tab.dataset.view);
    });
  });

  contextTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setActiveContext(tab.dataset.context);
    });
  });
}

function wireTools() {
  toolsToggle.addEventListener('click', e => {
    e.stopPropagation();
    toggleToolsMenu();
  });

  document.addEventListener('click', event => {
    if (!toolsMenu.contains(event.target) && event.target !== toolsToggle) {
      closeToolsMenu();
    }
  });

  rankingButtons.forEach(button => {
    button.addEventListener('click', () => {
      closeToolsMenu();
      openRankingModal();
    });
  });

  statusBtn.addEventListener('click', () => {
    closeToolsMenu();
    renderStatusModal();
    openModal(statusModal);
  });

  rankingModalClose.addEventListener('click', () => closeModal(rankingModal));
  statusModalClose.addEventListener('click', () => closeModal(statusModal));

  challengeModalClose.addEventListener('click', closeChallengeModal);
  challengeCancelBtn.addEventListener('click', closeChallengeModal);
  challengeValidateBtn.addEventListener('click', applyChallengeResult);

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });
}

function wireMainButtons() {
  landingSportcoBtn.addEventListener('click', () => handleUniverseChoice('sportco'));
  landingRaquettesBtn.addEventListener('click', () => handleUniverseChoice('raquettes'));

  modeNextBtn.addEventListener('click', () => {
    if (!state.currentModeId) return;
    renderOptionsScreen();
    showScreen('options');
  });

  countMinus.addEventListener('click', () => {
    state.teamCount = Math.max(2, Number(state.teamCount || 2) - 1);
    syncCountUI();
    renderTeamFields();
    saveState();
  });

  countPlus.addEventListener('click', () => {
    state.teamCount = Math.min(32, Number(state.teamCount || 2) + 1);
    syncCountUI();
    renderTeamFields();
    saveState();
  });

  teamCountSlider.addEventListener('input', e => {
    state.teamCount = Number(e.target.value || 8);
    syncCountUI();
    renderTeamFields();
    saveState();
  });

  modeParticipantsInput.addEventListener('input', e => {
    state.teamCount = Math.max(2, Math.min(32, Number(e.target.value || 8)));
    syncCountUI();
    renderTeamFields();
    saveState();
  });

  matchMode.addEventListener('change', () => {
    scoreTargetField.classList.toggle('hidden', matchMode.value !== 'score');
    saveState();
  });

  generateBtn.addEventListener('click', generateTournament);

  const startLiveBtn = document.getElementById('startLiveBtn');
  if (startLiveBtn) {
    startLiveBtn.addEventListener('click', () => {
      showScreen('live');
    });
  }

  const resultsProjectionBtn = document.getElementById('resultsProjectionBtn');
  if (resultsProjectionBtn) {
    resultsProjectionBtn.addEventListener('click', () => {
      showScreen('projection');
    });
  }

  const resultsChronoBtn = document.getElementById('resultsChronoBtn');
  if (resultsChronoBtn) {
    resultsChronoBtn.addEventListener('click', () => {
      showScreen('chrono');
    });
  }

  const projectionBackBtn = document.getElementById('projectionBackBtn');
  if (projectionBackBtn) {
    projectionBackBtn.addEventListener('click', () => showScreen('results'));
  }

  const chronoBackBtn = document.getElementById('chronoBackBtn');
  if (chronoBackBtn) {
    chronoBackBtn.addEventListener('click', () => showScreen('live'));
  }

  const liveBackBtn = document.getElementById('liveBackBtn');
  if (liveBackBtn) {
    liveBackBtn.addEventListener('click', () => showScreen('results'));
  }

  const liveRankingBtn = document.getElementById('liveRankingBtn');
  if (liveRankingBtn) {
    liveRankingBtn.addEventListener('click', openRankingModal);
  }

  const liveRankingPanelBtn = document.getElementById('liveRankingPanelBtn');
  if (liveRankingPanelBtn) {
    liveRankingPanelBtn.addEventListener('click', openRankingModal);
  }

  const timerRanking = document.getElementById('timerRanking');
  if (timerRanking) {
    timerRanking.addEventListener('click', openRankingModal);
  }

  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  const printTopBtn = document.getElementById('printTopBtn');
  if (printTopBtn) {
    printTopBtn.addEventListener('click', () => {
      closeToolsMenu();
      window.print();
    });
  }
}

function hydrateUIFromState() {
  syncCountUI();
  renderTeamFields();
  setTheme(state.currentUniverse);

  if (state.currentUniverse) {
    renderModeCards();
  }

  if (state.currentModeId) {
    renderOptionsScreen();
  }

  if (state.generated) {
    recomputeRanking();
    renderResults();
  }

  if (state.currentScreen && screens[state.currentScreen]) {
    showScreen(state.currentScreen);
  } else {
    showScreen('landing');
  }
}

function init() {
  loadState();
  wireNavigationButtons();
  wireTabs();
  wireTools();
  wireMainButtons();
  hydrateUIFromState();
}

init();
