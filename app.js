const express = require('express');
const path = require('path');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const colors = require('colors');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();
const multer = require('multer'); // Para manejar la carga de archivos


const app = express();


app.use(express.static(__dirname + '/public'));


const port = process.env.PORT;




const SESSION_FILE_PATH = './session.json';

let sessionData;

if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}



const client = new Client({
  puppeteer: {
    args: ['--no-sandbox']
  },
  authStrategy: new LocalAuth({ clientId: "Client-one" }),
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2332.15.html'
  }
});


client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});




client.on('authenticated', (session) => {
  console.log('Conexión exitosa');
  sessionData = session;
  if (sessionData) {
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
});



let MSGbien = null; // inicia el Mensaje de bienvenida
let etapa = 0;
const registro = {}; // Registra los numeros telefono que inician al programa 
let numeroDocumento = '';

client.on('message', async (message) => {
  console.log(`Mensaje recibido de ${message.from}: ${message.body}`);




// Este codigo verifica que ya se envio el mensaje de bienvenida
if (!registro[message.from]) { 
  client.sendMessage(message.from, 'Hola soy Marco Polo, tu asistente virtual cheque regalo \n \n Marque el número de la opción que necesita. \n \n 1️⃣ Eres afiliado \n \n 2️⃣ Deseas afiliarte \n \n 3️⃣Activar Código');

  registro[message.from] = { etapa: 0, numeroDocumento: '' };
  // registro[message.from] = true; // Register the phone number
  return;
}

if (MSGbien !== null) { // Check if MSGbien exists
  client.sendMessage(message.from, MSGbien);
  MSGbien = null; // Reset to a falsy value after sending
} else {
  console.log('Error al verificar el mensaje de bienvenida');
}

setTimeout(() => {
  delete registro[message.from];
}, 150 * 10000);






switch (registro[message.from].etapa) {

  

  case 0:
    const mensajeEnMinusculas = message.body.toLowerCase();
    if (mensajeEnMinusculas.includes('1')) {
      client.sendMessage(message.from, 'Indicanos tu código de afiliación. Recuerda son 6 caracteres alfanumericos');
      registro[message.from].etapa = 10;
    } else if (mensajeEnMinusculas.includes('2')) {
      client.sendMessage(message.from, 'Por favor diligencia la información siguiente en este mismo cuerpo del mensaje: nombre de la empresa donde te vinculas. Tu nombre completo, Numero documento, Número celular, Correo electrónico, Edad, Estado civil, Ciudad de residencia. Manifiesto haber leído y aceptado las condiciones de uso impresas en la revista.');
      registro[message.from].etapa = 12;
  } else if (mensajeEnMinusculas.includes('3')) {
    client.sendMessage(message.from, 'Indicanos tu código de afiliación. Recuerda son 6 caracteres alfanumericosindícame el código que vas a activar seguido en el mismo cuerpo del mensaje tu nombre, tu número de contacto, tu correo electrónico, edad y estado civil , y la respuesta sigue siendo la misma que dimos para esta opción');
    registro[message.from].etapa = 22;
  }
    break;




    case 10:
      if (message.body.length > 2) {
        // Si el mensaje contiene "No" o "Cancelar", envía la respuesta
        client.sendMessage(message.from, 'Marque el número de la opción que necesita. \n \n 1️⃣ Ayuda para reservar un plan. \n \n 2️⃣ Solicitar un plan personalizado. \n \n 3️⃣ Realizar un reclamo\n \n4️⃣ Disfruta de un plan en tu ciudad \n \n 5️⃣ Disfruta de un pasadia ');
        registro[message.from].etapa = 11;
      }
      break
    

      case 11:
        if (message.body === '1') {
          // Si el mensaje contiene "No" o "Cancelar", envía la respuesta
          client.sendMessage(message.from, 'Indicanos el nombre del plan que deseas reservar y la fecha para usarlo');
          registro[message.from].etapa = 13;
        } else if (message.body === '2') {
          client.sendMessage(message.from, 'Indicanos el lugar donde deseas reservar, fechas de ingresa y salida, número de personas');
          registro[message.from].etapa = 13;
        } else if (message.body === '3') {
          client.sendMessage(message.from, 'Indícanos el nombre del plan que deseas disfrutar, la fecha y el numero de personas. ');
          registro[message.from].etapa = 21;
        } else if (message.body === '4') {
          client.sendMessage(message.from, 'Indícanos el nombre del plan que deseas disfrutar, la fecha y el numero de personas. ');
          registro[message.from].etapa = 21;
        } else if (message.body === '5') {
          client.sendMessage(message.from, 'Indícanos el nombre del plan que deseas disfrutar, la fecha y el numero de personas. ');
          registro[message.from].etapa = 21;
        }
        break;
  

        case 12:
          if (message.body.length > 2) {
            // Verificar si el mensaje tiene más de 2 letras
            client.sendMessage(message.from, 'Tu solicitud ha sido recibida, en cuanto la empresa donde te afilias nos confirme tu información te enviaremos por este medio tu código de afiliación. Gracias');
            registro[message.from].etapa = 19;
            delete registro[message.from];
          }
          break;

          case 13:
            if (message.body.length > 2) {
              // Verificar si el mensaje tiene más de 2 letras
              client.sendMessage(message.from, 'Tu solicitud ha sido recibida, te contactaremos para su respuesta máximo en 24 horas hábiles.');
              registro[message.from].etapa = 20;
              delete registro[message.from];
            }
            break;


            case 14:
              if (message.body.length > 2) {
                // Verificar si el mensaje tiene más de 2 letras
                client.sendMessage(message.from, 'Tu solicitud ha sido recibida, te contactaremos para su respuesta máximo en 24 horas hábiles.');
                registro[message.from].etapa = 19;
                delete registro[message.from];
              }
              break;


              case 21:
                if (message.body.length > 2) {
                  // Verificar si el mensaje tiene más de 2 letras
                  client.sendMessage(message.from, 'Tu solicitud ha sido recibida, te contactaremos lo más pronto posible');
                  registro[message.from].etapa = 20;
                  delete registro[message.from];
                }
                break;


                case 22:
                  if (message.body.length > 2) {
                    // Verificar si el mensaje tiene más de 2 letras
                    client.sendMessage(message.from, 'Cordial bienvenida tu código ha sido activado y puedes disfrutar los privilegios desde ya.');
                    registro[message.from].etapa = 20;
                    delete registro[message.from];
                  }
                  break;


  }


});




  // Desde aqui inica el cargue de la imagen al servidor 

  // Configura multer para guardar las imágenes en la carpeta "media"
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'media'); // Directorio de destino para las imágenes
    },
    filename: (req, file, cb) => {
      // Define el nombre del archivo como "image" y asegúrate de que sea único
      const extname = path.extname(file.originalname);
      const filename = 'image' + extname;
      cb(null, filename);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      // Verifica si el archivo ya existe en "media" y lo elimina si es necesario
      const filePath = path.join('media', 'image' + path.extname(file.originalname));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      cb(null, true);
    },
  });

  app.post('/upload', upload.single('image'), (req, res) => {
    // Mostrar un mensaje emergente en HTML
    const successMessage = `
      <div id="popup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #fff; padding: 20px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5); text-align: center;">
        <p>Imagen cargada con éxito</p>
        <button onclick="closePopup()">Cerrar</button>
      </div>
      <script>
        function closePopup() {
          document.getElementById('popup').style.display = 'none';
          // Redirige de nuevo a la página anterior
          window.location.href = '/'; // Cambia esto al URL de tu página
        }
      </script>
    `;
    res.send(successMessage);
  });


  // 



  let MSGenvio = true;




  // Desde aqui Robot de envio Mesivo

  client.on('auth_failure', (msg) => {
    console.error('Error de autenticación:', msg);
  });


  client.on('ready', () => {
    console.log('Cliente listo');
  });

  client.initialize();


  app.use(bodyParser.json()); // Usar body-parser para analizar JSON
  app.use(bodyParser.urlencoded({ extended: true })); // Usar body-parser para analizar datos codificados en URL

  // Array para almacenar los registros de mensajes enviados
  const registros = [];

  // app.get('/', (req, res) => {
  //   res.sendFile('index.html');
  //  });
  

  app.post('/procesar', (req, res) => {
    const { numbers, messages } = req.body;

    console.log('Números de Teléfono:', numbers);
    console.log('Mensajes:', messages);

    if (!numbers || !messages) {
      res.status(400).send('Los datos enviados no son válidos.');
      return;
    }

    if (!Array.isArray(numbers) || !Array.isArray(messages)) {
      res.status(400).send('Los datos enviados no son válidos.');
      return;
    }


    const sendMedia = (to, file) => {
      const mediaFile = MessageMedia.fromFilePath(`./media/${file}`)
      client.sendMessage(to, mediaFile)
    }
  
    
    // ///////////////////////////////////////

    let messageCounter = 0;



    app.post('/cambiar', (req, res) => {
      MSGenvio = !MSGenvio; // Cambiamos el valor de MSGenvio
      res.json({ MSGenvio });
  });


  


    setInterval(() => {
      console.log("MSGenvio:", MSGenvio);
    }, 1000);
    
    
    app.use(express.json());

  // ///////////////////////////////////////////////////////////////


  numbers.forEach((phoneNumber, index) => {
    const phoneNumberWithSuffix = `${phoneNumber}@c.us`;
    const message = messages[index] || ""; // Asigna una cadena vacía si el mensaje no está presente para ese número



    setTimeout(() => {
    
      if (MSGenvio) {
        sendMedia(phoneNumberWithSuffix, 'image.jpg');
      }
      client.sendMessage(phoneNumberWithSuffix, message)
        .then(() => {
          const registro = {
            mensaje: `Mensaje ${++messageCounter} enviado a ${phoneNumberWithSuffix}`,
            numero: phoneNumberWithSuffix
          };

          registros.push(registro); // Agregar el registro al array de registros
          console.log(registro.mensaje.green);

  // Verifica si estás en el último elemento del array
  if (index === numbers.length - 1) {
    registros.push({ mensaje: 'Terminé de enviar los mensajes', numero: 'Oprima el boton borra registro' });
    console.log('Terminé de enviar');
  }
        })
        .catch((error) => {
          console.log(`Error al enviar el mensaje a ${phoneNumberWithSuffix}: ${error.message}`.red);
        });
    }, 15000 * (index + 1));
  });




    res.status(200).send('Datos recibidos correctamente');


  app.get('/registros', (req, res) => {
    const ultimosRegistros = registros.slice(-10); // Obtener los últimos 10 registros

    res.json(ultimosRegistros); // Enviar los últimos 10 registros como respuesta en formato JSON
  });

  });

  // Ruta para borrar los registros
  app.delete('/borrar-registros', (req, res) => {
    registros.length = 0; // Borra todos los registros
    res.json({ message: 'Registros borrados exitosamente' });
  });






  app.listen(port, () => {
    console.log(`Servidor Express escuchando en el puerto ${port}`);
  });
