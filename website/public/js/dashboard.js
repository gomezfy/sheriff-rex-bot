// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all items
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Get section
        const section = item.dataset.section;
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        
        // Show selected section
        const selectedSection = document.getElementById(`${section}-section`);
        if (selectedSection) {
            selectedSection.classList.add('active');
            document.getElementById('pageTitle').textContent = item.textContent.trim();
        }
    });
});

// Load user data
async function loadUserData() {
    try {
        const response = await fetch('/api/user');
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const user = await response.json();
        
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        const clientId = document.getElementById('clientId');
        
        if (userName && user.username) {
            userName.textContent = `${user.username}`;
        }
        
        if (userAvatar) {
            if (user.avatar) {
                const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
                userAvatar.innerHTML = `<img src="${avatarUrl}" alt="${user.username}">`;
            } else if (user.username) {
                userAvatar.textContent = user.username.charAt(0).toUpperCase();
            }
        }
        
        if (clientId && user.id) {
            clientId.textContent = user.id;
        }
        
        // Load servers
        if (user.guilds) {
            loadServers(user.guilds);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        window.location.href = '/';
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('serverCount').textContent = stats.servers;
        document.getElementById('userCount').textContent = stats.users;
        document.getElementById('commandCount').textContent = stats.commands;
        
        // Format uptime
        const uptime = formatUptime(stats.uptime);
        document.getElementById('uptime').textContent = uptime;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Load servers
function loadServers(guilds) {
    const serversList = document.getElementById('serversList');
    
    if (!guilds || guilds.length === 0) {
        serversList.innerHTML = '<p>Nenhum servidor encontrado.</p>';
        return;
    }
    
    serversList.innerHTML = guilds.map(guild => {
        const iconUrl = guild.icon 
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : null;
        
        return `
            <div class="server-card">
                <div class="server-icon">
                    ${iconUrl ? `<img src="${iconUrl}" alt="${guild.name}">` : '🏛️'}
                </div>
                <div class="server-info">
                    <div class="server-name">${guild.name}</div>
                    <div class="server-members">ID: ${guild.id}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadStats();
    
    // Refresh stats every 30 seconds
    setInterval(loadStats, 30000);
});
