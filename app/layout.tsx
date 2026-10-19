import type {Metadata,Viewport} from 'next';
import './globals.css';
import './arcade.css';
import './phone.css';
import './cards.css';
export const metadata:Metadata={title:'5 Dead — Stay under 21. Stay alive.',description:'Five lives. One last survivor. Play the card game offline, with bots, or with friends online.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/icon-192.png'},appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'5 Dead'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',interactiveWidget:'resizes-content',themeColor:'#1c1d20'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
