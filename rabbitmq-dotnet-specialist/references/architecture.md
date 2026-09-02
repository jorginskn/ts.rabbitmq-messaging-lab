# Arquitetura e topologia

## Escolha da exchange

| Necessidade | Tipo | Decisão |
| --- | --- | --- |
| Um destino conhecido | direct | Routing key exata; simples e explícita. |
| Eventos por domínio e padrão | topic | Use chaves como `pedido.criado.v1`; evita uma exchange por evento. |
| Broadcast para todos os bindings | fanout | Ignora routing key; útil para notificações amplas. |
| Roteamento por atributos de headers | headers | Use apenas quando routing keys não modelarem bem a regra. |

Não use a mesma fila para consumidores que precisam receber cada um uma cópia. Consumidores na mesma fila competem; filas diferentes ligadas à mesma exchange recebem cópias independentes.

## Padrões

- **Comando:** intenção direcionada, nome imperativo, normalmente um responsável. Ex.: `GerarRelatorio`.
- **Evento:** fato imutável ocorrido, pode ter vários consumidores. Ex.: `PedidoCriado`.
- **Request/reply:** possível, mas cria acoplamento temporal. Para operações longas, prefira resposta assíncrona por evento/status.
- **Work queue:** várias instâncias competem na mesma fila para escalar processamento.
- **Saga/process manager:** coordena fluxo distribuído e compensações; não promete transação ACID entre serviços.

## Convenções sugeridas

- Exchanges: `<dominio>.<categoria>`, por exemplo `pedidos.events`.
- Routing keys: `<agregado>.<evento>.v<major>`, por exemplo `pedido.criado.v1`.
- Filas: `<servico>.<finalidade>.v<major>`, por exemplo `faturamento.pedido-criado.v1`.
- DLQ: `<fila>.dlq` e exchange de dead letter explícita.

Adapte à convenção existente antes de criar outra. Identifique o serviço proprietário da fila; o publicador é proprietário do contrato/evento, enquanto o consumidor costuma ser proprietário da fila e de sua política operacional.

## Dimensionamento inicial

- Throughput necessário: `taxa de chegada × tempo médio de processamento` orienta concorrência mínima.
- Prefetch baixo reduz trabalho preso por consumidor; alto melhora throughput, mas aumenta memória, latência desigual e quantidade redelivered após falha.
- Mensagens devem ser pequenas. Armazene payloads grandes em storage adequado e publique referência segura quando necessário.
- Se ordenação for obrigatória, explicite o escopo da ordem. Concorrência e redelivery quebram ordem global; considere particionamento lógico, chave de agregação ou consumidor serial por partição.

## Perguntas de arquitetura

1. É comando ou evento?
2. Cada consumidor recebe uma cópia ou compete pelo trabalho?
3. Qual perda, duplicação, atraso ou reordenação o negócio tolera?
4. O que ocorre se o broker, consumidor ou banco cair em cada etapa?
5. Como o contrato evolui?
6. Como mensagens problemáticas são inspecionadas e reprocessadas?
