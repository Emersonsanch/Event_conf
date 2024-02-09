// Recupera todas as mensagens do chat do servidor e exibe-as
function getChatMessages() {
    fetch('/chat')
        .then(response => response.json())
        .then(messages => {
            const ul = document.getElementById('messages');
            messages.forEach(message => {
                const li = document.createElement('li');
                li.appendChild(document.createTextNode(`${message.name}: ${message.message}`));
                ul.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao obter mensagens do chat:', error));
}

// Chama a função para obter mensagens do chat ao carregar a página
getChatMessages();

// Manipula mensagens de chat recebidas
socket.on('chat message', function (data) {
    var ul = document.getElementById('messages');
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(`${data.name}: ${data.message}`));
    ul.appendChild(li);
});

// Manipula o envio do formulário de chat
document.getElementById('chat-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var input = document.getElementById('m');
    var message = input.value.trim();
    if (message !== '') {
        // Envia a mensagem para o servidor
        fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: window.chatName, message: message })
        })
            .catch(error => console.error('Erro ao enviar mensagem do chat:', error));

        input.value = '';
    }
});







function toggleChat() {
    var chatContainer = document.getElementById('chat-container');
    chatContainer.style.display = (chatContainer.style.display === 'none' || chatContainer.style.display === '') ? 'block' : 'none';
}



    document.addEventListener('DOMContentLoaded', function () {
        // Seu código existente ...

        // Adiciona um ouvinte de evento ao formulário
        document.querySelector('form').addEventListener('submit', function (event) {
            event.preventDefault();

            // Chama a função para iniciar o efeito de confete
            startConfetti();

            // Aqui você pode enviar os dados do formulário para o servidor, se necessário
            // fetch('/confirm', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         name: document.getElementById('name').value,
            //         // Adicione outros campos conforme necessário
            //     })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     // Manipule a resposta do servidor conforme necessário
            // })
            // .catch(error => console.error('Erro ao enviar formulário:', error));
        });

        // Função para iniciar o efeito de confete
        function startConfetti() {
            // Cria um elemento de confete
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            document.body.appendChild(confetti);

            // Adiciona classes de animação ao confete
            confetti.classList.add('confetti-fall');

            // Remove o confete após a animação
            confetti.addEventListener('animationend', function () {
                document.body.removeChild(confetti);
            });
        }
    });
