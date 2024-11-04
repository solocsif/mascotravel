require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(async () => {
  console.log('Conectado a MongoDB');

  // Define el esquema de usuario aquí mismo
  const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // ...otros campos que necesites para el usuario
  });

  const User = mongoose.model('User', userSchema); 

  try {
    const users = await User.find({}); 

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      await user.save();
      console.log(`Contraseña hasheada para el usuario ${user.username}`);
    }

    console.log('Contraseñas hasheadas correctamente');
    mongoose.disconnect(); 
  } catch (error) {
    console.error('Error al hashear las contraseñas:', error);
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});