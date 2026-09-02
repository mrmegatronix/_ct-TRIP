import math
import urllib.request
from PIL import Image, ImageOps
import os

def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def num2deg(xtile, ytile, zoom):
    n = 2.0 ** zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return (lat_deg, lon_deg)

zoom = 17
lat_min = -43.480
lat_max = -43.472
lon_min = 172.615
lon_max = 172.622

x_min, y_max = deg2num(lat_min, lon_min, zoom)
x_max, y_min = deg2num(lat_max, lon_max, zoom)

print(f"Fetching tiles x: {x_min}-{x_max}, y: {y_min}-{y_max}")

width_tiles = x_max - x_min + 1
height_tiles = y_max - y_min + 1

full_img = Image.new('RGB', (width_tiles * 256, height_tiles * 256))

for x in range(x_min, x_max + 1):
    for y in range(y_min, y_max + 1):
        url = f"https://tile.openstreetmap.org/{zoom}/{x}/{y}.png"
        filename = f"/tmp/tile_{x}_{y}.png"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
                out_file.write(response.read())
            
            img = Image.open(filename)
            full_img.paste(img, ((x - x_min) * 256, (y - y_min) * 256))
            os.remove(filename)
        except Exception as e:
            print(f"Error fetching {url}: {e}")

# Apply dark mode filter (invert and desaturate a bit maybe?)
# Let's just invert for a dark theme look.
full_img = ImageOps.invert(full_img)

# Save the final image
full_img.save('/run/media/zeus/6TB-1/__GITHUB NUC/_ct-TRIP/map_bg.jpg', quality=90)

# Calculate exactly what bounds this image represents
top_left_lat, top_left_lon = num2deg(x_min, y_min, zoom)
bottom_right_lat, bottom_right_lon = num2deg(x_max + 1, y_max + 1, zoom)

print(f"Bounds: [[{bottom_right_lat}, {top_left_lon}], [{top_left_lat}, {bottom_right_lon}]]")
