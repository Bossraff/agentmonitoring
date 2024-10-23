// Trackers data (store in local storage)
let trackers = JSON.parse(localStorage.getItem('trackers')) || [];
let dismissedHistory = JSON.parse(localStorage.getItem('dismissedHistory')) || []; // New history log array

// Function to add a new tracker
function addTracker(agentName, reason) {
    const newTracker = {
        id: Date.now(), // Unique ID for the tracker
        name: agentName,
        reason: reason,
        startTime: Date.now(), // Capture the start time
        exceeded: false // Whether the agent exceeded the max time
    };
    trackers.push(newTracker);
    localStorage.setItem('trackers', JSON.stringify(trackers)); // Save to local storage
    renderTrackers();
}

// Function to render trackers
function renderTrackers() {
    const trackerGrid = document.querySelector('.tracker-grid');
    trackerGrid.innerHTML = ''; // Clear existing trackers

    trackers.forEach(tracker => {
        const trackerElement = document.createElement('div');
        trackerElement.classList.add('tracker');

        // Calculate the elapsed time
        const elapsedTime = Date.now() - tracker.startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);

        // If exceeded max time (20 minutes), flag the tracker
        if (minutes >= 20 && !tracker.exceeded) {
            tracker.exceeded = true;
            localStorage.setItem('trackers', JSON.stringify(trackers)); // Update local storage
        }

        // Add "over-break" class if the time has exceeded
        if (tracker.exceeded) {
            trackerElement.classList.add('over-break');
        }

        // Tracker content
        trackerElement.innerHTML = `
            <p><strong>${tracker.name}</strong></p>
            <p>${tracker.reason}</p>
            <p class="timer">${minutes}:${seconds < 10 ? '0' + seconds : seconds}</p>
            <button class="dismiss-btn" onclick="dismissTracker(${tracker.id})">Dismiss</button>
        `;

        // Append to tracker grid
        trackerGrid.appendChild(trackerElement);

        // Update the timer every second
        setInterval(() => updateTimer(tracker.id), 1000);
    });
}

// Function to update the timer
function updateTimer(trackerId) {
    trackers = JSON.parse(localStorage.getItem('trackers')) || [];
    const tracker = trackers.find(t => t.id === trackerId);
    if (!tracker) return;

    const elapsedTime = Date.now() - tracker.startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);

    // If exceeded max time (20 minutes), flag the tracker
    if (minutes >= 20 && !tracker.exceeded) {
        tracker.exceeded = true;
        localStorage.setItem('trackers', JSON.stringify(trackers)); // Update local storage
    }

    // Update the timer in the tracker box
    const trackerElements = document.querySelectorAll('.tracker');
    trackerElements.forEach(el => {
        const id = parseInt(el.querySelector('.dismiss-btn').getAttribute('onclick').match(/\d+/)[0]);
        if (id === trackerId) {
            if (tracker.exceeded) {
                el.classList.add('over-break'); // Add red background if exceeded
            } else {
                el.classList.remove('over-break'); // Remove red background if not exceeded
            }
            el.querySelector('.timer').textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
    });
}

// Function to dismiss a tracker and log history
function dismissTracker(id) {
    const trackerToDismiss = trackers.find(t => t.id === id);
    if (trackerToDismiss) {
        const totalTimeConsumed = Math.floor((Date.now() - trackerToDismiss.startTime) / 60000); // Total time in minutes
        dismissedHistory.push({
            ...trackerToDismiss,
            totalTimeConsumed // Include total time in history log
        }); // Add to dismissed history
        localStorage.setItem('dismissedHistory', JSON.stringify(dismissedHistory)); // Save to local storage
    }
    trackers = trackers.filter(t => t.id !== id);
    localStorage.setItem('trackers', JSON.stringify(trackers)); // Update local storage
    renderTrackers(); // Re-render the trackers
    renderDismissedHistory(); // Update dismissed history display
}

// Function to render dismissed history
function renderDismissedHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = ''; // Clear existing history

    dismissedHistory.forEach(historyItem => {
        const historyElement = document.createElement('li');
        historyElement.textContent = `Dismissed: ${historyItem.name} - Reason: ${historyItem.reason} - Total Time Consumed: ${historyItem.totalTimeConsumed} minutes at ${new Date(historyItem.startTime).toLocaleString()}`;
        historyList.appendChild(historyElement);
    });
}

// Initialize trackers and history on page load
renderTrackers();
renderDismissedHistory(); // Display existing history log

// Event listener for adding a new tracker
document.querySelector('.add-btn').addEventListener('click', () => {
    const agentName = prompt('Enter agent name:');
    const reason = prompt('Enter reason (e.g., CR):');
    if (agentName && reason) {
        addTracker(agentName, reason);
    }
});

// Event listener for the history button
document.getElementById('historyBtn').addEventListener('click', () => {
    renderDismissedHistory(); // Render history log
    document.getElementById('historyModal').style.display = 'block'; // Show modal
});

// Event listener for closing the modal
document.getElementById('closeBtn').addEventListener('click', () => {
    document.getElementById('historyModal').style.display = 'none'; // Hide modal
});

// Close the modal if the user clicks outside of it
window.addEventListener('click', (event) => {
    const modal = document.getElementById('historyModal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Hide modal
    }
});

// Event listener for "Clear History" button
document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    dismissedHistory = []; // Clear history array
    localStorage.removeItem('dismissedHistory'); // Remove history log from local storage
    renderDismissedHistory(); // Re-render the history
});
