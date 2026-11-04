import type { Metadata } from 'next';
import './globals.css';
import './stitch-theme.css';
export const metadata:Metadata={title:'CampusConnect — Your campus, connected',description:'Discover campus events, join student clubs, and bring your community together.'};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
