// PHANTOM PACKET - UI Module
// Safe DOM manipulation with textContent only

export function setTitle(text) {
  const el = document.querySelector('title');
  if (el) el.textContent = text;
}

export function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

export function setHTML(selector, text) {
  // Legacy helper intentionally renders plain text, never untrusted HTML.
  const el = document.querySelector(selector);
  if (el) el.textContent = String(text);
}

export function getText(selector) {
  const el = document.querySelector(selector);
  return el ? el.textContent : '';
}

export function addClass(selector, className) {
  const el = document.querySelector(selector);
  if (el) el.classList.add(className);
}

export function removeClass(selector, className) {
  const el = document.querySelector(selector);
  if (el) el.classList.remove(className);
}

export function toggleClass(selector, className) {
  const el = document.querySelector(selector);
  if (el) el.classList.toggle(className);
}

export function show(selector) {
  const el = document.querySelector(selector);
  if (el) el.style.display = '';
}

export function hide(selector) {
  const el = document.querySelector(selector);
  if (el) el.style.display = 'none';
}

export function isVisible(selector) {
  const el = document.querySelector(selector);
  return el && el.style.display !== 'none';
}

export function on(selector, event, handler) {
  const el = document.querySelector(selector);
  if (el) el.addEventListener(event, handler);
}

export function onAll(selector, event, handler) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener(event, handler);
  });
}

export function emptyElement(selector) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = '';
}

export function createDiv(className = '', textContent = '') {
  const div = document.createElement('div');
  if (className) div.className = className;
  if (textContent) div.textContent = textContent;
  return div;
}

export function createButton(text, className = '') {
  const btn = document.createElement('button');
  btn.textContent = text;
  if (className) btn.className = className;
  return btn;
}

export function append(selector, element) {
  const parent = document.querySelector(selector);
  if (parent && element) parent.appendChild(element);
}

export function prepend(selector, element) {
  const parent = document.querySelector(selector);
  if (parent && element) parent.insertBefore(element, parent.firstChild);
}

export function clear(selector) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = '';
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function getInputValue(selector) {
  const el = document.querySelector(selector);
  return el ? el.value : '';
}

export function setInputValue(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.value = value;
}

export function clearInput(selector) {
  const el = document.querySelector(selector);
  if (el) el.value = '';
}

export function focusElement(selector) {
  const el = document.querySelector(selector);
  if (el) el.focus();
}
