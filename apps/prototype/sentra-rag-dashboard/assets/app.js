const surfaceState = {
  chunkWindow: {
    value: 512,
    step: 64,
    min: 128,
    max: 2048,
  },
  metrics: {
    coverage: 84,
    coverageNote: "approved for retrieval",
    pendingReview: 16,
    pendingReviewNote: "needs validation",
    reviewQueueOpen: 3,
  },
  quality: {
    approvedHitRate: 92,
    citationConfidence: 0.88,
    reviewLeakage: 3,
  },
  retrievalRuns: [
    { state: "Ready", source: "hipertensi-2026.pdf", chunks: 128 },
    { state: "Ready", source: "pnpk-diabetes.pdf", chunks: 96 },
    { state: "Reviewing", source: "neonatal-sepsis-scan.pdf", chunks: 64 },
    { state: "Blocked", source: "duplicate-case-notes.pdf", chunks: 0 },
  ],
};

const tabTargets = {
  overview: "hero",
  intake: "ingestion",
  registry: "registry",
  review: "registry",
  retrieval: "retrieval",
  queries: "queries",
  evaluation: "evaluation",
  authentication: "promoteSection",
};

function setSurfaceStatus(message) {
  document.title = `Sentra RAG Surface - ${message}`;

  const liveStatus = document.getElementById("liveStatus");
  if (liveStatus) {
    liveStatus.textContent = message;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function renderMetrics() {
  setText("coverageValue", `${surfaceState.metrics.coverage} docs`);
  setText("coverageNote", surfaceState.metrics.coverageNote);
  setText("pendingReviewValue", `${surfaceState.metrics.pendingReview} docs`);
  setText("pendingReviewNote", surfaceState.metrics.pendingReviewNote);
  setText("reviewQueueCount", `${surfaceState.metrics.reviewQueueOpen} open`);
}

function renderQuality() {
  setText("approvedHitRate", `${surfaceState.quality.approvedHitRate}%`);
  setText("citationConfidence", surfaceState.quality.citationConfidence.toFixed(2));
  setText("reviewLeakage", `${surfaceState.quality.reviewLeakage} docs`);
}

function renderChunkWindow() {
  setText("chunkValue", String(surfaceState.chunkWindow.value));
}

function getRunsQuery() {
  const input = document.getElementById("runsFilter");
  return input instanceof HTMLInputElement ? input.value.trim().toLowerCase() : "";
}

function getFilteredRuns() {
  const query = getRunsQuery();
  if (!query) {
    return surfaceState.retrievalRuns;
  }

  return surfaceState.retrievalRuns.filter((run) =>
    `${run.state} ${run.source} ${run.chunks}`.toLowerCase().includes(query),
  );
}

function renderRuns() {
  const tableBody = document.getElementById("runsTableBody");
  const summary = document.getElementById("runsSummary");

  if (!tableBody || !summary) {
    return;
  }

  const rows = getFilteredRuns();
  tableBody.innerHTML = rows
    .map(
      (run, index) => `
        <tr class="${index < rows.length - 1 ? "border-b border-white/10" : ""}">
          <td class="px-4 py-4"><input type="checkbox" class="rounded border-white/10" /></td>
          <td class="px-4 py-4">${run.state}</td>
          <td class="px-4 py-4">${run.source}</td>
          <td class="px-4 py-4 text-right">${run.chunks}</td>
          <td class="px-4 py-4 text-right">…</td>
        </tr>
      `,
    )
    .join("");

  summary.textContent = `0 of ${rows.length} run(s) selected.`;
}

function setActiveTab(activeTab) {
  const tabs = [...document.querySelectorAll(".surface-tab")];
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === activeTab;
    tab.classList.toggle("bg-muted", isActive);
    tab.classList.toggle("text-foreground", isActive);
    tab.classList.toggle("text-muted-foreground", !isActive);
  });
}

function scrollToTarget(targetId) {
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function activateTabs() {
  const tabs = [...document.querySelectorAll(".surface-tab")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tabTargets[tab.dataset.tab];
      setActiveTab(tab.dataset.tab);
      if (targetId) {
        scrollToTarget(targetId);
      }
      setSurfaceStatus(`tab ${tab.dataset.tab} active`);
    });
  });
}

function highlightCardsBySearch() {
  const input = document.getElementById("surfaceSearch");
  const cards = [...document.querySelectorAll("article")];

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  const query = input.value.trim().toLowerCase();
  cards.forEach((card) => {
    const matches = !query || card.textContent.toLowerCase().includes(query);
    card.style.opacity = matches ? "1" : "0.42";
    card.style.transform = matches ? "none" : "scale(0.995)";
  });

  if (query) {
    setSurfaceStatus(`search active for ${query}`);
  } else {
    setSurfaceStatus("surface ready");
  }
}

function focusSurfaceSearchFromShortcut(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const input = document.getElementById("surfaceSearch");
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  }
}

function bumpPendingReview(delta) {
  surfaceState.metrics.pendingReview = Math.max(0, surfaceState.metrics.pendingReview + delta);
  surfaceState.metrics.reviewQueueOpen = Math.max(0, surfaceState.metrics.reviewQueueOpen + (delta > 0 ? 1 : -1));
}

function pushRun(run) {
  surfaceState.retrievalRuns.unshift(run);
  surfaceState.retrievalRuns = surfaceState.retrievalRuns.slice(0, 6);
}

function getLibraryFileName() {
  const field = document.getElementById("libraryPath");
  if (!(field instanceof HTMLInputElement) || !field.value.trim()) {
    return "library-medical.pdf";
  }

  const trimmed = field.value.trim();
  const parts = trimmed.split(/[/\\]+/).filter(Boolean);
  const tail = parts[parts.length - 1];
  return tail.toLowerCase().endsWith(".pdf") ? tail : `${tail}.pdf`;
}

function bindButtons() {
  document.getElementById("increaseChunkBtn")?.addEventListener("click", () => {
    surfaceState.chunkWindow.value = Math.min(
      surfaceState.chunkWindow.max,
      surfaceState.chunkWindow.value + surfaceState.chunkWindow.step,
    );
    renderChunkWindow();
    setSurfaceStatus("chunk window increased");
  });

  document.getElementById("decreaseChunkBtn")?.addEventListener("click", () => {
    surfaceState.chunkWindow.value = Math.max(
      surfaceState.chunkWindow.min,
      surfaceState.chunkWindow.value - surfaceState.chunkWindow.step,
    );
    renderChunkWindow();
    setSurfaceStatus("chunk window decreased");
  });

  document.getElementById("openIntakeBtn")?.addEventListener("click", () => {
    setActiveTab("intake");
    scrollToTarget("ingestion");
    document.getElementById("libraryPath")?.focus();
    setSurfaceStatus("intake ready");
  });

  document.getElementById("openReviewBtn")?.addEventListener("click", () => {
    setActiveTab("registry");
    scrollToTarget("registry");
    setSurfaceStatus("review queue focused");
  });

  document.getElementById("scanOcrBtn")?.addEventListener("click", () => {
    pushRun({ state: "Queued", source: getLibraryFileName(), chunks: 0 });
    bumpPendingReview(1);
    renderMetrics();
    renderRuns();
    setSurfaceStatus("ocr scan staged");
  });

  document.getElementById("extractTextBtn")?.addEventListener("click", () => {
    pushRun({ state: "Extracted", source: getLibraryFileName(), chunks: 32 });
    renderRuns();
    setSurfaceStatus("text extraction staged");
  });

  document.getElementById("stageIntakeBtn")?.addEventListener("click", () => {
    pushRun({ state: "Reviewing", source: getLibraryFileName(), chunks: 48 });
    bumpPendingReview(1);
    renderMetrics();
    renderRuns();
    setSurfaceStatus("library intake queued");
  });

  document.getElementById("applyPolicyBtn")?.addEventListener("click", () => {
    bumpPendingReview(-1);
    surfaceState.quality.reviewLeakage = Math.max(0, surfaceState.quality.reviewLeakage - 1);
    surfaceState.quality.approvedHitRate = Math.min(99, surfaceState.quality.approvedHitRate + 1);
    renderMetrics();
    renderQuality();
    setSurfaceStatus("approval policy applied");
  });

  document.getElementById("writeChunksBtn")?.addEventListener("click", () => {
    surfaceState.metrics.coverage += 1;
    surfaceState.metrics.coverageNote = "write completed to medical corpus";
    if (surfaceState.metrics.pendingReview > 0) {
      bumpPendingReview(-1);
    }

    pushRun({
      state: "Ready",
      source: getLibraryFileName(),
      chunks: Math.round(surfaceState.chunkWindow.value / 4),
    });

    renderMetrics();
    renderRuns();
    setSurfaceStatus("chunk write requested");
  });

  document.getElementById("writeChunkPlanBtn")?.addEventListener("click", () => {
    const suggestedChunks = Math.round(surfaceState.chunkWindow.value / 4);
    pushRun({ state: "Planned", source: "chunk-window-plan", chunks: suggestedChunks });
    renderRuns();
    setSurfaceStatus(`chunk plan drafted with ${suggestedChunks} chunks`);
  });

  document.getElementById("clearDraftBtn")?.addEventListener("click", () => {
    const query = document.getElementById("queryInput");
    const note = document.getElementById("queryNote");
    if (query instanceof HTMLInputElement) {
      query.value = "";
    }
    if (note instanceof HTMLTextAreaElement) {
      note.value = "";
    }
    setSurfaceStatus("query draft cleared");
  });

  document.getElementById("runQueryBtn")?.addEventListener("click", () => {
    const mode = document.getElementById("citationMode");
    const query = document.getElementById("queryInput");
    const usingApprovedOnly =
      mode instanceof HTMLSelectElement && mode.value.toLowerCase().includes("approved");

    surfaceState.quality.approvedHitRate = usingApprovedOnly ? 94 : 89;
    surfaceState.quality.citationConfidence = usingApprovedOnly ? 0.91 : 0.84;
    renderQuality();

    if (query instanceof HTMLInputElement && query.value.trim()) {
      pushRun({
        state: "Queried",
        source: query.value.trim().slice(0, 28),
        chunks: Math.round(surfaceState.chunkWindow.value / 8),
      });
      renderRuns();
    }

    setActiveTab("retrieval");
    scrollToTarget("retrieval");
    setSurfaceStatus("retrieval executed");
  });

  document.getElementById("copyPromotionBtn")?.addEventListener("click", async () => {
    const field = document.getElementById("promotionLink");
    if (!(field instanceof HTMLInputElement)) {
      return;
    }

    try {
      await navigator.clipboard.writeText(field.value);
      setSurfaceStatus("promotion link copied");
    } catch {
      field.select();
      setSurfaceStatus("promotion link selected");
    }
  });
}

window.addEventListener("load", () => {
  renderMetrics();
  renderQuality();
  renderChunkWindow();
  renderRuns();
  activateTabs();
  bindButtons();
  setActiveTab("overview");

  document.getElementById("runsFilter")?.addEventListener("input", renderRuns);
  document.getElementById("surfaceSearch")?.addEventListener("input", highlightCardsBySearch);
  document.addEventListener("keydown", focusSurfaceSearchFromShortcut);

  setSurfaceStatus("surface ready");
});
