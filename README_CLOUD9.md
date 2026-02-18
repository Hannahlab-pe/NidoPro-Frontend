# NidoPro Frontend - Despliegue en Cloud9/EC2

## Pre-requisitos

- Node.js 20+
- Acceso a la terminal de Cloud9/EC2
- Backend desplegado en Railway

## Pasos de Despliegue

### 1. Clonar el repositorio

```bash
cd ~/environment
git clone https://github.com/Hannahlab-pe/NidoPro-Frontend.git
cd NidoPro-Frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cat > .env << EOF
VITE_API_URL=https://eda.up.railway.app/api/v1
VITE_NODE_ENV=production
VITE_PORT=8080
VITE_PUBLIC_URL=http://3.15.37.129:8080
EOF
```

### 4. Construir la aplicación

```bash
npm run build
```

### 5. Instalar servidor HTTP

```bash
npm install -g serve
```

### 6. Iniciar el servidor

```bash
serve -s dist -l 8080
```

## Configurar Security Group

Asegúrate de que tu instancia EC2 permita:
- Puerto 22 (SSH)
- Puerto 8080 (HTTP - Frontend)

## Verificación

1. IP pública de la instancia: `3.15.37.129`
2. Abre en navegador: `http://3.15.37.129:8080`

## Mantener el servidor corriendo

Para que el servidor siga corriendo cuando cierres la terminal:

```bash
nohup serve -s dist -l 8080 > server.log 2>&1 &
```

Para detener:
```bash
pkill -f serve
```

## Actualizar la aplicación

```bash
cd ~/environment/NidoPro-Frontend
git pull
npm install
npm run build
pkill -f serve
nohup serve -s dist -l 8080 > server.log 2>&1 &
```
