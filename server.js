require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Importa mongoose
const bcrypt = require('bcrypt'); // Importa bcrypt para comparar contraseñas
const app = express();
const port = process.env.PORT || 5000;

// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Conexión a MongoDB usando la variable de entorno MONGO_URI
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Definición del esquema de usuario con Mongoose
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ...otros campos que necesites para el usuario
});

// Especificar el nombre de la colección 'User'
const User = mongoose.model('User', userSchema, 'User'); 

// Ruta para la API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hola desde Express!' }); 
});

// Ruta para el login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Busca el usuario en la base de datos
    const user = await User.findOne({ username });
    console.log(user); // <--- Agrega esta línea para imprimir el usuario

    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Compara la contraseña proporcionada con la contraseña hasheada en la base de datos
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Si las credenciales son válidas, puedes generar un token JWT (opcional) y enviarlo al cliente
    // ... lógica para generar el token JWT ...

    res.json({ message: 'Inicio de sesión exitoso', user }); // Envía la información del usuario al cliente
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});


// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public'))); 

// Manejo de errores 404 (Not Found)
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

app.listen(port, () => console.log(`Servidor iniciado en el puerto ${port}`));