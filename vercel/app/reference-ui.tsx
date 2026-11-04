'use client';
import { useState } from 'react';
import { Bell, Bookmark, Menu, Search, X, ArrowLeft, CalendarDays, Users, ScanLine, Megaphone, UserCheck, Hourglass, Armchair, Star, Download, Info, Video, MapPin, Ticket, Undo2, ChevronLeft, ChevronRight } from 'lucide-react';
const referenceIcons: Record<string, typeof Info> = { arrow_back: ArrowLeft, calendar_today: CalendarDays, group: Users, qr_code_scanner: ScanLine, campaign: Megaphone, how_to_reg: UserCheck, hourglass_top: Hourglass, event_seat: Armchair, stars: Star, search: Search, download: Download, info: Info, videocam: Video, location_on: MapPin, confirmation_number: Ticket, undo: Undo2, chevron_left: ChevronLeft, chevron_right: ChevronRight };
function ReferenceIcon({ name, className }: {
    name: string;
    className: string;
}) { const Icon = referenceIcons[name] || Info; return <Icon size="1em" className={className} aria-hidden="true"/>; }
import type { CampusEvent, Registration } from '@/lib/campus';
export function ReferenceHeader({ initials, active, search, onSearch, go, signedIn = false }: {
    signedIn?: boolean;
    initials: string;
    active: string;
    search: string;
    onSearch: (v: string) => void;
    go: (s: string) => void;
}) {
    const [menu, setMenu] = useState(false);
    const links = [['events', 'Discover Events'], ['calendar', 'Campus Calendar'], ['rewards', 'Reward Points'], ['my', 'My RSVPs & Clubs']];
    return <header className="reference-header stitch-header"><div className="stitch-header-inner"><a className="stitch-brand" href="#events"><span>CC</span>CampusConnect</a><div className="stitch-header-search"><Search size={17}/><input aria-label="Search events and clubs" placeholder="Search events, workshops, clubs…" value={search} onChange={e => onSearch(e.target.value)}/></div><nav aria-label="Main navigation">{links.map(([key, label]) => <a key={key} className={active === key || key === "events" && active === "event" ? " active " : ""} href={'#' + key}>{label}</a>)}</nav><div className="stitch-header-actions"><a className="portal-header-link" href={signedIn ? '#account' : '/login'}>{signedIn ? 'My account' : 'Sign in'}</a><button className="icon-btn" aria-label="Notifications" onClick={() => go('notifications')}><Bell size={20}/></button><button className="icon-btn stitch-saved" aria-label="Saved events" onClick={() => go('saved')}><Bookmark size={20}/></button><a className="btn primary stitch-create" href="#create"><span>＋</span>Create Event</a><a className="stitch-account" href="#account" aria-label="Your account">{initials}</a><button className="icon-btn stitch-menu-toggle" aria-label="Open navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={20}/> : <Menu size={20}/>}</button></div></div>{menu && <nav className="stitch-mobile-nav" aria-label="Mobile navigation">{[...links, ['create', 'Create Event'], ['organiser', 'Organiser workspace']].map(([key, label]) => <a key={key} href={'#' + key} onClick={() => setMenu(false)}>{label}</a>)}</nav>}</header>;
}
export function ReferenceFooter() {
    return (<footer className="reference-footer docked full-width bg-surface-container-lowest mt-12 border-t border-outline-variant/30">
    <div className="w-full py-8 px-6 mx-auto flex flex-col justify-between items-center">
    <div className="flex flex-col items-center text-center">
    <a className="text-headline-sm text-primary" href="#dashboard">CampusConnect</a>
    <span className="hidden text-outline-variant">•</span>
    <p className="text-body-sm text-on-surface-variant">
          © 2026 CampusConnect. University Student Life &amp; Extracurricular Hub. All rights reserved.
        </p>
    </div>

    <nav className="flex flex-wrap items-center justify-center text-label-sm">
    <a className="text-on-surface-variant hover:text-primary transition-colors" href="#clubs">Campus Directory</a>
    <a className="text-on-surface-variant hover:text-primary transition-colors" href="#guidelines">Event Guidelines</a>
    <a className="text-on-surface-variant hover:text-primary transition-colors" href="#about">Student Union</a>
    <a className="text-on-surface-variant hover:text-primary transition-colors" href="#privacy">Privacy Policy</a>
    <a className="text-on-surface-variant hover:text-primary transition-colors" href="#help">Help &amp; Support</a>
    </nav>
    </div>
    </footer>);
}
type Props = {
    event: CampusEvent;
    attendees: Registration[];
    busy: boolean;
    attendanceAvailable?: boolean;
    onCheck: (a: Registration) => void;
    onPass: (a: Registration) => void;
    onScanner: () => void;
    onBroadcast: () => void;
    onWalkIn: () => void;
    onExport: () => void;
};
export function ReferenceDashboard({ event, attendees, busy, attendanceAvailable = true, onCheck, onPass, onScanner, onBroadcast, onWalkIn, onExport }: Props) {
    const [search, setSearch] = useState(''), [filter, setFilter] = useState('All'), [page, setPage] = useState(1);
    const checked = attendees.filter(a => a.checked_in).length;
    const filtered = attendees.filter(a => (filter === 'All' || filter === 'Checked In' && a.checked_in || filter === 'Registered' && !a.checked_in) && ((a.name + ' ' + a.email).toLowerCase().includes(search.toLowerCase())));
    const actualPage = Math.min(page, Math.ceil(filtered.length / 7) || 1), visible = filtered.slice((actualPage - 1) * 7, actualPage * 7);
    return <div className="reference-ui space-y-6">

    <div>
    <a className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors text-label-md group" href="#organiser">
    <ReferenceIcon name={"arrow_back"} className="text-[18px] group-hover:-translate-x-0.5 transition-transform"/>
    <span>Back to my events</span>
    </a>
    </div>

    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/50 shadow-sm flex flex-col justify-between">
    <div className="space-y-1.5">
    <div className="flex items-center flex-wrap">
    <h1 className="text-headline-xl text-on-surface tracking-tight">Event attendees</h1>
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm">
            Live Check-in
          </span>
    </div>
    <p className="text-body-md text-on-surface-variant flex items-center flex-wrap">
    <span className="text-on-surface">{event.title}</span>
    <span className="text-outline-variant">•</span>
    <span className="flex items-center">
    <ReferenceIcon name={"calendar_today"} className="text-[16px] text-outline"/>
            {new Date(event.starts_at).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </span>
    <span className="text-outline-variant">•</span>
    <span className="flex items-center text-primary">
    <ReferenceIcon name={"group"} className="text-[16px]"/>
            {attendees.length} / {event.capacity} Confirmed RSVPs
          </span>
    </p>
    </div>

    <div className="flex items-center flex-wrap">
    <button onClick={onScanner} className="inline-flex items-center px-3.5 py-2 rounded-lg border border-outline-variant text-on-surface text-label-md hover:bg-surface-container-low hover:border-primary hover:text-primary transition-all active:scale-[0.98]">
    <ReferenceIcon name={"qr_code_scanner"} className="text-[18px]"/>
    <span>Scanner Mode</span>
    </button>
    <button onClick={onBroadcast} className="inline-flex items-center px-3.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-label-md hover:bg-surface-container-high transition-all active:scale-[0.98]">
    <ReferenceIcon name={"campaign"} className="text-[18px] text-secondary"/>
    <span>Broadcast Update</span>
    </button>
    </div>
    </div>

    <div className="grid grid-cols-1">
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center">
    <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
    <ReferenceIcon name={"how_to_reg"} className="text-[24px]"/>
    </div>
    <div>
    <div className="text-body-sm text-on-surface-variant">Checked-in</div>
    <div className="text-headline-md text-on-surface">{attendanceAvailable ? checked : "—"} <span className="text-body-sm text-outline">/ {attendees.length} RSVPs</span></div>
    </div>
    </div>
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center">
    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
    <ReferenceIcon name={"hourglass_top"} className="text-[24px]"/>
    </div>
    <div>
    <div className="text-body-sm text-on-surface-variant">Awaiting Arrival</div>
    <div className="text-headline-md text-on-surface">{attendanceAvailable ? attendees.length - checked : "—"} <span className="text-body-sm text-outline">pending</span></div>
    </div>
    </div>
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center">
    <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
    <ReferenceIcon name={"event_seat"} className="text-[24px]"/>
    </div>
    <div>
    <div className="text-body-sm text-on-surface-variant">Capacity Utilized</div>
    <div className="text-headline-md text-on-surface">{Math.round(attendees.length / event.capacity * 100)}% <span className="text-body-sm text-tertiary">({Math.max(0, event.capacity - attendees.length)} Open)</span></div>
    </div>
    </div>
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center">
    <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
    <ReferenceIcon name={"stars"} className="text-[24px]"/>
    </div>
    <div>
    <div className="text-body-sm text-on-surface-variant">Campus Verification</div>
    <div className="text-headline-md text-on-surface">— <span className="text-body-sm text-secondary">Not connected</span></div>
    </div>
    </div>
    </div>

    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden">

    <div className="p-5 border-b border-outline-variant/40 flex flex-col justify-between">

    <div className="flex flex-col w-full">

    <div className="relative w-full">
    <ReferenceIcon name={"search"} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]"/>
    <input className="w-full pl-10 pr-4 py-2 text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" aria-label="Search by name or email" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email" type="text"/>
    </div>

    <div className="flex items-center overflow-x-auto pb-1">
    <button onClick={() => { setFilter("All"); setPage(1); }} className={" px-3 py-1.5 rounded-lg text-label-md transition-all " + (filter === "All" ? " bg-primary text-on-primary " : " bg-surface-container-low text-on-surface-variant ")}>
              All ({attendees.length})
            </button>
    <button onClick={() => { setFilter("Checked In"); setPage(1); }} className={" px-3 py-1.5 rounded-lg text-label-md transition-all " + (filter === "Checked In" ? " bg-primary text-on-primary " : " bg-surface-container-low text-on-surface-variant ")}>
              Checked In ({checked})
            </button>
    <button onClick={() => { setFilter("Registered"); setPage(1); }} className={" px-3 py-1.5 rounded-lg text-label-md transition-all " + (filter === "Registered" ? " bg-primary text-on-primary " : " bg-surface-container-low text-on-surface-variant ")}>
              Registered ({attendees.length - checked})
            </button>
    <button onClick={() => { setFilter("Waitlist"); setPage(1); }} className={" px-3 py-1.5 rounded-lg text-label-md transition-all " + (filter === "Waitlist" ? " bg-primary text-on-primary " : " bg-surface-container-low text-on-surface-variant ")}>
              Waitlist ({0})
            </button>
    </div>
    </div>

    <div className="flex items-center self-end">
    <button onClick={onExport} className="inline-flex items-center px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-md transition-all active:scale-[0.98] shadow-xs">
    <ReferenceIcon name={"download"} className="text-[18px] text-primary"/>
    <span>Export attendee list</span>
    </button>
    </div>
    </div>

    <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
    <thead>
    <tr className="bg-surface-container-low text-on-surface-variant text-label-sm border-b border-outline-variant/40">
    <th className="py-3 px-4 w-12 text-center text-outline" scope="col">#</th>
    <th className="py-3 px-4 min-w-[200px]" scope="col">Name</th>
    <th className="py-3 px-4 min-w-[200px]" scope="col">Email</th>
    <th className="py-3 px-4 min-w-[150px]" scope="col">Registered at</th>
    <th className="py-3 px-4 min-w-[130px]" scope="col">Mode</th>
    <th className="py-3 px-4 min-w-[140px]" scope="col">Status</th>
    <th className="py-3 px-4 text-right min-w-[100px]" scope="col">Actions</th>
    </tr>
    </thead>
    <tbody className="divide-y divide-outline-variant/30 text-body-md">{visible.map((a, i) => <tr key={a.id} className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3.5 px-4 text-center text-outline text-body-sm">{String((actualPage - 1) * 7 + i + 1).padStart(2, "0")}</td><td className="py-3.5 px-4"><div className="flex items-center"><div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-label-sm">{a.name.split(" ").map(v => v[0]).slice(0, 2).join("")}</div><div><div className="text-on-surface">{a.name}</div><div className="text-body-sm text-outline">Campus student</div></div></div></td><td className="py-3.5 px-4 text-on-surface-variant text-body-sm">{a.email}</td><td className="py-3.5 px-4 text-on-surface-variant text-body-sm">{new Date(a.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · {new Date(a.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</td><td className="py-3.5 px-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm"><ReferenceIcon name={event.mode === "Virtual" ? "videocam" : "location_on"} className="text-[13px]"/>{event.mode}</span></td><td className="py-3.5 px-4"><span className={" inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm border " + (a.checked_in ? " bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] " : " bg-surface-container-high text-on-surface-variant border-outline-variant/60 ")}><span className={" w-1.5 h-1.5 rounded-full " + (a.checked_in ? " bg-[#10b981] " : " bg-outline ")}/>{!attendanceAvailable ? "Not tracked" : a.checked_in ? "Checked In" : "Awaiting Scan"}</span></td><td className="py-3.5 px-4 text-right"><div className="inline-flex items-center"><button className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container-high" title="View Ticket / Pass" onClick={() => onPass(a)}><ReferenceIcon name={"confirmation_number"} className="text-[20px]"/></button><button disabled={busy || !attendanceAvailable} className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container-high" title={a.checked_in ? "Undo check-in" : "Check in attendee"} onClick={() => onCheck(a)}><ReferenceIcon name={a.checked_in ? "undo" : "how_to_reg"} className="text-[20px]"/></button></div></td></tr>)}{!visible.length && <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">No attendees match this view.</td></tr>}</tbody>
    </table>
    </div>

    <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/40 flex flex-col justify-between text-body-sm text-on-surface-variant"><div>Showing <strong>{filtered.length ? (actualPage - 1) * 7 + 1 : 0}–{Math.min(actualPage * 7, filtered.length)}</strong> of <strong>{filtered.length}</strong> registered attendees</div><div className="flex items-center"><button className="p-1.5 rounded-lg border border-outline-variant/60 disabled:opacity-40" disabled={actualPage === 1} onClick={() => setPage(actualPage - 1)} aria-label="Previous page"><ReferenceIcon name={"chevron_left"} className="text-[18px]"/></button>{Array.from({ length: Math.ceil(filtered.length / 7) }, (_, i) => <button key={i} className={" w-8 h-8 rounded-lg text-label-sm " + (actualPage === i + 1 ? " bg-primary text-on-primary " : " hover:bg-surface-container-low ")} onClick={() => setPage(i + 1)}>{i + 1}</button>)}<button className="p-1.5 rounded-lg border border-outline-variant/60 disabled:opacity-40" disabled={actualPage >= Math.ceil(filtered.length / 7)} onClick={() => setPage(actualPage + 1)} aria-label="Next page"><ReferenceIcon name={"chevron_right"} className="text-[18px]"/></button></div></div></div><div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col items-center justify-between">
    <div className="flex items-center">
    <span className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
    <ReferenceIcon name={"info"} className="text-[20px]"/>
    </span>
    <div>
    <div className="text-label-lg text-on-surface">Need to admit unregistered walk-ins?</div>
    <div className="text-body-sm text-on-surface-variant">You can manually grant student admission using their University Student ID Card or event pass number.</div>
    </div>
    </div>
    <button onClick={onWalkIn} className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary text-label-md hover:bg-surface-container-high transition-colors shrink-0">
        + Add Walk-in Attendee
      </button>
    </div>
    </div>;
}
