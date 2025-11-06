import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployeeModel extends Model<IEmployee> {
  generateCode(): Promise<string>;
}

export interface IEmployee extends Document {
  codigo: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoDocumento: 'CC' | 'CE' | 'PASAPORTE';
  numeroDocumento: string;
  fechaNacimiento: Date;
  cargo: string;
  departamento: string;
  salarioBase: number;
  fechaIngreso: Date;
  estado: 'activo' | 'inactivo' | 'suspendido';
  eps: string;
  pension: string;
  arl: string;
  cajaCompensacion: string;
  cesantias: string;
  empresa?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código es obligatorio'],
      unique: true,
      trim: true,
      match: [/^GS-EMP-\d{4}$/, 'El formato del código debe ser GS-EMP-XXXX'],
    },
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
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
      match: [/^\d{10}$/, 'El teléfono debe tener 10 dígitos'],
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
    },
    tipoDocumento: {
      type: String,
      required: [true, 'El tipo de documento es obligatorio'],
      enum: ['CC', 'CE', 'PASAPORTE'],
      default: 'CC',
    },
    numeroDocumento: {
      type: String,
      required: [true, 'El número de documento es obligatorio'],
      unique: true,
      trim: true,
    },
    fechaNacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    cargo: {
      type: String,
      required: [true, 'El cargo es obligatorio'],
      trim: true,
    },
    departamento: {
      type: String,
      required: [true, 'El departamento es obligatorio'],
      trim: true,
    },
    salarioBase: {
      type: Number,
      required: [true, 'El salario base es obligatorio'],
      min: [0, 'El salario base no puede ser negativo'],
    },
    fechaIngreso: {
      type: Date,
      required: [true, 'La fecha de ingreso es obligatoria'],
      default: Date.now,
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo', 'suspendido'],
      default: 'activo',
    },
    eps: {
      type: String,
      required: [true, 'La EPS es obligatoria'],
      trim: true,
    },
    pension: {
      type: String,
      required: [true, 'El fondo de pensión es obligatorio'],
      trim: true,
    },
    arl: {
      type: String,
      required: [true, 'La ARL es obligatoria'],
      trim: true,
    },
    cajaCompensacion: {
      type: String,
      required: [true, 'La caja de compensación es obligatoria'],
      trim: true,
    },
    cesantias: {
      type: String,
      required: [true, 'El fondo de cesantías es obligatorio'],
      trim: true,
    },
    empresa: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
  }
);

// Método para generar un nuevo código de empleado
EmployeeSchema.statics.generateCode = async function (): Promise<string> {
  const lastEmployee = await this.findOne()
    .sort({ codigo: -1 })
    .exec();

  let newNumber = 1;
  if (lastEmployee) {
    const lastNumber = parseInt(lastEmployee.codigo.split('-')[2]);
    newNumber = lastNumber + 1;
  }

  return `GS-EMP-${newNumber.toString().padStart(4, '0')}`;
};

const Employee = mongoose.models.Employee || mongoose.model<IEmployee, IEmployeeModel>('Employee', EmployeeSchema);

export default Employee;