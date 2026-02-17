from PIL import Image
import os
import json

def extract_color(image_path):
    """Extract the dominant color from a PNG file"""
    img = Image.open(image_path)
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Get pixel from center of image
    width, height = img.size
    center_x, center_y = width // 2, height // 2
    r, g, b = img.getpixel((center_x, center_y))
    
    # Convert to hex
    hex_color = f'#{r:02x}{g:02x}{b:02x}'
    return hex_color

def main():
    colors_dir = 'colors'
    files = sorted([f for f in os.listdir(colors_dir) if f.startswith('B') and f.endswith('.png')])
    
    colors = []
    
    print("Extracted Colors:")
    print("-" * 40)
    
    for file in files:
        filepath = os.path.join(colors_dir, file)
        hex_color = extract_color(filepath)
        name = file.replace('.png', '')
        
        color_obj = {
            'name': name,
            'hex': hex_color,
            'image': f'/colors/{file}'
        }
        
        colors.append(color_obj)
        print(f"{name}: {hex_color}")
    
    print("\n\nColors array for App.jsx:")
    print(json.dumps(colors, indent=2))

if __name__ == '__main__':
    main()
