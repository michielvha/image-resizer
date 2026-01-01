# Image Resizer

A simple, client-side image resizer and aspect ratio converter. No accounts, no subscriptions, no server uploads. Everything runs in your browser.

## Features

- 🚀 **100% Client-Side** - All processing happens in your browser
- 🔒 **Privacy First** - Your images never leave your device
- ⚡ **Fast** - Powered by HTML5 Canvas API
- 🎨 **Beautiful UI** - Clean, modern interface with dark/light themes
- 📱 **Responsive** - Works on desktop and mobile devices
- 🖼️ **Smart Cropping** - Automatically centers images when changing aspect ratios
- 📐 **Multiple Aspect Ratios** - 1:1, 3:1, 16:9, 4:3, 9:16, custom, or original
- 🔧 **Flexible Resizing** - Resize by dimensions or percentage

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Open the app in your browser
2. Drag and drop an image or click to upload
3. Select your desired aspect ratio (or keep original)
4. Choose resize mode:
   - **Dimensions**: Set specific width/height
   - **Percentage**: Resize by percentage (e.g., 50% = half size)
5. Adjust quality slider if needed
6. Click "Apply Changes" to process
7. Download your resized image

## Aspect Ratios

- **Original**: Keep the original aspect ratio
- **1:1**: Square (Instagram posts)
- **3:1**: Wide banner (social media headers)
- **16:9**: Widescreen (YouTube thumbnails)
- **4:3**: Standard (traditional photos)
- **9:16**: Portrait (Instagram stories)
- **Custom**: Define your own aspect ratio

## Smart Cropping

When changing aspect ratios, the app uses smart cropping to center the most important part of your image. This ensures your images look good even when converting between very different aspect ratios (like 3:1 from a normal photo).

## Tech Stack

- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **HTML5 Canvas API** - Client-side image processing
- **Lucide Icons** - Beautiful icon set

## How It Works

The app uses the HTML5 Canvas API to:
- Load images into memory
- Resize and crop images based on your settings
- Apply smart cropping (centers the image) when changing aspect ratios
- Export the processed image as a PNG

Everything happens entirely in your browser - no data is sent to any server.

## License

MIT

