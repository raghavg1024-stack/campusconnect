'use client';
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import type { CampusEvent, Registration } from '@/lib/campus';
import { passCode } from '@/lib/pass-code';
export function EventPass({ event, registration, dateLabel, timeLabel }: {
    event: CampusEvent;
    registration: Registration;
    dateLabel: string;
    timeLabel: string;
}) {
    const card = useRef<HTMLDivElement>(null), code = passCode(event.id, registration.id), cancelled = event.status === 'cancelled';
    function download() {
        if (!card.current)
            return;
        const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CampusConnect event pass</title><style>body{background:#f7f9fb;padding:24px;color:#302951}.event-pass{width:min(100%, 460px);margin:auto;background:#f3effd;border:1px solid #e6dff7;padding:28px;border-radius:16px}.eyebrow{font-size:11px;letter-spacing:.08em;color:#4648d4}h2{font-size:25px}.pass-dashed{border-top:1px dashed #c9bfe2;margin:24px 0}.pass-qr{text-align:center;margin:24px 0}.pass-qr svg{width:min(100%, 100%);height:auto;background:white;border-radius:8px}.pass-qr p{font-size:12px}.pass-code{overflow-wrap:anywhere;background:#e9e3f6;padding:12px;border-radius:8px;margin:18px 0}.pill{display:inline-block;border-radius:20px;padding:5px 12px;background:#e0f5e8;color:#24734d;font-size:11px}.pink{background:#fde7ec;color:#9d2448}</style></head><body>' + card.current.outerHTML + '</body></html>';
        const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })), link = document.createElement('a');
        link.href = url;
        link.download = 'campus-event-pass-' + registration.id + '.html';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return <><div className="event-pass" ref={card}><div className="eyebrow">CAMPUSCONNECT / ADMIT ONE</div><h2>{event.title}</h2><p>{dateLabel}<br />{timeLabel} · {event.location}</p><div className="pass-dashed"/><strong>{registration.name}</strong><p>{registration.email}</p><div className="pass-qr"><QRCodeSVG value={code} size={224} level="M" marginSize={4} bgColor="#ffffff" fgColor="#191c1e" title={'Unique event pass for ' + event.title}/><p>Unique to this event registration</p></div><div className="pass-code">{registration.id}</div><span className={" pill " + (cancelled ? " pink " : " green ")}>{cancelled ? 'Event cancelled' : registration.checked_in ? 'Checked in' : 'Registration confirmed'}</span></div><p className="form-hint">Bring this QR pass and your campus ID. Each registration has its own code, including different events booked by the same student.</p><button className="btn primary full" onClick={download}><Download size={17}/>Download pass with QR</button></>;
}
