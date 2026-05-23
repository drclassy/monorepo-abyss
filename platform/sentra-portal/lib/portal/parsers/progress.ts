export function parseProgressCheckboxes(md: string): { done: number; total: number } {
  const boxes = [...md.matchAll(/- \[( |x|X)\]/g)]
  const done = boxes.filter((match) => match[1].toLowerCase() === 'x').length
  return { done, total: boxes.length }
}
