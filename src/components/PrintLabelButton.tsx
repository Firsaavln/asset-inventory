"use client";

import { Printer } from "lucide-react";
import QRCode from "react-qr-code"; // 👈 Pakai library bawaan bapak

interface PrintLabelProps {
  assetCode: string;
  assetName: string;
}

export default function PrintLabelButton({ assetCode, assetName }: PrintLabelProps) {
  
  const handlePrint = () => {
    // 1. Ambil elemen SVG dari QR Code yang kita sembunyikan di bawah
    const qrSvg = document.getElementById(`qr-hidden-${assetCode}`);
    const svgHTML = qrSvg ? qrSvg.outerHTML : '';

    // 2. Buka jendela cetak baru
    const printWindow = window.open('', '', 'width=600,height=400');
    if (!printWindow) return;

    // 3. Suntikkan HTML & CSS Standar Label 50mm x 25mm
    const html = `
      <html>
        <head>
          <title>Print Label - ${assetCode}</title>
          <style>
            /* Memaksa kertas printer default ke ukuran label sticker 50x25mm */
            @page { 
              size: 50mm 25mm; 
              margin: 0; 
            }
            body {
              margin: 0;
              padding: 2.5mm;
              width: 50mm;
              height: 25mm;
              box-sizing: border-box;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              display: flex;
              align-items: center;
              gap: 3mm;
              background: white;
            }
            .qr-container {
              width: 20mm; /* Standar emas ukuran QR Code */
              height: 20mm;
              flex-shrink: 0;
            }
            .qr-container svg {
              width: 100%;
              height: 100%;
            }
            .text-container {
              display: flex;
              flex-direction: column;
              justify-content: center;
              overflow: hidden;
              width: 100%;
            }
            .asset-code {
              font-size: 8pt;
              font-weight: 900;
              color: #000;
              margin-bottom: 1mm;
            }
            .asset-name {
              font-size: 5.5pt;
              font-weight: 600;
              color: #333;
              line-height: 1.3;
              /* Memotong teks jika nama aset terlalu panjang (maksimal 2 baris) */
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${svgHTML}
          </div>
          <div class="text-container">
            <div class="asset-code">${assetCode}</div>
            <div class="asset-name">${assetName}</div>
          </div>
          <script>
            // Otomatis munculkan dialog print saat loading selesai
            window.onload = () => {
              window.print();
              // Otomatis tutup jendela kalau user selesai nge-print atau batal
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <>
      {/* QR Code Tersembunyi: Hanya dipakai mesin untuk digenerate saat nge-print */}
      <div style={{ display: 'none' }}>
        <QRCode 
          id={`qr-hidden-${assetCode}`} 
          value={assetCode} 
          level="H" // Error correction level tertinggi (Aman walau sticker lecet)
        />
      </div>

      {/* Tombol Icon Clean UI */}
      <button
        onClick={handlePrint}
        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
        title="Cetak Label Aset"
      >
        <Printer className="w-4 h-4" />
      </button>
    </>
  );
}