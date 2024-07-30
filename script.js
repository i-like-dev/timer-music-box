document.addEventListener('DOMContentLoaded', () => {
    const timersContainer = document.getElementById('timers');
    const timeInput = document.getElementById('time-input');
    const musicInput = document.getElementById('music-input');
    const addTimerButton = document.getElementById('add-timer');
    const alarmSound = document.getElementById('alarm-sound');

    let savedTimers = JSON.parse(localStorage.getItem('timers')) || [];

    // 設定定時器檢查間隔
    setInterval(checkTimers, 1000);

    // 顯示保存的定時器
    savedTimers.forEach(timer => {
        addTimerToDOM(timer);
    });

    addTimerButton.addEventListener('click', () => {
        const time = timeInput.value;
        const file = musicInput.files[0];

        if (time && file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const musicData = e.target.result;
                const timer = { id: Date.now(), time, musicData };
                addTimerToDOM(timer);
                savedTimers.push(timer);
                localStorage.setItem('timers', JSON.stringify(savedTimers));
            };
            reader.readAsDataURL(file);
        } else {
            alert('請選擇時間並上傳音樂文件');
        }
    });

    function addTimerToDOM(timer) {
        const timerDiv = document.createElement('div');
        timerDiv.className = 'timer';
        timerDiv.innerHTML = `
            <span>定時器: ${timer.time}</span>
            <button class="delete-button" data-id="${timer.id}">刪除</button>
        `;

        const deleteButton = timerDiv.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            timersContainer.removeChild(timerDiv);
            savedTimers = savedTimers.filter(t => t.id !== timer.id);
            localStorage.setItem('timers', JSON.stringify(savedTimers));
        });

        timersContainer.appendChild(timerDiv);
    }

    function checkTimers() {
        const currentTime = new Date();
        savedTimers.forEach(timer => {
            const timerTime = new Date();
            const [hours, minutes] = timer.time.split(':');
            timerTime.setHours(hours);
            timerTime.setMinutes(minutes);
            timerTime.setSeconds(0);

            if (currentTime.getHours() === timerTime.getHours() && 
                currentTime.getMinutes() === timerTime.getMinutes() && 
                currentTime.getSeconds() === timerTime.getSeconds()) {
                
                playAlarm(timer.musicData);
            }
        });
    }

    function playAlarm(musicData) {
        alarmSound.src = musicData;
        alarmSound.play();
        alarmSound.onended = () => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
        };
    }
});
