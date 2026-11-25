/*
  LETRA.JS — canción y preguntas del juego.

  youtube   → pega aquí la URL del vídeo oficial de YouTube
              (por ejemplo https://www.youtube.com/watch?v=XXXXXXXXXXX)
  preguntas → una por hueco, ordenadas por "time". Puedes poner las que
              quieras: el juego se adapta solo al número de preguntas.
      time      → segundo del vídeo en el que se pausa y sale la pregunta
      antes     → texto antes del hueco (en inglés, como la letra original)
      despues   → texto después del hueco
      correcta  → la palabra oculta (debe estar en "opciones")
      opciones  → exactamente 4 palabras en inglés

  Las 16 preguntas de abajo son EJEMPLOS en inglés inventados para probar el
  juego (no son de la canción). Sustituye "antes", "despues", "correcta" y
  "opciones" por los de tu letra, y ajusta "time" escuchando el vídeo
  (la canción dura unos 3:41, así que van repartidas cada 12 segundos).
*/
const CANCION = {
  titulo: "Just the Way You Are",
  youtube: "PEGA_AQUI_LA_URL_DE_YOUTUBE",
  preguntas: [
    { time: 10,  antes: "Every morning I look in the mirror and see my", despues: "smiling back at me", correcta: "face", opciones: ["face", "rain", "shadow", "house"] },
    { time: 22,  antes: "No matter how far I run, I always come back to the same", despues: "", correcta: "place", opciones: ["river", "place", "train", "sky"] },
    { time: 34,  antes: "Tonight I write these lines so I never forget the", despues: "I took", correcta: "road", opciones: ["road", "money", "wind", "language"] },
    { time: 46,  antes: "The city is quiet and the", despues: "is shining on the street", correcta: "moon", opciones: ["moon", "coffee", "bridge", "radio"] },
    { time: 58,  antes: "She opened the window and let the cold", despues: "come inside", correcta: "air", opciones: ["air", "dog", "paper", "glass"] },
    { time: 70,  antes: "I keep a small", despues: "in my pocket for luck", correcta: "coin", opciones: ["coin", "storm", "chair", "ocean"] },
    { time: 82,  antes: "We sat on the roof and counted every", despues: "in the sky", correcta: "star", opciones: ["star", "key", "bus", "shoe"] },
    { time: 94,  antes: "He plays the old guitar until the", despues: "comes up", correcta: "sun", opciones: ["sun", "table", "bill", "snow"] },
    { time: 106, antes: "Don't be afraid of the dark, I'll hold your", despues: "tonight", correcta: "hand", opciones: ["hand", "phone", "map", "bread"] },
    { time: 118, antes: "The children ran across the", despues: "and laughed all day", correcta: "field", opciones: ["field", "clock", "lamp", "fire"] },
    { time: 130, antes: "I wrote your name in the", despues: "by the sea", correcta: "sand", opciones: ["sand", "metal", "book", "milk"] },
    { time: 142, antes: "Every little", despues: "can change the way you feel", correcta: "word", opciones: ["word", "engine", "tooth", "wall"] },
    { time: 154, antes: "The train leaves at midnight, so I must say", despues: "now", correcta: "goodbye", opciones: ["goodbye", "yellow", "ticket", "window"] },
    { time: 166, antes: "She danced alone in the", despues: "of the empty room", correcta: "light", opciones: ["light", "money", "hat", "feather"] },
    { time: 178, antes: "I will wait for you until the last", despues: "falls", correcta: "leaf", opciones: ["leaf", "bell", "plate", "wire"] },
    { time: 190, antes: "Close your eyes and let the music", despues: "your heart", correcta: "fill", opciones: ["fill", "break", "sell", "paint"] }
  ]
};
