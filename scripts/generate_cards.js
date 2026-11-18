const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const QRCode = require('qrcode');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const tempDir = path.join(rootDir, '.temp_cards');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // 1. Load logo as base64
  const logoPath = path.join(rootDir, 'apps/web/public/logo.png');
  const logoBuf = fs.readFileSync(logoPath);
  const logoB64 = 'data:image/png;base64,' + logoBuf.toString('base64');

  // 2. Generate vector QR Code for sicoinx.com
  const qrSvg = await QRCode.toString('https://sicoinx.com', {
    type: 'svg',
    margin: 1,
    color: { dark: '#00F0FF', light: '#00000000' }
  });

  // Common fonts and styles
  const googleFonts = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  `;

  // -------------------------------------------------------------
  // FRONT SIDE HTML
  // -------------------------------------------------------------
  const frontHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SICOINX Visiting Card - Front</title>
  ${googleFonts}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1050px;
      height: 600px;
      background: #040812;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      position: relative;
      width: 1050px;
      height: 600px;
      background: radial-gradient(120% 120% at 85% 15%, #0B1C38 0%, #071124 45%, #040812 100%);
      border-radius: 32px;
      overflow: hidden;
      border: 1.5px solid rgba(0, 240, 255, 0.4);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px -10px rgba(23, 92, 255, 0.25);
    }
    /* Ambient neon glows */
    .glow-cyan {
      position: absolute;
      top: -80px;
      right: -80px;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, rgba(23, 92, 255, 0.08) 50%, transparent 70%);
      pointer-events-none;
      filter: blur(40px);
    }
    .glow-blue {
      position: absolute;
      bottom: -100px;
      left: -80px;
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(23, 92, 255, 0.22) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 70%);
      pointer-events-none;
      filter: blur(40px);
    }
    .glow-emerald {
      position: absolute;
      bottom: 60px;
      right: 180px;
      width: 320px;
      height: 320px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
      pointer-events-none;
      filter: blur(35px);
    }

    /* Micro-fine background wireframe / guilloche waves */
    .bg-wave {
      position: absolute;
      inset: 0;
      opacity: 0.22;
      pointer-events-none;
    }

    /* Outer Holographic Border Inset */
    .inner-border {
      position: absolute;
      inset: 16px;
      border-radius: 22px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      pointer-events-none;
    }
    .inner-border::before {
      content: '';
      position: absolute;
      top: 0; left: 15%; right: 15%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #00F0FF, #10B981, transparent);
    }
    .inner-border::after {
      content: '';
      position: absolute;
      bottom: 0; left: 20%; right: 20%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #8B5CF6, #175CFF, transparent);
    }

    /* Card Content Layout */
    .card-content {
      position: relative;
      z-index: 2;
      height: 100%;
      padding: 44px 52px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Top Row: EMV Chip, NFC & Status */
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chip-group {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    /* Smart Metallic Chip */
    .emv-chip {
      width: 68px;
      height: 52px;
      background: linear-gradient(135deg, #FAD961 0%, #F76B1C 50%, #D4AF37 100%);
      border-radius: 10px;
      position: relative;
      box-shadow: inset 0 1px 3px rgba(255,255,255,0.6), 0 4px 10px rgba(0,0,0,0.5);
      border: 1px solid rgba(212, 175, 55, 0.8);
      overflow: hidden;
    }
    .emv-chip::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid rgba(130, 80, 10, 0.6);
      border-radius: 5px;
    }
    .emv-lines {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(130, 80, 10, 0.7);
    }
    .emv-lines::before {
      content: '';
      position: absolute;
      top: -12px;
      left: 35%;
      width: 1px;
      height: 25px;
      background: rgba(130, 80, 10, 0.7);
    }
    .emv-lines::after {
      content: '';
      position: absolute;
      top: -12px;
      right: 35%;
      width: 1px;
      height: 25px;
      background: rgba(130, 80, 10, 0.7);
    }

    /* Contactless NFC Icon */
    .nfc-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .badge-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      background: rgba(23, 92, 255, 0.12);
      border: 1px solid rgba(0, 240, 255, 0.35);
      border-radius: 100px;
      backdrop-filter: blur(12px);
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px #10B981;
    }
    .badge-text {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #00F0FF;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
    }

    /* Center Section: Grand Logo & Heading */
    .center-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 10px;
    }
    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .brand-logo-frame {
      width: 96px;
      height: 96px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 25px rgba(0, 240, 255, 0.45));
    }
    .brand-logo-frame img {
      width: 100%;
      height: 100%;
      object-contain: contain;
    }
    .title-box {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-size: 58px;
      font-weight: 900;
      letter-spacing: -1.5px;
      line-height: 1;
      color: #FFFFFF;
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .brand-name span.highlight {
      background: linear-gradient(135deg, #00F0FF 0%, #175CFF 50%, #2EE66B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-name span.sup {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #00F0FF;
      margin-left: 8px;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
      padding: 3px 8px;
      border: 1px solid rgba(0, 240, 255, 0.35);
      border-radius: 6px;
      background: rgba(0, 240, 255, 0.08);
    }
    .brand-subtitle-tag {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 3.5px;
      color: #94A3B8;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
      margin-top: 8px;
    }

    .tagline-callout {
      font-size: 18px;
      font-weight: 500;
      color: #E2E8F0;
      line-height: 1.4;
      max-width: 780px;
      letter-spacing: 0.2px;
      margin-top: 6px;
    }
    .tagline-callout strong {
      color: #FFFFFF;
      font-weight: 700;
    }

    /* Bottom Row: Micro-Telemetry & Hologram Bar */
    .bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .telemetry-specs {
      display: flex;
      gap: 32px;
    }
    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .spec-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748B;
      font-family: 'Space Grotesk', sans-serif;
    }
    .spec-value {
      font-size: 13px;
      font-weight: 700;
      color: #F1F5F9;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.5px;
    }
    .spec-value.cyan { color: #00F0FF; }
    .spec-value.green { color: #10B981; }

    .hologram-seal {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      backdrop-filter: blur(8px);
    }
    .seal-shield {
      width: 24px;
      height: 24px;
    }
    .seal-text {
      display: flex;
      flex-direction: column;
    }
    .seal-text span:first-child {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #FFFFFF;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
    }
    .seal-text span:last-child {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 1px;
      color: #00F0FF;
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="glow-cyan"></div>
    <div class="glow-blue"></div>
    <div class="glow-emerald"></div>

    <!-- Guilloche Background Vector Waves -->
    <svg class="bg-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 600" fill="none">
      <defs>
        <linearGradient id="gGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.5"/>
          <stop offset="50%" stop-color="#175CFF" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <!-- Mathematical Harmonic Grid Lines -->
      <path d="M0 320 C 250 200, 450 480, 750 310 S 950 180, 1050 240" stroke="url(#gGrad1)" stroke-width="1.2"/>
      <path d="M0 340 C 250 220, 450 500, 750 330 S 950 200, 1050 260" stroke="url(#gGrad1)" stroke-width="1.0" opacity="0.8"/>
      <path d="M0 360 C 250 240, 450 520, 750 350 S 950 220, 1050 280" stroke="url(#gGrad1)" stroke-width="0.8" opacity="0.6"/>
      <path d="M0 380 C 250 260, 450 540, 750 370 S 950 240, 1050 300" stroke="url(#gGrad1)" stroke-width="0.6" opacity="0.4"/>
      <path d="M0 400 C 250 280, 450 560, 750 390 S 950 260, 1050 320" stroke="url(#gGrad1)" stroke-width="0.5" opacity="0.3"/>
      
      <!-- Upper Counter Waves -->
      <path d="M0 120 C 300 220, 600 80, 1050 160" stroke="url(#gGrad1)" stroke-width="0.8" opacity="0.4"/>
      <path d="M0 140 C 300 240, 600 100, 1050 180" stroke="url(#gGrad1)" stroke-width="0.6" opacity="0.3"/>
      
      <!-- Constellation Nodes -->
      <circle cx="250" cy="200" r="3" fill="#00F0FF" opacity="0.8"/>
      <circle cx="450" cy="480" r="3" fill="#10B981" opacity="0.8"/>
      <circle cx="750" cy="310" r="4" fill="#00F0FF"/>
      <circle cx="950" cy="180" r="3" fill="#8B5CF6" opacity="0.8"/>
    </svg>

    <div class="inner-border"></div>

    <div class="card-content">
      <!-- TOP ROW -->
      <div class="top-row">
        <div class="chip-group">
          <!-- Metallic EMV Chip -->
          <div class="emv-chip">
            <div class="emv-lines"></div>
          </div>
          <!-- Contactless NFC Wave -->
          <svg class="nfc-icon" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
            <path d="M7 16.5 C 5.5 15, 5.5 12.5, 7 11"/>
            <path d="M10.5 19 C 7.5 16, 7.5 11, 10.5 8"/>
            <path d="M14 21.5 C 9.5 17, 9.5 9.5, 14 5"/>
            <path d="M17.5 24 C 11.5 18, 11.5 8, 17.5 2"/>
          </svg>
        </div>

        <div class="badge-pill">
          <span class="badge-dot"></span>
          <span class="badge-text">Genesis Protocol Core • Verified</span>
        </div>
      </div>

      <!-- CENTER SECTION -->
      <div class="center-section">
        <div class="brand-cluster">
          <div class="brand-logo-frame">
            <img src="${logoB64}" alt="SICOINX Logo">
          </div>
          <div class="title-box">
            <h1 class="brand-name">
              SI <span class="highlight">COINX</span>
              <span class="sup">Protocol</span>
            </h1>
            <span class="brand-subtitle-tag">Decentralized Digital Value & Settlement Network</span>
          </div>
        </div>

        <p class="tagline-callout">
          <strong>A Clearer Way to Explore, Value & Transact Digital Assets.</strong> Next-generation cryptographic telemetry, audited reference pricing, and non-custodial liquidity ecosystem.
        </p>
      </div>

      <!-- BOTTOM ROW -->
      <div class="bottom-row">
        <div class="telemetry-specs">
          <div class="spec-item">
            <span class="spec-label">Native Standard</span>
            <span class="spec-value cyan">SI COIN (ERC-20/POL)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Circulating Float</span>
            <span class="spec-value">18,500,000 SI</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Security Audit</span>
            <span class="spec-value green">100% Immutable</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Network Domain</span>
            <span class="spec-value">sicoinx.com</span>
          </div>
        </div>

        <div class="hologram-seal">
          <svg class="seal-shield" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <div class="seal-text">
            <span>Official Identity</span>
            <span>ID: 0x9D4E...7B2F</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  // -------------------------------------------------------------
  // BACK SIDE HTML
  // -------------------------------------------------------------
  const backHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SICOINX Visiting Card - Back</title>
  ${googleFonts}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1050px;
      height: 600px;
      background: #040812;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      position: relative;
      width: 1050px;
      height: 600px;
      background: radial-gradient(120% 120% at 20% 85%, #0B1C38 0%, #071124 45%, #040812 100%);
      border-radius: 32px;
      overflow: hidden;
      border: 1.5px solid rgba(0, 240, 255, 0.4);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px -10px rgba(23, 92, 255, 0.25);
    }
    /* Ambient neon glows */
    .glow-cyan {
      position: absolute;
      bottom: -80px;
      left: -80px;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(0, 240, 255, 0.16) 0%, rgba(23, 92, 255, 0.08) 50%, transparent 70%);
      pointer-events-none;
      filter: blur(40px);
    }
    .glow-blue {
      position: absolute;
      top: -80px;
      right: -80px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(23, 92, 255, 0.22) 0%, rgba(139, 92, 246, 0.12) 50%, transparent 70%);
      pointer-events-none;
      filter: blur(40px);
    }

    /* Inner Border Inset */
    .inner-border {
      position: absolute;
      inset: 16px;
      border-radius: 22px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      pointer-events-none;
    }
    .inner-border::before {
      content: '';
      position: absolute;
      top: 0; left: 20%; right: 20%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #00F0FF, #175CFF, transparent);
    }

    /* Content Area */
    .card-content {
      position: relative;
      z-index: 2;
      height: 100%;
      padding: 42px 52px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Top Bar: Brand Monogram & Access Tier */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-mini {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-mini img {
      width: 36px;
      height: 36px;
      filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.4));
    }
    .brand-mini-text {
      display: flex;
      flex-direction: column;
    }
    .brand-mini-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #FFFFFF;
      font-family: 'Space Grotesk', sans-serif;
    }
    .brand-mini-sub {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #64748B;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
    }

    .access-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 8px;
    }
    .access-tag-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }
    .access-tag-text {
      font-size: 11px;
      font-weight: 700;
      color: #34D399;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
    }

    /* Main Grid: Left Executive Info, Right QR Code Portal */
    .main-body {
      display: grid;
      grid-template-columns: 1fr 220px;
      gap: 40px;
      align-items: center;
      margin: 10px 0;
    }

    /* Executive Identity */
    .executive-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .exec-name-box {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .exec-name {
      font-size: 42px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      line-height: 1.1;
      background: linear-gradient(135deg, #FFFFFF 30%, #E2E8F0 70%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .exec-role {
      font-size: 15px;
      font-weight: 700;
      color: #00F0FF;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .exec-role-pill {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid rgba(0, 240, 255, 0.4);
      color: #00F0FF;
    }

    /* Contact Details Grid */
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 20px;
      margin-top: 4px;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      backdrop-filter: blur(8px);
    }
    .contact-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(23, 92, 255, 0.2);
      border: 1px solid rgba(0, 240, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00F0FF;
      flex-shrink: 0;
    }
    .contact-text {
      display: flex;
      flex-direction: column;
    }
    .contact-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #64748B;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
    }
    .contact-val {
      font-size: 13px;
      font-weight: 700;
      color: #F8FAFC;
      letter-spacing: 0.2px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* QR Code Hub */
    .qr-hub {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 18px;
      background: rgba(10, 25, 47, 0.7);
      border: 1px solid rgba(0, 240, 255, 0.35);
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(0, 240, 255, 0.15);
      position: relative;
    }
    .qr-frame {
      width: 140px;
      height: 140px;
      background: #FFFFFF;
      padding: 8px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    }
    .qr-frame svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .qr-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #00F0FF;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
      text-align: center;
    }

    /* Bottom Security Strip */
    .bottom-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748B;
    }
    .strip-hash {
      color: #94A3B8;
      letter-spacing: 0.5px;
    }
    .strip-hash strong {
      color: #00F0FF;
    }
    .strip-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #CBD5E1;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="glow-cyan"></div>
    <div class="glow-blue"></div>

    <div class="inner-border"></div>

    <div class="card-content">
      <!-- TOP BAR -->
      <div class="top-bar">
        <div class="brand-mini">
          <img src="${logoB64}" alt="SICOINX Monogram">
          <div class="brand-mini-text">
            <span class="brand-mini-title">SICOINX PROTOCOL</span>
            <span class="brand-mini-sub">Official Executive Credential</span>
          </div>
        </div>

        <div class="access-tag">
          <span class="access-tag-dot"></span>
          <span class="access-tag-text">Master Key • Authorized</span>
        </div>
      </div>

      <!-- MAIN BODY -->
      <div class="main-body">
        <!-- Executive Identity -->
        <div class="executive-card">
          <div class="exec-name-box">
            <h2 class="exec-name">S VIJAY KRISHNAN</h2>
            <div class="exec-role">
              Founder & Chief Executive Officer
              <span class="exec-role-pill">CEO</span>
            </div>
          </div>

          <!-- Contact Details Grid -->
          <div class="contact-grid">
            <div class="contact-item">
              <div class="contact-icon-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="contact-text">
                <span class="contact-label">Official Email</span>
                <span class="contact-val">info@sicoinx.com</span>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div class="contact-text">
                <span class="contact-label">Protocol Web</span>
                <span class="contact-val">sicoinx.com</span>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div class="contact-text">
                <span class="contact-label">Settlement Layer</span>
                <span class="contact-val">Layer-2 Non-Custodial</span>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div class="contact-text">
                <span class="contact-label">Protocol Governance</span>
                <span class="contact-val">Decentralized Foundation</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scannable QR Portal -->
        <div class="qr-hub">
          <div class="qr-frame">
            ${qrSvg}
          </div>
          <span class="qr-label">Scan For Portal</span>
        </div>
      </div>

      <!-- BOTTOM STRIP -->
      <div class="bottom-strip">
        <div class="strip-hash">
          KEY IDENTIFIER: <strong>0x7F9A-481B-9C02-B82E</strong>
        </div>
        <div class="strip-badge">
          <span>SECURED BY CRYPTOGRAPHIC PROOF</span>
          <span>•</span>
          <span>PERPETUAL VALIDITY</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  // -------------------------------------------------------------
  // LUXURY 3D SHOWCASE PRESENTATION (DOUBLE-SIDED MOCKUP)
  // -------------------------------------------------------------
  const showcaseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SICOINX Visiting Card - Double-Sided Showcase</title>
  ${googleFonts}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 2400px;
      height: 1400px;
      background: radial-gradient(120% 120% at 50% 10%, #0A162B 0%, #060D1B 50%, #03060C 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
    }

    /* Ambient lighting across the stage */
    .ambient-glow-1 {
      position: absolute;
      top: -150px;
      left: 20%;
      width: 900px;
      height: 900px;
      background: radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(23, 92, 255, 0.05) 50%, transparent 70%);
      filter: blur(80px);
      pointer-events-none;
    }
    .ambient-glow-2 {
      position: absolute;
      bottom: -150px;
      right: 20%;
      width: 900px;
      height: 900px;
      background: radial-gradient(circle, rgba(23, 92, 255, 0.18) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%);
      filter: blur(80px);
      pointer-events-none;
    }

    /* Subtle stage grid floor */
    .stage-floor {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 80px 80px;
      opacity: 0.6;
      mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 75%);
      -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 75%);
      pointer-events-none;
    }

    /* Showcase Header */
    .showcase-header {
      text-align: center;
      margin-bottom: 50px;
      position: relative;
      z-index: 5;
    }
    .header-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 22px;
      background: rgba(23, 92, 255, 0.12);
      border: 1px solid rgba(0, 240, 255, 0.35);
      border-radius: 100px;
      margin-bottom: 16px;
    }
    .pill-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px #10B981;
    }
    .pill-text {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #00F0FF;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
    }
    .showcase-title {
      font-size: 54px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -1px;
      line-height: 1.1;
    }
    .showcase-title span {
      background: linear-gradient(135deg, #00F0FF 0%, #175CFF 60%, #10B981 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .showcase-sub {
      font-size: 18px;
      color: #94A3B8;
      margin-top: 10px;
      letter-spacing: 0.5px;
    }

    /* Cards Stage */
    .cards-stage {
      display: flex;
      justify-content: center;
      gap: 70px;
      position: relative;
      z-index: 5;
      perspective: 1600px;
    }
    .card-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      transform-style: preserve-3d;
      transition: transform 0.3s ease;
    }
    .card-wrapper.front-wrap {
      transform: rotateY(-6deg) rotateX(4deg) translateY(-10px);
    }
    .card-wrapper.back-wrap {
      transform: rotateY(6deg) rotateX(4deg) translateY(10px);
    }

    .card-frame {
      width: 1000px;
      height: 572px;
      border-radius: 30px;
      overflow: hidden;
      box-shadow: 
        0 40px 90px -20px rgba(0, 0, 0, 0.95),
        0 0 60px -10px rgba(0, 240, 255, 0.25),
        0 0 0 1px rgba(0, 240, 255, 0.3);
      position: relative;
    }
    .card-frame iframe {
      width: 1050px;
      height: 600px;
      border: none;
      transform: scale(0.95238);
      transform-origin: top left;
      pointer-events: none;
    }

    .side-label {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 3px;
      color: #00F0FF;
      text-transform: uppercase;
      font-family: 'Space Grotesk', sans-serif;
      padding: 8px 24px;
      border-radius: 100px;
      background: rgba(10, 25, 47, 0.85);
      border: 1px solid rgba(0, 240, 255, 0.35);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  <div class="ambient-glow-1"></div>
  <div class="ambient-glow-2"></div>
  <div class="stage-floor"></div>

  <!-- Showcase Header -->
  <div class="showcase-header">
    <div class="header-pill">
      <span class="pill-dot"></span>
      <span class="pill-text">SICOINX Official Executive Identity</span>
    </div>
    <h1 class="showcase-title">Double-Sided <span>Executive Visiting Card</span></h1>
    <p class="showcase-sub">Precision-Engineered Luxury Titanium Finish • Audited Protocol Credential</p>
  </div>

  <!-- Cards Stage -->
  <div class="cards-stage">
    <!-- FRONT SIDE -->
    <div class="card-wrapper front-wrap">
      <div class="card-frame">
        <iframe src="front.html"></iframe>
      </div>
      <span class="side-label">Side A • Brand Presence</span>
    </div>

    <!-- BACK SIDE -->
    <div class="card-wrapper back-wrap">
      <div class="card-frame">
        <iframe src="back.html"></iframe>
      </div>
      <span class="side-label">Side B • Executive Contact & QR</span>
    </div>
  </div>
</body>
</html>`;

  // Write HTML templates
  fs.writeFileSync(path.join(tempDir, 'front.html'), frontHtml, 'utf8');
  fs.writeFileSync(path.join(tempDir, 'back.html'), backHtml, 'utf8');
  fs.writeFileSync(path.join(tempDir, 'showcase.html'), showcaseHtml, 'utf8');

  console.log('HTML templates written to', tempDir);

  // Chrome execution path
  const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
  const chromeTempDir = 'C:\\Users\\legen\\AppData\\Local\\Temp\\chrome_card_render';

  // Output paths
  const frontPng = path.join(rootDir, 'sicoinx_visiting_card_front.png');
  const backPng = path.join(rootDir, 'sicoinx_visiting_card_back.png');
  const showcasePng = path.join(rootDir, 'sicoinx_visiting_card_showcase.png');

  // 1. Render Front Side (1050x600 at 2x = 2100x1200)
  console.log('Rendering Front Side...');
  const frontUrl = 'file:///' + path.join(tempDir, 'front.html').replace(/\\/g, '/');
  execSync(
    `"${chromePath}" --headless=new --user-data-dir="${chromeTempDir}" --window-size=1050,600 --device-scale-factor=2 --screenshot="${frontPng}" "${frontUrl}"`
  );

  // 2. Render Back Side (1050x600 at 2x = 2100x1200)
  console.log('Rendering Back Side...');
  const backUrl = 'file:///' + path.join(tempDir, 'back.html').replace(/\\/g, '/');
  execSync(
    `"${chromePath}" --headless=new --user-data-dir="${chromeTempDir}" --window-size=1050,600 --device-scale-factor=2 --screenshot="${backPng}" "${backUrl}"`
  );

  // 3. Render Showcase (2400x1400 at 1x)
  console.log('Rendering Double-Sided Showcase...');
  const showcaseUrl = 'file:///' + path.join(tempDir, 'showcase.html').replace(/\\/g, '/');
  execSync(
    `"${chromePath}" --headless=new --user-data-dir="${chromeTempDir}" --window-size=2400,1400 --virtual-time-budget=4000 --screenshot="${showcasePng}" "${showcaseUrl}"`
  );

  console.log('All 3 visiting card PNGs rendered successfully!');
}

main().catch(err => {
  console.error('Render failed:', err);
  process.exit(1);
});
