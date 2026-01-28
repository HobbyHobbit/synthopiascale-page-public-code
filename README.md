# SynthopiaScale Records - Website Source Code

This is the public source code for [synthopiascale.com](https://synthopiascale.com).

## 🎵 About

A modern music label website featuring:
- **3D Logo Animation** with React Three Fiber
- **Audio-reactive visualizations** with Web Audio API
- **Glass morphism UI** with dynamic light reflections
- **Responsive design** optimized for mobile performance
- **Multiple visualizer modes**: frequency bars, waveform, lightning bolts, water

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **3D Graphics**: React Three Fiber, Three.js, @react-three/drei
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## ⚠️ Important Notes

- **Audio files are not included** - see live site for full functionality
- **Artist/track data is anonymized** for privacy
- **Links are disabled** (`#`) - visit live site for actual links

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Key Components

- `components/hero.tsx` - Hero section with 3D logo and audio player
- `components/3d/SynthopiaLogo/` - 3D animated logo components
- `components/StickyPlayer.tsx` - Global floating audio player
- `components/artists-section.tsx` - Artist showcase with glass cards
- `components/samplepacks-section.tsx` - Sample pack catalog

## 🎨 Features Demonstrated

### Mobile Performance Optimization
- Frame skipping during playback
- DPR reduction on mobile
- Visualizer complexity reduction
- Conditional effect rendering

### Glass Morphism Effects
- Dynamic light reflections following mouse/scroll
- Multi-layer refraction simulation
- Edge highlights and corner accents

### Audio Visualization
- Real-time frequency analysis
- Multiple visualization modes
- Smooth transitions between states

## 📄 License

This code is provided for **portfolio/reference purposes only**.

## 🔗 Live Site

Visit [synthopiascale.com](https://synthopiascale.com) to see the full experience with audio.
