import './globals.css';
import { StoreProvider } from './store';
export const metadata={title:'ALYA HOMES | Ev Yaşam Ürünleri',description:'ALYA HOMES ürün koleksiyonu'};
export default function RootLayout({children}){return <html lang="tr"><body><StoreProvider>{children}</StoreProvider></body></html>}
