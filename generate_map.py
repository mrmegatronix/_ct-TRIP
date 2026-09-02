import math
import urllib.request
from PIL import Image, ImageOps
import os

def num2deg(xtile, ytile, zoom):
    n = 2.0 ** zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return (lat_deg, lon_deg)

zoom = 17
x_min = 128381
x_max = 128387
y_min = 83143
y_max = 83151

bounds = [
    [num2deg(x_min, y_max + 1, zoom)[0], num2deg(x_min, y_min, zoom)[1]],
    [num2deg(x_max + 1, y_min, zoom)[0], num2deg(x_max + 1, y_max + 1, zoom)[1]]
]
print(f"Fetching tiles x: {x_min}-{x_max}, y: {y_min}-{y_max}")
print(f"Bounds: {bounds}")

width = (x_max - x_min + 1) * 256
height = (y_max - y_min + 1) * 256
full_img = Image.new('RGB', (width, height), color=(20, 20, 20))

for x in range(x_min, x_max + 1):
    for y in range(y_min, y_max + 1):
        url = f"https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{zoom}/{y}/{x}"
        filename = f"/tmp/tile_{x}_{y}.jpg"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
                out_file.write(response.read())
            
            img = Image.open(filename).convert('RGB')
            full_img.paste(img, ((x - x_min) * 256, (y - y_min) * 256))
            os.remove(filename)
        except Exception as e:
            pass

full_img.save('/run/media/zeus/6TB-1/__GITHUB NUC/_ct-TRIP/map_bg.jpg', quality=95)
