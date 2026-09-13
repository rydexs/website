// Saves website form submissions to the Supabase "enquiries" table.
// The publishable key is meant to be public: row level security only lets visitors insert.
// Never put the secret (sb_secret_...) key in this file.
(function () {
  const SUPABASE_URL = 'https://pahxdxxnyauigdukuxlz.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_AIyKJ6wSoAWxRUu96kiykA_EpHckliw';

  // Blank strings and unselected placeholders are stored as null
  function clean(data) {
    const out = {};
    for (const [key, value] of Object.entries(data)) {
      const v = typeof value === 'string' ? value.trim() : value;
      out[key] = v === '' || v === undefined || Number.isNaN(v) ? null : v;
    }
    return out;
  }

  window.saveEnquiry = async function (data) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/enquiries', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(clean({ page: location.pathname.split('/').pop() || 'index.html', ...data }))
    });
    if (!res.ok) throw new Error('Supabase ' + res.status + ': ' + (await res.text()));
  };

  // Value of a <select> whose first option is a placeholder like "Select trip type"
  window.selectValue = function (select) {
    return select && select.selectedIndex > 0 ? select.value : null;
  };

  // Disables the button while saving; returns true on success
  window.submitEnquiry = async function (button, data) {
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'SENDING…';
    try {
      await window.saveEnquiry(data);
      return true;
    } catch (err) {
      console.error(err);
      alert('Sorry, we could not send your request. Please try again or reach us on WhatsApp.');
      return false;
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  };
})();
