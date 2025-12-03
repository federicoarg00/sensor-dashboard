document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    btn.classList.add('active');
  });
});

async function loadDashboard() {
  try {
    const sensorsResponse = await fetch('/api/sensors/latest');
    const sensors = await sensorsResponse.json();
    
    const alarmsResponse = await fetch('/api/alarms');
    const alarms = await alarmsResponse.json();
    
    displaySensors(sensors);
    displayAlarms(alarms);
    
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

function displaySensors(sensors) {
  const grid = document.getElementById('sensorsGrid');
  
  if (sensors.length === 0) {
    grid.innerHTML = '<p class="loading">No sensors found</p>';
    return;
  }
  
  grid.innerHTML = sensors.map(sensor => {
    const lastUpdate = new Date(sensor.created_at).toLocaleString();
    const hasAlarm = sensor.alarm === 1;
    
    return `
      <div class="sensor-card ${hasAlarm ? 'alarm' : ''}">
        <div class="sensor-id">${sensor.sensorid}</div>
        <div class="sensor-stat">
          <span class="sensor-stat-label">Reading</span>
          <span class="sensor-reading">${sensor.sensor_reading.toFixed(2)}</span>
        </div>
        <div class="sensor-stat">
          <span class="sensor-stat-label">Status</span>
          <span class="sensor-alarm ${hasAlarm ? 'alarm-yes' : 'alarm-no'}">
            ${hasAlarm ? '🚨 ALARM' : '✓ OK'}
          </span>
        </div>
        <div class="last-update-time">Last: ${lastUpdate}</div>
      </div>
    `;
  }).join('');
}

function displayAlarms(alarms) {
  const tbody = document.getElementById('alarmsBody');
  
  if (alarms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">No alarms</td></tr>';
    return;
  }
  
  tbody.innerHTML = alarms.map(alarm => {
    return `
      <tr class="alarm-row">
        <td>${alarm.sensorid}</td>
        <td>${new Date(alarm.created_at).toLocaleString()}</td>
        <td>${alarm.sensor_reading.toFixed(2)}</td>
        <td>⚠️ Alarm</td>
      </tr>
    `;
  }).join('');
}

loadDashboard();
setInterval(loadDashboard, 30000);