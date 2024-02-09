const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const sqlite3 = require('sqlite3');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3030;

// Conecta ao banco de dados SQLite (será criado se não existir)
const db = new sqlite3.Database('convidados.db');

// Cria a tabela de confirmações se ainda não existir
db.run(`
    CREATE TABLE IF NOT EXISTS confirmations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        attending TEXT,
        message TEXT
    )
`);

// Cria a tabela de mensagens do chat se ainda não existir
db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Configuração do Express
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Rota principal
app.get('/', (req, res) => {
    // Consulta o banco de dados para obter as confirmações
    db.all('SELECT * FROM confirmations', (err, confirmations) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro interno do servidor');
        }

        // Passa as confirmações para a página
        res.render('index', { confirmations });
    });
});

// Rota para lidar com o envio do formulário de confirmação
app.post('/confirm', (req, res) => {
    const { name, phone, attending, message } = req.body;

    // Verificar se o número de telefone já confirmou presença
    db.get('SELECT * FROM confirmations WHERE phone = ?', [phone], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro interno do servidor');
        }

        if (row) {
            // Número de telefone já confirmou presença
            return res.status(400).send('Este número de telefone já confirmou presença.');
        }

        // Se o número de telefone ainda não confirmou presença, inserir no banco de dados
        db.run('INSERT INTO confirmations (name, phone, attending, message) VALUES (?, ?, ?, ?)',
            [name, phone, attending, message],
            (err) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send('Erro interno do servidor');
                }

                // Redireciona de volta à página principal
                res.redirect('/');
            }
        );
    });
});

// Rota para lidar com o envio do formulário de chat
app.post('/chat', (req, res) => {
    const { name, message } = req.body;

    // Insere a mensagem do chat no banco de dados
    db.run('INSERT INTO chat_messages (name, message) VALUES (?, ?)', [name, message], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro interno do servidor');
        }

        // Emite a mensagem para todos os clientes conectados
        io.emit('chat message', { name, message });

        // Retorna uma resposta de sucesso
        res.sendStatus(200);
    });
});

// Rota para obter todas as mensagens do chat
app.get('/chat', (req, res) => {
    // Consulta o banco de dados para obter todas as mensagens do chat
    db.all('SELECT * FROM chat_messages ORDER BY timestamp', (err, messages) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro interno do servidor');
        }

        // Retorna as mensagens do chat como JSON
        res.json(messages);
    });
});

// Inicia o servidor
server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

// Lógica do Socket.IO para manipular conexões de chat em tempo real
io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    // Lógica do Socket.IO para manipular desconexões de chat em tempo real
    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});
