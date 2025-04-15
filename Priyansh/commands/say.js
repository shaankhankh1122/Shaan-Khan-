<!DOCTYPE html>
<html>
<head>
  <title>اردو وائس بوٹ</title>
</head>
<body>
  <h2>مائیک پر کلک کریں اور کچھ کہیں جیسے: "کہو میں خوش ہوں"</h2>
  <button onclick="startBot()">مائیک آن کریں</button>

  <script>
    // Speech Recognition (in Urdu)
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ur-PK'; // Listening in Urdu
    recognition.interimResults = false;

    // Speech Synthesis (in Urdu)
    const synth = window.speechSynthesis;

    function startBot() {
      recognition.start();
      console.log("سن رہا ہوں...");
    }

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("آپ نے کہا:", transcript);

      if (transcript.startsWith("کہو ")) {
        const toSay = transcript.slice(4); // Remove "کہو "
        speakUrdu(toSay);
      } else {
        speakUrdu("براہ کرم 'کہو' سے جملہ شروع کریں");
      }
    };

    recognition.onerror = function