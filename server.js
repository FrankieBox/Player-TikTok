const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Define a pasta onde estão os ficheiros HTML (ex: pasta 'public')
app.use(express.static(path.join(__dirname, 'public')));

// Rotas opcionais para servir diretamente os ficheiros se estiverem na raiz
app.get('/control', (req, res) => {
    res.sendFile(path.join(__dirname, 'control.html'));
});

app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, 'display.html'));
});

// Gestão da comunicação em tempo real via WebSocket
io.on('connection', (socket) => {
  console.log(`Dispositivo conectado: ${socket.id}`);

  // 1. Recebe a ordem da mesa para mudar o Short e envia para o Display
  socket.on('mudar_video', (dados) => {
    console.log("A transmitir Short ID:", dados.videoId);
    io.emit('mudar_video', dados); // Envia para todas as telas conectadas (Display)
  });

  // 2. Recebe o balão flutuante da mesa e envia para o Display
  socket.on('enviar_balao', (dados) => {
    console.log("Balão flutuante:", dados.mensagem);
    io.emit('mostrar_balao', dados);
  });

  // 3. Recebe comandos gerais do player (play, pause, mute, reset) e envia para o Display
  socket.on('comando_player', (dados) => {
    console.log("Comando do player:", dados.acao);
    io.emit('comando_player', dados);
  });

  socket.on('disconnect', () => {
    console.log(`Dispositivo desconectado: ${socket.id}`);
  });
});

// Porta dinâmica exigida pelo Render ou padrão 3000 para testes locais
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor da Emissora rodando na porta ${PORT}`);
});
