import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  empresa?: string;
  // Campos de emisor para facturación
  nit?: string;
  direccion?: string;
  telefono?: string;
  correos?: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false,
    },
    rol: {
      type: String,
      enum: ['admin', 'gerente', 'contador', 'vendedor', 'almacen', 'rrhh'],
      default: 'vendedor',
    },
    activo: {
      type: Boolean,
      default: true,
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    ultimoAcceso: {
      type: Date,
    },
    empresa: {
      type: String,
      trim: true,
    },
    // Nuevos campos de emisor
    nit: { type: String, trim: true },
    direccion: { type: String, trim: true },
    telefono: { type: String, trim: true },
    correos: { type: [String], default: [], validate: {
      validator: (arr: string[]) => arr.every(email => /^(?:\S+@\S+\.\S+)$/.test(email)),
      message: 'Todos los correos deben tener formato válido'
    } },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

// Encriptación de contraseña antes de guardar
UserSchema.pre('save', async function (next) {
  const user = this as any;
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, (this as any).password);
};

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;