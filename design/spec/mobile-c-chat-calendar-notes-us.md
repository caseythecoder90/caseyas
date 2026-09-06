# Mobile spec C - Memory detail, Chat, Notes, Calendar, Us, Tab bar

Source: `design/Ours - mobile prototype.dc.html`
- Template: lines 481-694 (MEMORY DETAIL, CHAT, CALENDAR, NOTES, US, TAB BAR), 718-735 (NOTE COMPOSER sheet), 836-878 (EVENT SHEET, LIGHTBOX, OPENED SEALED NOTE).
- Logic: lines 900-1114 (`DETAIL`, `WAVE`, `EVENTS`, `MEM`, `renderVals()`).

All screens live inside the app shell scroll container (line 96):

```html
<div style="flex:1;overflow:auto;padding-top:54px;display:flex;flex-direction:column">  <!-- 54px = status bar clearance -->
```

The phone frame root (line 36) is `height:844px;display:flex;flex-direction:column;background:var(--bg);color:var(--fg1);font-family:var(--font-sans);font-size:15px;line-height:1.5;position:relative;overflow:hidden` (390 x 844). Global CSS: `*{box-sizing:border-box}`, `input,button{font:inherit}`, `.ours input::placeholder{color:var(--fg3)}`, `.ours input:focus{outline:2px solid var(--accent);outline-offset:2px}`, `.ours button:active{transform:translateY(1px)}`, scrollbars hidden. Sheets/overlays are `position:absolute` children of the phone root (not of the scroll container), so they cover the tab bar (z-index 20/21 over the tab bar's 6; lightbox is 30).

Note-color tokens used by this spec (already in the foundation): light `--n1:#f6ecd6; --n2:#e6ebdc; --n3:#f1ddd2; --n4:#e4e2ea`, dark `--n1:#2b2519; --n2:#222619; --n3:#2c201b; --n4:#232229`.

Every photo `<img>` in these screens carries `filter:sepia(.08) saturate(.88)`; avatars carry `filter:sepia(.2) saturate(.6)`. Image sources are picsum seeds in the prototype (`P(seed,w,h)` = `https://picsum.photos/seed/${seed}/${w}/${h}`); the implementation must call the mock image helper with the same seed and size instead of any external URL.

## Shared state / tweaks

- `herName` tweak (data-props, section People, default `'Yasmim'`): `her = p.herName ?? 'Yasmim'`; `herIni = her[0]`. Everywhere the copy says {{ her }} / {{ herIni }} it must come from this single value (prop/context), never hard-coded. `MEM[].by === 'her'` resolves to `her`.
- `theme`: `s.themeOverride ?? p.theme ?? 'light'`; `isDark = theme === 'dark'`. The Us screen writes `themeOverride`.
- `screen` values used here: `'detail' | 'chat' | 'calendar' | 'us'` (plus `'memories'`, `'plan'`, `'plans'`, `'today'`, `'gallery'`, `'composer'`, `'signin'` from other specs).
- `go(screen)` = `setState({ screen, sheet:false, ev:null, more:false, planSheet:false })`. It does NOT reset `chatSeg`, `detailId`, `lb`, `noteSheet`, `sealedOpen`, `draft`, or `typing`.
- State keys owned by this spec, with initial values:
  - `detailId: 3`, `reacted: ''`, `lb: null`, `favs: []`
  - `draft: ''`, `sent: []`, `typing: false`, `chatSeg: 'msgs'`
  - `ev: null`
  - `sealedOpen: false`, `sealedDone: false`
  - `noteSheet: false`, `noteDraft: ''`, `noteColor: 'n1'`, `sched: false`, `seal: false`, `addedNotes: []`
  - `notif: { push:true, email:false, quiet:true }`, `planNotif: { votes:true, comments:true, decisions:true, bookings:true }`, `optIn: { map:false, paste:false }`
  - `themeOverride` (unset), `locked: false`
- Toggle switch helper `tg(on)` = `{ bg: on ? 'var(--accent)' : 'var(--surface-2)', knob: on ? '19px' : '3px' }`. Switch markup everywhere: `<span style="width:40px;height:24px;border-radius:999px;background:{{bg}};position:relative;flex:none"><span style="position:absolute;top:3px;left:{{knob}};width:18px;height:18px;border-radius:999px;background:#faf9f6;transition:left 150ms"></span></span>`.
- Owner dot color `dotFor(o)`: `'c'` -> `var(--accent)` (Casey), `'h'` -> `var(--green)` (her), anything else (`'b'` both) -> `var(--fg1)`.

---

## 1. MEMORY DETAIL (`isDetail`, screen `'detail'`)

### Data

`MEM` (shared with Memories spec; the fields the detail uses):

```js
{ id:1, title:'Tuesday tacos, again',        date:'Sep 1, 2026',     loc:'Home',          type:'Everyday',   by:'her',   count:'3 photos',             img:P('tacos',600,600) }
{ id:2, title:'The night the power went out', date:'Aug 29, 2026',    loc:'Home',          type:'Everyday',   by:'Casey', count:'9 photos · 1 video',   img:P('candles',800,600) }
{ id:3, title:'Three days in Asheville',      date:'Aug 14–17, 2026', loc:'Asheville, NC', type:'Trip',       by:'Casey', count:'38 photos · 2 videos', img:P('asheville',1200,800) }
{ id:4, title:'Two years',                    date:'Jul 12, 2026',    loc:'Nonna’s',       type:'Milestone',  by:'her',   count:'12 photos',            img:P('twoyears',800,600) }
{ id:5, title:'Rooftop movie',                date:'Jul 3, 2026',     loc:'Downtown',      type:'Date night', by:'Casey', count:'1 photo',              img:P('rooftop',600,600) }
```

`DETAIL` (long-form body; keyed by memory id, `default` for all others):

```js
3: { take1a: 'We had a plan. The plan had trailheads and a start time. What actually happened is we found a biscuit place on the first morning and built the rest of the trip around going back to it.',
     quote: 'Nobody has ever regretted a second biscuit.',
     take1b: 'Saturday we did make it up to the parkway, late enough that the light was going gold. That’s the photo below. The creek incident is not pictured.',
     inline: P('parkway',900,600), inlineCap: 'Blue Ridge Parkway, 6:40 PM',
     take2: 'For the record, he fell in the creek. Fully. Shoes and all. Then he asked if I got it on video, and I had, and that is the video with 2 views because we’ve watched it twice.' }
default: { take1a: 'A small one, but it belongs here. The kind of night that doesn’t make it into any album unless you decide it does.',
     quote: 'The ordinary ones are the ones I forget first.',
     take1b: 'So here it is, written down before it goes.',
     inline: P('inlinedef',900,600), inlineCap: 'Kitchen, later than it should have been',
     take2: 'Not much to add. It was nice. Write more of these.' }
```

Derived `d`:
- `dm = MEM.find(id === s.detailId) || MEM[2]` (fallback is Asheville); `dd = DETAIL[dm.id] || DETAIL.default`.
- `d = { ...dm, ...dd, by: dm.by==='her' ? her : dm.by, ini: dm.by==='her' ? herIni : 'C', hasPlan: dm.id === 3, planName: 'Three days in Asheville', gallery }`.
- `gallery` (always 5 tiles, seed = the picsum seed of `dm.img`, e.g. `asheville`):
  1. `{ src: P(seed+'a',400,400), span: 2, video: true, dur: '0:42' }`
  2. `{ src: P(dm.id+'g2',400,400), span: 1 }`
  3. `{ src: P(dm.id+'g3',400,400), span: 1 }`
  4. `{ src: P(dm.id+'g4',400,400), span: 1 }`
  5. `{ src: P(dm.id+'g5',400,400), span: 1 }`
  each with `open: () => setState({ lb: i })`.
- Reactions: `[['loved it',2],['made me laugh',1],['miss this',0],['again please',0]]` -> `{ label, n: String(n + (reacted===label ? 1 : 0)), pick: () => setState({ reacted: reacted===label ? '' : label }), bg: active ? 'var(--accent-soft)' : 'transparent', border: active ? 'var(--accent)' : 'var(--border)' }`. Exactly one reaction can be active; tapping it again clears it.

### DOM

```html
<!-- floating header, over the hero -->
<div style="position:absolute;top:0;left:0;right:0;height:54px;z-index:3;display:flex;align-items:flex-end;padding:0 12px 6px;justify-content:space-between">
  <button onClick=back style="width:36px;height:36px;border-radius:8px;border:none;background:rgba(18,17,16,.5);color:#faf9f6;display:flex;align-items:center;justify-content:center;cursor:pointer">
    <svg 18x18 chevron-left: path "m15 18-6-6 6-6" stroke-width 1.5 round caps/joins>
  </button>
  <button style="(same box)"> <svg 18x18 three dots: circles (12,12) (19,12) (5,12) r=1> </button>   <!-- no action -->
</div>
<div style="margin-top:-54px;padding-bottom:110px">   <!-- pulls hero under the status bar -->
  <div style="height:360px;position:relative">
    <img src={d.img} style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.3),transparent 30%)"></div>
  </div>
  <div style="padding:20px 20px 0">
    <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)">{d.type}</div>
    <div style="font-family:var(--font-serif);font-size:38px;line-height:1;margin-top:8px">{d.title}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:12px;font-size:13px;color:var(--fg2);align-items:center">
      <span style="font-family:var(--font-mono);font-size:12px">{d.date}</span><span>·</span>
      <span style="display:inline-flex;align-items:center;gap:4px"><svg 13x13 map-pin: path "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" + circle (12,10) r=3>{d.loc}</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:14px;font-size:13px;color:var(--fg3)">
      <span style="width:24px;height:24px;border-radius:999px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px;color:var(--fg1)">{d.ini}</span>{d.by} · added 3 days ago
    </div>
    <!-- only when d.hasPlan -->
    <div onClick=goPlan style="margin-top:14px;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border);font-size:13px;cursor:pointer">
      <span style="display:flex;align-items:center;gap:8px"><svg 14x14 map (folded) icon: path "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" + "M15 5.764v15" + "M9 3.236v15">Planned in <span style="font-weight:500">{d.planName}</span></span>
      <span style="color:var(--accent)">Open →</span>
    </div>
  </div>
  <!-- gallery -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:20px">
    <!-- per tile g -->
    <div onClick=g.open style="position:relative;aspect-ratio:1;overflow:hidden;grid-column:span {g.span};cursor:pointer">
      <img src={g.src} style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
      <!-- when g.video -->
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span style="width:40px;height:40px;border-radius:999px;background:rgba(18,17,16,.6);display:flex;align-items:center;justify-content:center;color:#faf9f6"><svg 16x16 fill=currentColor polygon "6 3 20 12 6 21 6 3"></span></div>
      <div style="position:absolute;right:6px;bottom:6px;font-family:var(--font-mono);font-size:10px;color:#faf9f6;background:rgba(18,17,16,.6);padding:2px 5px;border-radius:4px">{g.dur}</div>
    </div>
  </div>
  <div style="padding:6px 20px 0;font-size:12px;color:var(--fg3);text-align:right">{d.count} · tap to open lightbox</div>

  <!-- Casey's take -->
  <div style="padding:28px 20px 0">
    <div style="display:flex;align-items:baseline;gap:10px"><span style="font-family:var(--font-serif);font-style:italic;font-size:22px">Casey's take</span><span style="flex:1;border-top:1px solid var(--border)"></span></div>
    <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:var(--fg1)">{d.take1a}</p>
    <blockquote style="margin:18px 0;padding:0 0 0 16px;border-left:1px solid var(--accent);font-family:var(--font-serif);font-size:22px;line-height:1.25;color:var(--fg1)">{d.quote}</blockquote>
    <p style="margin:0;font-size:16px;line-height:1.6;color:var(--fg1)">{d.take1b}</p>
    <img src={d.inline} style="width:100%;height:220px;object-fit:cover;border-radius:8px;margin-top:18px;filter:sepia(.08) saturate(.88)" alt="">
    <div style="font-size:12px;color:var(--fg3);margin-top:6px;font-family:var(--font-mono)">{d.inlineCap}</div>
  </div>
  <!-- Her take (separate section, never merged) -->
  <div style="padding:32px 20px 0">
    <div style="display:flex;align-items:baseline;gap:10px"><span style="font-family:var(--font-serif);font-style:italic;font-size:22px">{her}'s take</span><span style="flex:1;border-top:1px solid var(--border)"></span></div>
    <p style="margin:14px 0 0;font-size:16px;line-height:1.6">{d.take2}</p>
  </div>

  <!-- reactions -->
  <div style="margin:28px 20px 0;display:flex;gap:8px;align-items:center">
    <button onClick=r.pick style="height:34px;padding:0 12px;border-radius:4px;border:1px solid {r.border};background:{r.bg};color:var(--fg1);font-size:13px;cursor:pointer;display:flex;gap:6px;align-items:center;font-family:var(--font-serif);font-style:italic">{r.label}<span style="font-family:var(--font-mono);font-style:normal;font-size:11px;color:var(--fg3)">{r.n}</span></button>
    (x4)
  </div>
  <!-- comments (static) -->
  <div style="margin:24px 20px 0;padding-top:20px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;gap:10px"><span style="width:28px;height:28px;border-radius:999px;background:var(--green-soft);color:var(--green);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px;flex:none">{herIni}</span><div><div style="font-size:14px;line-height:1.5">You left out the part where you fell in the creek.</div><div style="font-size:11px;color:var(--fg3);font-family:var(--font-mono);margin-top:3px">{her} · Aug 18</div></div></div>
    <div style="display:flex;gap:10px"><span style="(same) background:var(--accent-soft);color:var(--accent)">C</span><div><div style="font-size:14px;line-height:1.5">Artistic license.</div><div style="font-size:11px;color:var(--fg3);font-family:var(--font-mono);margin-top:3px">Casey · Aug 18</div></div></div>
    <input placeholder="Say something…" style="height:44px;border-radius:8px;border:1px solid var(--border);background:var(--surface);padding:0 14px;color:var(--fg1);font-size:14px">   <!-- uncontrolled, no submit -->
  </div>
  <div style="display:flex;gap:8px;margin:24px 20px 0">
    <button style="flex:1;height:44px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:14px;font-weight:500;cursor:pointer">Edit</button>
    <button style="(same)">Add to album</button>
  </div>
</div>
```

The two comments are hard-coded (the same on every memory). "added 3 days ago" is hard-coded.

### Interactions

- `back` -> `go('memories')` (always Memories, even when the detail was opened from Chat).
- `goPlan` (Planned-in strip, id 3 only) -> `setState({ screen:'plan', planId:'japan', planSeg:'overview' })` (prototype quirk: opens the Japan plan, not Asheville; keep it).
- Gallery tile tap -> `lb = index` opens the LIGHTBOX (below).
- Reaction tap toggles `reacted` (single-select); count increments by 1 while selected.
- Tab bar: Memories tab is highlighted while on `detail`.

### LIGHTBOX (`lbOpen = s.lb !== null && s.screen === 'detail'`)

Data: `lbi = s.lb ?? 0`, `lbg = d.gallery[lbi]`; `CAPS = ['The creek, moments before.', 'Biscuit place, morning two.', 'Parkway pull-off.', 'Somebody’s porch, not ours.', 'Last morning. Packed the car twice.']`.
`lb = { src: lbg.src.replace('/400/400','/900/900'), pos: (lbi+1)+' of '+5, cap: CAPS[lbi], meta: d.date.split('–')[0].trim() + ' · ' + d.by, favLabel: favs.includes(lbi) ? 'Favorited' : 'Favorite', favBg: fav ? 'var(--accent-soft)' : 'transparent', favBorder: fav ? 'var(--accent)' : '#2e2b26' }`.

```html
<div style="position:absolute;inset:0;background:#121110;z-index:30;display:flex;flex-direction:column;color:#faf9f6">   <!-- always dark, literal colors -->
  <div style="display:flex;justify-content:space-between;align-items:center;padding:58px 16px 0">
    <button onClick=closeLb style="width:36px;height:36px;border-radius:8px;border:none;background:rgba(250,249,246,.1);color:#faf9f6;display:flex;align-items:center;justify-content:center;cursor:pointer"><svg 18x18 X: "M18 6 6 18" "m6 6 12 12"></button>
    <span style="font-family:var(--font-mono);font-size:12px;color:#a8a49a">{lb.pos}</span>
    <button style="(same box)"><svg three dots></button>
  </div>
  <div onClick=nextLb style="flex:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:16px 0"><img src={lb.src} style="width:100%;max-height:100%;object-fit:contain;display:block;filter:sepia(.08) saturate(.88)" alt=""></div>
  <div style="padding:0 20px 44px;display:flex;flex-direction:column;gap:14px">
    <div style="font-family:var(--font-serif);font-size:20px;line-height:1.3;color:#faf9f6">{lb.cap}</div>
    <div style="font-family:var(--font-mono);font-size:11px;color:#6e6a61">{lb.meta} · swipe for next</div>
    <div style="display:flex;gap:8px">
      <button onClick=shareLb style="flex:1;height:44px;border-radius:8px;border:1px solid #2e2b26;background:transparent;color:#faf9f6;font-size:14px;font-weight:500;cursor:pointer">Share to chat</button>
      <button onClick=favLb style="flex:1;height:44px;border-radius:8px;border:1px solid {lb.favBorder};background:{lb.favBg};color:#faf9f6;font-size:14px;font-weight:500;cursor:pointer">{lb.favLabel}</button>
    </div>
  </div>
</div>
```

- `closeLb` -> `lb:null`. `nextLb` (tap the image) -> `lb = (lbi+1) % 5`. `favLb` toggles `lbi` in `favs`.
- `shareLb` -> `setState({ lb:null, screen:'chat', sent:[...sent, { id:Date.now(), from:'me', type:'photo', img: lbg.src, time:'Delivered' }] })` - drops the 400x400 tile into the conversation and switches to Chat (whatever `chatSeg` currently is).

---

## 2. CHAT (`isChat`, screen `'chat'`)

### Header (shown for both segments)

```html
<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 20px 12px;border-bottom:1px solid var(--border)">
  <div style="display:flex;align-items:center;gap:12px">
    <span style="width:36px;height:36px;border-radius:999px;overflow:hidden;flex:none"><img src=P('herav',80,80) style="width:100%;height:100%;object-fit:cover;filter:sepia(.2) saturate(.6)" alt=""></span>
    <div><div style="font-family:var(--font-serif);font-size:22px;line-height:1">{her}</div><div style="font-size:12px;color:var(--green);margin-top:2px">Active now</div></div>
  </div>
  <div style="display:flex;gap:2px;padding:2px;border-radius:6px;background:var(--surface-2);font-size:13px">
    <button onClick=segMsgs  style="height:30px;padding:0 12px;border-radius:4px;border:none;background:{segMsgBg};color:var(--fg1);cursor:pointer;font-weight:500">Messages</button>
    <button onClick=segNotes style="height:30px;padding:0 12px;border-radius:4px;border:none;background:{segNoteBg};color:var(--fg1);cursor:pointer;font-weight:500;position:relative">Notes
      <!-- when hasUnopened --><span style="position:absolute;top:4px;right:2px;width:6px;height:6px;border-radius:999px;background:var(--accent)"></span>
    </button>
  </div>
</div>
```

- `segMsgBg = chatSeg==='msgs' ? 'var(--bg)' : 'transparent'`, `segNoteBg = chatSeg==='notes' ? 'var(--bg)' : 'transparent'`.
- `hasUnopened = !sealedDone` -> accent dot on the Notes segment.
- `chatSeg` persists when leaving and returning to Chat.

### Messages segment (`isChatMsgs = screen==='chat' && chatSeg==='msgs'`)

Data `base` (then `...s.sent` appended):

```js
{ id:1, from:'h',  type:'text',     text:'Did you see the sky on your way home', time:'9:38 PM' }
{ id:2, from:'me', type:'photo',    img:P('sunset',480,360), time:'9:40 PM' }
{ id:3, from:'h',  type:'photos',   imgs:[P('p1',200,200),P('p2',200,200),P('p3',200,200),P('p4',200,200)] (as {src}), time:'9:40 PM' }
{ id:4, from:'me', type:'voice',    dur:'0:42', time:'9:41 PM' }
{ id:5, from:'h',  type:'memory',   img:P('asheville',600,300), title:'Three days in Asheville', sub:'Aug 14–17 · 38 photos', memId:3, time:'9:41 PM' }
{ id:6, from:'h',  type:'link',     url:'resy.com/nonnas', title:'Nonna’s — Reserve a table', domain:'resy.com', time:'9:42 PM' }
{ id:7, from:'me', type:'text',     text:'Booked for Friday. 7.', time:'Seen 9:42 PM' }          // read receipt lives in the meta line
{ id:8, from:'h',  type:'planitem', kind:'activity', title:'Fushimi Inari at sunrise', sub:'Japan, spring 2027 · unscheduled · put it on day 6?', time:'9:44 PM' }
```

Per-message derived: `self/items = from==='me' ? 'flex-end' : 'flex-start'`; `bg = from==='me' ? 'var(--surface-2)' : 'var(--surface)'`; `meta = time`; `openMem: () => setState({ screen:'detail', detailId: m.memId })`; `openPlan: () => setState({ screen:'plan', planSeg:'itinerary' })`.

`WAVE` (30 bars): `h = (6 + round(|sin(i*1.7)*14 + cos(i*.8)*4|)) + 'px'`, `c = i < 12 ? 'var(--fg1)' : 'var(--fg3)'` (first 12 bars "played"). Computed heights, i = 0..29: `10,23,10,22,9,15,15,12,22,14,20,11,16,10,19,14,22,12,17,13,10,21,9,23,10,18,8,15,16,19`.

```html
<!-- pinned bar -->
<div style="display:flex;gap:8px;align-items:center;padding:8px 20px;background:var(--surface);border-bottom:1px solid var(--border);font-size:13px;color:var(--fg2)">
  <svg 14x14 pin: "M12 17v5" + "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z">
  <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Pinned · "Gate code is 4471, garage is the birthday"</span>
  <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">2</span>
</div>
<!-- thread -->
<div style="flex:1;display:flex;flex-direction:column;gap:10px;padding:16px 16px 12px">
  <div style="text-align:center;font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;color:var(--fg3);text-transform:uppercase;margin:4px 0 8px">Today</div>   <!-- single date separator -->
  <!-- per message m -->
  <div style="display:flex;flex-direction:column;align-self:{m.self};max-width:78%;gap:4px;align-items:{m.items}">
    text:     <div style="padding:10px 14px;border-radius:12px;background:{m.bg};color:var(--fg1);font-size:15px;line-height:1.45;border:1px solid var(--border)">{m.text}</div>
    photo:    <img src={m.img} style="width:240px;height:180px;object-fit:cover;border-radius:12px;display:block;filter:sepia(.08) saturate(.88)" alt="">
    photos:   <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;width:240px;border-radius:12px;overflow:hidden"> 4x <img src={p.src} style="width:100%;aspect-ratio:1;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt=""> </div>
    voice:    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:{m.bg};border:1px solid var(--border);width:240px">
                <span style="width:28px;height:28px;border-radius:999px;background:var(--fg1);color:var(--bg);display:flex;align-items:center;justify-content:center;flex:none"><svg 12x12 fill=currentColor polygon "6 3 20 12 6 21 6 3"></span>
                <div style="flex:1;display:flex;align-items:center;gap:2px;height:24px"> 30x <span style="flex:1;height:{w.h};background:{w.c};border-radius:1px"></span> </div>
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg2)">{m.dur}</span>
              </div>
    memory:   <div onClick=m.openMem style="width:260px;border-radius:12px;overflow:hidden;border:1px solid var(--border);background:var(--surface);cursor:pointer">
                <img src={m.img} style="width:100%;height:120px;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt="">
                <div style="padding:10px 12px 12px"><div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)">Memory</div><div style="font-family:var(--font-serif);font-size:20px;line-height:1.1;margin-top:3px">{m.title}</div><div style="font-size:12px;color:var(--fg3);margin-top:3px">{m.sub}</div></div>
              </div>
    planitem: <div onClick=m.openPlan style="width:260px;border-radius:12px;border:1px solid var(--border);background:var(--surface);cursor:pointer;padding:12px 14px;display:flex;flex-direction:column;gap:4px;border-left:2px solid var(--accent)">
                <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)">Plan item · {m.kind}</div>
                <div style="font-family:var(--font-serif);font-size:20px;line-height:1.1">{m.title}</div>
                <div style="font-size:12px;color:var(--fg3)">{m.sub}</div>
              </div>
    link:     <div style="width:260px;border-radius:12px;overflow:hidden;border:1px solid var(--border);background:{m.bg}">
                <div style="padding:10px 14px;font-size:15px;color:var(--accent)">{m.url}</div>
                <div style="border-top:1px solid var(--border);padding:10px 14px;display:flex;gap:10px;align-items:center"><span style="width:40px;height:40px;border-radius:6px;background:var(--surface-2);flex:none"></span><div style="min-width:0"><div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{m.title}</div><div style="font-size:12px;color:var(--fg3)">{m.domain}</div></div></div>
              </div>
    <div style="font-family:var(--font-mono);font-size:10px;color:var(--fg3);padding:0 4px">{m.meta}</div>   <!-- timestamp / "Seen 9:42 PM" / "Delivered" -->
  </div>
  <!-- when typing -->
  <div style="align-self:flex-start;padding:10px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--border);font-size:13px;color:var(--fg3);font-style:italic;font-family:var(--font-serif)">{her} is typing…</div>
</div>
<!-- composer -->
<div style="position:sticky;bottom:0;padding:10px 12px 12px;background:var(--bg);border-top:1px solid var(--border);display:flex;gap:8px;align-items:center">
  <button style="width:40px;height:40px;border:none;background:transparent;color:var(--fg2);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none"><svg 20x20 camera: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" + circle (12,13) r=3></button>   <!-- no action -->
  <input value={draft} onChange=onDraft onKeyDown=onDraftKey placeholder="Message {her}" style="flex:1;height:40px;border-radius:8px;border:1px solid var(--border);background:var(--surface);padding:0 14px;color:var(--fg1);font-size:15px">
  <button onClick=send style="width:40px;height:40px;border-radius:8px;border:none;background:{sendBg};color:{sendFg};display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none">
    hasDraft: <svg 18x18 send: "m22 2-7 20-4-9-9-4Z" + "M22 2 11 13">
    noDraft:  <svg 18x18 mic: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" + "M19 10v2a7 7 0 0 1-14 0v-2" + "M12 19v3">
  </button>
</div>
```

- `sendBg = draft ? 'var(--accent)' : 'transparent'`, `sendFg = draft ? '#faf9f6' : 'var(--fg2)'`; `hasDraft = !!draft`, `noDraft = !draft` (untrimmed).
- `send()`: `if (!draft.trim()) return; setState({ sent:[...sent, { id:Date.now(), from:'me', type:'text', text:draft, time:'Delivered' }], draft:'', typing:true }); setTimeout(() => setState({ typing:false }), 2500)`. Sent messages append after the plan-item card, right-aligned, meta "Delivered". No reply is ever generated.
- `onDraft` = value change; `onDraftKey`: `Enter` -> `send()`.
- Tapping the memory card opens that memory's detail; tapping the plan-item card opens the plan Itinerary.
- Layout note: in the prototype the composer is `position:sticky;bottom:0` inside the scroll container, whose bottom edge sits under the 88px absolute tab bar. The implementation should keep the sticky composer visible above the tab bar (e.g. `bottom:88px`, or the thread gets the tab bar's height as bottom padding) - the visual is the same composer bar; only its resting offset differs.

---

## 3. NOTES (`isChatNotes = screen==='chat' && chatSeg==='notes'`)

Rendered under the Chat header (the same header from section 2; the Chat block's messages part is hidden). In the DOM the NOTES block sits after CALENDAR, but the calendar is not shown on this screen, so visually it follows the header directly.

Data `notes = [...addedNotes, ...fixed]` where fixed:

```js
{ body:'Coffee’s in the thermos. The good beans, not the emergency ones.',                 color:'n1', from:her,     time:'This morning', span:1 }
{ body:'Reminder that you said you’d fix the porch light. Reminder from me, not the light.', color:'n2', from:'Casey', time:'Yesterday',    span:1 }
{ body:'Found this in the glovebox.',                                                        color:'n3', from:her,     time:'Aug 30',       span:2, hasPhoto:true, photo:P('glovebox',600,300) }
{ body:'Happy birthday. Check the freezer.',                                                 color:'n4', from:'Casey', time:'Scheduled',    span:1, scheduled:true, when:'Appears Oct 3, 7:00 AM' }
{ body:'You hummed the whole drive back. You didn’t notice.',                               color:'n1', from:her,     time:'Aug 22',       span:1 }
```

Note shape: `{ body, color:'n1'|'n2'|'n3'|'n4', from, time, span:1|2, hasPhoto?, photo?, scheduled?, when? }`. `color` maps to `background:var(--n1)` etc.

```html
<div style="padding:16px 20px 0;display:flex;align-items:center;justify-content:space-between">
  <div style="font-size:13px;color:var(--fg2)">Notes stay here. They don't scroll away like messages.</div>
  <button onClick=openNoteSheet style="height:36px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;flex:none"><svg 14x14 plus: "M5 12h14" "M12 5v14">Leave a note</button>
</div>
<!-- when hasUnopened (= !sealedDone) -->
<div style="padding:20px 20px 0">
  <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:10px">Unopened · 1</div>
  <div onClick=openSealed style="border-radius:8px;border:1px solid var(--border);background:var(--surface);padding:22px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;text-align:center">
    <span style="color:var(--accent)"><svg 32x32 mail: rect 20x16 at (2,4) rx=2 + "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke-width 1.5 round></span>
    <div style="font-family:var(--font-serif);font-size:22px;line-height:1.1">A sealed note from {her}</div>
    <div style="font-size:13px;color:var(--fg2)">Left Sep 5 · tap to open</div>
  </div>
</div>
<!-- board -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:20px 20px 110px;align-items:start">
  <!-- per note n -->
  <div style="border-radius:8px;padding:16px;background:var(--{n.color});border:1px solid var(--border);grid-column:span {n.span};display:flex;flex-direction:column;gap:10px">
    hasPhoto:  <img src={n.photo} style="width:100%;height:110px;object-fit:cover;border-radius:6px;filter:sepia(.08) saturate(.88)" alt="">
    <div style="font-size:15px;line-height:1.45;color:var(--fg1)">{n.body}</div>
    scheduled: <div style="font-size:11px;color:var(--fg3);font-family:var(--font-mono);display:flex;gap:6px;align-items:center"><svg 12x12 clock: circle r=10 + "M12 6v6l4 2">{n.when}</div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:auto;gap:8px;flex-wrap:wrap"><span style="font-family:var(--font-serif);font-style:italic;font-size:16px;color:var(--fg2);white-space:nowrap">— {n.from}</span><span style="font-family:var(--font-mono);font-size:10px;color:var(--fg3);white-space:nowrap">{n.time}</span></div>
  </div>
</div>
```

### OPENED SEALED NOTE overlay (`sealedOpen`)

```html
<div onClick=closeSealed style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:20"></div>
<div style="position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);z-index:21;background:var(--n1);border:1px solid var(--border);border-radius:8px;padding:28px 24px;display:flex;flex-direction:column;gap:16px;box-shadow:var(--shadow-md)">
  <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Sealed Sep 5 · opened just now</div>
  <div style="font-family:var(--font-serif);font-size:24px;line-height:1.25">You were asleep before I got home and I didn't want to wake you. The porch light was on. That's the whole note, really.</div>
  <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-family:var(--font-serif);font-style:italic;font-size:18px;color:var(--fg2)">— {her}</span><a onClick=closeSealed style="font-size:14px;cursor:pointer">Keep it →</a></div>   <!-- <a> = accent color, no underline (global a rule) -->
</div>
```

- `openSealed` -> `sealedOpen:true`. `closeSealed` (scrim or "Keep it →") -> `sealedOpen:false, sealedDone:true`.
- Once `sealedDone`: the Unopened block disappears, the Notes segment dot disappears, and the Chat tab badge drops from 3 to 2. The opened note is NOT added to the board.

### NOTE COMPOSER sheet (`noteSheet`)

Derived: `noteColors = ['n1','n2','n3','n4'].map(k => ({ k, pick: () => setState({ noteColor:k }), border: noteColor===k ? 'var(--fg1)' : 'var(--border)' }))`; `schedBg/schedKnob = tg(sched)`; `sealBg/sealKnob = tg(seal)`; `schedNote = sched ? 'Oct 3, 7:00 AM' : 'appears now'`; `leaveLabel = seal ? 'Seal it and leave it' : sched ? 'Schedule it' : 'Leave it on the fridge'`.

```html
<div onClick=closeNoteSheet style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:20"></div>
<div style="position:absolute;left:0;right:0;bottom:0;z-index:21;background:var(--bg);border-radius:12px 12px 0 0;padding:12px 20px 40px;display:flex;flex-direction:column;gap:14px;border-top:1px solid var(--border)">
  <div style="width:36px;height:4px;border-radius:999px;background:var(--border);margin:0 auto"></div>
  <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-family:var(--font-serif);font-size:26px">Leave a note</span><span style="font-size:12px;color:var(--fg3)">for {her}</span></div>
  <div style="border-radius:8px;padding:16px;background:var(--{noteColor});border:1px solid var(--border);display:flex;flex-direction:column;gap:12px;min-height:150px;transition:background 200ms">
    <textarea value={noteDraft} onChange=onNoteDraft placeholder="No title. Just say it." style="flex:1;min-height:70px;border:none;background:transparent;resize:none;font-size:16px;line-height:1.5;color:var(--fg1);padding:0;font-family:var(--font-sans)"></textarea>
    <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-family:var(--font-serif);font-style:italic;font-size:16px;color:var(--fg2)">— Casey</span><button style="height:30px;padding:0 10px;border-radius:6px;border:1px dashed var(--border);background:transparent;color:var(--fg2);font-size:12px;cursor:pointer">+ photo</button></div>   <!-- no action -->
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center">
    <span style="display:flex;gap:8px"> 4x <button onClick=c.pick style="width:28px;height:28px;border-radius:999px;background:var(--{c.k});border:2px solid {c.border};cursor:pointer"></button> </span>
    <span style="font-size:12px;color:var(--fg3)">color</span>
  </div>
  <div style="display:flex;flex-direction:column;border-top:1px solid var(--border)">
    <div onClick=toggleSched style="display:flex;justify-content:space-between;align-items:center;min-height:48px;font-size:14px;cursor:pointer"><span>Schedule it<span style="color:var(--fg3)"> · {schedNote}</span></span>{switch schedBg/schedKnob}</div>
    <div onClick=toggleSeal style="display:flex;justify-content:space-between;align-items:center;min-height:48px;font-size:14px;cursor:pointer;border-top:1px solid var(--border)"><span>Seal it<span style="color:var(--fg3)"> · {her} has to open it</span></span>{switch sealBg/sealKnob}</div>
  </div>
  <button onClick=leaveNote style="height:48px;border-radius:8px;border:none;background:var(--fg1);color:var(--bg);font-weight:500;font-size:15px;cursor:pointer">{leaveLabel}</button>
</div>
```

- `openNoteSheet` -> `noteSheet:true`; `closeNoteSheet` (scrim) -> `noteSheet:false` (draft, color, sched, seal are kept).
- `leaveNote`: `if (!noteDraft.trim()) return;` then `setState({ noteSheet:false, noteDraft:'', addedNotes:[{ body:noteDraft, color:noteColor, from:'Casey', time: sched ? 'Scheduled' : 'Just now', span:1, scheduled:sched, when:'Appears Oct 3, 7:00 AM' }, ...addedNotes] })`. New notes go to the FRONT of the board. `noteColor`, `sched`, `seal` are not reset. Sealing has no effect on the stored note (it lands on the board like any other).

---

## 4. CALENDAR (`isCalendar`, screen `'calendar'`)

### Data

`EVENTS` keyed by September day number:

```js
2:  { title:'Farmers market',         kind:'Event',     owner:'b', when:'Wed Sep 2 · 9:00 AM',        rule:'Every Wednesday',        loc:'Union Square', past:true }
8:  { title:'Dentist',                kind:'Reminder',  owner:'c', when:'Tue Sep 8 · 2:30 PM',        rule:'Does not repeat',        loc:'Elm St Dental' }
10: { title:'Book club',              kind:'Recurring', owner:'h', when:'Thu Sep 10 · 7:00 PM',       rule:'Every second Thursday',  loc:'Rosa’s place' }
11: { title:'Dinner at Nonna’s',      kind:'Event',     owner:'b', when:'Fri Sep 11 · 7:00 PM',       rule:'Does not repeat',        loc:'Nonna’s, 14 Grove St' }
19: { title:'Casey’s parents visit',  kind:'All day',   owner:'b', when:'Sat Sep 19 – Sun Sep 20',    rule:'Does not repeat',        loc:'Home' }
25: { title:'Pay the car',            kind:'Recurring', owner:'c', when:'Fri Sep 25',                 rule:'Monthly on the 25th',    loc:'' }
```

`PLAN_BARS` (Lake weekend, spans Sat 12 - Sun 13):

```js
12: { bg:'var(--green)', label:'Lake weekend', l:'2px',  r:'-2px', rad:'3px 0 0 3px' }
13: { bg:'var(--green)', label:'',             l:'-2px', r:'2px',  rad:'0 3px 3px 0' }
```

`days` = one leading blank cell `{ n:'', blank:true }` (Sep 1, 2026 is a Tuesday; the week starts Monday) followed by 30 cells, n = 1..30. Today = 6. For each cell:

- `e = EVENTS[n]`, `pb = PLAN_BARS[n]`, `today = n === 6`
- `pick`: `e ? () => setState({ ev:n }) : pb ? () => setState({ screen:'plan', planSeg:'overview' }) : () => {}` (event days open the event sheet; plan-bar days open the plan; other days do nothing; the blank cell has no handler and renders every binding empty)
- `bg = e ? 'var(--surface)' : 'transparent'`
- `color = today ? '#faf9f6' : 'var(--fg1)'`; `todayBg = today ? 'var(--accent)' : 'transparent'`
- `dot1 = e ? (e.owner==='b' ? 'var(--accent)' : dotFor(e.owner)) : 'transparent'` -> Casey accent, her green, both accent
- `dot2 = e && e.owner==='b' ? 'var(--green)' : 'transparent'` -> second (green) dot only for "both"
- `bar = pb ? pb.label : ''`, `barBg = pb ? pb.bg : 'transparent'`, `barL = pb ? pb.l : '0'`, `barR = pb ? pb.r : '0'`, `barRad = pb ? pb.rad : '0'`, `barZ = pb && pb.label ? 2 : 1` (the labelled left half is stacked above so its text overflows across the right half)

`agenda` (Upcoming): rows for EVENTS 8, 10, 11, 19 mapped as `{ day:String(n), dow: when.slice(0,3), title, sub, dot: dotFor(owner), right: loc, rightColor:'var(--fg3)', pick: () => setState({ ev:n }) }` where `sub = when.split('· ')[1] ? when.split('· ')[1] + (rule.startsWith('Every') ? ' · ' + rule : '') : when`, plus three fixed rows, sorted by day with Oct -> 1000 and Apr -> 2000. Resulting order and values:

| day | dow | dot | title | badge | sub | right (color) | pick |
|---|---|---|---|---|---|---|---|
| 8 | Tue | accent | Dentist | none | 2:30 PM | Elm St Dental (fg3) | ev 8 |
| 10 | Thu | green | Book club | none | 7:00 PM · Every second Thursday | Rosa’s place (fg3) | ev 10 |
| 11 | Fri | fg1 | Dinner at Nonna’s | none | 7:00 PM | Nonna’s, 14 Grove St (fg3) | ev 11 |
| 12 | Sat | green | Lake weekend | `plan` | Sep 12 – 13 · Lake Lure · check-in 3 PM | in 6 days (fg3) | screen 'plan', planSeg 'overview' |
| 19 | Sat | fg1 | Casey’s parents visit | none | Sat Sep 19 – Sun Sep 20 | Home (fg3) | ev 19 |
| 18 | Oct | fg1 | Anniversary | none | Oct 18 → every year | in 42 days (accent) | none |
| 8 | Apr | accent | Japan, spring 2027 | `plan` | JL 5 · JFK → HND · 12:55 PM | in 214 days (accent) | screen 'plan', planSeg 'overview' |

(`dow` is rendered uppercase by CSS; the badge text `plan` is also uppercased by CSS.)

### DOM

```html
<div style="padding:8px 20px 0;display:flex;align-items:flex-end;justify-content:space-between">
  <div><div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">2026</div><div style="font-family:var(--font-serif);font-size:36px;line-height:1">September</div></div>
  <div style="display:flex;gap:4px;font-size:12px;color:var(--fg2)"><span style="padding:6px 10px;border-radius:4px;background:var(--surface-2);color:var(--fg1);font-weight:500">Month</span><span style="padding:6px 10px">Agenda</span></div>   <!-- static, Month selected -->
</div>
<!-- quick-add (static, placeholder-styled) -->
<div style="margin:16px 20px 0;display:flex;align-items:center;gap:10px;height:44px;padding:0 14px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--fg3);font-size:14px"><svg 16x16 plus>Dinner at Nonna's Fri 7pm</div>
<!-- weekday header -->
<div style="display:grid;grid-template-columns:repeat(7,1fr);padding:16px 14px 0;text-align:center;font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;color:var(--fg3)"><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span><span>SU</span></div>
<!-- month grid -->
<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:6px 14px 0">
  <!-- per day d (31 cells incl. blank) -->
  <div onClick=d.pick style="height:54px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:4px;gap:3px;border-radius:8px;background:{d.bg};cursor:pointer;position:relative">
    <span style="width:26px;height:26px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:14px;color:{d.color};background:{d.todayBg};font-family:var(--font-mono)">{d.n}</span>
    <span style="display:flex;gap:3px;height:4px"><span style="width:4px;height:4px;border-radius:999px;background:{d.dot1}"></span><span style="width:4px;height:4px;border-radius:999px;background:{d.dot2}"></span></span>
    <span style="position:absolute;left:{d.barL};right:{d.barR};bottom:2px;height:12px;background:{d.barBg};border-radius:{d.barRad};font-family:var(--font-mono);font-size:8px;color:#faf9f6;line-height:12px;padding-left:4px;white-space:nowrap;overflow:visible;z-index:{d.barZ}">{d.bar}</span>
  </div>
</div>
<!-- legend -->
<div style="display:flex;gap:14px;padding:12px 20px 0;font-size:11px;color:var(--fg3);font-family:var(--font-mono)">
  <span style="display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:999px;background:var(--accent)"></span>Casey</span>
  <span style="(same)"><span style="... background:var(--green)"></span>{her}</span>
  <span style="(same)"><span style="... background:var(--fg1)"></span>Both</span>
</div>
<!-- upcoming -->
<div style="padding:20px 20px 110px;display:flex;flex-direction:column">
  <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3);margin-bottom:8px">Upcoming</div>
  <!-- per agenda row e -->
  <div onClick=e.pick style="display:grid;grid-template-columns:44px 1fr auto;gap:12px;padding:12px 0;border-top:1px solid var(--border);cursor:pointer;align-items:center">
    <div style="font-family:var(--font-serif);line-height:1"><div style="font-size:24px">{e.day}</div><div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;color:var(--fg3);text-transform:uppercase">{e.dow}</div></div>
    <div style="min-width:0">
      <div style="font-size:15px;font-weight:500;display:flex;align-items:center;gap:8px"><span style="width:6px;height:6px;border-radius:999px;background:{e.dot};flex:none"></span>{e.title}
        <!-- when e.plan --><span style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:{e.dot};border:1px solid {e.dot};padding:1px 5px;border-radius:3px">{e.plan}</span>
      </div>
      <div style="font-size:12px;color:var(--fg2);margin-top:2px">{e.sub}</div>
    </div>
    <div style="font-family:var(--font-mono);font-size:11px;color:{e.rightColor};text-align:right">{e.right}</div>
  </div>
</div>
```

### EVENT SHEET (`evOpen = !!s.ev`)

`ev = { ...EVENTS[s.ev], dot: dotFor(owner), loc: loc || 'No location', past: !!past, future: !past }`.

```html
<div onClick=closeEv style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:20"></div>
<div style="position:absolute;left:0;right:0;bottom:0;z-index:21;background:var(--bg);border-radius:12px 12px 0 0;padding:12px 20px 40px;display:flex;flex-direction:column;gap:14px;border-top:1px solid var(--border)">
  <div style="width:36px;height:4px;border-radius:999px;background:var(--border);margin:0 auto"></div>
  <div style="display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)"><span style="width:8px;height:8px;border-radius:999px;background:{ev.dot}"></span>{ev.kind}</div>
  <div style="font-family:var(--font-serif);font-size:30px;line-height:1.05">{ev.title}</div>
  <div style="font-size:15px;color:var(--fg1)">{ev.when}</div>
  <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--fg2);padding-top:8px;border-top:1px solid var(--border)"><div>{ev.rule}</div><div>Remind: push 1 hour before · email the morning of</div><div>{ev.loc}</div></div>
  past:   <button onClick=closeEv style="height:48px;border-radius:8px;border:none;background:var(--accent);color:#faf9f6;font-weight:500;font-size:15px;cursor:pointer">Add a memory from this →</button>
  future: <button onClick=closeEv style="height:48px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--fg1);font-weight:500;font-size:15px;cursor:pointer">Edit</button>
</div>
```

- Opens from a day cell with an event (2, 8, 10, 11, 19, 25) or an agenda row for 8/10/11/19. Day 2 is the only `past` event (accent CTA). Day 25 has `loc:''` -> "No location".
- `closeEv` (scrim, Edit, Add a memory) -> `ev:null`. Tab navigation also clears `ev` via `go()`.
- Day 12/13 (plan bar) tap and the Lake weekend / Japan agenda rows -> `screen:'plan', planSeg:'overview'` (planId is left as-is, i.e. Japan by default).

---

## 5. US (`isUs`, screen `'us'`)

### Data

- `stats = [{n:'599',l:'memories'},{n:'4,812',l:'photos'},{n:'37',l:'places'},{n:'5',l:'trips'},{n:'786',l:'days'}]`
- `security` rows `{ t, d, r, c }`:
  - `Password` / `Changed 4 months ago` / `Change` / fg2
  - `Authenticator` / `TOTP · 8 backup codes left` / `On` / `var(--green)`
  - `Passkeys` / `Casey’s iPhone · MacBook` / `2` / fg2
  - `Active sessions` / `This phone · Chrome on Mac` / `2` / fg2
  - `Recent logins` / `Today 9:41 PM · Sep 4 · Sep 2` / `View` / fg2
- `notifs` from `[['push','Push','Messages, notes, calendar reminders'],['email','Email','Weekly digest of new memories'],['quiet','Quiet hours','10 PM – 7 AM, both timezones']]` -> `{ t, d, ...tg(notif[k]), toggle: () => setState({ notif:{...notif,[k]:!notif[k]} }) }`
- `planNotifs` from `[['votes','Votes'],['comments','Comments'],['decisions','Decisions'],['bookings','Bookings']]` -> `{ t, on: planNotif[k], color: on ? 'var(--fg1)' : 'var(--fg3)', border: on ? 'var(--accent)' : 'var(--border)', bg: on ? 'var(--accent)' : 'transparent', toggle }`
- `optIns` from `[['map','Map view','Shows plan items and memories on a map. Loads map tiles from a third party.'],['paste','Paste a confirmation','Turns pasted text or screenshots into a booking form. Runs on your device only.']]` -> `{ t, d, ...tg(optIn[k]), toggle }`
- `lightBtnBg = theme==='light' ? 'var(--bg)' : 'transparent'`, `darkBtnBg = theme==='dark' ? 'var(--bg)' : 'transparent'`.

### DOM

```html
<div style="padding:8px 20px 110px;display:flex;flex-direction:column;gap:28px">
  <div style="font-family:var(--font-serif);font-size:36px;line-height:1">Us</div>
  <!-- two person cards -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border)"><span style="width:64px;height:64px;border-radius:999px;overflow:hidden"><img src=P('caseyav',128,128) style="width:100%;height:100%;object-fit:cover;filter:sepia(.2) saturate(.6)" alt=""></span><div style="font-family:var(--font-serif);font-size:22px">Casey</div><div style="font-size:12px;color:var(--fg3)">312 memories</div></div>
    <div style="(same)"><span ...><img src=P('herav',128,128) ...></span><div style="font-family:var(--font-serif);font-size:22px">{her}</div><div style="font-size:12px;color:var(--fg3)">287 memories</div></div>
  </div>
  <div style="text-align:center"><div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Together since</div><div style="font-family:var(--font-serif);font-size:30px;line-height:1.1;margin-top:4px">Jul 12, 2024</div></div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;text-align:center"> 5x <div><div style="font-family:var(--font-serif);font-size:28px;line-height:1">{s.n}</div><div style="font-size:11px;color:var(--fg3);margin-top:4px">{s.l}</div></div> </div>

  <!-- Security -->
  <div>
    <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3);margin-bottom:8px">Security</div>
    <div style="border-radius:8px;border:1px solid var(--border);background:var(--surface);overflow:hidden">
      5x <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-top:1px solid var(--border);min-height:52px"><div style="flex:1"><div style="font-size:15px">{s.t}</div><div style="font-size:12px;color:var(--fg3);margin-top:2px">{s.d}</div></div><span style="font-family:var(--font-mono);font-size:11px;color:{s.c}">{s.r}</span></div>
      <!-- every row incl. the first has border-top (as designed); rows have no tap action -->
    </div>
  </div>

  <!-- Preferences -->
  <div>
    <div style="(eyebrow)">Preferences</div>
    <div style="border-radius:8px;border:1px solid var(--border);background:var(--surface);overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;min-height:52px"><span style="font-size:15px">Theme</span>
        <div style="display:flex;gap:2px;padding:2px;border-radius:6px;background:var(--surface-2);font-size:12px"><button onClick=setLight style="height:28px;padding:0 10px;border-radius:4px;border:none;background:{lightBtnBg};color:var(--fg1);cursor:pointer">Light</button><button onClick=setDark style="(same) background:{darkBtnBg}">Late night</button></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--border);min-height:52px"><span style="font-size:15px">Home currency</span><span style="font-family:var(--font-mono);font-size:12px;color:var(--fg2)">USD · $</span></div>
      <div style="(same)"><span style="font-size:15px">Timezone</span><span style="font-family:var(--font-mono);font-size:12px;color:var(--fg2)">America/New_York</span></div>
    </div>
  </div>

  <!-- Notifications -->
  <div>
    <div style="(eyebrow)">Notifications</div>
    <div style="border-radius:8px;border:1px solid var(--border);background:var(--surface);overflow:hidden">
      3x <div onClick=n.toggle style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--border);min-height:52px;cursor:pointer"><div><div style="font-size:15px">{n.t}</div><div style="font-size:12px;color:var(--fg3);margin-top:2px">{n.d}</div></div>{switch n.bg/n.knob}</div>
      <div style="padding:12px 16px 6px;border-top:1px solid var(--border);font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Per plan · Japan, spring 2027</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px;padding:4px 16px 12px">
        4x <div onClick=n.toggle style="display:flex;align-items:center;justify-content:space-between;min-height:40px;font-size:14px;cursor:pointer"><span style="color:{n.color}">{n.t}</span><span style="width:20px;height:20px;border-radius:4px;border:1px solid {n.border};background:{n.bg};display:inline-flex;align-items:center;justify-content:center;color:#faf9f6">{when n.on: <svg 12x12 check "M20 6 9 17l-5-5" stroke-width 2.2 round>}</span></div>
      </div>
    </div>
  </div>

  <!-- Opt-ins -->
  <div>
    <div style="(eyebrow)">Optional · off by default</div>
    <div style="border-radius:8px;border:1px solid var(--border);background:var(--surface);overflow:hidden">
      2x <div onClick=o.toggle style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-top:1px solid var(--border);min-height:52px;cursor:pointer"><div><div style="font-size:15px">{o.t}</div><div style="font-size:12px;color:var(--fg3);margin-top:2px;line-height:1.4">{o.d}</div></div>{switch o.bg/o.knob}</div>
    </div>
  </div>

  <!-- Storage / export -->
  <div>
    <div style="border-radius:8px;border:1px solid var(--border);background:var(--surface);overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;min-height:52px"><span style="font-size:15px">Storage</span><span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">41.2 GB of 200 GB</span></div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-top:1px solid var(--border);min-height:52px"><span style="font-size:15px">Export everything</span><span style="color:var(--fg3)">→</span></div>
    </div>
  </div>

  <button onClick=lockNow style="height:44px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--fg2);font-size:14px;cursor:pointer">Lock now</button>
</div>
```

The eyebrow style `(eyebrow)` = `font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3);margin-bottom:8px`.

### Interactions

- `setLight` / `setDark` -> `themeOverride:'light'|'dark'`; the whole app flips theme immediately (`data-theme` on the root, dark palette in the foundation).
- Notification switches, per-plan checkboxes, and opt-in switches toggle their key. Knob slides with `transition:left 150ms`.
- Security rows, currency, timezone, storage, export: static, no action.
- `lockNow` ("sign out") -> `setState({ screen:'signin', locked:true, step:1 })` - shows the sign-in screen in its expired/locked state (`locked` is consumed by the Sign-in spec). Note `lockNow` does not reset chat/notes/preference state.

---

## 6. TAB BAR (always rendered while `inApp`)

```html
<div style="position:absolute;left:0;right:0;bottom:0;height:88px;padding:8px 8px 30px;display:grid;grid-template-columns:repeat(5,1fr);background:color-mix(in oklab,var(--bg),transparent 12%);backdrop-filter:blur(12px) saturate(1.2);border-top:1px solid var(--border);z-index:6">
  <button onClick=goMemories style="border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:4px;color:{tab.memories};font-size:10px;cursor:pointer;padding-top:6px"><svg 22x22 image: rect 18x18 at (3,3) rx=2 ry=2 + circle (9,9) r=2 + "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21">Memories</button>
  <button onClick=goPlans    style="(same) color:{tab.plans}"><svg 22x22 map icon (same path as the Planned-in strip)>Plans</button>
  <button onClick=goCalendar style="(same) color:{tab.calendar}"><svg 22x22 calendar: "M8 2v4" "M16 2v4" rect 18x18 at (3,4) rx=2 "M3 10h18">Calendar</button>
  <button onClick=goChat     style="(same) color:{tab.chat};position:relative"><svg 22x22 chat bubble: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z">Chat
    <!-- when chatBadge --><span style="position:absolute;top:4px;left:calc(50% + 6px);min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--accent);color:#faf9f6;font-family:var(--font-mono);font-size:10px;display:flex;align-items:center;justify-content:center">{chatBadgeN}</span>
  </button>
  <button onClick=goUs       style="(same) color:{tab.us}"><svg 22x22 users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" circle (9,7) r=4 "M22 21v-2a4 4 0 0 0-3-3.87" "M16 3.13a4 4 0 0 1 0 7.75">Us</button>
</div>
```

All SVGs: `fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"` unless noted.

Rules:
- Active color `active(c) = c ? 'var(--fg1)' : 'var(--fg3)'`:
  - `tab.memories` active on `memories | detail | gallery | composer`
  - `tab.plans` active on `plans | plan | today`
  - `tab.calendar` active on `calendar`; `tab.chat` on `chat`; `tab.us` on `us`
- Badge: `chatBadge = screen !== 'chat'` (hidden while on Chat, in either segment); `chatBadgeN = sealedDone ? '2' : '3'`. Sending messages does not change the badge.
- `goMemories/goPlans/goCalendar/goChat/goUs` all call `go(screen)` (closes sheets, clears `ev`, keeps `chatSeg`).
- Screens that scroll under the bar reserve `padding-bottom:110px` on their last block (detail wrapper, calendar Upcoming, notes board, Us column). The chat Messages segment does not (see composer note in section 2).
- The bar is hidden by full-screen overlays with higher z-index (lightbox 30, sheets 20/21) but is never removed from the DOM.
