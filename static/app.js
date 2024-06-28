document.getElementById('startRecordBtn').addEventListener('click', startRecording);
document.getElementById('stopRecordBtn').addEventListener('click', stopRecording);
document.getElementById('sendAudioBtn').addEventListener('click', sendAudio);

let mediaRecorder;
let audioChunks = [];

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            audioChunks = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();

                document.getElementById('sendAudioBtn').disabled = false;
            });

            document.getElementById('startRecordBtn').disabled = true;
            document.getElementById('stopRecordBtn').disabled = false;
            document.getElementById('status').textContent = 'Запись...';
        })
        .catch(e => {
            console.error(e);
            document.getElementById('status').textContent = 'Ошибка доступа к микрофону.';
        });
}

function stopRecording() {
    mediaRecorder.stop();
    document.getElementById('startRecordBtn').disabled = false;
    document.getElementById('stopRecordBtn').disabled = true;
    document.getElementById('status').textContent = 'Запись остановлена. Можно отправить аудио.';
}

function sendAudio() {
    const formData = new FormData();
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    formData.append('file', audioBlob);

    fetch('/speech_to_text', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('status').textContent = 'Текст: ' + data.text;
    })
    .catch(error => {
        console.error(error);
        document.getElementById('status').textContent = 'Ошибка отправки аудио.';
    });

    document.getElementById('sendAudioBtn').disabled = true;
}
