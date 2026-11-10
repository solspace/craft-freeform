type Span = { columns: number; rows: number };
type Cell = { column: number; row: number };
type Placement = Cell & Span;

const overlaps = (a: Placement, b: Placement) =>
  a.column < b.column + b.columns &&
  a.column + a.columns > b.column &&
  a.row < b.row + b.rows &&
  a.row + a.rows > b.row;

// Match the grid's sparse row placement, including cells occupied by tall cards.
function nextSlot(
  cursor: Cell,
  span: Span,
  occupied: Placement[],
  columns: number,
): Placement {
  const cell = { ...cursor };
  while (true) {
    if (cell.column + span.columns > columns) {
      cell.column = 0;
      cell.row++;
    }
    const placement = { ...cell, ...span };
    if (!occupied.some((item) => overlaps(item, placement))) return placement;
    cell.column++;
  }
}

export function findGridDropGaps<T>(
  cards: { id: T; span: Span }[],
  dragged: T,
  draggedSpan: Span,
  columns: number,
): (Placement & { before: T })[] {
  if (columns < 1 || draggedSpan.columns > columns) return [];
  const pack = (items: typeof cards) => {
    const occupied: (Placement & { id: T })[] = [];
    let cursor = { column: 0, row: 0 };
    for (const item of items) {
      const placement = nextSlot(cursor, item.span, occupied, columns);
      occupied.push({ ...placement, id: item.id });
      cursor = {
        column: placement.column + placement.columns,
        row: placement.row,
      };
    }
    return occupied;
  };
  const actual = pack(cards);
  const height = Math.max(0, ...actual.map((item) => item.row + item.rows));
  const occupied: Placement[] = [];
  const gaps: (Placement & { before: T })[] = [];
  let cursor = { column: 0, row: 0 };
  for (const card of cards) {
    if (card.id === dragged) continue;
    const candidate = nextSlot(cursor, draggedSpan, occupied, columns);
    if (
      candidate.row + candidate.rows <= height &&
      !actual.some(
        (item) => item.id !== dragged && overlaps(item, candidate),
      ) &&
      !gaps.some((gap) => overlaps(gap, candidate))
    ) {
      gaps.push({ ...candidate, before: card.id });
    }
    const placement = nextSlot(cursor, card.span, occupied, columns);
    occupied.push(placement);
    cursor = {
      column: placement.column + placement.columns,
      row: placement.row,
    };
  }
  return gaps;
}

const spanOf = (card: HTMLElement): Span => {
  const style = getComputedStyle(card);
  const span = (value: string) => Number(value.match(/span\s+(\d+)/)?.[1]) || 1;
  return {
    columns: Math.max(span(style.gridColumnStart), span(style.gridColumnEnd)),
    rows: Math.max(span(style.gridRowStart), span(style.gridRowEnd)),
  };
};

/** Absolute targets participate in Sortable hit testing without filling the grid. */
export function createGridDropTargets(
  lists: HTMLElement[],
  dragged: HTMLElement,
) {
  const targets: HTMLElement[] = [];
  const draggedSpan = spanOf(dragged);
  for (const list of lists) {
    const style = getComputedStyle(list);
    const tracks = style.gridTemplateColumns
      .split(/\s+/)
      .map(Number.parseFloat);
    const rowHeight = Number.parseFloat(style.gridAutoRows);
    if (
      style.display !== "grid" ||
      tracks.some((track) => !Number.isFinite(track)) ||
      !rowHeight
    )
      continue;
    const columnGap = Number.parseFloat(style.columnGap) || 0;
    const rowGap = Number.parseFloat(style.rowGap) || 0;
    const cards = Array.from(
      list.querySelectorAll<HTMLElement>(":scope > [data-id]"),
    ).filter((card) => getComputedStyle(card).display !== "none");
    const gaps = findGridDropGaps(
      cards.map((card) => ({ id: card, span: spanOf(card) })),
      dragged,
      draggedSpan,
      tracks.length,
    );
    for (const gap of gaps) {
      const target = document.createElement("li");
      target.setAttribute("data-grid-gap", "");
      target.setAttribute("aria-hidden", "true");
      const offset = tracks
        .slice(0, gap.column)
        .reduce((sum, width) => sum + width + columnGap, 0);
      const width =
        tracks
          .slice(gap.column, gap.column + gap.columns)
          .reduce((sum, width) => sum + width, 0) +
        (gap.columns - 1) * columnGap;
      Object.assign(target.style, {
        position: "absolute",
        top: `${gap.row * (rowHeight + rowGap)}px`,
        left: style.direction === "rtl" ? "auto" : `${offset}px`,
        right: style.direction === "rtl" ? `${offset}px` : "auto",
        width: `${width}px`,
        height: `${gap.rows * rowHeight + (gap.rows - 1) * rowGap}px`,
      });
      list.insertBefore(target, gap.before);
      targets.push(target);
    }
  }
  const destroy = () => {
    for (const target of targets) target.remove();
  };
  // Keep these anchors stable while Sortable previews other positions. Otherwise
  // crossing a card on the way to a gap can move that card into the gap and erase
  // the target before the pointer reaches it.
  return { destroy };
}
