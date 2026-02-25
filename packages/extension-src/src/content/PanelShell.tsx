/** @jsxImportSource preact */

export function PanelShell() {
  return (
    <section id="pier-panel" hidden>
      <div
        id="pier-resize-handle"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize terminal panel"
        tabIndex={0}
      />
      <button
        id="pier-close-button"
        type="button"
        data-pier-action="close"
        data-pier-close="1"
        aria-label="Close terminal panel"
        title="Close terminal panel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
      <div id="pier-terminal" />
    </section>
  );
}
