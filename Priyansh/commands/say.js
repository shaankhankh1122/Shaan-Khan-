<!DOCTYPE html>
<html>
<head>
  <title>Voice Say Bot (Urdu)</title>
</head>
<body>
  <h2>Click the button and say something like: "say mein acha hoon"</h2>
  <button onclick="startBot()">Start Voice Bot</button>

  <script>
    // Initialize speech recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US'; // still using English for commands
    recognition.interimResults = false;

    // Initialize speech synthesis
    const synth = window.speechSynthesis;

    function startBot() {
      recognition.start();
      console.log("Listening...");
    }

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Heard:", transcript);

      if (transcript.startsWith("say ")) {
        const toSay = transcript.slice(4); // remove "say "
        speakUrdu(toSay);
      } else {
        speakUrdu("برائے مہربانی 'say' سے شروع کریں");
      }
    };

    recognition.onerror = function(event) {
      console.error("Error:", event.error);
      speakUrdu("معذرت، کچھ غلطی ہوئی ہے");
    };

    function speakUrdu(text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ur-PK'; // Urdu language
      synth.speak(utterance);
    }
  </script>
</body>
</html>