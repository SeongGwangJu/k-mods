# 촬영 원본에서 글자가 있는 가로 줄 구간(y)을 찾아 crop 값을 정할 때 쓴다.
#
#   uvx --with pillow python scripts/demo/rows.py /tmp/k-demo/shots/<이름>.png
#
# 출력: 줄 구간(y 시작-끝)과 그 줄에서 글자가 걸친 x 범위. GIF는 ffmpeg로 한 프레임을 뽑아서 재요.
import sys

from PIL import Image

im = Image.open(sys.argv[1]).convert('RGB')
W, H = im.size
bg = im.getpixel((W - 3, H // 2))
px = im.load()


def ink(x, y):
    p = px[x, y]
    return abs(p[0] - bg[0]) + abs(p[1] - bg[1]) + abs(p[2] - bg[2]) > 40


rows = [any(ink(x, y) for x in range(0, W, 2)) for y in range(H)]
print('size', W, H, 'bg', '#%02x%02x%02x' % bg)
y = 0
while y < H:
    if rows[y]:
        start = y
        while y < H and rows[y]:
            y += 1
        mid = start + (y - start) // 2
        xs = [x for x in range(0, W, 2) if ink(x, mid)]
        print(f'{start:4d}-{y:4d} (h{y - start:3d})  x {min(xs) if xs else "-"}..{max(xs) if xs else "-"}')
    y += 1
