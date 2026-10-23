for (const link of document.querySelectorAll('[data-format]')) {
  link.addEventListener('click', () => { document.querySelector('#format').value = link.dataset.format; });
}
const status = document.querySelector('#form-status');
document.querySelector('#enquiry').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = `Campus AI session enquiry — ${data.get('institution')}`;
  const body = `Hello MASS team,\n\nWe would like to discuss an AI session for our institution.\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nInstitution: ${data.get('institution')}\nCity: ${data.get('city')}\nSession of interest: ${data.get('format')}\n\nOur plans:\n${data.get('plans')}\n\nPlease share the next steps and available options.\n\nRegards,\n${data.get('name')}`;
  document.querySelector('#prepared-enquiry').value = `To: info@mass.llc\nSubject: ${subject}\n\n${body}`;
  document.querySelector('#email-fallback').hidden = false;
  status.textContent = 'Review and send your enquiry in your email app. Your enquiry has not been sent yet.';
  window.location.href = `mailto:info@mass.llc?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
document.querySelector('#copy-enquiry').addEventListener('click', async () => {
  const field = document.querySelector('#prepared-enquiry');
  try {
    await navigator.clipboard.writeText(field.value);
    status.textContent = 'Enquiry copied. Paste it into an email to info@mass.llc.';
  } catch {
    field.focus();
    field.select();
    status.textContent = 'Select and copy the enquiry below, then send it to info@mass.llc.';
  }
});

const campusMenu = document.querySelector('.campus-mobile-menu');
campusMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { campusMenu.open = false; }));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && campusMenu?.open) { campusMenu.open = false; campusMenu.querySelector('summary').focus(); }
});
document.addEventListener('click', event => {
  if (campusMenu?.open && !campusMenu.contains(event.target)) campusMenu.open = false;
});
