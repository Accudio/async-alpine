export default function outputDirective(el, { expression }) {
  el.innerHTML = expression;
}
