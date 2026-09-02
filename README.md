# RabbitMQ com Node.js e TypeScript
Projeto criado para estudar a integração entre Node.js, TypeScript e RabbitMQ.

## Tecnologias utilizadas
Node.js
TypeScript
RabbitMQ
Docker e Docker Compose
Amqplib
Configuração do RabbitMQ
O RabbitMQ é executado utilizando Docker Compose.

Para iniciar o serviço:


## Configurações utilizadas:

Usuário: admin
Senha: admin
Porta AMQP: 5672
Painel administrativo: http://localhost:15672
Estrutura do projeto

Conexão
O arquivo connection.ts demonstra como:

Conectar ao RabbitMQ;
Criar um canal de comunicação;
Manter a conexão ativa;
Fechar o canal e a conexão corretamente.
Producer
O arquivo producer.ts cria ou verifica a existência da fila hello e envia a mensagem:


Consumer
O arquivo consumer.ts monitora a fila hello, recebe as mensagens e exibe seu conteúdo no terminal.

Após processar cada mensagem, o consumidor confirma o recebimento utilizando channel.ack().

## Executando o projeto
Com o RabbitMQ em execução, abra um terminal e inicie o consumidor:


Em outro terminal, execute o produtor:


O consumidor deverá exibir a mensagem enviada pelo produtor.

Objetivo
O objetivo deste projeto é compreender, na prática:

Como configurar o RabbitMQ;
Como estabelecer uma conexão com o servidor;
Como criar canais e filas;
Como enviar mensagens;
Como consumir mensagens;
Como confirmar o processamento das mensagens.
