require('dotenv').config();
const mongoose = require('mongoose');

async function promote(email) {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI no está definido en el entorno.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const res = await mongoose.connection
      .collection('users')
      .updateOne({ email }, { $set: { rol: 'admin', activo: true } });

    console.log(`Usuario: ${email}`);
    console.log('Coincidencias:', res.matchedCount, 'Modificados:', res.modifiedCount);
  } catch (err) {
    console.error('Error realizando la actualización:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

const emailArg = process.argv[2] || 'cvictor121@hotmail.com';
promote(emailArg);