import QRCode from 'qrcode';

export class WatermarkAssets {
  /**
   * Generates a PNG QR code buffer for the public verification URL
   */
  public static async generateVerificationQr(verificationUrl: string): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(verificationUrl, {
        type: 'png',
        width: 160,
        margin: 1,
        color: {
          dark: '#245B38',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (err) {
      console.error('[QR Generation Error]', err);
      // Fallback 1x1 transparent PNG if QR generation fails
      return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA', 'base64');
    }
  }

  /**
   * Renders the authentic Farmer-Ploughing-with-Two-Oxen background watermark
   * Centered on the page with 5% opacity so body text remains 100% readable.
   */
  public static renderOxenWatermark(doc: PDFKit.PDFDocument, centerX: number = 297.64, centerY: number = 430, scale: number = 0.85): void {
    doc.save();
    doc.opacity(0.048); // Subtle 4.8% opacity - strictly adheres to 4-7% specification
    doc.translate(centerX - (140 * scale), centerY - (90 * scale));
    doc.scale(scale);

    const emerald = '#245B38';

    // 1. Furrowed Soil Base lines
    doc.lineWidth(2).strokeColor(emerald);
    doc.moveTo(10, 165).bezierCurveTo(70, 168, 140, 163, 210, 166).bezierCurveTo(250, 168, 290, 164, 330, 167).stroke();
    doc.moveTo(35, 172).bezierCurveTo(90, 174, 160, 170, 230, 173).bezierCurveTo(270, 175, 305, 171, 320, 173).stroke();

    // 2. Oxen 1 (Lead Bullock - Right)
    // Body & Hump (Zebu hump typical of Indian Gir / Kankrej bullocks)
    doc.fillColor(emerald);
    doc.path('M 195 125 C 190 115 185 100 195 90 C 205 80 215 90 220 95 C 235 90 255 92 270 100 C 280 95 290 85 295 75 C 298 70 305 72 305 78 C 302 90 295 102 290 108 C 300 112 305 120 302 130 C 295 135 285 133 275 132 C 270 145 268 162 265 165 C 262 165 258 145 255 132 C 245 132 235 132 225 133 C 220 145 218 160 215 165 C 210 165 208 142 205 132 C 198 132 195 130 195 125 Z').fill();
    // Horns of Ox 1
    doc.path('M 292 85 C 296 70 302 55 315 48 C 314 55 308 65 300 80 Z').fill();
    doc.path('M 285 82 C 288 68 290 54 285 45 C 283 55 284 68 288 80 Z').fill();

    // 3. Oxen 2 (Pair Bullock - Offset Left)
    doc.path('M 145 128 C 140 118 135 105 145 95 C 155 85 165 95 170 100 C 185 95 205 97 220 105 C 230 100 240 90 245 80 C 248 75 255 77 255 83 C 252 95 245 107 240 113 C 250 117 255 125 252 135 C 245 140 235 138 225 137 C 220 148 218 163 215 166 C 212 166 208 148 205 137 C 195 137 185 137 175 138 C 170 148 168 162 165 166 C 160 166 158 145 155 137 C 148 137 145 134 145 128 Z').fill();
    // Horns of Ox 2
    doc.path('M 242 90 C 246 75 252 60 265 53 C 264 60 258 70 250 85 Z').fill();
    doc.path('M 235 87 C 238 73 240 59 235 50 C 233 60 234 73 238 85 Z').fill();

    // 4. Wooden Yoke (ધૂંસરી) across the necks
    doc.lineWidth(3).strokeColor(emerald);
    doc.moveTo(155, 98).lineTo(285, 96).stroke();

    // 5. Traditional Plough Beam & Share (હળ)
    doc.lineWidth(2.5).strokeColor(emerald);
    doc.moveTo(220, 97).lineTo(85, 150).stroke(); // Main draught beam
    // Plough body & handle
    doc.path('M 85 150 L 78 165 L 88 167 L 95 152 Z').fill(); // Plough iron share penetrating ground
    doc.lineWidth(2).strokeColor(emerald);
    doc.moveTo(85, 150).lineTo(65, 110).stroke(); // Upright handle held by farmer

    // 6. Indian Farmer (ખેડૂત - Dhoti, Paghdi/Turban, Upright Agronomist Stature)
    // Paghdi / Turban (Head)
    doc.circle(48, 85, 9).fill();
    doc.path('M 40 85 C 40 76 56 76 56 85 C 57 88 39 88 40 85 Z').fill();
    // Torso with Angrakha / Kurta
    doc.path('M 43 95 L 53 95 L 58 130 L 38 130 Z').fill();
    // Arms holding the plough handle
    doc.lineWidth(2.5).strokeColor(emerald);
    doc.moveTo(48, 102).lineTo(65, 110).stroke();
    // Dhoti / Legs treading the furrow
    doc.path('M 38 130 L 47 165 L 51 165 L 48 130 Z').fill();
    doc.path('M 48 130 L 56 163 L 60 163 L 57 130 Z').fill();

    // Subtle sun rays behind farmer
    doc.lineWidth(0.8).strokeColor(emerald);
    for (let angle = 0; angle < Math.PI; angle += Math.PI / 8) {
      const sx = 48 + Math.cos(angle) * 16;
      const sy = 80 - Math.sin(angle) * 16;
      const ex = 48 + Math.cos(angle) * 26;
      const ey = 80 - Math.sin(angle) * 26;
      doc.moveTo(sx, sy).lineTo(ex, ey).stroke();
    }

    doc.restore();
  }

  /**
   * Renders the Official Circular Company Seal on the bottom-right of the document
   */
  public static renderOfficialSeal(doc: PDFKit.PDFDocument, centerX: number, centerY: number, radius: number = 32): void {
    doc.save();
    const primary = '#245B38';
    const secondary = '#4F8A4B';

    // 1. Outer Circular Ring
    doc.circle(centerX, centerY, radius).lineWidth(1.8).strokeColor(primary).stroke();
    
    // 2. Middle Concentric Ring
    doc.circle(centerX, centerY, radius - 2.5).lineWidth(0.6).strokeColor(secondary).stroke();

    // 3. Inner Dotted / Star Ring
    doc.circle(centerX, centerY, radius - 5.5).lineWidth(0.8).dash(2, { space: 1.5 }).strokeColor(primary).stroke();
    doc.undash();

    // 4. Center Background Tint
    doc.circle(centerX, centerY, radius - 6.5).fillColor('#F7F9F5').fill();

    // 5. Seal Top Arc Header Text
    doc.font('Helvetica-Bold').fontSize(5.2).fillColor(primary);
    doc.text('THE KHEDUT', centerX - 24, centerY - 23, { width: 48, align: 'center' });

    // 6. Center Emblem Icon (Stylized Farmer & Sprout Node)
    doc.circle(centerX, centerY - 8, 2.8).fillColor(secondary).fill();
    doc.path(`M ${centerX - 5} ${centerY - 4} Q ${centerX} ${centerY - 9} ${centerX + 5} ${centerY - 4} L ${centerX + 3} ${centerY + 5} L ${centerX - 3} ${centerY + 5} Z`)
      .fillColor(primary).fill();
    // Leaf flourish
    doc.path(`M ${centerX} ${centerY - 1} Q ${centerX + 6} ${centerY - 6} ${centerX + 8} ${centerY - 1} Q ${centerX + 4} ${centerY + 1} ${centerX} ${centerY - 1}`)
      .fillColor('#A5C96A').fill();

    // 7. Verification Banner
    doc.rect(centerX - 24, centerY + 6, 48, 8).fillColor(primary).fill();
    doc.font('Helvetica-Bold').fontSize(4.5).fillColor('#FFFFFF');
    doc.text('VERIFIED REPORT', centerX - 24, centerY + 8, { width: 48, align: 'center' });

    // 8. Seal Bottom Text
    doc.font('Helvetica-Bold').fontSize(3.8).fillColor(secondary);
    doc.text('DIGITALLY ATTESTED', centerX - 25, centerY + 16, { width: 50, align: 'center' });

    doc.restore();
  }
}
