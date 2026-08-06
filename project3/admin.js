// admin.js - Admin Dashboard Logic
(function() {
    "use strict";

    const STORAGE_KEY = 'fieldEngineerBookings';
    const DAILY_LIMIT = 30;

    // DOM Elements
    const tableBody = document.getElementById('tableBody');
    const bookingCount = document.getElementById('bookingCount');
    const totalBookings = document.getElementById('totalBookings');
    const countDedicated = document.getElementById('countDedicated');
    const countIsdn = document.getElementById('countIsdn');
    const countVpn = document.getElementById('countVpn');
    const todayCountSpan = document.getElementById('todayCount');
    const todayBookingsAdmin = document.getElementById('todayBookingsAdmin');

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

    // Format date
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Truncate text
    function truncate(text, maxLength = 50) {
        if (!text) return '—';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Render dashboard
    function renderDashboard() {
        const bookings = getBookings();
        const total = bookings.length;

        // Update counts
        bookingCount.textContent = total;
        totalBookings.textContent = total;

        // Service counts
        let ded = 0, isdn = 0, vpn = 0;
        bookings.forEach(b => {
            if (b.service === 'Dedicated Internet') ded++;
            else if (b.service === 'ISDN Service') isdn++;
            else if (b.service === 'VPN Service') vpn++;
        });
        countDedicated.textContent = ded;
        countIsdn.textContent = isdn;
        countVpn.textContent = vpn;

        // Today's count
        const todayCount = getTodayBookingCount();
        todayCountSpan.textContent = todayCount;
        if (todayBookingsAdmin) {
            todayBookingsAdmin.textContent = todayCount;
        }

        // Build table
        if (bookings.length === 0) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="8">No bookings yet</td></tr>`;
            return;
        }

        let html = '';
        bookings.forEach((booking) => {
            html += `<tr>
                <td><span class="badge">${booking.service || '—'}</span></td>
                <td class="description-cell" title="${booking.description || ''}">
                    ${truncate(booking.description, 50)}
                </td>
                <td><strong>${booking.company || '—'}</strong></td>
                <td>${booking.location || '—'}</td>
                <td>${booking.phone || '—'}</td>
                <td>${formatDate(booking.date)}</td>
                <td>${booking.time || '—'}</td>
                <td style="text-align:right;">
                    <button class="delete-btn" data-id="${booking.id}">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </td>
            </tr>`;
        });
        tableBody.innerHTML = html;

        // Delete functionality
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Delete this booking?')) {
                    let bookings = getBookings();
                    bookings = bookings.filter(b => b.id !== id);
                    saveBookings(bookings);
                    renderDashboard();
                }
            });
        });
    }

    // Set date in header
    document.getElementById('dateDisplay').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    // Initial render
    renderDashboard();

    // Auto-refresh on storage change (from other tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            renderDashboard();
        }
    });

    // Auto-refresh every 5 seconds
    setInterval(renderDashboard, 5000);

})();