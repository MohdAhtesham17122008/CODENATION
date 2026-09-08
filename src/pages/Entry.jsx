/**
 * ENTRY PAGE — the ONE front page of the app.
 *
 * This is the Field Cartography design (ported from the
 * polar-expedition-logistics proposal site) as the visual identity for the
 * front page, with the console's actual sign-in — the role picker, live
 * stats and honesty note that used to live in a separate Login.jsx screen —
 * folded in as its own section ("Console access") further down the same
 * page, rather than a second screen. There is only one front page.
 *
 * Ported from TypeScript (.tsx, wouter routing) to plain JSX: type
 * annotations removed, and the old wouter <Link> nav items now scroll to
 * the #access section on this same page instead of navigating elsewhere.
 */
import { useState } from "react";
import { ArrowDownRight, ArrowRight, Box, Check, ChevronLeft, ChevronRight, Compass, Crosshair, Fuel, Lock, Menu, Minus, Radio, ShieldAlert, Snowflake, Users, X } from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { useData } from "../store/DataContext";
import { ROLES, ROLE_KEYS } from "../lib/roles";
import { TONE_COLOUR } from "../lib/statuses";

const heroImage = "/images/image 1.webp";
const cargoImage = "/images/image 2.jpg";
const traverseImage = "/images/image7.png";
const logoImage = "/images/image7.png";

const scenarioData = {
  base: { label: "Base command", status: "All systems nominal", tone: "calm", title: "Morning operating picture", copy: "A connected view of field teams, essential stock, and the next safe movement window.", cards: [["Personnel tracked", "46 / 46", "last check-in 08:42"], ["Cargo in motion", "18 units", "3 handoffs today"], ["Fuel cover", "19 days", "across 4 locations"]], events: [["08:42", "Traverse Team Echo checked in at W-14", "received"], ["08:15", "Resupply flight manifest cleared for loading", "cleared"], ["07:50", "South Camp medical cache reconciled", "received"]] },
  transit: { label: "Transit view", status: "Weather window active", tone: "watch", title: "Resupply corridor in motion", copy: "Aircraft, cargo and receiving camp share one chain of custody throughout the weather window.", cards: [["Flight PX-17", "En route", "ETA 10:26 local"], ["Manifest match", "98.7%", "1 item flagged for review"], ["Landing margin", "3h 18m", "wind threshold monitored"]], events: [["09:03", "PX-17 departed staging point", "in transit"], ["08:54", "Pallet S-12 reweighed within aircraft limit", "cleared"], ["08:37", "South Camp confirms receiving crew ready", "received"]] },
  response: { label: "Response drill", status: "Response path prepared", tone: "critical", title: "One operating picture, when minutes matter", copy: "A simulated incident view connects a declared alert to nearby people, assets and evacuation capability.", cards: [["Nearest team", "12 min", "Team Delta · 6.2 km"], ["Medical cache", "8.4 km", "South Ridge cache"], ["Aircraft capacity", "4 seats", "PX-17 return leg"]], events: [["09:12", "Simulation declared for Team Echo route", "declared"], ["09:13", "Location, profile and nearby assets surfaced", "prioritized"], ["09:14", "Response brief ready for base command", "ready"]] },
};

const modules = [
  ["01 / Expedition planning", "Plan the season", "Build routes, resource plans, permit checks and contingency options before departure.", "Scenario-ready itineraries make each alternate route visible before a decision becomes urgent.", Compass],
  ["02 / Cargo tracking", "Follow every handoff", "Track manifest, weight, condition and chain of custody from staging to final delivery.", "Barcode and RFID events create one reconciled cargo record through constrained connectivity.", Box, traverseImage],
  ["03 / Inventory management", "See stock before it becomes a problem", "Forecast consumables and safety-critical equipment across camps, caches and mobile platforms.", "Consumption trends and expiry checks make a shortfall visible while it is still recoverable.", Fuel],
  ["04 / Personnel movement", "Keep the field accounted for", "Connect movement plans, check-ins, buddy pairs and return-time alerts.", "Role-aware records protect sensitive profiles while keeping the right people informed.", Users, traverseImage],
  ["05 / Emergency response", "Respond from one brief", "Bring people, locations, medical information and nearby assets into a single response view.", "Safety-critical data moves first, so the essential picture arrives over limited links.", ShieldAlert],
];

const roadmap = [
  ["01", "Months 1–3", "Foundation", "Shared data core, roles, planning and offline-sync framework."],
  ["02", "Months 4–6", "Asset visibility", "Cargo, inventory, scanning workflows and field-device rollout."],
  ["03", "Months 7–9", "People & safety", "Movement, satellite positioning and overdue-check workflows."],
  ["04", "Months 10–11", "Emergency response", "Agency notification paths and unified command view."],
  ["05", "Month 12", "Hardening & launch", "Live-condition testing, training and operational launch."],
];

const SUGGESTED_NAMES = new Set(ROLE_KEYS.map((key) => ROLES[key].operator));

function accessSummary(role) {
  return [
    { allowed: role.canManage, text: role.canManage ? "Edit expeditions, roster, cargo and stock" : "Cannot change any record" },
    { allowed: role.canRespond, text: role.canRespond ? "Acknowledge and resolve incidents" : "Cannot acknowledge or resolve incidents" },
    { allowed: true, text: "Report an emergency" },
  ];
}

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Entry() {
  const [scenario, setScenario] = useState("base");
  const [selectedModule, setSelectedModule] = useState(0);
  const [roadmapIndex, setRoadmapIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeScenario = scenarioData[scenario];
  const activeModule = modules[selectedModule];
  const activeRoadmap = roadmap[roadmapIndex];
  const ModuleIcon = activeModule[4];

  /* ---------- Console access (ported from the old Login.jsx) ---------- */
  const { signIn, signingIn, authError, clearAuthError, defaultRole } = useAuth();
  const { stats, loading } = useData();
  const [roleKey, setRoleKey] = useState(defaultRole);
  const [name, setName] = useState(ROLES[defaultRole].operator);
  const role = ROLES[roleKey];
  const RoleIcon = role.icon;
  const roleColour = TONE_COLOUR[role.tone];

  function chooseRole(key) {
    setRoleKey(key);
    setName((current) => (SUGGESTED_NAMES.has(current.trim()) ? ROLES[key].operator : current));
    clearAuthError();
  }

  function handleSignIn(event) {
    event.preventDefault();
    signIn({ name, role: roleKey });
  }

  const figure = (value) => (loading ? "—" : value);

  const nav = (section) => { go(section); setMenuOpen(false); };

  return <main className="site-shell">
    <div className="route-spine" aria-hidden="true"><i /><b /><i /><b /><i /></div>
    <header className="masthead">
      <button className="brand-lockup" onClick={() => go("top")} aria-label="Go to start"><img src={logoImage} alt="" /><span><strong>POLAR</strong><small>EXPEDITION LOGISTICS</small></span></button>
      <nav className="desktop-nav"><button onClick={() => go("command")}>Command view</button><button onClick={() => go("modules")}>Modules</button><button onClick={() => go("roadmap")}>Roadmap</button><button onClick={() => go("access")}>Console access</button></nav>
      <button className="header-cta" onClick={() => { setScenario("response"); go("command"); }}>Explore response view <ArrowDownRight size={16} /></button>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      {menuOpen && <div className="mobile-nav"><button onClick={() => nav("command")}>Command view</button><button onClick={() => nav("modules")}>Modules</button><button onClick={() => nav("roadmap")}>Roadmap</button><button onClick={() => nav("access")}>Console access</button></div>}
    </header>

    <section className="hero" id="top"><img src={heroImage} alt="Polar expedition field camp on an ice shelf" /><div className="hero-wash" />
      <div className="hero-content"><div className="pl-eyebrow light"><i />Integrated expedition operations</div><h1>Every pallet, person,<br /><em>and plan—</em><br />on the same bearing.</h1><p>A unified operating picture for polar teams managing uncertainty between the staging floor and the farthest field camp.</p><div className="hero-actions"><button className="primary-button" onClick={() => go("command")}>Open command concept <ArrowRight size={18} /></button><button className="text-button" onClick={() => go("modules")}>Explore five modules <ArrowDownRight size={18} /></button></div></div>
      <div className="hero-coordinates">78° 14′ S &nbsp;/&nbsp; 166° 28′ E<br /><span>Field view · August 2026</span></div>
      <div className="hero-stats"><div><strong>12</strong><span>months to launch</span></div><div><strong>5</strong><span>connected modules</span></div><div><strong>01</strong><span>source of truth</span></div></div>
    </section>

    {/* ==================== CONSOLE ACCESS (ported from the old Login.jsx) ====================
        Unchanged from how it was originally built — moved up to sit right after the hero
        instead of at the end of the page, nothing about its own design touched. */}
    <section className="section-wrap" id="access">
      <div className="section-mark"><b>01</b><span>Console access</span></div>
      <div className="intro-layout" style={{ marginTop: 51 }}>
        <div>
          <div className="pl-eyebrow">Ministry of Earth Sciences · NCPOR · Problem Statement 26062</div>
          <h2>Sign in to the operations console.</h2>
          <p style={{ marginTop: 22, maxWidth: 480, color: "#405462", fontSize: 15, lineHeight: 1.65 }}>
            One console for the things a polar station cannot afford to lose track of — who is deployed, what is in
            transit, what is running out, and what has gone wrong. Every module reads the same records, so a change
            made in one is visible in all of them.
          </p>

          <dl className="mt-6 grid max-w-[440px] grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4" style={{ marginTop: 28 }}>
            {[
              { label: "Expeditions", value: figure(stats.expeditionsTotal) },
              { label: "Personnel", value: figure(stats.personnelTotal) },
              { label: "Consignments", value: figure(stats.cargoTotal) },
              { label: "Open incidents", value: figure(stats.emergenciesOpen), tone: stats.emergenciesOpen > 0 ? "alert" : null, pulse: stats.emergenciesOpen > 0 },
            ].map((item) => (
              <div key={item.label}>
                <dd className="font-display text-[24px] font-semibold leading-none" style={{
                  color: item.tone
                    ? TONE_COLOUR[item.tone]
                    : "#eaf2f2",
                  textShadow: item.tone ? "none" : "0 0 20px rgba(111,214,214,.4), 0 0 40px rgba(111,214,214,.2)",
                  animation: item.pulse ? "stat-pulse 1.8s ease-in-out infinite" : "none"
                }}>
                  {item.value}
                </dd>
                <dt className="eyebrow mt-1.5" style={{ color: "#83b2ba" }}>{item.label}</dt>
              </div>
            ))}
          </dl>

          <p style={{ marginTop: 28, maxWidth: 440, fontSize: "11.5px", lineHeight: 1.6, color: "#7d8f97" }}>
            Prototype build. Positions are simulated demo data, not live GPS or beacon feeds. Weather is fetched
            live from Open-Meteo where it is reachable, and clearly marked as fallback figures where it is not.
          </p>
        </div>

        <form className="card" onSubmit={handleSignIn} noValidate>
          <div className="eyebrow">Console access</div>
          <h2 className="mt-1 font-display text-[19px] font-semibold tracking-[0.03em] text-hi">Sign In</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-low">
            Choose the role you are signing in as. It decides which controls the console shows you.
          </p>

          <div className="mt-4 space-y-2">
            {ROLE_KEYS.map((key) => {
              const option = ROLES[key];
              const OptionIcon = option.icon;
              const active = key === roleKey;
              const colour = TONE_COLOUR[option.tone];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => chooseRole(key)}
                  className={`login-role ${active ? "login-role--active" : ""}`}
                  style={active ? { borderColor: colour, boxShadow: `inset 3px 0 0 ${colour}` } : undefined}
                  aria-pressed={active}
                >
                  <OptionIcon size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: active ? colour : "var(--ink-low)" }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-hi">{option.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-low">{option.remit}</span>
                  </span>
                  {active && <Check size={14} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: colour }} />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded border p-3" style={{ borderColor: "var(--line)", background: "var(--navy-850)" }}>
            <div className="flex items-center gap-2">
              <RoleIcon size={13} strokeWidth={2} style={{ color: roleColour }} />
              <span className="eyebrow" style={{ color: roleColour }}>{role.label} may</span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {accessSummary(role).map((line) => (
                <li key={line.text} className="flex items-start gap-2 text-[11.5px] leading-snug">
                  {line.allowed ? (
                    <Check size={12} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  ) : (
                    <Minus size={12} strokeWidth={2.5} className="mt-0.5 shrink-0 text-low" />
                  )}
                  <span className={line.allowed ? "text-mid" : "text-low"}>{line.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <label className="field-label" htmlFor="login-name">Operator name</label>
            <input
              id="login-name"
              className="input"
              value={name}
              onChange={(event) => { setName(event.target.value); clearAuthError(); }}
              placeholder="Who is on the console?"
              autoComplete="off"
              maxLength={48}
            />
            <p className="mt-1.5 text-[11px] text-low">
              Shown in the sidebar so it is always clear whose session this is. The suggested names are fictional.
            </p>
          </div>

          {authError && (
            <div className="alert-strip mt-3">
              <span className="text-[12px] leading-relaxed text-hi">{authError}</span>
            </div>
          )}

          <button type="submit" className="btn mt-4 w-full" disabled={signingIn}>
            {signingIn ? (<><Radio size={14} className="pulse" /> Signing in…</>) : (<><Lock size={14} /> Enter Console</>)}
          </button>

          <div className="mt-4 flex items-start gap-2 border-t pt-3" style={{ borderColor: "var(--line)" }}>
            <Lock size={13} className="mt-0.5 shrink-0 text-low" />
            <p className="text-[11px] leading-relaxed text-low">
              <span className="text-mid">Demo sign-in.</span> No password is checked and nothing is verified — this
              screen selects a role, it does not authenticate anyone. A real deployment would put NCPOR sign-in in
              front of this and enforce these rules on the server as well.
            </p>
          </div>
        </form>
      </div>
    </section>

    <section className="intro section-wrap"><div className="section-mark"><b>02</b><span>Mission rationale</span></div><div className="intro-layout"><div><div className="pl-eyebrow">When the weather closes in</div><h2>Fragmented information is not just an inefficiency. It is a field risk.</h2></div><div className="intro-copy"><p>Polar operations still move through spreadsheets, radio checks and isolated manifests. The platform brings planning, cargo, stock, personnel and incidents into a shared data core—designed for intermittent connectivity and decisions that cannot wait.</p><div className="principle-list"><div><b>01</b><p><strong>Offline-first by design.</strong> Field devices continue working through a lost connection and synchronize when bandwidth returns.</p></div><div><b>02</b><p><strong>Safety data goes first.</strong> Check-ins and incident declarations outrank routine sync activity.</p></div><div><b>03</b><p><strong>One record, many actions.</strong> A cargo, person or asset update becomes useful across every function.</p></div></div></div></div></section>

    <section className="command section-wrap" id="command"><div className="section-mark light"><b>03</b><span>Interactive operating picture</span></div><div className="command-intro"><div><div className="pl-eyebrow light">Concept dashboard</div><h2>See the field before the weather closes in.</h2></div><p>This interactive concept reframes the same shared records for different operational moments.</p></div><div className="scenario-tabs" role="tablist">{Object.keys(scenarioData).map(key => <button key={key} onClick={() => setScenario(key)} className={scenario === key ? "selected" : ""} role="tab" aria-selected={scenario === key}>{scenarioData[key].label}<ArrowDownRight size={14} /></button>)}</div>
      <div className="command-board"><div className="board-map"><div className="map-ruler">ROSS SHELF FIELD NETWORK <span>NOTIONAL VIEW</span></div><div className="contour one" /><div className="contour two" /><div className="contour three" /><svg viewBox="0 0 600 400" preserveAspectRatio="none"><path d="M 35 300 C 126 268, 132 184, 225 200 S 300 85, 395 128 S 500 92, 570 45" /></svg><div className="map-pin base"><i /><span><strong>BASE ALPHA</strong><small>Operational hub</small></span></div><div className="map-pin echo"><i className={scenario === "response" ? "alert" : ""} /><span><strong>TEAM ECHO</strong><small>{scenario === "response" ? "Response point" : "On traverse"}</small></span></div><div className="map-pin camp"><i /><span><strong>SOUTH CAMP</strong><small>Receiving site</small></span></div><div className="map-pin flight"><i /><span><strong>PX-17</strong><small>{scenario === "transit" ? "En route" : "Standby"}</small></span></div><div className="map-scale"><i />10 km</div></div>
        <aside className="board-side" aria-live="polite"><div className="board-status"><span className={`status-chip ${activeScenario.tone}`}><i />{activeScenario.status}</span><span className="sync"><Radio size={13} /> Priority sync</span></div><h3>{activeScenario.title}</h3><p>{activeScenario.copy}</p><div className="metric-list">{activeScenario.cards.map(([label, value, sub], index) => <div className="metric" key={label}><span className="metric-icon">{index === 0 ? <Users size={17} /> : index === 1 ? <Box size={17} /> : <Fuel size={17} />}</span><div><small>{label}</small><strong>{value}</strong><em>{sub}</em></div></div>)}</div><button className="board-action" onClick={() => setScenario(scenario === "response" ? "base" : "response")}>{scenario === "response" ? "Return to base command" : "Run response drill"}<ArrowRight size={16} /></button></aside>
        <div className="event-strip"><div className="event-title"><Crosshair size={15} /> Event log</div>{activeScenario.events.map(([time, text, state]) => <div className="event" key={time}><time>{time}</time><span>{text}</span><em>{state}</em></div>)}</div></div><div className="concept-note"><Snowflake size={15} /> This is a proposal concept using notional field data; a production system would connect to approved operational sources.</div>
    </section>

    <section className="modules section-wrap" id="modules"><div className="section-mark"><b>04</b><span>Five connected modules</span></div><div className="modules-header"><div><div className="pl-eyebrow">Shared data core</div><h2>Plan once.<br />Act everywhere.</h2></div><p>Each capability works independently. Together, they turn isolated field updates into an authoritative operating picture across base, transit and camp.</p></div><div className="modules-layout"><div className="module-rail" role="tablist">{modules.map(([tag, title, , , Icon], index) => <button key={title} onClick={() => setSelectedModule(index)} className={index === selectedModule ? "selected" : ""} role="tab" aria-selected={index === selectedModule}><b>0{index + 1}</b><Icon size={19} /><span>{title}</span><ArrowRight size={16} /></button>)}</div><div className="module-feature"><span>{activeModule[0]}</span><ModuleIcon size={39} /><h3>{activeModule[1]}</h3><p>{activeModule[2]}</p><div><small>Field note</small><p>{activeModule[3]}</p></div></div><div className="module-image"><img src={cargoImage} alt="Expedition cargo in a polar field setting" /><span>Shared record<br /><i>trusted at the edge</i></span></div></div></section>

    <section className="architecture section-wrap"><div className="section-mark light"><b>05</b><span>Architecture for the edge</span></div><div className="architecture-layout"><div><div className="pl-eyebrow light">Built for disconnected operations</div><h2>Reliable when the connection is not.</h2><p>Ruggedized field terminals capture scans, updates and messages locally. A conflict-aware synchronization layer then prioritizes the records base command needs first.</p></div><div className="layers"><article><span>01 / Field layer</span><strong>Offline terminal</strong><small>Camp · vessel · aircraft · team</small></article><div className="bridge"><Radio size={15} />Priority sync</div><article><span>02 / Integration layer</span><strong>Conflict-aware sync</strong><small>Satellite · local network · provider APIs</small></article><div className="bridge">✓ Reconciled record</div><article><span>03 / Core platform</span><strong>Command dashboard</strong><small>Role-based, multi-agency view</small></article></div></div></section>

    <section className="roadmap section-wrap" id="roadmap"><div className="section-mark"><b>06</b><span>Delivery route</span></div><div className="roadmap-header"><div><div className="pl-eyebrow">Working capability at every stop</div><h2>A 12-month route to launch.</h2></div><p>The delivery sequence builds the safety-critical response module on top of proven planning, asset and people workflows.</p></div><div className="roadmap-ui"><div className="roadmap-track">{roadmap.map(([phase], index) => <button key={phase} onClick={() => setRoadmapIndex(index)} className={roadmapIndex === index ? "selected" : ""}>{phase}<i /></button>)}</div><article className="roadmap-card"><div><small>{activeRoadmap[1]}</small><h3>{activeRoadmap[2]}</h3><p>{activeRoadmap[3]}</p></div><div className="roadmap-controls"><button onClick={() => setRoadmapIndex((roadmapIndex - 1 + roadmap.length) % roadmap.length)} aria-label="Previous phase"><ChevronLeft size={20} /></button><span>{roadmapIndex + 1} / {roadmap.length}</span><button onClick={() => setRoadmapIndex((roadmapIndex + 1) % roadmap.length)} aria-label="Next phase"><ChevronRight size={20} /></button></div></article></div></section>

    <section className="closing"><div><div className="pl-eyebrow light">Ready for operational review</div><h2>Make the next<br /><em>field season</em> more knowable.</h2><p>From first expedition plan to final incident report, the platform is designed to reduce friction, preserve accountability and make decisive action easier.</p><button className="primary-button" onClick={() => go("access")}>Sign in to the console <ArrowDownRight size={18} /></button></div><aside><img src={logoImage} alt="" /><span>78° 14′ S<br />166° 28′ E</span></aside></section>
    <footer><span><img src={logoImage} alt="" /> POLAR / EXPEDITION LOGISTICS</span><small>Integrated operations proposal · v1.0</small><small>August 2026</small></footer>
  </main>;
}
