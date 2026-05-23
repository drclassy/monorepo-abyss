const summaryRoot = document.getElementById("summary-stats");
const stateViewer = document.getElementById("mock-state-viewer");

const fallbackState = {
  prototype: "sentra-rag-dashboard",
  status: "scaffolded",
  phase: "task-1",
  readiness: {
    structure: true,
    branding: true,
    mockState: true,
  },
  stats: {
    documents: 0,
    indexed: 0,
    alerts: 0,
  },
  note: "Fallback state is active because mock-rag-state.json could not be loaded.",
};

function renderStats(state) {
  const cards = [
    ["Phase", state.phase ?? "task-1"],
    ["Status", state.status ?? "unknown"],
    ["Documents", String(state.stats?.documents ?? 0)],
    ["Indexed", String(state.stats?.indexed ?? 0)],
  ];

  summaryRoot.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <p class="stat-card__value">${value}</p>
          <p class="stat-card__label">${label}</p>
        </article>
      `,
    )
    .join("");
}

function renderState(state) {
  stateViewer.textContent = JSON.stringify(state, null, 2);
}

async function loadState() {
  try {
    const response = await fetch("./assets/mock-rag-state.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      ...fallbackState,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function bootstrap() {
  const state = await loadState();
  renderStats(state);
  renderState(state);
}

bootstrap();
