# Operação, observabilidade e incidentes

## Métricas essenciais

- `messages_ready`, `messages_unacknowledged` e idade da mensagem mais antiga;
- publish, deliver/consume, ack, redelivery e reject rates;
- conexões, canais, consumers e churn;
- memória, disco, file descriptors, alarmes e estado do cluster;
- latência e erro do handler/downstream;
- tamanho e crescimento de retry/DLQ/outbox.

Alertas devem refletir impacto sustentado, não um pico isolado. Backlog crescente com taxa de entrada maior que a de ack indica capacidade insuficiente ou lentidão downstream.

## Logs e tracing

Registre `messageId`, `correlationId`, `causationId`, tipo, exchange, routing key, fila, tentativa, duração e resultado. Propague contexto de tracing nos headers usando padrões adotados pelo projeto. Não use alta cardinalidade sem controle em métricas.

## Health checks

- Liveness: processo ainda consegue progredir; não reinicie por uma dependência externa brevemente indisponível sem necessidade.
- Readiness: instância está apta a receber/tratar trabalho.
- Um socket aberto não prova que publicação/consumo funciona; escolha checks que representem a capacidade necessária sem gerar carga excessiva.

## Docker e Kubernetes

- Use volumes persistentes conforme a estratégia de durabilidade/cluster.
- Configure requests/limits com margem; alarmes de memória/disco são mecanismos de proteção.
- Use PodDisruptionBudget, anti-affinity e estratégia de upgrade quando a disponibilidade exigir.
- Garanta encerramento gracioso e `terminationGracePeriodSeconds` compatível com mensagens em voo.
- Não exponha management UI publicamente. Use TLS, usuários por aplicação, vhosts e permissões mínimas.
- Kubernetes Service e DNS não substituem desenho correto de cluster, quorum e recuperação.

## Roteiro de incidente

1. Quantifique impacto, fila afetada, início e tendência.
2. Compare publish rate, ack rate, ready, unacked e idade.
3. Verifique consumers ativos, erros/restarts e latência downstream.
4. Examine alarmes de memória/disco, conexões/canais e estado dos nós.
5. Confirme mudança recente em deploy, contrato, política, credencial ou rede.
6. Mitigue com ação reversível: pausar produtor quando seguro, reduzir carga, corrigir downstream, ajustar concorrência gradualmente ou isolar poison messages.
7. Valide recuperação pela redução da idade/backlog, não apenas por logs “sem erro”.

## Sintoma para hipótese

| Sintoma | Hipóteses prioritárias |
| --- | --- |
| `ready` cresce | consumidor lento/ausente, prefetch/concorrência baixa, downstream lento, mensagem venenosa. |
| `unacked` alto | handlers travados/lentos, prefetch excessivo, ack não executado. |
| muitas redeliveries | crash, timeout, nack/requeue, perda de conexão, falta de idempotência. |
| publish bloqueado | alarmes de recurso, confirms atrasados, conexão/canal com problema. |
| DLQ cresce | contrato quebrado, falha permanente, política de retry inadequada. |
| conexões/canais crescem | vazamento ou criação por operação/mensagem. |

## Mudanças perigosas

Antes de purge, delete, shovel, federation, alteração de quorum, reprocessamento em massa ou redução de retenção, exigir autorização, backup/export quando aplicável, contagem de mensagens, plano de rollback e janela de impacto.
