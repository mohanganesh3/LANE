/**
 * Fix Existing Bookings
 * This script will link all existing bookings to their parent rides
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const Booking = require('./models/Booking');
const connectDB = require('./config/database');

const fixBookings = async () => {
    try {
        console.log('🔧 Starting booking fix...');

        // Connect to database
        await connectDB();

        // Get all bookings
        const bookings = await Booking.find({});
        console.log(`📦 Found ${bookings.length} bookings`);

        let fixed = 0;
        let skipped = 0;
        let orphaned = 0;

        for (const booking of bookings) {
            const ride = await Ride.findById(booking.ride);
            
            if (!ride) {
                console.log(`⚠️  Ride not found for booking ${booking._id}`);
                orphaned++;
                continue;
            }

            // Check if booking is already in ride's bookings array
            const alreadyLinked = ride.bookings.some(b => b.toString() === booking._id.toString());
            
            if (alreadyLinked) {
                console.log(`✓ Booking ${booking._id} already linked to ride ${ride._id}`);
                skipped++;
                continue;
            }

            // Add booking to ride's bookings array
            ride.bookings.push(booking._id);
            
            // Save without validation to handle old data
            await ride.save({ validateBeforeSave: false });

            console.log(`✅ Linked booking ${booking._id} to ride ${ride._id}`);
            fixed++;
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Fixed: ${fixed} bookings`);
        console.log(`⏭️  Skipped: ${skipped} bookings (already linked)`);
        console.log(`⚠️  Orphaned: ${orphaned} bookings (ride not found)`);
        console.log(`📦 Total: ${bookings.length} bookings`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Fix error:', error);
        process.exit(1);
    }
};

fixBookings();
