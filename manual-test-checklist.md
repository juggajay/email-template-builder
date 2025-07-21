# Editor Manual Test Checklist

## Setup
1. Start the development server: `npm run dev`
2. Open http://localhost:3000/editor in your browser
3. Open Developer Tools (F12) to monitor console and network

## Loading Performance Test
- [ ] Note the time when you navigate to /editor
- [ ] Note when the editor is fully loaded and interactive
- [ ] Check console for performance logs
- [ ] Expected load time: < 3 seconds

## Tiles/Blocks Availability Test
Check that ALL of the following tiles are visible in the left sidebar:

### Essential Blocks
- [ ] **Text** - For adding text content
- [ ] **Image** - For adding images  
- [ ] **Button** - For call-to-action buttons
- [ ] **Divider** - For horizontal lines
- [ ] **Spacer** - For adding vertical space
- [ ] **Social** - For social media links
- [ ] **HTML** - For custom HTML code

### Structure
- [ ] **Columns** - For creating column layouts

## Drag and Drop Test
1. **Basic Drag Test**
   - [ ] Drag a Text block to the canvas - it should drop successfully
   - [ ] Drag an Image block to the canvas - it should drop successfully
   - [ ] Drag a Button block to the canvas - it should drop successfully
   - [ ] Drag Columns to the canvas - it should drop successfully

2. **Repositioning Test**
   - [ ] Click on a placed block - drag handles should appear
   - [ ] Drag the block to a new position - it should move
   - [ ] Try moving blocks up and down
   - [ ] Try moving blocks between columns (if using column layout)

## Visual Issues Test
- [ ] Check that all percentage text in blocks panel is visible (not white on white)
- [ ] Verify Save Template button is positioned correctly (not covering Preview button)
- [ ] Check that editor uses most of the vertical space

## Console Errors Test
- [ ] Open browser console
- [ ] Check for any red errors
- [ ] Note any warnings

## Performance Metrics
From the console, note:
- Initial load time: _____ ms
- Unlayer script load time: _____ ms
- Any performance warnings: _____

## Screenshot
- [ ] Take a screenshot showing all available tiles
- [ ] Take a screenshot with some blocks placed in the editor

## Issues Found
List any issues:
1. 
2. 
3.