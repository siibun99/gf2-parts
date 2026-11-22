'use strict';
// Capture image events without executable HTML attributes (strict script CSP).
document.addEventListener('load', event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const portrait = image.closest('.doll-portrait, .thumb');
  if (!portrait) return;
  image.classList.add('loaded');
  portrait.classList.add('has-image');
  portrait.classList.remove('empty');
}, true);
document.addEventListener('error', event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const portrait = image.closest('.doll-portrait, .thumb');
  if (!portrait) return;
  portrait.classList.remove('has-image');
  portrait.classList.add('empty');
  image.closest('.portrait-position, .thumb-position')?.remove();
}, true);

// Resolve confirmation inside the page, including browsers without confirm().
window.askConfirmation = message => new Promise(resolve => {
  const dialog = document.createElement('dialog');
  dialog.className = 'confirm-dialog';
  const text = document.createElement('p');
  text.textContent = message;
  const cancel = document.createElement('button');
  cancel.textContent = '취소';
  const accept = document.createElement('button');
  accept.textContent = '확인';
  accept.className = 'primary';
  const previous = document.activeElement;
  const finish = result => { dialog.close(); dialog.remove(); previous?.focus(); resolve(result); };
  cancel.onclick = () => finish(false);
  accept.onclick = () => finish(true);
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
  dialog.append(text, cancel, accept);
  document.body.append(dialog);
  dialog.showModal();
  cancel.focus();
});
