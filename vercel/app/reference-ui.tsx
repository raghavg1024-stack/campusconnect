'use client';
import {useState} from 'react';
import {Bell,Bookmark,Menu,Search,X} from 'lucide-react';
import type {CampusEvent,Registration} from '@/lib/campus';
export function ReferenceHeader({initials,active,search,onSearch,go}:{initials:string;active:string;search:string;onSearch:(v:string)=>void;go:(s:string)=>void}){
 const [menu,setMenu]=useState(false);const links=[['events','Discover Events'],['calendar','Campus Calendar'],['rewards','Reward Points'],['my','My RSVPs & Clubs']];
 return <header className="reference-header stitch-header"><div className="stitch-header-inner"><a className="stitch-brand" href="#events"><span>CC</span>CampusConnect</a><div className="stitch-header-search"><Search size={17}/><input aria-label="Search events and clubs" placeholder="Search events, workshops, clubs…" value={search} onChange={e=>onSearch(e.target.value)}/></div><nav aria-label="Main navigation">{links.map(([key,label])=><a key={key} className={active===key||key==='events'&&active==='event'?'active':''} href={'#'+key}>{label}</a>)}</nav><div className="stitch-header-actions"><button className="icon-btn" aria-label="Notifications" onClick={()=>go('notifications')}><Bell size={20}/></button><button className="icon-btn stitch-saved" aria-label="Saved events" onClick={()=>go('saved')}><Bookmark size={20}/></button><a className="btn primary stitch-create" href="#create"><span>＋</span>Create Event</a><a className="stitch-account" href="#account" aria-label="Your account">{initials}</a><button className="icon-btn stitch-menu-toggle" aria-label="Open navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X size={20}/>:<Menu size={20}/>}</button></div></div>{menu&&<nav className="stitch-mobile-nav" aria-label="Mobile navigation">{[...links,['create','Create Event'],['organiser','Organiser workspace']].map(([key,label])=><a key={key} href={'#'+key} onClick={()=>setMenu(false)}>{label}</a>)}</nav>}</header>
}
export function ReferenceFooter(){return (<footer className="reference-footer docked full-width bg-surface-container-lowest mt-12 border-t border-outline-variant/30">
<div className="w-full py-8 px-6 lg:px-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
<div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
<a className="text-headline-sm font-headline-sm font-bold text-primary" href="#dashboard">CampusConnect</a>
<span className="hidden sm:inline text-outline-variant">•</span>
<p className="text-body-sm font-body-sm text-on-surface-variant">
          © 2026 CampusConnect. University Student Life &amp; Extracurricular Hub. All rights reserved.
        </p>
</div>

<nav className="flex flex-wrap items-center justify-center gap-4 text-label-sm font-label-sm">
<a className="text-on-surface-variant hover:text-primary transition-colors" href="#clubs">Campus Directory</a>
<a className="text-on-surface-variant hover:text-primary transition-colors" href="#guidelines">Event Guidelines</a>
<a className="text-on-surface-variant hover:text-primary transition-colors" href="#about">Student Union</a>
<a className="text-on-surface-variant hover:text-primary transition-colors" href="#privacy">Privacy Policy</a>
<a className="text-on-surface-variant hover:text-primary transition-colors" href="#help">Help &amp; Support</a>
</nav>
</div>
</footer>)}
type Props={event:CampusEvent;attendees:Registration[];busy:boolean;attendanceAvailable?:boolean;onCheck:(a:Registration)=>void;onPass:(a:Registration)=>void;onScanner:()=>void;onBroadcast:()=>void;onWalkIn:()=>void;onExport:()=>void};
export function ReferenceDashboard({event,attendees,busy,attendanceAvailable=true,onCheck,onPass,onScanner,onBroadcast,onWalkIn,onExport}:Props){const [search,setSearch]=useState(''),[filter,setFilter]=useState('All'),[page,setPage]=useState(1);const checked=attendees.filter(a=>a.checked_in).length;const filtered=attendees.filter(a=>(filter==='All'||filter==='Checked In'&&a.checked_in||filter==='Registered'&&!a.checked_in)&&((a.name+' '+a.email).toLowerCase().includes(search.toLowerCase())));const actualPage=Math.min(page,Math.ceil(filtered.length/7)||1),visible=filtered.slice((actualPage-1)*7,actualPage*7);return <div className="reference-ui space-y-6">

<div>
<a className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-label-md font-label-md group" href="#organiser">
<span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform" data-icon="arrow_back">arrow_back</span>
<span>Back to my events</span>
</a>
</div>

<div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
<div className="space-y-1.5">
<div className="flex items-center gap-2.5 flex-wrap">
<h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">Event attendees</h1>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold text-label-sm">
            Live Check-in
          </span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
<span className="font-semibold text-on-surface">{event.title}</span>
<span className="text-outline-variant">•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-outline" data-icon="calendar_today">calendar_today</span>
            {new Date(event.starts_at).toLocaleDateString("en-US",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
          </span>
<span className="text-outline-variant">•</span>
<span className="flex items-center gap-1 font-medium text-primary">
<span className="material-symbols-outlined text-[16px]" data-icon="group">group</span>
            {attendees.length} / {event.capacity} Confirmed RSVPs
          </span>
</p>
</div>

<div className="flex items-center gap-2.5 flex-wrap">
<button onClick={onScanner}  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-outline-variant text-on-surface text-label-md font-label-md hover:bg-surface-container-low hover:border-primary hover:text-primary transition-all active:scale-[0.98]">
<span className="material-symbols-outlined text-[18px]" data-icon="qr_code_scanner">qr_code_scanner</span>
<span>Scanner Mode</span>
</button>
<button onClick={onBroadcast}  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-label-md font-label-md hover:bg-surface-container-high transition-all active:scale-[0.98]">
<span className="material-symbols-outlined text-[18px] text-secondary" data-icon="campaign">campaign</span>
<span>Broadcast Update</span>
</button>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]" data-icon="how_to_reg">how_to_reg</span>
</div>
<div>
<div className="text-body-sm font-body-sm text-on-surface-variant font-medium">Checked-in</div>
<div className="text-headline-md font-headline-md text-on-surface font-bold">{attendanceAvailable?checked:"—"} <span className="text-body-sm font-body-sm text-outline font-normal">/ {attendees.length} RSVPs</span></div>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-[24px]" data-icon="hourglass_top">hourglass_top</span>
</div>
<div>
<div className="text-body-sm font-body-sm text-on-surface-variant font-medium">Awaiting Arrival</div>
<div className="text-headline-md font-headline-md text-on-surface font-bold">{attendanceAvailable?attendees.length-checked:"—"} <span className="text-body-sm font-body-sm text-outline font-normal">pending</span></div>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined text-[24px]" data-icon="event_seat">event_seat</span>
</div>
<div>
<div className="text-body-sm font-body-sm text-on-surface-variant font-medium">Capacity Utilized</div>
<div className="text-headline-md font-headline-md text-on-surface font-bold">{Math.round(attendees.length/event.capacity*100)}% <span className="text-body-sm font-body-sm text-tertiary font-medium">({Math.max(0,event.capacity-attendees.length)} Open)</span></div>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[24px]" data-icon="stars">stars</span>
</div>
<div>
<div className="text-body-sm font-body-sm text-on-surface-variant font-medium">Campus Verification</div>
<div className="text-headline-md font-headline-md text-on-surface font-bold">— <span className="text-body-sm font-body-sm text-secondary font-medium">Not connected</span></div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden">

<div className="p-5 border-b border-outline-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-4">

<div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">

<div className="relative w-full sm:w-80">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]" data-icon="search">search</span>
<input className="w-full pl-10 pr-4 py-2 text-body-md font-body-md bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" aria-label="Search by name or email" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search by name or email" type="text"/>
</div>

<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
<button onClick={()=>{setFilter("All");setPage(1)}}  className={"px-3 py-1.5 rounded-lg text-label-md font-semibold transition-all "+(filter==="All"?"bg-primary text-on-primary":"bg-surface-container-low text-on-surface-variant")}>
              All ({attendees.length})
            </button>
<button onClick={()=>{setFilter("Checked In");setPage(1)}}  className={"px-3 py-1.5 rounded-lg text-label-md font-semibold transition-all "+(filter==="Checked In"?"bg-primary text-on-primary":"bg-surface-container-low text-on-surface-variant")}>
              Checked In ({checked})
            </button>
<button onClick={()=>{setFilter("Registered");setPage(1)}}  className={"px-3 py-1.5 rounded-lg text-label-md font-semibold transition-all "+(filter==="Registered"?"bg-primary text-on-primary":"bg-surface-container-low text-on-surface-variant")}>
              Registered ({attendees.length-checked})
            </button>
<button onClick={()=>{setFilter("Waitlist");setPage(1)}}  className={"px-3 py-1.5 rounded-lg text-label-md font-semibold transition-all "+(filter==="Waitlist"?"bg-primary text-on-primary":"bg-surface-container-low text-on-surface-variant")}>
              Waitlist ({0})
            </button>
</div>
</div>

<div className="flex items-center gap-2 self-end sm:self-auto">
<button onClick={onExport}  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-md font-label-md font-semibold transition-all active:scale-[0.98] shadow-xs">
<span className="material-symbols-outlined text-[18px] text-primary" data-icon="download">download</span>
<span>Export attendee list</span>
</button>
</div>
</div>

<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm border-b border-outline-variant/40">
<th className="py-3 px-4 w-12 text-center text-outline" scope="col">#</th>
<th className="py-3 px-4 min-w-[200px]" scope="col">Name</th>
<th className="py-3 px-4 min-w-[200px]" scope="col">Email</th>
<th className="py-3 px-4 min-w-[150px]" scope="col">Registered at</th>
<th className="py-3 px-4 min-w-[130px]" scope="col">Mode</th>
<th className="py-3 px-4 min-w-[140px]" scope="col">Status</th>
<th className="py-3 px-4 text-right min-w-[100px]" scope="col">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/30 text-body-md font-body-md">{visible.map((a,i)=><tr key={a.id} className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3.5 px-4 text-center font-semibold text-outline text-body-sm">{String((actualPage-1)*7+i+1).padStart(2,"0")}</td><td className="py-3.5 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-label-sm">{a.name.split(" ").map(v=>v[0]).slice(0,2).join("")}</div><div><div className="font-bold text-on-surface">{a.name}</div><div className="text-body-sm text-outline font-normal">Campus student</div></div></div></td><td className="py-3.5 px-4 text-on-surface-variant text-body-sm">{a.email}</td><td className="py-3.5 px-4 text-on-surface-variant text-body-sm">{new Date(a.created_at).toLocaleDateString("en-US",{day:"numeric",month:"short"})} · {new Date(a.created_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</td><td className="py-3.5 px-4"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-medium"><span className="material-symbols-outlined text-[13px]">{event.mode==="Virtual"?"videocam":"location_on"}</span>{event.mode}</span></td><td className="py-3.5 px-4"><span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-semibold border "+(a.checked_in?"bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]":"bg-surface-container-high text-on-surface-variant border-outline-variant/60")}><span className={"w-1.5 h-1.5 rounded-full "+(a.checked_in?"bg-[#10b981]":"bg-outline")}/>{!attendanceAvailable?"Not tracked":a.checked_in?"Checked In":"Awaiting Scan"}</span></td><td className="py-3.5 px-4 text-right"><div className="inline-flex items-center gap-1"><button   className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container-high" title="View Ticket / Pass" onClick={()=>onPass(a)}><span className="material-symbols-outlined text-[20px]">confirmation_number</span></button><button   disabled={busy||!attendanceAvailable} className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container-high" title={a.checked_in?"Undo check-in":"Check in attendee"} onClick={()=>onCheck(a)}><span className="material-symbols-outlined text-[20px]">{a.checked_in?"undo":"how_to_reg"}</span></button></div></td></tr>)}{!visible.length&&<tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">No attendees match this view.</td></tr>}</tbody>
</table>
</div>

<div className="p-4 bg-surface-container-lowest border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-sm text-on-surface-variant"><div>Showing <strong>{filtered.length?(actualPage-1)*7+1:0}–{Math.min(actualPage*7,filtered.length)}</strong> of <strong>{filtered.length}</strong> registered attendees</div><div className="flex gap-1 items-center"><button className="p-1.5 rounded-lg border border-outline-variant/60 disabled:opacity-40" disabled={actualPage===1} onClick={()=>setPage(actualPage-1)} aria-label="Previous page"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>{Array.from({length:Math.ceil(filtered.length/7)},(_,i)=><button key={i} className={"w-8 h-8 rounded-lg text-label-sm "+(actualPage===i+1?"bg-primary text-on-primary font-bold":"hover:bg-surface-container-low")} onClick={()=>setPage(i+1)}>{i+1}</button>)}<button className="p-1.5 rounded-lg border border-outline-variant/60 disabled:opacity-40" disabled={actualPage>=Math.ceil(filtered.length/7)} onClick={()=>setPage(actualPage+1)} aria-label="Next page"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button></div></div></div><div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]" data-icon="info">info</span>
</span>
<div>
<div className="text-label-lg font-label-lg text-on-surface font-bold">Need to admit unregistered walk-ins?</div>
<div className="text-body-sm font-body-sm text-on-surface-variant">You can manually grant student admission using their University Student ID Card or event pass number.</div>
</div>
</div>
<button onClick={onWalkIn}  className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary font-semibold text-label-md font-label-md hover:bg-surface-container-high transition-colors shrink-0">
        + Add Walk-in Attendee
      </button>
</div>
</div>;}

