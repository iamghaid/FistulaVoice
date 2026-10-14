# FiSaV research excerpts

Original dataset: https://osf.io/hypfr

Paper: Centracchio et al. (2026), A dataset of multichannel broadband recordings of sounds and vibrations acquired from arteriovenous fistulas via a novel force sensor array. https://doi.org/10.1038/s41597-026-08242-8

Dataset authors: Salvatore Parlato, Jessica Centracchio, Eliana Cinotti, Emilio Andreozzi. License: CC BY 4.0; original license is included in `dist/assets/research/LICENSE_CC_BY.txt`.

The archive index was read using HTTP Range and `pat002.csv` was extracted without downloading the full 2.3 GB archive. Its decompressed size and ZIP CRC were checked. SHA-256 provenance is retained in `fisav.json`. Raw clinical spreadsheets are not included in the website. Clinical labels come from patient_information.xlsx, Patient data, Presence (Y/N): pat002 = Y; pat006 = N. pat002 residual diameter is 2 mm and reference diameter is 3.6 mm. These are supplied ultrasound observations, not app predictions.

Two simultaneous PZT sensor channels from the same recording are included. They are **not** repeated visits and are **not** smartphone recordings. Original rate: 10,000 Hz. Rest excerpt: 10–22 seconds; every selected occlusion flag is zero. Raw ECG and PZT1–3 traces at 10–14 seconds are displayed with individual original-value ranges.

Listening transformations: remove DC; FFT-domain high-pass with raised-cosine transition between 15 and 25 Hz over padded 8–24 second source window; crop 10–22 seconds; use a common gain for both channels; convert to 16-bit PCM WAV. This is a simple audible-band extraction, not a reproduction of the paper's complete pulse/thrill/bruit separation. Playback-file amplitude cannot be interpreted as native sensor amplitude or calibrated SPL.

Frequency display: 1,024-point Hann window, 128-sample hop (12.8 ms), 0–1,500 Hz display, every fourth frame. Spectrogram power is normalized to each clip's maximum and displayed from -70 to 0 dB. Full-file RMS/peak refer to the exported WAV. No diagnosis, disease percentage, flow estimate, or AI prediction is produced.

Extraction/processing script retained in the workspace at `tools/fisav/build_samples.py`. Raw archive entries can be downloaded again using tools/fisav/extract.py and are intentionally excluded from Git.

The visible interface compares PZT1 rest excerpts from two different participants at the anastomosis, not before/after treatment or longitudinal change. Synthetic patient/review/sample screens are removed from visible navigation and synthetic audio generation is no longer invoked. Details remain in a collapsed source section. The two patients have separately normalized playback levels; amplitudes are not directly comparable across patients.
