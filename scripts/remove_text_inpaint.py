#!/usr/bin/env python3
"""
Remove overlaid text or badges from images using OpenCV inpainting.

Usage:
  python scripts/remove_text_inpaint.py input.jpg output.jpg --rect x,y,w,h [--rect x,y,w,h ...]

Example:
  python scripts/remove_text_inpaint.py photo.jpg photo_clean.jpg --rect 30,40,220,80 --rect 40,300,420,140

The script creates a mask from the given rectangles and runs OpenCV's inpaint.
"""
import argparse
import cv2
import numpy as np
import sys


def parse_rect(s):
    parts = s.split(',')
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("rect must be x,y,w,h")
    try:
        return tuple(int(p) for p in parts)
    except ValueError:
        raise argparse.ArgumentTypeError("rect values must be integers")


def make_mask(img_shape, rects):
    mask = np.zeros((img_shape[0], img_shape[1]), dtype=np.uint8)
    for (x, y, w, h) in rects:
        x2 = max(0, min(img_shape[1], x + w))
        y2 = max(0, min(img_shape[0], y + h))
        x1 = max(0, min(img_shape[1], x))
        y1 = max(0, min(img_shape[0], y))
        mask[y1:y2, x1:x2] = 255
    return mask


def inpaint_image(img, mask, method='telea'):
    if method == 'telea':
        flags = cv2.INPAINT_TELEA
    else:
        flags = cv2.INPAINT_NS
    # Convert to BGR if grayscale
    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    res = cv2.inpaint(img, mask, 3, flags)
    return res


def main():
    parser = argparse.ArgumentParser(description='Remove rectangular overlays from images using inpainting')
    parser.add_argument('input', help='Input image path')
    parser.add_argument('output', help='Output image path')
    parser.add_argument('--rect', action='append', type=parse_rect, help='Rectangle to remove: x,y,w,h', required=True)
    parser.add_argument('--method', choices=['telea','ns'], default='telea', help='Inpainting method (telea or ns)')
    args = parser.parse_args()

    # Load image (cross-platform unicode-safe approach)
    if sys.platform.startswith('win'):
        img = cv2.imdecode(np.fromfile(args.input, dtype=np.uint8), cv2.IMREAD_COLOR)
    else:
        img = cv2.imread(args.input, cv2.IMREAD_COLOR)

    if img is None:
        print(f'Failed to load image: {args.input}', file=sys.stderr)
        sys.exit(2)

    mask = make_mask(img.shape, args.rect)

    result = inpaint_image(img, mask, method=args.method)

    # Save result
    if sys.platform.startswith('win'):
        ext = args.output.split('.')[-1]
        is_success, buffer = cv2.imencode('.' + ext, result)
        if not is_success:
            print('Failed to encode result', file=sys.stderr)
            sys.exit(3)
        with open(args.output, 'wb') as f:
            f.write(buffer.tobytes())
    else:
        cv2.imwrite(args.output, result)

    print('Saved cleaned image to', args.output)


if __name__ == '__main__':
    main()
