# Changelog

All notable changes to AI Career Copilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- AI Mock Interview improvements documentation (WALKTHROUGH.md)
- Professional pre-interview permission dialog for microphone and camera access
- Smart question management - never repeats skipped or answered questions
- Configurable silence detection with 5-second timeout
- Dynamic question rendering with typewriter effect synchronized with AI speech
- Stable video interview camera preview with proper aspect ratio
- Comprehensive media cleanup on interview completion and exit
- Edge case handling for browser refresh, disconnection, and network errors
- UI/UX Refactoring documentation (WALKTHROUGH.md)
- Comprehensive UI_REFACTORING_CHANGELOG.md with detailed phase breakdown

### Changed
- **AI Voice + Video Mock Interview**: Complete interview flow overhaul for professional experience
  - Added permission dialog before interview starts
  - Implemented skip question tracking (never repeat skipped questions)
  - Implemented answered question tracking (never repeat answered questions)
  - Added silence detection with polite question repeat on first silence
  - Added auto-submit "No Response" on second silence
  - Improved dynamic question rendering with typewriter effect
  - Fixed video camera preview with stable initialization
  - Enhanced media cleanup on completion and exit
  - Added edge case handling for various scenarios
- **useVoiceSession Hook**: Enhanced with comprehensive state management
  - Added skippedQuestions and answeredQuestions state tracking
  - Added silenceCountRef and hasRepeatedQuestionRef for silence logic
  - Improved cleanup function with comprehensive media resource cleanup
  - Added SILENCE_TIMEOUT_MS configurable constant (5000ms)
  - Improved speakQuestion with speech-synchronized typewriter effect
- **VoiceInterviewFlow Component**: Enhanced with permission dialog and edge case handling
  - Added PermissionDialog integration
  - Added browser refresh cleanup on beforeunload event
  - Added visibility change detection for auto-pause
  - Added network online/offline detection
  - Added camera disconnection detection
  - Improved webcam initialization with proper error handling
  - Enhanced stopWebcam with comprehensive cleanup
  - Added resolution support (480p, 720p, 1080p)
- **PermissionDialog Component**: New component for pre-interview permission requests
  - Voice interview: microphone permission
  - Video interview: camera and microphone permissions
  - Graceful error handling for various permission errors
  - Retry support after permission denial

### Changed (Previous)
- **Dashboard Welcome Section**: Fixed Premium badge vertical alignment with welcome heading
- **AI Mock Interview History Card**: Fixed Premium badge vertical alignment with card heading
- **AI Mock Interview Page**: Removed unnecessary screenshot preview section for cleaner layout
- **Landing Page Hero**: Enhanced animations with smooth fade-in, slide, and staggered effects
- **Landing Page Hero**: Improved floating animation for feature cards with hardware-accelerated transforms
- **Landing Page Hero**: Enhanced button hover effects with scale and shadow transitions
- **Dashboard**: Merged Voice/Video buttons into single unified button
- **Landing Page Animations Overhaul**: Complete premium animation system
  - Animated background gradient blobs with slow floating movement
  - Enhanced Hero section with swirling/floating animations for left content and cards
  - Animated floating cards with unique durations for organic feel
  - Enhanced Navbar with hover underline, logo spin, and button animations
  - Enhanced Stats section with improved floating cards and animated stats
  - Enhanced Features section with animated icons and cards
  - Enhanced How It Works section with animated timeline
  - Enhanced Comparison Table section with animated rows
  - All animations use GPU-accelerated transforms (willChange: "transform")
- **Product Preview Component**: Updated image path to voiceVideoAI.png (copied from root screenshots folder to public/screenshots)
- **Landing Page Hero**: Enhanced swirling/floating animation for more visibility (increased x/y offsets, rotation, and scale)
- **Dashboard Welcome Section**: Adjusted Premium Badge margin top to 2 for better alignment with welcome text
- **Dashboard AI Mock Interview Card**: Adjusted button container alignment to items-start (removed margin top) and increased button size to lg

### Performance
- All landing page animations use hardware-accelerated transforms only
- Performance optimized for mobile devices
- FPS-friendly animations

### Files Modified
- `src/components/landing/Hero.jsx - Enhanced hero animations, breathing effects, animated background, floating cards with rotation
- `src/components/landing/Navbar.jsx - Navbar animations (hover underline, logo spin, button animations, mobile menu animations
- `src/components/landing/Stats.jsx - Enhanced stats cards with animations
- `src/components/landing/Features.jsx - Enhanced feature cards animations
- `src/components/landing/HowItWorks.jsx - Enhanced timeline animations
- `src/components/landing/ComparisonTable.jsx - Enhanced table animations

### Fixed
- **AI Mock Interview**: Permission flow - interview cannot start without required permissions
- **AI Mock Interview**: Question repetition - skipped and answered questions never repeat
- **AI Mock Interview**: Silence handling - polite repeat on first silence, auto-submit on second
- **AI Mock Interview**: Question rendering - typewriter effect synchronized with speech
- **AI Mock Interview**: Video camera - stable initialization with proper aspect ratio
- **AI Mock Interview**: Media cleanup - comprehensive cleanup on completion/exit
- **AI Mock Interview**: Edge cases - graceful handling of refresh, disconnection, network errors
- Premium badge alignment issues across dashboard components
- Layout clutter on AI Mock Interview page
- Animation performance on landing page hero section

---

## [1.0.0] - 2026-07-05

### Added
- Complete AI Career Copilot application
- Resume optimization with ATS scoring
- Job description alignment analysis
- Interactive interview coach
- AI Voice + Video Mock Interview (Premium feature)
- Dashboard with analytics and activity feed
- Premium membership management
- Multilingual support
- Dark/Light mode support
- Responsive design across all devices

### Security
- Clerk authentication integration
- Route guards for protected pages
- Secure file uploads via UploadThing
- Environment-based configuration

### Performance
- Serverless architecture on Vercel
- PostgreSQL database on Neon DB
- Optimized database queries with Prisma
- Hardware-accelerated animations with Framer Motion
- Lazy loading for images and components

---

## UI/UX Refactoring Details (July 5, 2026)

### Phase 1: Initial Audit
- Verified existing component consistency
- Confirmed Premium Badge component usage across 14+ files
- Confirmed Go Back Button component usage across 11+ files
- Validated landing page feature cards structure
- Validated comparison table centering and alignment
- Validated AI Mock Interview page unified design

### Phase 2: Premium Badge Alignment
**Dashboard Welcome Section**
- File: `src/components/dashboard/dashboard-client-view.jsx`
- Change: Added `className="mt-0.5"` to Premium badge
- Result: Perfect vertical alignment with welcome heading

**AI Mock Interview History Card**
- File: `src/components/dashboard/dashboard-client-view.jsx`
- Change: Added `className="mt-0.5"` to Premium badge
- Result: Perfect vertical alignment with card heading

### Phase 3: AI Mock Interview Page Cleanup
**Screenshot Preview Removal**
- File: `src/components/voice-interview/voice-interview-client.jsx`
- Change: Removed entire mockup preview image section
- Result: Cleaner layout restored to previous design

### Phase 4: Landing Page Hero Animation Enhancements
**Left Section (Heading + Description + CTA)**
- File: `src/components/landing/Hero.jsx`
- Changes:
  - Added smooth fade-in animation
  - Added slight slide from left (-40px)
  - Added soft upward movement (20px)
  - Implemented staggered animation for heading, description, and button
  - Duration: 700ms for section, 750ms for items
  - Smooth easing curve: [0.25, 0.1, 0.25, 1]
  - Button hover: scale (1.05), shadow enhancement, transition (300ms)

**Right Section (Feature Cards)**
- File: `src/components/landing/Hero.jsx`
- Changes:
  - Enhanced floating animation (6px offset, 5-6s duration)
  - Added staggered appearance with container variants
  - Added fade-in with scale animation (0.95 to 1)
  - Soft hover scale (1.03) with smooth transition (200ms)
  - Hardware-accelerated transforms with `willChange: "transform"`
  - No jittering or overlapping
  - No layout shifts

**Whole Hero Section**
- File: `src/components/landing/Hero.jsx`
- Changes:
  - Smooth page-load animation with container variants
  - Smooth transition between left and right sections
  - Staggered children with 0.15s delay
  - Subtle and professional animations
  - No impact on responsiveness or performance

### Dashboard Voice/Video Button Merge
- File: `src/components/dashboard/dashboard-client-view.jsx`
- Change: Merged separate "Voice Interview" and "Video Interview" buttons into single "AI Voice + Video Interview" button
- Reason: Consistency with unified AI Mock Interview page design

---

## Files Modified

### UI/UX Refactoring (July 5, 2026)
- `src/components/dashboard/dashboard-client-view.jsx` - Premium badge alignment, button merge
- `src/components/voice-interview/voice-interview-client.jsx` - Screenshot removal
- `src/components/landing/Hero.jsx` - Animation enhancements

### Documentation
- `WALKTHROUGH.md` - Created comprehensive walkthrough guide
- `UI_REFACTORING_CHANGELOG.md` - Detailed UI refactoring documentation
- `CHANGELOG.md` - This file

---

## Quality Assurance

### Phase 1 Quality Check
- ✅ No overlapping UI
- ✅ No overflowing text
- ✅ No duplicate buttons
- ✅ Consistent Premium badges
- ✅ Proper card alignment
- ✅ Proper spacing
- ✅ Responsive layout
- ✅ Smooth animations
- ✅ No console errors

### Phase 2 Quality Check
- ✅ Dashboard Premium badge perfectly aligned
- ✅ AI Mock Interview History Premium badge perfectly aligned
- ✅ No layout shifts
- ✅ No overlapping elements

### Phase 3 Quality Check
- ✅ Screenshot preview removed
- ✅ Previous layout restored
- ✅ No layout shifts
- ✅ No console errors
- ✅ All functionality preserved

### Phase 4 Quality Check
- ✅ Landing Page hero animations are smooth and premium
- ✅ No layout shifts
- ✅ No overlapping elements
- ✅ No jittering
- ✅ Hardware-accelerated transforms
- ✅ Responsive design maintained
- ✅ Performance not impacted

---

## Notes for Future Development

### Component Architecture
- Maintain existing component architecture (PremiumBadge, GoBackButton)
- Continue using unified components for new features
- Follow established spacing and typography patterns
- Ensure all new components are responsive
- Test animations for smoothness and performance

### UI/UX Guidelines
- Use hardware-accelerated transforms for animations
- Implement staggered animations for multiple elements
- Add smooth easing curves for professional feel
- Test animations on different devices and screen sizes
- Respect prefers-reduced-motion when implemented
- Ensure no layout shifts during animations
- Maintain consistent spacing and alignment

### Performance Considerations
- Use `willChange: "transform"` for animated elements
- Keep animation durations under 1s for UI elements
- Use spring physics for natural movement
- Test performance on mobile devices
- Avoid excessive re-renders during animations

---

## Links

- [GitHub Repository](https://github.com/piyushgarg6702-cyber/ai-career-copilot)
- [Live Demo](https://ai-career-copilot-ehmy.vercel.app)
- [Documentation](docs/)
