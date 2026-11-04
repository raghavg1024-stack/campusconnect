'use client';
import type {ReactNode} from 'react';
import {ArrowLeft,ArrowUpRight,Bookmark,CalendarDays,CheckCircle2,GraduationCap,Info,MapPin,Share2,ShieldCheck,Sparkles,Ticket,Users} from 'lucide-react';
import {eventCover} from '@/lib/event-cover';
import {clubs,type CampusEvent} from '@/lib/campus';

type Props={event:CampusEvent;saved:boolean;onSave:()=>void;onShare:()=>void;onCalendar:()=>void;registration:ReactNode;owner:boolean;attendanceAvailable:boolean};
export function StitchEvent({event,saved,onSave,onShare,onCalendar,registration,owner,attendanceAvailable}:Props){
 const host=clubs.find(c=>c.id===event.club),remaining=Math.max(0,event.capacity-event.registered),percent=event.capacity?Math.min(100,Math.round(event.registered/event.capacity*100)):0;
 const open=event.status==='published'&&new Date(event.starts_at).getTime()>Date.now()&&remaining>0;
 const day=event.starts_at?new Date(event.starts_at).toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'Date to be announced';
 const hour=event.starts_at?new Date(event.starts_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZoneName:'short'}):'Time to be announced';
 return <div className="stitch-detail">
  <a className="stitch-back" href="#events"><ArrowLeft size={16}/>Back to events</a>
  <div className="stitch-hero-grid">
   <section className="stitch-visual">
    <div className="stitch-photo"><img src={eventCover(event.title)} alt="AI-generated campus event illustration" fetchPriority="high"/><div className="stitch-tags"><span>{event.category}</span><span>Campus event</span></div><div className="stitch-photo-caption"><span><Users size={17}/>Hosted by {host?.name||'Campus Community'}</span><span className="stitch-campus-tag"><GraduationCap size={15}/>CampusConnect</span></div></div>
    <div className="stitch-social"><span className="stitch-attending"><span className="stitch-people"><Users size={18}/></span><strong>{event.registered}</strong> students registered</span><span><Ticket size={16}/>Free campus gathering</span></div>
   </section>
   <section className="stitch-summary stitch-panel">
    <div className="stitch-summary-top"><span className={'stitch-status '+(open?'':'closed')}><i/>{open?'Registration open':'Registration closed'}</span><div><button className="icon-btn" onClick={onSave} aria-label={saved?'Remove bookmark':'Save event'} aria-pressed={saved}><Bookmark size={19} fill={saved?'currentColor':'none'}/></button><button className="icon-btn" onClick={onShare} aria-label="Share event"><Share2 size={18}/></button></div></div>
    <h1>{event.title}</h1>
    <div className="stitch-facts"><div className="stitch-fact"><span className="stitch-fact-icon"><CalendarDays size={20}/></span><div><strong>{day}</strong><p>{hour} <button className="stitch-inline" onClick={onCalendar}>· Add to calendar</button></p></div></div><div className="stitch-fact"><span className="stitch-fact-icon violet"><MapPin size={20}/></span><div><strong>{event.mode==='Virtual'?'Online session':event.location==='Location to be announced'?'Campus gathering':event.mode+' event'}</strong><p>{event.location}</p></div></div><div className="stitch-fact amber"><span className="stitch-fact-icon amber"><Sparkles size={20}/></span><div><strong>{attendanceAvailable?'Earn campus points':'Make your next campus connection'}</strong><p>{attendanceAvailable?'Points are earned after verified check-in.':'Meet your community. Learn something new.'}</p></div></div></div>
    <div className="stitch-registration">{registration}<p>Free admission · Your registration appears in My RSVPs</p></div>
    <div className="stitch-capacity"><div><strong>Registration capacity</strong><strong>{event.registered} / {event.capacity} claimed ({percent}%)</strong></div><progress value={percent} max={100} aria-label="Registration capacity"/><div><span>{remaining} spots remaining</span><span>{open?'Reserve your place':'Registration unavailable'}</span></div></div>
   </section>
  </div>
  <div className="stitch-content-grid"><div className="stitch-main-panels">
   <section className="stitch-panel stitch-about"><h2><Info size={23}/>About this event</h2><p className="stitch-description">{event.description}</p><h3>Good to know</h3><ul><li><CheckCircle2/>Free entry with an event registration.</li><li><CheckCircle2/>Keep your event pass handy on the day.</li><li><CheckCircle2/>Can’t make it? Cancel your registration to release your spot.</li><li><CheckCircle2/>Check with the organiser for venue and accessibility arrangements.</li></ul></section>
   <section className="stitch-panel"><div className="stitch-panel-title"><h2><Users size={23}/>Your campus community</h2><span className="stitch-badge">CONNECT & PARTICIPATE</span></div><div className="stitch-community"><span className="stitch-fact-icon"><GraduationCap size={28}/></span><div><h3>{host?.name||'Campus Community'}</h3><p>{host?.description||'A place for students to discover gatherings, share interests, and build connections across campus.'}</p><a href={host?'#club/'+host.id:'#events'} className="stitch-text-link">{host?'Explore this club':'Explore more events'}<ArrowUpRight size={15}/></a></div></div></section>
  </div><aside className="stitch-sidebar"><section className="stitch-panel"><h3><Info size={19}/>Event details</h3><dl><div><dt>Capacity</dt><dd>{event.capacity} attendees</dd></div><div><dt>Registered</dt><dd className="stitch-primary">{event.registered} spots</dd></div><div><dt>Status</dt><dd><span className={'stitch-state-pill '+(open?'':'closed')}>{open?'Open':'Closed'}</span></dd></div><div><dt>Admission</dt><dd>Free</dd></div></dl><div className="stitch-requirements"><strong>Before you arrive</strong><p><Ticket size={19}/>Register using your own account and bring your event pass.</p></div></section><section className="stitch-panel"><div className="stitch-host"><span className="stitch-fact-icon"><GraduationCap size={24}/></span><div><h3>{host?.name||'Campus Community'}</h3><p>Student events & connections</p></div></div><p className="stitch-host-copy">{host?.description||'Discover what’s happening, meet fellow students, and take part in campus life.'}</p><a className="btn full" href={owner?'#attendees/'+event.id:host?'#club/'+host.id:'#clubs'}>{owner?<ShieldCheck size={16}/>:<Users size={16}/>} {owner?'Manage event':'Explore clubs'}</a></section><a className="stitch-help" href="#help"><Info size={20}/><span>Questions about registration or your event pass? <strong>Visit Help & Support.</strong></span></a></aside></div>
 </div>;
}
