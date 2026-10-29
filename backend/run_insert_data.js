#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando inserción de datos de muestra...\n');

try {
  // Verificar si existe el archivo .env
  const fs = require('fs');
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No se encontró archivo .env');
    console.log('📝 Creando archivo .env con configuración por defecto...\n');
    
    const envContent = `# Configuración de la base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=zoomtv_db
DB_PORT=3306

# Configuración del servidor
PORT=3000
NODE_ENV=development`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado exitosamente\n');
  }

  // Instalar dependencias si es necesario
  console.log('📦 Verificando dependencias...');
  try {
    require('mysql2');
    require('dotenv');
    console.log('✅ Dependencias encontradas\n');
  } catch (error) {
    console.log('📥 Instalando dependencias...');
    execSync('npm install mysql2 dotenv', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas\n');
  }

  // Ejecutar el script de inserción
  console.log('🔄 Ejecutando script de inserción de datos...\n');
  require('./insert_sample_data.js');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
