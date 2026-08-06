// script.js - Client Booking Logic with 30 bookings/day limit
(function() {
    "use strict";

    const STORAGE_KEY = 'fieldEngineerBookings';
    const DAILY_LIMIT = 30;

    // DOM Elements
    const form = document.getElementById('bookingForm');
    const serviceSelect = document.getElementById('serviceType');
    const companyInput = document.getElementById('companyName');
    const locationInput = document.getElementById('clientLocation');
    const phoneInput = document.getElementById('phoneNumber');
    const dateInput = document.getElementById('bookingDate');
    const timeInput = document.getElementById('bookingTime');
    const descriptionInput = document.getElementById('issueDescription');
    const todayBookingsSpan = document.getElementById('todayBookings');

    // Get today's date string (YYYY-MM-DD)
    function getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Get bookings from localStorage (Database)
    function getBookings() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    // Save bookings to localStorage (Database)
    function saveBookings(bookings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    }

    // Count bookings for today
    function getTodayBookingCount() {
        const bookings = getBookings();
        const today = getTodayString();
        return bookings.filter(b => b.date === today).length;
    }

    // Update today's booking counter
    function updateTodayCounter() {
        const count = getTodayBookingCount();
        todayBookingsSpan.textContent = count;
        return count;
    }

    // Set default date and time
    function setDefaults() {
        // Today's date
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;

        // Time (now + 1 hour)
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;

        // Date in header
        document.getElementById('dateDisplay').textContent = today.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        // Update today's counter
        updateTodayCounter();
    }
    setDefaults();

    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    }

    // Add new booking
    function addBooking(service, company, location, phone, date, time, description) {
        const bookings = getBookings();
        const newBooking = {
            id: generateId(),
            service: service.trim(),
            company: company.trim(),
            location: location.trim(),
            phone: phone.trim(),
            date: date,
            time: time,
            description: description.trim(),
            createdAt: new Date().toISOString()
        };
        bookings.push(newBooking);
        saveBookings(bookings);
        return newBooking;
    }

    // Form submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const service = serviceSelect.value;
        const company = companyInput.value.trim();
        const location = locationInput.value.trim();
        const phone = phoneInput.value.trim();
        const date = dateInput.value;
        const time = timeInput.value;
        const description = descriptionInput.value.trim();

        // Validation
        if (!service || !company || !location || !phone || !date || !time || !description) {
            alert('⚠️ Please fill in all fields.');
            return;
        }

        // Validate phone number (basic)
        const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(phone)) {
            alert('⚠️ Please enter a valid phone number.');
            return;
        }

        // Check if date is in past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date + 'T00:00:00');
        if (selectedDate < today) {
            alert('⚠️ Booking date cannot be in the past.');
            return;
        }

        // Check daily limit (only for today's bookings)
        const todayStr = getTodayString();
        if (date === todayStr) {
            const todayCount = getTodayBookingCount();
            if (todayCount >= DAILY_LIMIT) {
                alert(`⚠️ Daily limit of ${DAILY_LIMIT} bookings has been reached for today. Please select a different date.`);
                return;
            }
        }

        // Add booking
        addBooking(service, company, location, phone, date, time, description);

        // Clear form (keep service, date, time)
        companyInput.value = '';
        locationInput.value = '';
        phoneInput.value = '';
        descriptionInput.value = '';
        companyInput.focus();

        // Update counter
        updateTodayCounter();

        // Show success
        const btn = form.querySelector('.btn-primary');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Booked Successfully!';
        btn.style.background = '#28a745';
        btn.style.borderColor = '#28a745';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 2500);

        // Check if limit reached after booking
        if (date === getTodayString()) {
            const newCount = getTodayBookingCount();
            if (newCount >= DAILY_LIMIT) {
                alert(`⚠️ Daily limit of ${DAILY_LIMIT} bookings has been reached for today.`);
            }
        }
    });

    // Re-check counter when date changes
    dateInput.addEventListener('change', function() {
        const selectedDate = this.value;
        const todayStr = getTodayString();
        if (selectedDate === todayStr) {
            updateTodayCounter();
        } else {
            // For future dates, show 0/30
            todayBookingsSpan.textContent = '0';
        }
    });

})();