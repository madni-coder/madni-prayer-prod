Remove overlaid text/badges from photos

Install dependencies:

```bash
python3 -m pip install --upgrade pip
pip install opencv-python numpy
```

Run the script:

```bash
python scripts/remove_text_inpaint.py input.jpg output.jpg --rect x,y,w,h [--rect x,y,w,h ...]
```

Notes:

- Provide one or more `--rect` arguments in pixel coordinates: `x,y,w,h` (origin top-left).
- Try a rectangle slightly larger than the text/badge for best results.
- If results look patchy, try `--method ns` (Navier-Stokes) instead of the default `telea`.

Example (use and adjust coordinates for your image):

```bash
python scripts/remove_text_inpaint.py shop_photo.jpg shop_photo_clean.jpg --rect 24,28,260,96 --rect 20,220,480,140
```

If you'd like, I can run this on the image for you if you point me to the exact file path or give approximate rectangles and I'll produce a cleaned image.
