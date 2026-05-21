/** PORTAL Tribune — faithful to gallery/round-2/02-newspaper.html */
export const news = {
  page: 'min-h-full bg-[#f5f0e8] text-[#1a1a1a]',
  shell: 'mx-auto w-full max-w-[1200px] px-6 py-8 md:px-10 md:py-10',
  mast: 'font-serif text-[2rem] leading-tight border-b-4 border-double border-[#1a1a1a] pb-2 md:text-[2.625rem]',
  edition: 'mt-2 text-[13px] text-[#555555]',
  mastBar: 'mt-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#cccccc] pb-3',
  refreshBtn:
    'inline-flex items-center gap-1.5 border border-[#1a1a1a] bg-white px-3 py-1.5 text-[13px] hover:bg-[#ebe6dc]',
  alert: 'mb-4 border border-[#b91c1c] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]',
  activeWork: 'mt-4 border border-[#cccccc] bg-white px-4 py-3',
  activeWorkLabel: 'text-[11px] font-semibold uppercase tracking-wide text-[#555555]',
  activeWorkBody: 'mt-1 text-[14px] leading-relaxed',
  riskTicker: 'mt-2 text-[12px] text-[#555555] font-mono',

  classifiedRow: 'grid grid-cols-2 gap-px bg-[#cccccc] md:grid-cols-4',
  classifiedCell: 'bg-white px-3 py-3',
  classifiedLabel: 'text-[11px] text-[#555555]',
  classifiedValue: 'font-serif mt-0.5 text-xl font-bold tabular-nums leading-none',
  classifiedValueRisk: 'text-[#b91c1c]',

  columns: 'mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10',
  columnTitle: 'font-serif text-lg font-bold mb-1',
  item: 'flex w-full items-baseline justify-between gap-4 border-t border-[#cccccc] py-2.5 text-left hover:bg-[#ebe6dc]',
  itemLabel: 'text-[14px]',
  itemValue: 'shrink-0 text-[14px] font-semibold tabular-nums',
  itemValueRisk: 'shrink-0 text-[14px] font-semibold tabular-nums text-[#b91c1c]',

  lead: 'mt-6 bg-[#1a1a1a] px-4 py-4 text-[15px] leading-relaxed text-[#f5f0e8]',
  desksWrap: 'mt-8 border-t-2 border-[#1a1a1a] pt-6',
  desksHeading: 'font-serif text-lg font-bold',
  desksSub: 'text-[13px] text-[#555555] mt-1',
  details: 'group mt-3 border border-[#cccccc] bg-white',
  detailsSummary:
    'flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-serif text-[15px] font-bold hover:bg-[#faf8f4] [&::-webkit-details-marker]:hidden',
  detailsBody: 'border-t border-[#cccccc] px-4 py-4',

  card: 'border border-[#cccccc] bg-white p-4 mb-3',
  cardTitle: 'font-serif text-base font-bold mb-3 border-b border-[#e5e5e5] pb-2',
  body: 'text-sm text-[#333333] leading-relaxed',
  bodyMuted: 'text-sm text-[#555555]',
  kpi: 'text-2xl font-semibold tabular-nums',
  link: 'text-sm font-medium underline hover:text-[#b91c1c]',
  desk: 'font-serif text-2xl mt-1',
} as const

export const NEWS_DESK: Record<string, { desk: string; section: string }> = {
  ssot: { desk: 'The HANDOFF Desk', section: 'Continuity' },
  ops: { desk: 'The Ops Desk', section: 'Operations' },
  rag: { desk: 'The Knowledge Desk', section: 'Operations' },
  unicom: { desk: 'The Wire Desk', section: 'Operations' },
  context: { desk: 'The Briefing Desk', section: 'Continuity' },
  prompt: { desk: 'The Audit Desk', section: 'Continuity' },
}
