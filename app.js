// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbdih73am-L7ep6yYTlBnA-ycKuxTv9gY",
    authDomain: "app-adm-246d7.firebaseapp.com",
    databaseURL: "https://app-adm-246d7-default-rtdb.firebaseio.com",
    projectId: "app-adm-246d7",
    storageBucket: "app-adm-246d7.firebasestorage.app",
    messagingSenderId: "701209991366",
    appId: "1:701209991366:web:c37bf4e36f601b91c2dfc7",
    measurementId: "G-Q74ZZVT2CJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Services Form Handling
document.getElementById('serviceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const serviceName = document.getElementById('serviceName').value;
    const servicePrice = document.getElementById('servicePrice').value;
    const serviceDuration = document.getElementById('serviceDuration').value;
    
    const newServiceRef = database.ref('services').push();
    newServiceRef.set({
        name: serviceName,
        price: servicePrice,
        duration: serviceDuration
    });
    
    this.reset();
});

// Load Services
function loadServices() {
    const servicesList = document.getElementById('servicesList');
    
    // Clear existing listeners to prevent duplicate entries
    database.ref('services').off('child_added');
    database.ref('services').off('child_removed');
    servicesList.innerHTML = '';
    
    database.ref('services').on('child_added', function(snapshot) {
        const service = snapshot.val();
        const serviceId = snapshot.key;
        
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            ${service.name} - R$${service.price} (${service.duration} min)
            <span class="delete-btn" onclick="deleteService('${serviceId}')">🗑️</span>
        `;
        servicesList.appendChild(li);
    });

    // Handle service deletion
    database.ref('services').on('child_removed', function(snapshot) {
        const serviceId = snapshot.key;
        const serviceElement = document.querySelector(`[data-service-id="${serviceId}"]`);
        if (serviceElement) {
            serviceElement.remove();
        }
    });
}

// Delete Service
function deleteService(serviceId) {
    database.ref(`services/${serviceId}`).remove()
        .then(() => {
            showNotification('Serviço excluído com sucesso!', 'success');
        })
        .catch((error) => {
            showNotification('Erro ao excluir serviço', 'danger');
        });
}

// Client Management
function loadClients() {
    const clientsList = document.getElementById('clientsList');
    clientsList.innerHTML = '';
    
    database.ref('bookings').on('child_added', function(snapshot) {
        const booking = snapshot.val();
        const bookingId = snapshot.key;
        
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            ${booking.clientName} - ${booking.day} ${booking.time}
            <span class="delete-btn" onclick="deleteClient('${bookingId}')">🗑️</span>
        `;
        clientsList.appendChild(li);
    });
}

// Delete Client
function deleteClient(bookingId) {
    database.ref(`bookings/${bookingId}`).remove()
        .then(() => {
            showNotification('Cliente removido com sucesso!', 'success');
            loadClients();
            updateScheduleTable();
        })
        .catch((error) => {
            showNotification('Erro ao remover cliente', 'danger');
        });
}

// Show Notification
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    notificationArea.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update Schedule Table
function updateScheduleTable() {
    const scheduleTableBody = document.getElementById('scheduleTableBody');
    scheduleTableBody.innerHTML = '';
    
    const days = ['Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    days.forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${day}</td>`;
        
        for (let i = 0; i < 18; i++) {
            const cell = document.createElement('td');
            const hour = 9 + Math.floor(i/2);
            const minute = i % 2 === 0 ? '00' : '30';
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute}`;
            
            cell.classList.add('schedule-slot');
            cell.dataset.day = day;
            cell.dataset.time = timeSlot;
            row.appendChild(cell);
        }
        
        scheduleTableBody.appendChild(row);
    });

    // Mark booked slots
    database.ref('bookings').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const booking = childSnapshot.val();
            const slots = document.querySelectorAll(
                `[data-day="${booking.day}"][data-time="${booking.time}"]`
            );
            
            slots.forEach(slot => {
                slot.classList.add('schedule-slot-booked');
                slot.textContent = booking.clientName;
            });
        });
    });
}

// Initial Loads
loadServices();
loadClients();
updateScheduleTable();