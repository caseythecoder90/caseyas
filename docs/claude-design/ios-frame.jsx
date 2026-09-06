<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<meta name="design_doc_mode" content="canvas">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,wght@0,400;0,500;1,400&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Lora:ital,wght@0,400;0,500;1,400&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
body{margin:0;background:#e9e5dc;font-family:'Inter Tight',system-ui,sans-serif;color:#121110}
a{color:#c84b31;text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:3px}
input,button{font:inherit}
*{box-sizing:border-box}
.ours{--bg:#faf9f6;--surface:#f0ede5;--surface-2:#e8e4d9;--fg1:#121110;--fg2:#5a574f;--fg3:#8a857a;--border:#d4d0c5;--accent:#c84b31;--accent-soft:rgba(200,75,49,.12);--green:#78866a;--green-soft:rgba(120,134,106,.16);--plum:#7a5c7a;--ochre:#b58b3a;--danger:#b33e26;--n1:#f6ecd6;--n2:#e6ebdc;--n3:#f1ddd2;--n4:#e4e2ea;--font-serif:'Newsreader',Georgia,serif;--font-sans:'Inter Tight',system-ui,sans-serif;--font-mono:'JetBrains Mono',ui-monospace,monospace}
.ours[data-theme="dark"]{--bg:#121110;--surface:#1a1917;--surface-2:#23211e;--fg1:#faf9f6;--fg2:#a8a49a;--fg3:#6e6a61;--border:#2e2b26;--accent:#d4593a;--accent-soft:rgba(212,89,58,.16);--green:#8a9a78;--green-soft:rgba(138,154,120,.18);--plum:#a889a8;--ochre:#cfa65a;--danger:#e26a4a;--n1:#2b2519;--n2:#222619;--n3:#2c201b;--n4:#232229}
.ours[data-font="cormorant"]{--font-serif:'Cormorant Garamond',Georgia,serif}
.ours[data-font="lora"]{--font-serif:'Lora',Georgia,serif}
.ours[data-font="instrument"]{--font-serif:'Instrument Serif',Georgia,serif}
.sec{background:var(--bg);color:var(--fg1);border:1px solid var(--border);border-radius:12px;padding:28px;display:flex;flex-direction:column;gap:18px;font-family:var(--font-sans);font-size:14px;line-height:1.5}
.sec h2{margin:0;font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3);font-weight:500}
.sw{display:flex;flex-direction:column;gap:6px;font-family:var(--font-mono);font-size:10px;color:var(--fg2)}
.sw span{height:44px;border-radius:6px;border:1px solid var(--border)}
.btn{height:44px;padding:0 16px;border-radius:8px;font-weight:500;font-size:14px;cursor:pointer;white-space:nowrap}
.chip{height:30px;padding:0 12px;border-radius:4px;border:1px solid var(--border);display:inline-flex;align-items:center;font-size:13px;color:var(--fg2);white-space:nowrap}
.kind{font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg3);border:1px solid var(--border);padding:2px 5px;border-radius:3px}
.card{border-radius:8px;border:1px solid var(--border);background:var(--surface);overflow:hidden}
.note{font-size:12px;color:var(--fg3)}
</style>
</helmet>
<div class="ours" data-theme="{{ theme }}" data-font="{{ fontKey }}" style="padding:40px;display:flex;flex-direction:column;gap:24px">
<div style="max-width:760px"><div style="font-family:'Instrument Serif',serif;font-size:30px;line-height:1;color:#121110">Ours — system sheet</div><div style="font-size:13px;color:#5a574f;line-height:1.55;margin-top:8px">Tokens and components as used across the mobile, desktop and identity files. Toggle theme and display font in Tweaks — everything here follows. <a href="Ours — mobile prototype.dc.html">Mobile →</a> · <a href="Ours — desktop.dc.html">Desktop →</a> · <a href="Ours — identity pages.dc.html">Identity →</a></div></div>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:24px;max-width:1400px">

<div class="sec"><h2>Color · {{ theme }}</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
    <div class="sw"><span style="background:var(--bg)"></span>bg · paper</div><div class="sw"><span style="background:var(--surface)"></span>surface</div><div class="sw"><span style="background:var(--surface-2)"></span>surface-2</div><div class="sw"><span style="background:var(--border)"></span>border</div>
    <div class="sw"><span style="background:var(--fg1)"></span>fg1 · ink</div><div class="sw"><span style="background:var(--fg2)"></span>fg2</div><div class="sw"><span style="background:var(--fg3)"></span>fg3</div><div class="sw"><span style="background:var(--danger)"></span>danger</div>
    <div class="sw"><span style="background:var(--accent)"></span>accent · terracotta</div><div class="sw"><span style="background:var(--accent-soft)"></span>accent-soft 12%</div><div class="sw"><span style="background:var(--green)"></span>sage · secondary</div><div class="sw"><span style="background:var(--green-soft)"></span>sage-soft</div>
  </div>
  <div class="note">Accent is a brushstroke, not a fill: one highlight per screen, links, selection, the FAB. Sage marks {{ her }}'s things; terracotta marks Casey's; ink marks both.</div>
  <h2>Plan colors</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"><div class="sw"><span style="background:var(--accent)"></span>clay</div><div class="sw"><span style="background:var(--green)"></span>sage</div><div class="sw"><span style="background:var(--plum)"></span>plum</div><div class="sw"><span style="background:var(--ochre)"></span>ochre</div></div>
  <h2>Note palette</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"><div class="sw"><span style="background:var(--n1)"></span>n1 · cream</div><div class="sw"><span style="background:var(--n2)"></span>n2 · moss</div><div class="sw"><span style="background:var(--n3)"></span>n3 · blush</div><div class="sw"><span style="background:var(--n4)"></span>n4 · slate</div></div>
</div>

<div class="sec"><h2>Type</h2>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div><div style="font-family:var(--font-serif);font-size:56px;line-height:1">Three days in Asheville</div><div class="note">display / 56 · serif · memory titles, plan names, big numbers</div></div>
    <div><div style="font-family:var(--font-serif);font-size:36px;line-height:1">September</div><div class="note">h1 / 36 · serif · screen titles</div></div>
    <div><div style="font-family:var(--font-serif);font-size:22px;line-height:1.1;font-style:italic">Casey's take</div><div class="note">h2 / 22 · serif italic · section labels, signatures</div></div>
    <div><div style="font-size:16px;line-height:1.6;max-width:520px">We meant to hike. We mostly ate. Saturday we did make it up to the parkway, late enough that the light was going gold.</div><div class="note">body / 16 · sans · 1.6 line-height, 680px measure on desktop</div></div>
    <div><div style="font-size:14px">Label / 14 · sans · UI, buttons, list rows</div></div>
    <div><div style="font-family:var(--font-mono);font-size:12px">Q7XR4M · 12:55 PM · $1,840 · Aug 14–17, 2026</div><div class="note">mono / 12 · confirmation codes, times, prices, dates</div></div>
    <div><div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg3)">Eyebrow · on this day · next up</div></div>
  </div>
</div>

<div class="sec"><h2>Buttons</h2>
  <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" style="border:1px solid var(--accent);background:var(--accent);color:#faf9f6">Primary</button><button class="btn" style="border:1px solid var(--border);background:transparent;color:var(--fg1)">Secondary</button><button class="btn" style="border:none;background:transparent;color:var(--fg2)">Quiet</button><button class="btn" style="border:1px solid var(--border);background:transparent;color:var(--danger)">Destructive</button><button class="btn" style="border:1px solid var(--accent);background:var(--accent);color:#faf9f6;opacity:.4;cursor:not-allowed">Disabled</button></div>
  <div class="note">44px tall on mobile, 36–40px in dense desktop rows. Press = 1px down. No scale, no bounce.</div>
  <h2>Inputs &amp; pickers</h2>
  <div style="display:flex;flex-direction:column;gap:10px;max-width:400px">
    <input value="Yoshikawa Inn" style="height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--fg1);font-size:14px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div style="height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:space-between;font-size:14px"><span>Thu Apr 8</span><span style="font-family:var(--font-mono)">12:55 PM</span></div><div style="height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:space-between;font-size:14px;color:var(--fg2)"><span>Timezone</span><span style="font-family:var(--font-mono);font-size:12px">Asia/Tokyo</span></div></div>
    <div style="display:flex;align-items:center;justify-content:space-between;font-size:14px"><span>Toggle</span><span style="width:40px;height:24px;border-radius:999px;background:var(--accent);position:relative"><span style="position:absolute;top:3px;left:19px;width:18px;height:18px;border-radius:999px;background:#faf9f6"></span></span></div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px"><span style="height:48px;border-radius:8px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:20px">4</span><span style="height:48px;border-radius:8px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:20px">8</span><span style="height:48px;border-radius:8px;border:1px solid var(--fg1);background:var(--surface)"></span><span style="height:48px;border-radius:8px;border:1px solid var(--border);background:var(--surface)"></span><span style="height:48px;border-radius:8px;border:1px solid var(--border);background:var(--surface)"></span><span style="height:48px;border-radius:8px;border:1px solid var(--border);background:var(--surface)"></span></div>
  </div>
  <h2>Chips &amp; segmented control</h2>
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="chip" style="background:var(--fg1);color:var(--bg);border-color:var(--fg1)">All</span><span class="chip">Trips</span><span class="chip">Date nights</span><span class="chip" style="border-color:var(--accent);background:var(--accent-soft);color:var(--fg1)">Everyday</span><span class="chip" style="border-style:dashed;color:var(--fg3)">+ tag</span></div>
  <div style="display:flex;gap:2px;padding:2px;border-radius:6px;background:var(--surface-2);font-size:13px;width:fit-content"><span style="height:30px;padding:0 12px;border-radius:4px;background:var(--bg);display:flex;align-items:center;font-weight:500">Messages</span><span style="height:30px;padding:0 12px;border-radius:4px;display:flex;align-items:center;font-weight:500;color:var(--fg2)">Notes</span></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="kind" style="color:var(--fg1);border-color:var(--fg1)">planning</span><span class="kind" style="color:var(--green);border-color:var(--green)">booked</span><span class="kind" style="color:var(--accent);border-color:var(--accent)">shortlisted</span><span class="kind" style="color:var(--green);border-color:var(--green)">decided</span><span class="kind">idea</span><span class="kind">dreaming</span><span class="kind">done</span></div>
</div>

<div class="sec"><h2>Item kinds</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
    <sc-for list="{{ kinds }}" as="k" hint-placeholder-count="9"><div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface)"><span style="color:var(--fg1);display:flex" dangerouslySetInnerHTML="{{ k.svg }}"></span><div><div style="font-size:13px">{{ k.label }}</div><div class="kind" style="display:inline-block;margin-top:3px">{{ k.abbr }}</div></div></div></sc-for>
  </div>
  <div class="note">Lucide outline, 1.5px stroke, currentColor, 16–20px. The mono abbreviation is the fallback where an icon would be too small (itinerary rows, chat cards).</div>
  <h2>Avatars &amp; votes</h2>
  <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
    <span style="display:flex"><img src="https://picsum.photos/seed/caseyav/64/64" style="width:32px;height:32px;border-radius:999px;object-fit:cover;filter:sepia(.2) saturate(.6);border:2px solid var(--bg)" alt=""><img src="https://picsum.photos/seed/herav/64/64" style="width:32px;height:32px;border-radius:999px;object-fit:cover;filter:sepia(.2) saturate(.6);margin-left:-10px;border:2px solid var(--bg)" alt=""></span>
    <span style="display:flex;gap:4px"><span style="width:24px;height:24px;border-radius:999px;background:var(--accent-soft);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px">C↑</span><span style="width:24px;height:24px;border-radius:999px;background:var(--green-soft);color:var(--green);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px">{{ herIni }}~</span></span>
    <span class="note">pair · votes: ↑ like, ~ meh, ✕ no</span>
  </div>
  <h2>Empty state · toast</h2>
  <div style="padding:28px;border-radius:8px;border:1px dashed var(--border);text-align:center"><div style="font-family:var(--font-serif);font-size:24px;line-height:1.1">Nothing here yet.</div><div style="font-size:14px;color:var(--fg2);margin-top:6px">Start with how you met.</div><button class="btn" style="border:1px solid var(--border);background:transparent;color:var(--fg1);margin-top:14px;height:40px">Write the first one →</button></div>
  <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:8px;background:var(--fg1);color:var(--bg);font-size:14px;max-width:360px"><span>Saved to Japan, spring 2027</span><a style="color:var(--accent);font-size:13px">Undo</a></div>
</div>

<div class="sec"><h2>Cards</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div class="card"><img src="https://picsum.photos/seed/candles/400/240" style="width:100%;height:110px;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt=""><div style="padding:12px 14px"><div style="font-family:var(--font-mono);font-size:10px;color:var(--fg3)">Aug 29, 2026 · 9 photos</div><div style="font-family:var(--font-serif);font-size:20px;line-height:1.1;margin-top:4px">The night the power went out</div></div></div>
    <div class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:4px"><div style="display:flex;align-items:center;gap:8px"><span style="width:6px;height:6px;border-radius:999px;background:var(--accent)"></span><span style="font-family:var(--font-mono);font-size:10px;color:var(--fg3)">Apr 8 – 22, 2027</span></div><div style="font-family:var(--font-serif);font-size:20px;line-height:1.1">Japan, spring 2027</div><div style="font-size:12px;color:var(--fg3)">12 ideas · 4 booked · 3/18</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><span class="kind">planning</span><span style="font-size:12px;color:var(--accent)">in 214 days</span></div></div>
    <div class="card" style="padding:12px 14px;display:grid;grid-template-columns:60px 1fr;gap:10px"><div><div style="font-family:var(--font-mono);font-size:12px">12:55 PM</div><div class="kind" style="display:inline-block;margin-top:4px">flight</div></div><div><div style="font-size:14px;font-weight:500;display:flex;gap:8px;align-items:center">JL 5 · JFK → HND<span class="kind" style="color:var(--green);border-color:var(--green)">booked</span></div><div style="font-size:12px;color:var(--fg2)">Terminal 1 · $1,840 · 2 files</div></div></div>
    <div class="card" style="padding:14px"><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:14px;font-weight:500">Nozomi 23</span><span class="note">JR Pass</span></div><div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-top:8px"><span style="font-family:var(--font-serif);font-size:26px;line-height:1">Tokyo</span><span style="color:var(--fg3)">→</span><span style="font-family:var(--font-serif);font-size:26px;line-height:1;text-align:right">Kyoto</span></div><div style="font-family:var(--font-mono);font-size:16px;letter-spacing:.12em;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">Q7XR4M</div></div>
    <div class="card"><img src="https://picsum.photos/seed/inari/400/240" style="width:100%;height:80px;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt=""><div style="padding:10px 12px;display:flex;flex-direction:column;gap:6px"><div style="font-size:13px;font-weight:500">Fushimi Inari at sunrise</div><div style="display:flex;justify-content:space-between;align-items:center"><span style="display:flex;gap:3px"><span style="width:20px;height:20px;border-radius:999px;background:var(--accent-soft);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">C↑</span><span style="width:20px;height:20px;border-radius:999px;background:var(--green-soft);color:var(--green);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">{{ herIni }}↑</span></span><span class="kind" style="color:var(--accent);border-color:var(--accent)">shortlisted</span></div></div></div>
    <div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px"><span style="width:20px;height:20px;border-radius:4px;background:var(--accent);display:inline-flex;align-items:center;justify-content:center;color:#faf9f6"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span><span style="flex:1;color:var(--fg3);text-decoration:line-through">Renew passport</span><span style="width:20px;height:20px;border-radius:999px;background:var(--accent-soft);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">C</span></div><div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px"><span style="width:20px;height:20px;border-radius:4px;border:1px solid var(--border)"></span><span style="flex:1">Buy JR Pass vouchers</span><span style="font-family:var(--font-mono);font-size:11px;color:var(--fg3)">Mar 1</span><span style="width:20px;height:20px;border-radius:999px;background:var(--green-soft);color:var(--green);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:9px">{{ herIni }}</span></div><div class="note" style="margin-top:8px">checklist rows</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
    <div style="position:relative;aspect-ratio:1;border-radius:6px;overflow:hidden"><img src="https://picsum.photos/seed/p1/300/300" style="width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.08) saturate(.88)" alt=""><span style="position:absolute;right:6px;bottom:6px;font-family:var(--font-mono);font-size:10px;color:#faf9f6;background:rgba(18,17,16,.6);padding:2px 5px;border-radius:4px">▶ 0:42</span></div>
    <div style="position:relative;aspect-ratio:1;border-radius:6px;background:var(--surface);border:1px solid var(--border);padding:12px;display:flex;flex-direction:column;gap:5px"><span style="height:6px;width:70%;background:var(--surface-2);border-radius:2px"></span><span style="height:4px;width:90%;background:var(--surface-2);border-radius:2px"></span><span style="height:4px;width:80%;background:var(--surface-2);border-radius:2px"></span><span style="position:absolute;right:8px;bottom:8px;font-family:var(--font-mono);font-size:10px;color:var(--fg2);background:var(--bg);border:1px solid var(--border);padding:2px 6px;border-radius:3px">2</span></div>
    <div style="border-radius:8px;padding:12px;background:var(--n1);border:1px solid var(--border);display:flex;flex-direction:column;gap:8px;font-size:13px"><span>Coffee's in the thermos.</span><span style="font-family:var(--font-serif);font-style:italic;color:var(--fg2)">— {{ her }}</span></div>
  </div>
  <div class="note">media tile · document tile · note card. Radii: 4 chips/inputs · 8 cards/sheets · 12 hero panels &amp; bubbles · 999 avatars only.</div>
</div>

<div class="sec"><h2>Tab bar · bottom sheet</h2>
  <div style="border-radius:12px;border:1px solid var(--border);overflow:hidden;width:390px;max-width:100%">
    <div style="height:120px;background:var(--surface);position:relative"><div style="position:absolute;left:0;right:0;bottom:0;background:var(--bg);border-radius:12px 12px 0 0;border-top:1px solid var(--border);padding:10px 16px 12px;display:flex;flex-direction:column;gap:8px"><span style="width:36px;height:4px;border-radius:999px;background:var(--border);margin:0 auto"></span><span style="font-family:var(--font-serif);font-size:20px">New memory</span><span class="note">Sheet: 12px top radius, scrim rgba(0,0,0,.6), drag handle, primary action last.</span></div></div>
    <div style="height:72px;padding:8px 8px 14px;display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid var(--border);font-size:10px;text-align:center;align-items:end;color:var(--fg3)"><span style="color:var(--fg1)">Memories</span><span>Plans</span><span>Calendar</span><span style="position:relative">Chat<span style="position:absolute;top:-16px;left:calc(50% + 8px);min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--accent);color:#faf9f6;font-family:var(--font-mono);display:inline-flex;align-items:center;justify-content:center">3</span></span><span>Us</span></div>
  </div>
  <div class="note">Tab bar: 88px incl. home indicator, blurred paper, hairline top border. Active = ink, inactive = fg3. One badge, on Chat, covering messages and notes.</div>
  <h2>Motion</h2>
  <div class="note">120ms hover/press · 200ms sheets and segment switches · 400ms screen transitions. cubic-bezier(.22,1,.36,1). Opacity + ≤8px translate. Sealed note opens with a 200ms fade, no envelope animation. Reduce-motion → instant.</div>
</div>

</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props="{&quot;displayFont&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;options&quot;:[&quot;Newsreader&quot;,&quot;Cormorant Garamond&quot;,&quot;Lora&quot;,&quot;Instrument Serif&quot;],&quot;default&quot;:&quot;Newsreader&quot;,&quot;tsType&quot;:&quot;string&quot;,&quot;section&quot;:&quot;Look&quot;},&quot;theme&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;options&quot;:[&quot;light&quot;,&quot;dark&quot;],&quot;default&quot;:&quot;light&quot;,&quot;tsType&quot;:&quot;'light' | 'dark'&quot;,&quot;section&quot;:&quot;Look&quot;},&quot;herName&quot;:{&quot;editor&quot;:&quot;text&quot;,&quot;default&quot;:&quot;Yasmim&quot;,&quot;tsType&quot;:&quot;string&quot;,&quot;section&quot;:&quot;People&quot;}}">
class Component extends DCLogic {
  renderVals() {
    const p = this.props;
    const her = p.herName ?? 'Yasmim';
    const theme = p.theme ?? 'light';
    const fontKey = ({ 'Newsreader': 'newsreader', 'Cormorant Garamond': 'cormorant', 'Lora': 'lora' })[p.displayFont ?? 'Newsreader'] || 'instrument';
    const ic = d => ({ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>` });
    const kinds = [
      ['Flight', 'FLT', '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'],
      ['Stay', 'STY', '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>'],
      ['Train', 'TRN', '<rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/>'],
      ['Car', 'CAR', '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>'],
      ['Activity', 'ACT', '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>'],
      ['Food', 'EAT', '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'],
      ['Ticket', 'TKT', '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>'],
      ['Idea', 'IDEA', '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'],
      ['Note', 'NOTE', '<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>'],
    ].map(([label, abbr, d]) => ({ label, abbr, svg: ic(d) }));
    return { her, herIni: her[0], theme, fontKey, kinds };
  }
}
</script>
</body>
</html>
