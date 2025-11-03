# Banner Image Size Guide - Pawship Catalog

## 📐 Banner Size Specifications

Banner di Pawship Catalog memiliki ukuran yang berbeda tergantung pada jenis halaman.

---

## 🏠 **Home Page Banner (Carousel)**

### Desktop Version

- **Recommended Size**: `1920 x 600 pixels`
- **Aspect Ratio**: `3.2:1`
- **Display Height**: `600px` (fixed)
- **Container**: Full width, responsive
- **Format**: JPEG, PNG, WebP
- **Max File Size**: 5MB
- **Optimized Size**: 2-3MB recommended

### Mobile Version

- **Recommended Size**: `768 x 400 pixels`
- **Aspect Ratio**: `1.92:1`
- **Display Height**: `400px` (fixed)
- **Breakpoint**: < 768px
- **Format**: JPEG, PNG, WebP
- **Max File Size**: 3MB
- **Optimized Size**: 1-2MB recommended

### Features

- Multiple banners support (carousel)
- Auto-slide every 5 seconds
- Navigation arrows (previous/next)
- Dot indicators
- Smooth transitions
- Custom button with text, URL, color, position
- Custom text color and position
- Optional overlay color

### CSS Height Classes

```css
.home-banner {
  height: 400px; /* Mobile */
}

@media (min-width: 768px) {
  .home-banner {
    height: 600px; /* Desktop */
  }
}
```

---

## 📄 **Other Pages Banner (Single)**

Applies to:

- Our Collection
- Reseller Program
- Reseller Whitelabeling
- About Us
- Contact Us
- Stores
- Payment

### Desktop Version

- **Recommended Size**: `1920 x 400 pixels`
- **Aspect Ratio**: `4.8:1`
- **Display Height**: `400px` (fixed)
- **Container**: Full width, responsive
- **Format**: JPEG, PNG, WebP
- **Max File Size**: 5MB
- **Optimized Size**: 2-3MB recommended

### Mobile Version

- **Recommended Size**: `768 x 300 pixels`
- **Aspect Ratio**: `2.56:1`
- **Display Height**: `300px` (fixed)
- **Breakpoint**: < 768px
- **Format**: JPEG, PNG, WebP
- **Max File Size**: 3MB
- **Optimized Size**: 1-2MB recommended

### Features

- Single banner only (first active banner displayed)
- Custom button with text, URL, color, position
- Custom text color and position
- Optional overlay color

### CSS Height Classes

```css
.single-banner {
  height: 300px; /* Mobile */
}

@media (min-width: 768px) {
  .single-banner {
    height: 400px; /* Desktop */
  }
}
```

---

## 🎨 **Design Recommendations**

### General Guidelines

1. **Safe Area for Text**
   - Desktop: Keep important content within center 1200px
   - Mobile: Keep important content within center 90%
   - Avoid text near edges (minimum 40px padding)

2. **Image Composition**
   - Place focal point in center or rule of thirds
   - Leave space for text overlay
   - Consider text position (left, center, right)

3. **Color Contrast**
   - Ensure text is readable on background
   - Use overlay color if background is too busy
   - Test with different text colors (white/dark)

4. **File Optimization**
   - Compress images before upload
   - Use WebP format for better compression
   - Target quality: 80-85% for JPEG
   - Remove EXIF data to reduce file size

---

## 📊 **Size Comparison Table**

| Page Type       | Desktop Size | Mobile Size | Desktop Height | Mobile Height |
| --------------- | ------------ | ----------- | -------------- | ------------- |
| Home (Carousel) | 1920x600px   | 768x400px   | 600px          | 400px         |
| Other Pages     | 1920x400px   | 768x300px   | 400px          | 300px         |

---

## 🖼️ **Aspect Ratio Calculation**

### Home Page Banner

- **Desktop**: 1920 ÷ 600 = `3.2:1`
- **Mobile**: 768 ÷ 400 = `1.92:1` (almost 2:1)

### Other Pages Banner

- **Desktop**: 1920 ÷ 400 = `4.8:1` (almost 5:1)
- **Mobile**: 768 ÷ 300 = `2.56:1`

---

## 🎯 **Responsive Behavior**

### Desktop (≥ 768px)

```
┌─────────────────────────────────────┐
│                                     │
│         Desktop Banner Image        │  Home: 600px height
│         (Full width, centered)      │  Others: 400px height
│                                     │
└─────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌───────────────────┐
│                   │
│  Mobile Banner    │  Home: 400px height
│  (Full width)     │  Others: 300px height
│                   │
└───────────────────┘
```

### Fallback Behavior

- If mobile image not provided → Use desktop image
- Desktop image is **always required**
- Mobile image is **optional**

---

## 🛠️ **Tools for Image Creation**

### Online Tools

1. **Canva** (canva.com)
   - Use custom dimensions
   - Home Desktop: 1920x600px
   - Other Desktop: 1920x400px

2. **Figma** (figma.com)
   - Professional design tool
   - Export as PNG/JPEG/WebP

3. **Photopea** (photopea.com)
   - Free Photoshop alternative
   - Browser-based

### Image Optimization

1. **TinyPNG** (tinypng.com)
   - Compress PNG/JPEG up to 70%
   - Maintains quality

2. **Squoosh** (squoosh.app)
   - Google's image optimizer
   - WebP conversion

3. **ImageOptim** (imageoptim.com)
   - Desktop app for Mac
   - Batch optimization

---

## ✅ **Pre-Upload Checklist**

Before uploading banner:

- [ ] Image dimensions match recommendation
- [ ] File size under 5MB (3MB for mobile)
- [ ] Image optimized/compressed
- [ ] Text overlay area is clear
- [ ] Important elements not near edges
- [ ] Tested readability with text color
- [ ] Checked on both light/dark backgrounds
- [ ] Format is JPEG/PNG/WebP

---

## 🎨 **Design Templates**

### Template Structure

**Home Page Banner Template:**

```
1920x600px (Desktop)
┌────────────────────────────────────────────┐
│  [40px padding]                            │
│                                            │
│  ┌──────────────────┐                     │
│  │ Title Text       │  [Button]           │ 600px
│  │ Description      │                     │
│  └──────────────────┘                     │
│                                            │
│  [40px padding]                            │
└────────────────────────────────────────────┘
```

**Other Pages Banner Template:**

```
1920x400px (Desktop)
┌────────────────────────────────────────────┐
│  [30px padding]                            │
│  ┌──────────────────┐                     │
│  │ Title Text       │  [Button]           │ 400px
│  │ Description      │                     │
│  └──────────────────┘                     │
│  [30px padding]                            │
└────────────────────────────────────────────┘
```

---

## 📱 **Testing Checklist**

After upload, test on:

- [ ] Desktop (1920px+)
- [ ] Laptop (1366px, 1440px)
- [ ] Tablet (768px - 1024px)
- [ ] Mobile (375px, 414px, 768px)
- [ ] Check text readability
- [ ] Check button visibility
- [ ] Check loading speed
- [ ] Check carousel animation (Home)

---

## 💡 **Pro Tips**

1. **Consistency**: Use same style across all banners
2. **Branding**: Include subtle logo/branding element
3. **Call to Action**: Clear, visible button text
4. **Hierarchy**: Title > Description > Button
5. **Whitespace**: Don't overcrowd the banner
6. **Mobile First**: Design for mobile, then desktop
7. **Performance**: Smaller file size = faster load
8. **A/B Testing**: Test different versions to see what works

---

## 🚨 **Common Mistakes to Avoid**

❌ **Don't:**

- Use images with text too small to read
- Put important content near edges
- Upload huge file sizes (>5MB)
- Use low resolution images
- Forget to test on mobile
- Use too many colors/elements
- Make text hard to read on background

✅ **Do:**

- Use high-quality, optimized images
- Keep text large and readable
- Use overlay for better contrast
- Test on multiple devices
- Optimize file size
- Keep design clean and simple
- Ensure clear call-to-action

---

## 📞 **Need Help?**

If you need help creating banners:

1. Check design inspiration sites (Dribbble, Behance)
2. Use Canva templates for banners
3. Hire a designer on Fiverr/Upwork
4. Use AI tools (Midjourney, DALL-E) for backgrounds

---

**Last Updated:** November 3, 2025  
**Version:** 1.0.0
