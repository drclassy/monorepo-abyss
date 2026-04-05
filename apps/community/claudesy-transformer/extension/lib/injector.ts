// Claudesy Transformer Engine V2 — Floating Button Injector

const BUTTON_ID = 'cte-v2-optimize-btn'

/**
 * Create a floating "Optimize" button near a textarea element.
 */
export function createFloatingButton(
  targetEl: HTMLElement,
  onClick: () => void,
): HTMLButtonElement {
  // Remove existing button if any
  removeFloatingButton()

  const btn = document.createElement('button')
  btn.id = BUTTON_ID
  btn.textContent = 'CTE'
  btn.title = 'Optimize with CTE V2'

  Object.assign(btn.style, {
    position: 'fixed',
    zIndex: '999999',
    bottom: '80px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#eb5939',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(235, 89, 57, 0.4)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)'
    btn.style.boxShadow = '0 4px 12px rgba(235, 89, 57, 0.6)'
  })

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)'
    btn.style.boxShadow = '0 2px 8px rgba(235, 89, 57, 0.4)'
  })

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  })

  document.body.appendChild(btn)
  return btn
}

/**
 * Remove the floating button from the DOM.
 */
export function removeFloatingButton(): void {
  const existing = document.getElementById(BUTTON_ID)
  if (existing) {
    existing.remove()
  }
}
