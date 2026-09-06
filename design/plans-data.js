// Shared placeholder content for the Plans feature (Ours). Loaded by the mobile + desktop DCs.
(function () {
  const P = (s, w, h) => `https://picsum.photos/seed/${s}/${w}/${h}`;
  const PLANS = [
    { id: 'japan', name: 'Japan, spring 2027', type: 'Trip', dates: 'Apr 8 – 22, 2027', dest: ['Tokyo', 'Kyoto', 'Osaka'], status: 'planning', countdown: 'in 214 days', hints: '12 ideas · 4 booked · checklist 3/18', color: 'var(--accent)', cover: P('japan', 1200, 800), group: 'next', large: true },
    { id: 'lake', name: 'Lake weekend', type: 'Trip', dates: 'Sep 12 – 13, 2026', dest: ['Lake Lure'], status: 'booked', countdown: 'in 6 days', hints: '3 ideas · 1 booked · checklist 5/9', color: 'var(--green)', cover: P('lake1', 600, 400), group: 'next' },
    { id: 'anniv', name: 'Anniversary weekend', type: 'Event', dates: 'Oct 17 – 18, 2026', dest: ['Home', 'Nonna’s'], status: 'booked', countdown: 'in 41 days', hints: '2 ideas · 2 booked · guests 6/8', color: 'var(--plum)', cover: P('anniv', 600, 400), group: 'next' },
    { id: 'portugal', name: 'Portugal, someday', type: 'Trip', dates: 'No dates yet', dest: ['Lisbon', 'Porto'], status: 'dreaming', countdown: '', hints: '7 ideas', color: 'var(--ochre)', cover: P('lisbon', 600, 400), group: 'dream' },
    { id: 'asheville', name: 'Three days in Asheville', type: 'Trip', dates: 'Aug 14 – 17, 2026', dest: ['Asheville'], status: 'done', countdown: '', hints: 'Memory published', color: 'var(--fg3)', cover: P('asheville', 600, 400), group: 'past' },
  ];
  const DAYS = [
    { n: 1, dow: 'Thu', date: 'Apr 8', city: 'Tokyo', items: [
      { kind: 'flight', time: '12:55 PM', title: 'JL 5 · JFK → HND', place: 'Terminal 1, gate B22', cost: '$1,840', booked: true, conf: 'Q7XR4M', docs: 2, by: 'Casey' },
      { kind: 'transport', time: '5:10 PM +1', title: 'Monorail to Hamamatsucho', place: 'Haneda Airport', cost: '¥500', booked: false, docs: 0, by: 'Yasmim' },
      { kind: 'stay', time: '6:30 PM', title: 'Check in · Hotel Niwa', place: 'Chiyoda, Tokyo', cost: '$620', booked: true, conf: 'NW-88213', docs: 1, by: 'Casey' },
      { kind: 'food', time: '8:00 PM', title: 'Ichiran ramen', place: 'Shibuya', cost: '¥2,400', booked: false, docs: 0, by: 'Yasmim' },
    ] },
    { n: 2, dow: 'Fri', date: 'Apr 9', city: 'Tokyo', items: [
      { kind: 'ticket', time: '5:30 PM', title: 'teamLab Planets', place: 'Toyosu', cost: '$56', booked: true, conf: 'TLP-40912', docs: 1, by: 'Casey' },
    ] },
    { n: 3, dow: 'Sat', date: 'Apr 10', city: 'Tokyo', items: [] },
  ];
  const UNSCHEDULED = [
    { kind: 'activity', title: 'Fushimi Inari at sunrise', place: 'Kyoto', by: 'Yasmim' },
    { kind: 'food', title: 'Nishiki market breakfast', place: 'Kyoto', by: 'Casey' },
  ];
  const IDEAS = [
    { title: 'Fushimi Inari at sunrise', city: 'Kyoto', by: 'Yasmim', status: 'shortlisted', img: P('inari', 400, 300), c: 'like', h: 'like' },
    { title: 'Ichiran ramen', city: 'Tokyo', by: 'Yasmim', status: 'decided', img: P('ramen', 400, 300), c: 'like', h: 'like' },
    { title: 'Ghibli Museum tickets go on sale on the 10th', city: 'Tokyo', by: 'Casey', status: 'idea', img: P('ghibli', 400, 300), c: 'like', h: 'meh' },
    { title: 'Dotonbori at night', city: 'Osaka', by: 'Casey', status: 'idea', img: P('dotonbori', 400, 300), c: 'meh', h: 'like' },
    { title: 'Nishiki market', city: 'Kyoto', by: 'Casey', status: 'shortlisted', img: P('nishiki', 400, 300), c: 'like', h: 'like' },
    { title: 'Owl café', city: 'Tokyo', by: 'Yasmim', status: 'idea', img: P('owl', 400, 300), c: 'no', h: 'meh' },
  ];
  const BOOKINGS = [
    { group: 'Flights', kind: 'flight', title: 'Japan Airlines · JL 5', a: 'JFK', b: 'HND', dep: 'Thu Apr 8 · 12:55 PM', arr: 'Fri Apr 9 · 4:15 PM', seats: '34A · 34B', conf: 'Q7XR4M', docs: 2, sub: 'Return JL 6 · Apr 22' },
    { group: 'Stays', kind: 'stay', title: 'Yoshikawa Inn', addr: '135 Tominokoji, Nakagyo, Kyoto', dep: 'Check in Tue Apr 13 · 3 PM', arr: 'Check out Fri Apr 16 · 11 AM', seats: '+81 75-221-5544', conf: 'YK-2027-0413', docs: 1, sub: 'Ryokan · kaiseki dinner included' },
    { group: 'Transport', kind: 'train', title: 'Shinkansen Nozomi 23', a: 'Tokyo', b: 'Kyoto', dep: 'Tue Apr 13 · 9:00 AM', arr: 'Tue Apr 13 · 11:15 AM', seats: 'Car 7 · 12D, 12E · JR Pass', conf: '—', docs: 0, sub: 'Reserve seats at the station' },
    { group: 'Tickets', kind: 'ticket', title: 'teamLab Planets', a: 'Toyosu', b: '', dep: 'Fri Apr 9 · 5:30 PM', arr: '', seats: '2 adults', conf: 'TLP-40912', docs: 1, sub: '' },
  ];
  const LISTS = [
    { name: 'Before we go', done: 3, total: 7, items: [{ t: 'Renew Casey’s passport', who: 'C', done: true, due: 'Oct 1' }, { t: 'Buy JR Pass vouchers', who: 'Y', done: false, due: 'Mar 1' }, { t: 'Ghibli tickets (on sale the 10th)', who: 'C', done: false, due: 'Mar 10' }, { t: 'Tell the bank', who: 'Y', done: true, due: '' }] },
    { name: 'Packing (Casey)', done: 0, total: 6, items: [{ t: 'Onsen-friendly sandals', who: 'C', done: false, due: '' }, { t: 'Camera + 2 batteries', who: 'C', done: false, due: '' }] },
    { name: 'Packing (Yasmim)', done: 0, total: 5, items: [{ t: 'Walking shoes, the real ones', who: 'Y', done: false, due: '' }] },
  ];
  const BUDGET = { planned: '$9,400', committed: '$5,120', paid: '$3,860', plannedJpy: '¥1,393,000', committedJpy: '¥758,800', paidJpy: '¥572,000', rate: '148.2', rows: [['Flights', '$3,680', 39], ['Stays', '$2,900', 31], ['Transport', '$720', 8], ['Food', '$1,400', 15], ['Tickets', '$700', 7]] };
  const DOCS = [{ name: 'JL5-eticket.pdf', of: 'JL 5 · JFK → HND', pages: 2 }, { name: 'yoshikawa-confirmation.pdf', of: 'Yoshikawa Inn', pages: 1 }, { name: 'teamlab-qr.png', of: 'teamLab Planets', pages: 1 }, { name: 'hotel-niwa.pdf', of: 'Hotel Niwa', pages: 3 }];
  window.OURS_PLANS = { PLANS, DAYS, UNSCHEDULED, IDEAS, BOOKINGS, LISTS, BUDGET, DOCS };
})();
