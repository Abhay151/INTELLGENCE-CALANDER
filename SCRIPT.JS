const calendar = document.getElementById('calendar');
const eventsDiv = document.getElementById('events');
const voiceBtn = document.getElementById('voiceBtn');
const examCountdownDiv = document.getElementById('examCountdown');
const moodLogDiv = document.getElementById('moodLog');
const timetableDiv = document.getElementById('showTimetable');
const timetableInput = document.getElementById('timetableInput');
const moodSelect = document.getElementById('moodSelect');

let events = JSON.parse(localStorage.getItem('events')) || {};
let moods = JSON.parse(localStorage.getItem('moods')) || {};
let timetable = JSON.parse(localStorage.getItem('timetable')) || {};

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function renderCalendar() {
  calendar.innerHTML = '';
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  document.getElementById("monthName").innerText = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  document.getElementById("year").innerText = currentYear;

  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement('div');
    div.className = 'day';
    div.innerText = day;

    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
    if (events[dateKey]) {
      div.classList.add('has-event');
    }

    div.onclick = () => {
      const title = prompt('Enter event title:');
      if (!title) return;
      const category = prompt('Category? (exam, birthday, task)') || 'general';
      addEvent(dateKey, title, category);
    };

    calendar.appendChild(div);
  }

  renderEvents();
  renderExamCountdown();
}

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function changeYear(offset) {
  currentYear += offset;
  renderCalendar();
}

function addEvent(date, title, category) {
  const newEvent = { title, category };
  if (!events[date]) events[date] = [];
  events[date].push(newEvent);
  localStorage.setItem('events', JSON.stringify(events));
  renderEvents();
  renderCalendar();
}

function renderEvents() {
  eventsDiv.innerHTML = '<h3>Events:</h3>';
  for (const date in events) {
    eventsDiv.innerHTML += `<div><strong>${date}</strong>:</div>`;
    events[date].forEach((e, index) => {
      const badge = `<span style="background:#0ea5e9;color:white;border-radius:4px;padding:2px 6px;font-size:12px;margin-left:8px;">${e.category}</span>`;
      eventsDiv.innerHTML += `
        <div style="margin-left: 15px; margin-bottom: 5px;">
          ${e.title} ${badge}
          <button onclick="editEvent('${date}', ${index})">✏️</button>
          <button onclick="deleteEvent('${date}', ${index})">🗑️</button>
        </div>
      `;
    });
  }
}

function editEvent(date, index) {
  const current = events[date][index];
  const newTitle = prompt("Edit event:", current.title);
  if (!newTitle) return;
  const newCategory = prompt("New category? (exam, birthday, task)", current.category) || current.category;
  events[date][index] = { title: newTitle, category: newCategory };
  localStorage.setItem('events', JSON.stringify(events));
  renderCalendar();
}

function deleteEvent(date, index) {
  if (confirm("Delete this event?")) {
    events[date].splice(index, 1);
    if (events[date].length === 0) delete events[date];
    localStorage.setItem('events', JSON.stringify(events));
    renderCalendar();
  }
}

// Voice Recognition: Add Event via Voice
voiceBtn.onclick = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Voice recognition is not supported in this browser.");
    return;
  }

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.start();

  recognition.onstart = () => {
    console.log("Voice recognition started. Speak now!");
  };

  recognition.onresult = (event) => {
    const speech = event.results[0][0].transcript.toLowerCase();
    console.log("Recognized Speech:", speech);

    const dayMatch = speech.match(/\b(\d{1,2})\b/);
    const titleMatch = speech.split(':')[1]?.trim();
    const categoryMatch = speech.includes('exam') ? 'exam'
                        : speech.includes('birthday') ? 'birthday'
                        : speech.includes('task') ? 'task'
                        : 'general';

    if (dayMatch && titleMatch) {
      const date = `${currentYear}-${currentMonth + 1}-${dayMatch[1]}`;
      addEvent(date, titleMatch, categoryMatch);
      alert(`🎤 Added "${titleMatch}" on ${date}`);
    } else {
      alert('❌ Voice format not recognized. Try: "Add event on May 3: Exam"');
    }
  };

  recognition.onerror = (event) => {
    console.error('Voice Recognition Error:', event.error);
    alert("There was an error with voice recognition.");
  };

  recognition.onend = () => {
    console.log("Voice recognition ended.");
  };
}

// Exam Countdown
function renderExamCountdown() {
  const examDate = '2025-06-01';
  const today = new Date();
  const exam = new Date(examDate);
  const timeDiff = exam - today;
  if (timeDiff > 0) {
    const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    examCountdownDiv.innerText = `${daysLeft} days left until your next exam!`;
  } else {
    examCountdownDiv.innerText = "No upcoming exams";
  }
}

// Mood Tracker
function saveMood() {
  const selectedMood = moodSelect.value;
  const today = new Date().toISOString().split('T')[0];
  moods[today] = selectedMood;
  localStorage.setItem('moods', JSON.stringify(moods));
  renderMoodLog();
}

function renderMoodLog() {
  moodLogDiv.innerHTML = '<h4>Your Mood Log:</h4>';
  for (const date in moods) {
    moodLogDiv.innerHTML += `<div><strong>${date}: </strong>${moods[date]}</div>`;
  }
}

// Timetable Integration
function saveTimetable() {
  const timetableData = timetableInput.value.split('\n').map(item => item.trim()).filter(Boolean);
  timetable = timetableData;
  localStorage.setItem('timetable', JSON.stringify(timetable));
  renderTimetable();
}

function renderTimetable() {
  timetableDiv.innerHTML = '<h4>Your Timetable:</h4>';
  if (timetable.length === 0) {
    timetableDiv.innerHTML += "<div>No timetable saved</div>";
  } else {
    timetable.forEach(item => {
      timetableDiv.innerHTML += `<div>${item}</div>`;
    });
  }
}

renderCalendar();
renderMoodLog();
renderTimetable();
