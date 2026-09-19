// "Plan Your Journey" trip planner, shared by Home and Contact.
// Put <div class="planner-card" data-trip-planner></div> on a page and load this file (after js/supabase.js).
// Three trip types: Outstation (round trip / one way), Local (hourly package) and Airport (pickup / drop).
// Requests are saved to the Supabase "enquiries" table with the trip details in trip_type, destination,
// travel_date and a readable summary in message, so the existing email alert shows everything.
(function () {
  const HOME_CITY = 'Bengaluru';
  const CITIES = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Chennai', 'Hyderabad', 'Kochi'];
  const DESTINATIONS = ['Coorg', 'Chikkamagaluru', 'Ooty', 'Mysuru', 'Gokarna', 'Goa', 'Kerala', 'Hampi', 'Wayanad',
    'Pondicherry', 'Tirupati', 'Chennai', 'Hyderabad', 'Kodaikanal', 'Munnar', 'Dharmasthala', 'Murudeshwar'];
  const PACKAGES = ['4 Hr / 40 Km', '8 Hr / 80 Km', '12 Hr / 120 Km'];
  const VEHICLE_TYPES = ['Urbania', 'Sedan', 'SUVs & MPVs', 'Premium', 'Luxury', 'Vans'];
  const AIRPORTS = [
    'Kempegowda International Airport, Bengaluru (BLR)',
    'Mysuru Airport (MYQ)',
    'Mangaluru International Airport (IXE)',
    'Hubballi Airport (HBX)',
    'Belagavi Airport (IXG)',
    'Chennai International Airport (MAA)',
    'Rajiv Gandhi International Airport, Hyderabad (HYD)',
    'Cochin International Airport (COK)'
  ];

  const icon = {
    outstation: '<path d="M4 20 9 4M20 20 15 4M12 6v2M12 11v2M12 16v2"/>',
    local: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    airport: '<path d="M2 16h20M5.5 13.5 3 8h2.5l2.5 3h5L9.5 4H12l6 7h2.5a1.5 1.5 0 0 1 0 3H7.8a2 2 0 0 1-1.7-.9z"/>',
    round: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
    oneway: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    package: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8"/>'
  };
  const svg = (name, size = 20) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[name]}</svg>`;

  // yyyy-mm-ddThh:mm in local time, for datetime-local inputs
  const localValue = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const readable = v => v ? new Date(v).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
  const options = list => list.map(o => `<option>${o}</option>`).join('');

  function field(id, label, control, { iconName, full } = {}) {
    return `<div class="trip-field${full ? ' full' : ''}">
      <label for="${id}">${label}</label>
      <div class="trip-input">${iconName ? svg(iconName, 18) : ''}${control}</div>
    </div>`;
  }

  function render(card) {
    card.innerHTML = `
      <h3>${card.dataset.title || 'Plan Your Journey'}</h3>
      <form class="trip-planner" novalidate>
        <div class="trip-tabs" role="tablist" aria-label="Trip type">
          <button type="button" class="trip-tab" role="tab" data-trip="outstation" aria-selected="true">${svg('outstation', 24)}<span>Outstation</span></button>
          <button type="button" class="trip-tab" role="tab" data-trip="local" aria-selected="false">${svg('local', 24)}<span>Local Trip</span></button>
          <button type="button" class="trip-tab" role="tab" data-trip="airport" aria-selected="false">${svg('airport', 24)}<span>Airport Trip</span></button>
        </div>

        <fieldset class="trip-panel planner-grid" data-panel="outstation">
          <legend class="visually-hidden">Outstation trip</legend>
          <div class="trip-toggle full" role="group" aria-label="Journey">
            <button type="button" data-way="round" aria-pressed="true">${svg('round', 18)}Round Trip</button>
            <button type="button" data-way="oneway" aria-pressed="false">${svg('oneway', 18)}One Way</button>
          </div>
          ${field('tpFrom', 'From city', `<input id="tpFrom" name="from" type="text" list="tpCities" value="${HOME_CITY}" required maxlength="60">`, { iconName: 'pin' })}
          ${field('tpTo', 'To city', `<input id="tpTo" name="to" type="text" list="tpDestinations" placeholder="Where do you want to go?" required maxlength="100">`, { iconName: 'pin' })}
          ${field('tpPickup', 'Pickup date &amp; time', `<input id="tpPickup" name="pickup" type="datetime-local" required>`, { iconName: 'calendar' })}
          <div class="trip-field trip-return">
            <label for="tpReturn">Return date &amp; time</label>
            <div class="trip-input">${svg('calendar', 18)}<input id="tpReturn" name="return" type="datetime-local" required></div>
          </div>
        </fieldset>

        <fieldset class="trip-panel planner-grid" data-panel="local" hidden disabled>
          <legend class="visually-hidden">Local trip</legend>
          ${field('tpLocalCity', 'City', `<input id="tpLocalCity" name="city" type="text" list="tpCities" value="${HOME_CITY}" required maxlength="60">`, { iconName: 'pin' })}
          ${field('tpPackage', 'Package', `<select id="tpPackage" name="package" required>${options(PACKAGES)}</select>`, { iconName: 'package' })}
          ${field('tpLocalPickup', 'Pickup date &amp; time', `<input id="tpLocalPickup" name="pickup" type="datetime-local" required>`, { iconName: 'calendar', full: true })}
        </fieldset>

        <fieldset class="trip-panel planner-grid" data-panel="airport" hidden disabled>
          <legend class="visually-hidden">Airport trip</legend>
          ${field('tpAirportWay', 'Trip type', `<select id="tpAirportWay" name="airportWay" required><option>Pickup from airport</option><option>Drop to airport</option></select>`, { iconName: 'swap' })}
          ${field('tpAirportCity', 'City', `<input id="tpAirportCity" name="city" type="text" list="tpCities" value="${HOME_CITY}" required maxlength="60">`, { iconName: 'pin' })}
          ${field('tpAirport', 'Airport', `<select id="tpAirport" name="airport" required>${options(AIRPORTS)}</select>`, { iconName: 'airport', full: true })}
          ${field('tpAirportPickup', 'Pickup date &amp; time', `<input id="tpAirportPickup" name="pickup" type="datetime-local" required>`, { iconName: 'calendar', full: true })}
        </fieldset>

        <div class="planner-grid trip-contact">
          ${field('tpVehicle', 'Vehicle type', `<select id="tpVehicle" name="vehicleType"><option value="">Any / Not sure</option>${options(VEHICLE_TYPES)}</select>`, { full: true })}
          ${field('tpTravellers', 'Travellers', `<input id="tpTravellers" name="travellers" type="number" min="1" max="500" placeholder="Number of people">`)}
          ${field('tpName', 'Your name', `<input id="tpName" name="name" type="text" placeholder="Enter your name" maxlength="100">`)}
          ${field('tpPhone', 'Phone number', `<input id="tpPhone" name="phone" type="tel" placeholder="10-digit mobile number" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" required>`, { full: true })}
        </div>

        <datalist id="tpCities">${options(CITIES)}</datalist>
        <datalist id="tpDestinations">${options(DESTINATIONS)}</datalist>

        <button type="submit" class="planner-cta">GET A QUOTE</button>
        <p class="planner-confirm" role="status" hidden>Thanks! Our team will call you with a quote shortly.</p>
      </form>`;
    wire(card.querySelector('form'));
  }

  function wire(form) {
    const tabs = form.querySelectorAll('.trip-tab');
    const panels = form.querySelectorAll('.trip-panel');
    const wayButtons = form.querySelectorAll('.trip-toggle button');
    const returnField = form.querySelector('.trip-return');
    const returnInput = form.querySelector('#tpReturn');
    const pickups = form.querySelectorAll('input[name="pickup"]');
    const confirm = form.querySelector('.planner-confirm');
    let trip = 'outstation', way = 'round';

    function setDefaults() {
      const now = new Date();
      const pickup = new Date(now); pickup.setDate(pickup.getDate() + 1); pickup.setHours(10, 0, 0, 0);
      const back = new Date(pickup); back.setDate(back.getDate() + 1); back.setHours(21, 0, 0, 0);
      const min = localValue(now);
      pickups.forEach(input => { input.min = min; input.value = localValue(pickup); });
      returnInput.min = localValue(pickup);
      returnInput.value = localValue(back);
    }

    function showTrip(name) {
      trip = name;
      tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.trip === name)));
      // hidden panels are disabled too, so their required fields don't block submitting
      panels.forEach(p => { const on = p.dataset.panel === name; p.hidden = !on; p.disabled = !on; });
    }

    function showWay(name) {
      way = name;
      wayButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.way === name)));
      returnField.hidden = name !== 'round';
      returnInput.disabled = name !== 'round';
    }

    tabs.forEach(t => t.addEventListener('click', () => showTrip(t.dataset.trip)));
    wayButtons.forEach(b => b.addEventListener('click', () => showWay(b.dataset.way)));

    // return can't be before pickup
    const outPickup = form.querySelector('#tpPickup');
    outPickup.addEventListener('change', () => {
      returnInput.min = outPickup.value;
      if (returnInput.value && returnInput.value <= outPickup.value) {
        const back = new Date(outPickup.value); back.setHours(back.getHours() + 12);
        returnInput.value = localValue(back);
      }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      confirm.hidden = true;
      returnInput.setCustomValidity(way === 'round' && returnInput.value && returnInput.value <= outPickup.value
        ? 'Return must be after pickup' : '');
      if (!form.reportValidity()) return;

      const v = name => (form.querySelector(`.trip-panel:not([hidden]) [name="${name}"], .trip-contact [name="${name}"]`) || {}).value || '';
      const pickup = v('pickup');
      const vehicle = v('vehicleType') || 'Any / Not sure';
      let data;
      if (trip === 'outstation') {
        data = {
          trip_type: `Outstation · ${way === 'round' ? 'Round trip' : 'One way'}`,
          destination: v('to'),
          message: [`From: ${v('from')}`, `To: ${v('to')}`, `Pickup: ${readable(pickup)}`,
            way === 'round' ? `Return: ${readable(returnInput.value)}` : 'One way', `Vehicle: ${vehicle}`].join('\n')
        };
      } else if (trip === 'local') {
        data = {
          trip_type: `Local · ${v('package')}`,
          destination: v('city'),
          message: [`City: ${v('city')}`, `Package: ${v('package')}`, `Pickup: ${readable(pickup)}`, `Vehicle: ${vehicle}`].join('\n')
        };
      } else {
        data = {
          trip_type: `Airport · ${v('airportWay')}`,
          destination: v('airport'),
          message: [`${v('airportWay')}`, `City: ${v('city')}`, `Airport: ${v('airport')}`, `Pickup: ${readable(pickup)}`, `Vehicle: ${vehicle}`].join('\n')
        };
      }

      const saved = await submitEnquiry(form.querySelector('.planner-cta'), {
        source: 'planner',
        ...data,
        travel_date: pickup.slice(0, 10),
        travellers: parseInt(v('travellers'), 10),
        name: v('name'),
        phone: v('phone')
      });
      if (!saved) return;
      confirm.hidden = false;
      form.querySelectorAll('.trip-contact input, #tpTo').forEach(input => { input.value = ''; });
      form.querySelector('#tpVehicle').value = '';
      setDefaults();
    });

    setDefaults();
    showTrip('outstation');
    showWay('round');
  }

  document.querySelectorAll('[data-trip-planner]').forEach(render);
})();
