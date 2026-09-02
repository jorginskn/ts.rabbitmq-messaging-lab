# Implementação .NET

## Escolha da biblioteca

- Use `RabbitMQ.Client` quando precisar de controle direto da topologia, protocolo e ciclo de vida.
- Use MassTransit quando o projeto se beneficiar de abstrações para consumers, retry, outbox, sagas e observabilidade. Considere o custo de abstração e preserve entendimento da topologia criada.
- Confirme a versão instalada antes de gerar código: APIs de conexão, canais, confirms e consumo assíncrono mudam entre versões.

## Producer

O producer deve reutilizar conexão, publicar um DTO versionado, atribuir `messageId`, `correlationId`, tipo e timestamp, serializar de forma determinística e observar confirms. Trate publicação não roteada quando obrigatório. Não declare sucesso de negócio apenas porque `BasicPublish` retornou.

Quando banco e publicação precisam ser consistentes, grave mudança e registro de outbox na mesma transação local. Um dispatcher publica, confirma e marca o registro; falhas podem repetir publicação, portanto o consumidor continua idempotente.

## Consumer

1. Receber e validar metadados/contrato.
2. Verificar idempotência por `messageId` ou chave de negócio.
3. Executar o caso de uso com cancellation e timeout.
4. Persistir resultado e marcador de idempotência de forma coerente quando possível.
5. Ack somente depois do sucesso.
6. Classificar exceções transitórias e permanentes para retry/DLQ.

Use `BackgroundService` ou integração nativa do framework com encerramento gracioso. Ao parar, interrompa novas entregas, aguarde trabalho em voo dentro de um limite e então feche canal/conexão.

## DI e ciclo de vida

- Conexão: longa duração, normalmente singleton gerenciado.
- Canal: siga a documentação da versão; não permita uso concorrente inseguro.
- Consumer handler: escopo por mensagem quando utiliza serviços scoped como `DbContext`.
- Não capture serviços scoped em singleton; crie escopo explicitamente no worker ou deixe o framework fazê-lo.

## Tratamento de exceções

- Transitória: timeout, indisponibilidade temporária, rate limit.
- Permanente: contrato inválido ou regra de negócio definitiva.
- Desconhecida: retry limitado e quarentena com diagnóstico.

Não use `catch (Exception) { nack(requeue: true); }` sem limite. Isso cria hot loop e pode derrubar dependências.

## Testes

- Unitário: handler, serialização, validação e classificação de falhas; não finja validar o broker com mocks.
- Integração: RabbitMQ real via container, declaração de topologia, publish/consume, ack, retry e DLQ.
- Contrato: compatibilidade entre versões do DTO/schema.
- Resiliência: reinício do consumidor, falha após efeito e antes do ack, duplicata e indisponibilidade do downstream.

Evite testes dependentes de `Task.Delay` fixo. Aguarde condições com timeout e capture diagnósticos ao falhar.

## Revisão de código

Verifique: conexão por mensagem, descarte incorreto, canal compartilhado, auto-ack, ack precoce, serialização incompatível, ausência de confirms, requeue infinito, `async void`, cancellation ignorado, segredo em configuração/log, ausência de health/readiness útil e testes que só mockam a biblioteca.
