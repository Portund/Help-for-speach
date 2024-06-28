from flask import Flask, request, jsonify, render_template_string
import speech_recognition as sr

app = Flask(__name__)

@app.route('/')
def index():
    return render_template_string('''
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <title>Голосовой помощник для заявлений</title>
        </head>
        <body>
            <h1>Голосовой помощник для заявлений</h1>
            <button id="startRecordBtn">Начать запись</button>
            <button id="stopRecordBtn" disabled>Остановить запись</button>
            <button id="sendAudioBtn" disabled>Отправить аудио</button>
            <p id="status"></p>
            <script src="/static/app.js"></script>
        </body>
        </html>
    ''')

@app.route('/speech_to_text', methods=['POST'])
def speech_to_text():
    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400

    if file:
        # Использование распознавателя речи
        recognizer = sr.Recognizer()
        with sr.AudioFile(file) as source:
            audio_data = recognizer.record(source)
            try:
                # Распознавание речи
                text = recognizer.recognize_google(audio_data, language='ru-RU')
                return jsonify({"status": "success", "text": text})
            except sr.UnknownValueError:
                return jsonify({"status": "error", "message": "Speech was unintelligible"})
            except sr.RequestError as e:
                return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
