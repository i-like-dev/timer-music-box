document.addEventListener('DOMContentLoaded', () => {
    const timersContainer = document.getElementById('timers');
    const textInput = document.getElementById('text-input');
    const timeInput = document.getElementById('time-input');
    const intervalInput = document.getElementById('interval-input');
    const ttsTimeInput = document.getElementById('tts-time-input');
    const ttsIntervalInput = document.getElementById('tts-interval-input');
    const musicInput = document.getElementById('music-input');
    const addTimerButton = document.getElementById('add-timer');
    const alarmSound = document.getElementById('alarm-sound');
    const transcriptionContainer = document.getElementById('transcription');
    
    const ttsContainer = document.getElementById('tts-container');
    const uploadContainer = document.getElementById('upload-container');
    
    let savedTimers = JSON.parse(localStorage.getItem('timers')) || [];

    // 設定定時器檢查間隔
    setInterval(checkTimers, 1000);

    // 顯示保存的定時器
    savedTimers.forEach(timer => {
        addTimerToDOM(timer);
    });

    addTimerButton.addEventListener('click', () => {
        const selectedMode = document.querySelector('input[name="mode"]:checked').value;
        const timeType = document.querySelector('input[name="time-type"]:checked').value;
        const ttsTimeType = document.querySelector('input[name="tts-time-type"]:checked').value;

        if (selectedMode === 'tts') {
            const text = textInput.value;
            const time = ttsTimeInput.value;
            const interval = parseInt(ttsIntervalInput.value, 10);

            if (text && (time || interval)) {
                const timer = {
                    id: Date.now(),
                    text,
                    mode: 'tts',
                    time: time || '',
                    interval: interval || 0,
                    nextPlayTime: getNextPlayTime(new Date(), time ? 0 : interval, time),
                    type: time ? 'daily' : 'interval' // 添加类型字段
                };
                addTimerToDOM(timer);
                savedTimers.push(timer);
                localStorage.setItem('timers', JSON.stringify(savedTimers));
            } else {
                alert('請輸入文本並設定時間或間隔');
            }
        } else {
            const file = musicInput.files[0];
            const time = timeInput.value;
            const interval = parseInt(intervalInput.value, 10);

            if (file && (time || interval)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const musicData = e.target.result;
                    const timer = {
                        id: Date.now(),
                        musicData,
                        mode: 'upload',
                        time: time || '',
                        interval: interval || 0,
                        nextPlayTime: getNextPlayTime(new Date(), time ? 0 : interval, time),
                        type: time ? 'daily' : 'interval' // 添加类型字段
                    };
                    addTimerToDOM(timer);
                    savedTimers.push(timer);
                    localStorage.setItem('timers', JSON.stringify(savedTimers));
                };
                reader.readAsDataURL(file);
            } else {
                alert('請上傳音頻文件並設定時間或間隔');
            }
        }
    });

    function addTimerToDOM(timer) {
        const timerDiv = document.createElement('div');
        timerDiv.className = 'timer';
        timerDiv.innerHTML = `
            <span>定時器: ${timer.time || '即刻'} (間隔: ${timer.interval || '無'})</span>
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
            if (currentTime.getTime() >= timer.nextPlayTime.getTime()) {
                if (timer.mode === 'tts') {
                    playTextToSpeech(timer.text);
                } else if (timer.mode === 'upload') {
                    playAlarm(timer.musicData);
                }
                if (timer.type === 'interval') {
                    // 设置下一个触发时间
                    timer.nextPlayTime = getNextPlayTime(currentTime, timer.interval);
                } else if (timer.type === 'daily') {
                    // 设置每天的触发时间
                    timer.nextPlayTime = getNextPlayTime(currentTime, 0, timer.time);
                }
            }
        });
        localStorage.setItem('timers', JSON.stringify(savedTimers));
    }

    function getNextPlayTime(currentTime, interval, specificTime) {
        const nextPlayTime = new Date(currentTime.getTime());
        if (specificTime) {
            const [hours, minutes] = specificTime.split(':').map(Number);
            nextPlayTime.setHours(hours, minutes, 0, 0);
            if (nextPlayTime <= currentTime) {
                nextPlayTime.setDate(nextPlayTime.getDate() + 1);
            }
        } else {
            nextPlayTime.setMinutes(nextPlayTime.getMinutes() + interval);
        }
        return nextPlayTime;
    }

    function playTextToSpeech(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }

    function playAlarm(musicData) {
        alarmSound.src = musicData;
        alarmSound.play();
        alarmSound.onended = () => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
        };
    }

    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'tts') {
                ttsContainer.style.display = 'block';
                uploadContainer.style.display = 'none';
                document.querySelectorAll('input[name="tts-time-type"]').forEach(radio => {
                    radio.addEventListener('change', (event) => {
                        if (event.target.value === 'time') {
                            ttsTimeInput.style.display = 'block';
                            ttsIntervalInput.style.display = 'none';
                        } else {
                            ttsTimeInput.style.display = 'none';
                            ttsIntervalInput.style.display = 'block';
                        }
                    });
                });
            } else {
                ttsContainer.style.display = 'none';
                uploadContainer.style.display = 'block';
                document.querySelectorAll('input[name="time-type"]').forEach(radio => {
                    radio.addEventListener('change', (event) => {
                        if (event.target.value === 'time') {
                            timeInput.style.display = 'block';
                            intervalInput.style.display = 'none';
                        } else {
                            timeInput.style.display = 'none';
                            intervalInput.style.display = 'block';
                        }
                    });
                });
            }
        });
    });

    // 初始加载时设置显示状态
    document.querySelector('input[name="mode"]:checked').dispatchEvent(new Event('change'));
});
