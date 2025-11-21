# Kitchen Inventory Tracker - User Guide

Welcome to the Kitchen Inventory Tracker! This guide will help you get the most out of the application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Managing Inventory](#managing-inventory)
3. [Shopping Lists](#shopping-lists)
4. [Dashboard & Insights](#dashboard--insights)
5. [Categories & Organization](#categories--organization)
6. [Settings & Preferences](#settings--preferences)
7. [Offline Mode](#offline-mode)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Accessibility Features](#accessibility-features)
10. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Time Setup

When you first open the app, you'll see an onboarding flow that introduces you to the main features. You can:
- Click "Next" to go through each step
- Click "Skip" to jump straight to the app
- Click "Previous" to go back to a previous step

The onboarding can be accessed again from the Help Center (? icon in the bottom left).

### Installing as a PWA

For the best experience, install the app on your device:

**On Desktop:**
1. Look for the install icon in your browser's address bar
2. Click "Install" when prompted
3. The app will open in its own window

**On Mobile:**
1. Open the app in your mobile browser
2. Tap the share button
3. Select "Add to Home Screen"
4. The app will appear on your home screen like a native app

---

## Managing Inventory

### Adding Items

1. Navigate to the **Inventory** page
2. Click the **"Add Item"** button
3. Fill in the item details:
   - **Name**: What the item is (e.g., "Milk", "Chicken Breast")
   - **Quantity**: How much you have
   - **Unit**: The measurement unit (pieces, lbs, oz, cups, etc.)
   - **Expiration Date**: When the item expires (optional)
   - **Location**: Where it's stored (Fridge, Pantry, or Freezer)
   - **Category**: What type of item it is
   - **Notes**: Any additional information (optional)
4. Click **"Add Item"** to save

### Editing Items

1. Click on any item card in the inventory
2. Update the information you want to change
3. Click **"Save Changes"**

### Quick Actions

Each item card has quick action buttons:
- **Use**: Decrease quantity by 1
- **Finish**: Mark the item as finished (quantity becomes 0)
- **Edit**: Open the edit form
- **Delete**: Remove the item from inventory

### Batch Entry

For adding multiple items quickly:
1. Click the **"Batch Entry"** button
2. Enter items one by one with minimal information
3. Items are added immediately as you type
4. Perfect for after grocery shopping!

### Searching & Filtering

- **Search Bar**: Type to search by item name
- **Location Filter**: Filter by Fridge, Pantry, or Freezer
- **Category Filter**: Filter by category (Produce, Dairy, etc.)
- **Status Filter**: Show all items, expiring items, low stock, or finished items
- **Advanced Filters**: Combine multiple filters for precise results

---

## Shopping Lists

### Automatic List Generation

Items are automatically added to your shopping list when:
- Quantity reaches zero (marked as finished)
- Quantity falls below the low stock threshold (set in Settings)

### Manual Addition

1. Navigate to the **Shopping** page
2. Click **"Add Item"**
3. Enter the item name and quantity
4. Click **"Add to List"**

### Checking Off Items

While shopping:
1. Tap the checkbox next to each item as you add it to your cart
2. Checked items move to the bottom of the list
3. On mobile, swipe left on an item for quick actions

### Clearing Completed Items

After shopping:
1. Click **"Clear Completed"** to remove all checked items
2. This helps keep your list clean and focused

### Offline Shopping

The shopping list works fully offline:
- Check off items without internet
- Add new items while shopping
- Changes sync automatically when you reconnect

---

## Dashboard & Insights

### Key Metrics

The dashboard shows:
- **Total Items**: How many items are in your inventory
- **Low Stock**: Items that need to be restocked
- **Expiring Soon**: Items expiring within 7 days
- **Shopping List**: Number of items to buy

### Expiring Items Widget

- Shows items expiring within 7 days
- Sorted by urgency (expiring soonest first)
- Color-coded by urgency:
  - Red: Expiring in 1-2 days
  - Orange: Expiring in 3-5 days
  - Yellow: Expiring in 6-7 days

### Usage Insights

- **Shopping Patterns**: See how often you buy certain items
- **Unused Items**: Items that haven't been used in 30+ days
- **Waste Reduction**: Track expired items to reduce waste

### Quick Actions Panel

Access common tasks directly from the dashboard:
- Add new item
- View shopping list
- Check expiring items
- Manage categories

---

## Categories & Organization

### Predefined Categories

The app comes with 8 default categories:
- 🥬 Produce
- 🥛 Dairy
- 🥩 Meat & Seafood
- 🥫 Pantry Staples
- 🧊 Frozen
- 🥤 Beverages
- 🍿 Snacks
- 🍯 Condiments

### Custom Categories

Create your own categories:
1. Go to **Settings**
2. Scroll to **Categories**
3. Click **"Add Category"**
4. Enter name, choose color and icon
5. Click **"Save"**

### Organizing by Location

Items can be stored in three locations:
- **Fridge**: Perishable items requiring refrigeration
- **Pantry**: Shelf-stable items
- **Freezer**: Frozen items

Use location filters to quickly find items in a specific storage area.

---

## Settings & Preferences

### General Settings

- **Low Stock Threshold**: When to consider an item "low stock" (default: 5)
- **Expiration Warning**: How many days before expiration to show warnings (default: 7)
- **Default Location**: Where new items are stored by default
- **Preferred Units**: Common units you use for measurements

### Theme

Choose your preferred theme:
- **Light**: Bright, clean interface
- **Dark**: Easy on the eyes in low light
- **System**: Matches your device's theme

### Accessibility

- **Reduced Motion**: Disable animations if you prefer less movement
- **High Contrast**: Increase contrast for better visibility (coming soon)

### Data Management

- **Export Data**: Download your inventory as JSON
- **Import Data**: Restore from a previous export
- **Reset All Data**: Clear all data and start fresh (cannot be undone!)

---

## Offline Mode

### How It Works

The app is designed to work offline:
1. **First Visit**: The app downloads and caches all necessary files
2. **Subsequent Visits**: The app loads from cache, even without internet
3. **Data Storage**: All your data is stored locally on your device
4. **Sync**: Changes sync automatically when you reconnect

### What Works Offline

✅ View inventory
✅ Add, edit, delete items
✅ Manage shopping lists
✅ Check off items while shopping
✅ View dashboard and insights
✅ Change settings

### What Requires Internet

❌ Initial app load (first visit only)
❌ App updates
❌ Syncing across devices (if implemented)

### Offline Indicator

When offline, you'll see a banner at the top of the screen indicating you're in offline mode.

---

## Keyboard Shortcuts

Keyboard shortcuts are available on desktop for faster navigation:

### Navigation
- `Alt + 1`: Go to Dashboard
- `Alt + 2`: Go to Inventory
- `Alt + 3`: Go to Shopping List
- `Alt + 4`: Go to Settings

### Actions
- `Ctrl + N`: Add new item (when available)
- `Ctrl + K` or `Ctrl + /`: Focus search
- `Ctrl + B`: Toggle sidebar

### General
- `Escape`: Close modals or clear focus
- `Tab`: Navigate between elements
- `Shift + Tab`: Navigate backwards
- `Enter`: Activate buttons and links
- `Space`: Toggle checkboxes

### Viewing Shortcuts

Press `Ctrl + ?` or click the keyboard icon (bottom right) to see all available shortcuts.

---

## Accessibility Features

### Keyboard Navigation

The entire app can be used with just a keyboard:
- **Tab Order**: Logical flow through interactive elements
- **Focus Indicators**: Clear visual indication of focused elements
- **Skip Links**: Jump directly to main content

### Screen Reader Support

- **ARIA Labels**: All interactive elements have descriptive labels
- **Semantic HTML**: Proper heading structure and landmarks
- **Live Regions**: Dynamic content changes are announced

### Visual Accessibility

- **Color Contrast**: WCAG AA compliant contrast ratios
- **Touch Targets**: Minimum 44px touch targets on all buttons
- **Reduced Motion**: Respects system preferences for reduced motion
- **Focus Visible**: Clear focus indicators for keyboard navigation

### Mobile Accessibility

- **Touch-Friendly**: Large, easy-to-tap buttons
- **Swipe Gestures**: Alternative to button taps
- **Haptic Feedback**: Tactile feedback on supported devices
- **Responsive Text**: Scales with system font size

---

## Tips & Best Practices

### Inventory Management

1. **Regular Updates**: Update quantities as you use items
2. **Expiration Dates**: Always add expiration dates for perishables
3. **Consistent Units**: Use the same units for similar items
4. **Categories**: Assign categories to make filtering easier
5. **Notes**: Add notes for special storage instructions

### Shopping Lists

1. **Review Before Shopping**: Check your list before heading to the store
2. **Offline Mode**: Use offline mode in stores with poor signal
3. **Batch Add**: Use batch entry after shopping to quickly add items
4. **Clear Regularly**: Clear completed items to keep lists manageable

### Reducing Waste

1. **Check Dashboard Daily**: Review expiring items each day
2. **FIFO Method**: Use older items first (First In, First Out)
3. **Meal Planning**: Plan meals around items expiring soon
4. **Freeze Items**: Move items to freezer before they expire
5. **Track Patterns**: Use insights to adjust shopping habits

### Performance

1. **Regular Cleanup**: Delete finished items periodically
2. **Limit Items**: Keep inventory focused on current items
3. **Export Data**: Backup your data regularly
4. **Update App**: Keep the app updated for best performance

### Organization

1. **Consistent Naming**: Use consistent names for items
2. **Location Accuracy**: Store items in their actual location
3. **Category System**: Develop a category system that works for you
4. **Custom Categories**: Create categories for your specific needs

---

## Troubleshooting

### App Won't Load

1. Check your internet connection (for first visit)
2. Clear browser cache and reload
3. Try a different browser
4. Ensure JavaScript is enabled

### Data Not Saving

1. Check if you're in private/incognito mode
2. Ensure browser allows local storage
3. Check available storage space
4. Try exporting and re-importing data

### Offline Mode Not Working

1. Visit the app online at least once
2. Allow the service worker to install
3. Check browser compatibility (modern browsers only)
4. Clear cache and revisit the app

### Performance Issues

1. Delete old/finished items
2. Clear browser cache
3. Reduce number of items in inventory
4. Disable animations in Settings

---

## Support & Feedback

### Getting Help

- **Help Center**: Click the ? icon (bottom left) for in-app help
- **Keyboard Shortcuts**: Click the keyboard icon (bottom right) for shortcuts
- **Onboarding**: Restart the onboarding from Help Center

### Reporting Issues

If you encounter bugs or issues:
1. Note what you were doing when the issue occurred
2. Check the browser console for errors
3. Try reproducing the issue
4. Report with detailed steps to reproduce

---

## Privacy & Data

### Data Storage

- All data is stored locally on your device
- No data is sent to external servers
- Data persists across sessions
- Clearing browser data will delete your inventory

### Data Export

Export your data regularly:
1. Go to Settings
2. Click "Export Data"
3. Save the JSON file to a safe location
4. Use this file to restore data if needed

### Data Import

To restore from a backup:
1. Go to Settings
2. Click "Import Data"
3. Select your exported JSON file
4. Confirm the import

---

## Version Information

**Current Version**: 0.1.0

### Recent Updates

- Initial release with core features
- Inventory management
- Shopping lists
- Dashboard insights
- Offline functionality
- PWA support
- Accessibility features

---

## Glossary

- **PWA**: Progressive Web App - a web app that works like a native app
- **IndexedDB**: Browser database for storing data locally
- **Service Worker**: Background script that enables offline functionality
- **ARIA**: Accessible Rich Internet Applications - standards for accessibility
- **WCAG**: Web Content Accessibility Guidelines
- **Low Stock**: Items below the threshold set in settings
- **Expiring Soon**: Items expiring within the warning period

---

Thank you for using Kitchen Inventory Tracker! We hope this guide helps you manage your kitchen inventory efficiently and reduce food waste.

For additional help, click the ? icon in the app or revisit the onboarding flow.
