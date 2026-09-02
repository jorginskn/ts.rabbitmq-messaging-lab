# Confiabilidade e consistência

## Modelo mental

RabbitMQ pode confirmar que aceitou uma publicação e pode redeliver uma mensagem não confirmada pelo consumidor. Isso não garante que o efeito no banco ocorreu uma única vez. Projete para duplicatas.

## Idempotência

- Escolha uma chave estável: `messageId` para repetição da mesma mensagem ou chave de negócio para impedir efeito semanticamente duplicado.
- Armazene estado com retenção compatível com a janela de redelivery/replay.
- Um `SELECT` seguido de efeito sem proteção concorrente pode duplicar. Prefira constraint única, insert condicional ou transação apropriada.
- Quando a mensagem já tiver sido processada, normalmente faça ack sem repetir o efeito.

## Retry e DLQ

- Retry imediato: poucas tentativas para falhas muito breves.
- Retry atrasado: filas com TTL + dead-letter, delayed-message plugin quando aprovado, ou recurso equivalente do framework.
- Use backoff e jitter quando muitos consumidores atingem a mesma dependência.
- Preserve mensagem original, identificadores, contagem de tentativas, último erro sanitizado e timestamps.
- Depois do limite, envie à DLQ/quarentena e gere alerta. Reprocessamento deve ser auditável, limitado e idempotente.

Evite cadeia sem limite de filas de retry e TTL por mensagem em uma mesma fila quando a ordenação interna do TTL puder atrasar mensagens menores. Avalie filas por faixa de atraso ou plugin suportado.

## Ack e falhas

| Momento da falha | Resultado esperado |
| --- | --- |
| Antes do efeito | Mensagem pode ser redelivered; repetir é seguro. |
| Depois do efeito, antes do ack | Mensagem será potencialmente duplicada; idempotência impede novo efeito. |
| Contrato inválido | Não repetir indefinidamente; DLQ/quarentena. |
| Dependência temporariamente fora | Retry atrasado com limite e backpressure. |

## Outbox e Inbox

- Outbox resolve o intervalo entre commit no banco e publicação, mas pode publicar duplicado.
- Inbox registra processamento recebido e ajuda a tornar o consumidor idempotente.
- O dispatcher precisa de locking/claim seguro, limite de lote, confirmação, retentativa e métricas de idade/backlog.
- Limpeza precisa considerar auditoria, replay e retenção legal/operacional.

## Contratos

- Prefira mudanças aditivas; consumidores devem tolerar campos desconhecidos.
- Não reutilize campo com semântica diferente.
- Versione quando houver quebra real e planeje coexistência/migração.
- Inclua unidade, timezone e semântica de ausência/null quando relevantes.
- Valide tamanho e schema antes de executar regra de negócio.

## Garantias que não devem ser prometidas

- “Exactly once” ponta a ponta sem explicar escopo e mecanismo.
- Ordenação global com múltiplos consumidores concorrentes.
- Persistência absoluta apenas por marcar mensagem como persistent.
- Ausência de duplicatas apenas por usar ack manual.
