Recreate the "Silk blend" gradient from 21st.dev (https://21st.dev/community/gradients).

Style: Silk Blend. a smooth, silky linear gradient along `angle` (colours at their `pos`) with a faint film `grain` overlay.
Palette: #0B1E3B (Deep sea) @ 0%, #1E5A8A (Cobalt) @ 39%, #4F9AD0 (Azure) @ 65%, #BFE6F5 (Ice) @ 99%

Ready-to-use CSS (apply to any full-bleed element):
```css
.gradient {
  /* CSS approximation: the bitmap grain texture require canvas. Export an image for the exact result. */
  background-color: #0B1E3B;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.110'/></svg>"), linear-gradient(180deg, #0B1E3B 0%, #1E5A8A 39%, #4F9AD0 65%, #BFE6F5 99%);
  background-size: 120px 120px, auto;
  background-blend-mode: overlay, normal;
}
```

If you need to rebuild it from scratch instead of pasting the CSS, use these exact parameters:
```json
{
  "mode": "ios",
  "colors": [
    {
      "id": "c15_36415",
      "hex": "#0B1E3B",
      "pos": 0,
      "name": "Deep sea"
    },
    {
      "id": "c16_72176",
      "hex": "#1E5A8A",
      "pos": 39,
      "name": "Cobalt"
    },
    {
      "id": "c17_7937",
      "hex": "#4F9AD0",
      "pos": 65,
      "name": "Azure"
    },
    {
      "id": "c18_43698",
      "hex": "#BFE6F5",
      "pos": 99,
      "name": "Ice"
    }
  ],
  "angle": 180,
  "centerX": 50,
  "centerY": 50,
  "scale": 72,
  "softness": 26,
  "wave": 12,
  "distortion": 23,
  "grain": 22,
  "vignette": 0,
  "count": 6,
  "fade": 40,
  "envelope": "ramp",
  "spread": -20,
  "soften": 0,
  "pixelCols": 16,
  "pixelRows": 10,
  "pixelAngle": 45,
  "pixelDither": 50,
  "pixelGap": 0,
  "archBase": 70,
  "archHeight": 50,
  "archWidth": 100,
  "archGlow": 55,
  "archEdge": 30,
  "animated": false,
  "speed": 31,
  "motionAmount": 32,
  "motionReverse": false,
  "seed": 883019105,
  "backdrop": "#0B1E3B"
}
```