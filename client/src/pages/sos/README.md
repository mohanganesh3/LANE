# SOS Emergency System - Component Index

This directory contains all components for the Emergency SOS feature, providing comprehensive safety features for riders.

## Components

### Main Pages
- **SOSEmergency.jsx** - Main SOS emergency page with emergency type selection and active emergency display
- **SOSEmergency.css** - Comprehensive styling with responsive design and animations

### Core Components

#### EmergencyContacts.jsx
- Manage emergency contacts list
- Add/delete/edit emergency contacts
- Set primary contact for emergency alerts
- Form validation and API integration

#### LocationSharing.jsx
- Real-time location tracking via geolocation API
- Live map display with Leaflet integration
- Location accuracy indicator
- Share location via Google Maps links
- Copy location coordinates

#### EmergencyAlertModal.jsx
- Countdown confirmation modal (10 seconds)
- Emergency type display with icons
- Auto-trigger or manual confirmation
- Cancel functionality
- Warning messages

#### EmergencyNotifications.jsx
- Real-time notifications via Socket.IO
- Browser notifications support
- Emergency notification banner
- Notifications list with filters
- Mark as read functionality
- Unread count badge

#### EmergencyCallButton.jsx
- Quick dial emergency numbers
- Emergency call panel with Indian helpline numbers
  - Police (100)
  - Ambulance (108)
  - Fire Brigade (101)
  - Women Helpline (1091)
  - Child Helpline (1098)
  - Road Accident (1800-11-4000)
- Floating action button for quick access
- Expandable quick dial menu

## Features

### Emergency Types
1. **Accident** - Vehicle accidents or collisions
2. **Medical** - Health emergencies
3. **Harassment** - Safety concerns or threats
4. **Breakdown** - Vehicle malfunction
5. **Route Deviation** - Unexpected route changes
6. **Other** - General safety concerns

### Safety Features
- ✓ Live location tracking and sharing
- ✓ Emergency contact notifications (SMS + Call)
- ✓ Real-time Socket.IO alerts
- ✓ Browser push notifications
- ✓ Quick dial emergency services
- ✓ Auto-trigger with countdown
- ✓ Support team integration
- ✓ Ride information display

### Technical Integration
- **Socket.IO** - Real-time emergency alerts
- **Geolocation API** - High-accuracy location tracking
- **Leaflet Maps** - Live location visualization
- **Browser Notifications API** - Push notifications
- **Tel protocol** - Direct emergency calling
- **API Integration** - Backend emergency services

## Usage

### Trigger Emergency
```jsx
import SOSEmergency from './pages/sos/SOSEmergency';

<SOSEmergency rideId={currentRideId} />
```

### Emergency Contacts
```jsx
import EmergencyContacts from './components/sos/EmergencyContacts';

<EmergencyContacts />
```

### Floating Call Button
```jsx
import { FloatingEmergencyCallButton } from './components/sos/EmergencyCallButton';

<FloatingEmergencyCallButton />
```

### Emergency Notifications
```jsx
import { useEmergencyNotifications, EmergencyNotificationBanner } from './components/sos/EmergencyNotifications';

const { notifications, unreadCount } = useEmergencyNotifications();
<EmergencyNotificationBanner notification={activeNotification} />
```

## API Endpoints Required

- `POST /sos/trigger` - Trigger emergency alert
- `POST /sos/{id}/location` - Update location
- `POST /sos/{id}/notify-contacts` - Notify emergency contacts
- `POST /sos/{id}/cancel` - Cancel emergency
- `GET /user/emergency-contacts` - Get contacts
- `POST /user/emergency-contacts` - Add contact
- `DELETE /user/emergency-contacts/{id}` - Remove contact
- `PUT /user/emergency-contacts/{id}/set-primary` - Set primary
- `GET /notifications/emergency` - Get emergency notifications
- `PUT /notifications/{id}/read` - Mark as read

## Socket.IO Events

- `emergency:triggered` - New emergency alert
- `emergency:updated` - Emergency status update
- `emergency:resolved` - Emergency resolved
- `location:update` - Live location update

## Styling

All components include:
- Responsive design (mobile-first)
- Dark mode compatible color schemes
- Smooth animations and transitions
- Accessibility features
- Touch-friendly controls
- High-contrast emergency indicators

## Security Considerations

- Location data encrypted in transit
- Emergency contacts stored securely
- Rate limiting on emergency triggers
- False alarm prevention (countdown modal)
- Contact verification recommended
- Audit logs for all emergency events

---

**Created**: November 1, 2025  
**Author**: Mohan (mohanganesh3)  
**Day**: 15 of 22 - React Migration  
**Commits**: 7 total (SOS Emergency System)
