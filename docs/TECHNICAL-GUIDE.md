# Technical guide

## Architecture and local run

Static HTML/CSS/JavaScript in `dist/`, using Web Audio, MediaRecorder and IndexedDB. No runtime package installation, API keys or server-side patient records.

```bash
python -m http.server 8000 --directory dist
node check-signals.cjs
node check-history.cjs
```

Commands run from the repository root. Some inactive legacy overview/review code remains in `app.js`; synthetic audio generation is not invoked. Active navigation: History, Record, Library, Signals and Evidence.

## Analysis

Full decoded audio is analyzed. RMS and peak are reported linearly and in dBFS. Near-limit samples have absolute amplitude at least 0.98. A 2,048-point Hann-window FFT with 50% overlap supplies averaged power, dominant non-DC frequency and power-weighted spectral centroid. Compatible spectra use cosine similarity.

AudioContext may resample; the reported rate is the decoded rate. Echo cancellation, noise suppression and automatic gain control are requested off, with actual settings stored when provided by the browser.

dBFS is not calibrated dB SPL. The -60 dBFS low-level flag is an engineering heuristic, not a medical threshold. Near-limit samples do not establish analog clipping. Spectral similarity is not a disease score.

## Capture and storage

Capture is limited to 20 seconds per site, with early manual stopping. This is a pilot setting, not a validated clinical protocol. Pairing requires matching access, site, device, condition and decoded sample rate. A first recording is not automatically healthy.

Captures, metadata and notes stay in IndexedDB. Theme is stored in localStorage. There is no upload backend or automatic clinician notification. Export/download actions are user-initiated. Never commit private recordings, clinical spreadsheets or patient identifiers.

## Deployment

Vercel repository settings: **Root Directory = dist**, **Framework = Other**, no build command. `dist/` is the deployable application.

Alternatively, using an authorized account:

```bash
cd dist
vercel link
vercel deploy --prod
```

Local `.vercel/` and `.env*` files are excluded. The app requires no secrets; never commit deployment tokens.

## Optional FiSaV preparation

Ready-to-use excerpts are included. To reproduce preparation:

```bash
python -m pip install numpy openpyxl
python tools/fisav/extract.py pat002
python tools/fisav/extract.py pat006
```

Obtain the information sheet from the [original dataset](https://osf.io/hypfr) and place it at `tools/fisav/patient_information.xlsx`:

```bash
python tools/fisav/build_samples.py pat002
python tools/fisav/build_samples.py pat006
```

Extraction verifies entry size/CRC and uses HTTP Range. The archive index may need updating if upstream data changes. Generated CSV/XLSX files are excluded. See [Research data](RESEARCH-DATA.md) for source credit and processing details.

Third-party data/font licenses remain with their assets. The application has no open-source license grant.

## UI file names

`layout.css` contains layout polish; `interface-overrides.css` contains the final neutral palette and interface refinements. `concise-copy.js` adjusts interface copy; `visit-comparison.js` renders the previous/current visit summary. CSS layers are loaded in the order specified in `index.html`.
