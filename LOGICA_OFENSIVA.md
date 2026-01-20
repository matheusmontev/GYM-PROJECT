# 🔥 Lógica de Ofensiva e Dias Consecutivos (Streak)

Este documento descreve detalhadamente o funcionamento do sistema de **Histórico de Treinos** e **Cálculo de Ofensiva** do GYM-PRO.

## 🎯 Objetivo
O sistema visa engajar o aluno através da gamificação, recompensando a consistência nos treinos. O foco não é apenas em "treinar todo dia", mas em **seguir o plano**, respeitando inclusive os dias de descanso programados.

---

## 📅 Status dos Dias

O calendário opera com 3 status principais, definidos exclusivamente pelo **Treinador**:

1.  **✅ Treinou (Verde)**
    *   Indica que o aluno cumpriu o treino do dia.
    *   **Efeito na Ofensiva:** Soma +1 dia à contagem atual e mantém a sequência viva.

2.  **🔵 Descanso (Azul)**
    *   Indica um dia programado de recuperação.
    *   **Efeito na Ofensiva:** **Não quebra** a sequência (a chama continua acesa), mas também **não soma** na contagem numérica. É um "congelamento" estratégico.
    *   *Exemplo:* Se o aluno tem ofensiva de 5, descansa no sábado (Descanso) e treina no domingo, a ofensiva vai para 6.

3.  **🔴 Falta / Não Treinou (Vermelho)**
    *   Indica que o aluno deveria ter treinado, mas não foi.
    *   **Efeito na Ofensiva:** **Quebra** a sequência imediatamente. A contagem volta para 0.

4.  **⚪ Vazio / Não Marcado**
    *   Dias no passado sem marcação são interpretados como falta de confirmação.
    *   **Efeito na Ofensiva:** Quebra a sequência se for um dia passado.

---

## 🏆 Regras de Cálculo

### Ofensiva Atual (Fogo 🔥)
É o número de dias consecutivos que o aluno manteve a disciplina.
*   A contagem olha para trás a partir de "Hoje".
*   Se "Hoje" ainda não tem status, olhamos para "Ontem".
*   A contagem continua somando dias `Treinou` e pulando dias `Descanso` até encontrar uma `Falta` ou um `Buraco` (dia sem status no passado).

### Recorde (Troféu 🏆)
É a maior "Ofensiva Atual" que o aluno já atingiu em toda a sua história na plataforma.
*   Este número nunca diminui. Ele só aumenta se o aluno superar seu próprio recorde anterior.

---

## 🔄 Reset Semanal vs. Histórico Permanente

É importante diferenciar o **Painel de Treinos** do **Calendário de Histórico**:

*   **Painel de Treinos (Tela Principal):**
    *   Os "tiques" (check-boxes) dos exercícios são para controle da semana corrente.
    *   **Reset Automático:** Todo **Domingo às 22h**, os exercícios marcados na tela principal são limpos para preparar a nova semana.
    *   *Isso NÃO afeta a ofensiva.*

*   **Calendário de Histórico (Modal):**
    *   É o banco de dados permanente.
    *   O reset semanal **não apaga** bolinhas verdes/azuis/vermelhas do calendário.
    *   A ofensiva e o recorde são calculados com base neste histórico permanente, não nos tiques da semana.

---

## 👥 Permissões

*   **Treinador:** Tem controle total. Pode marcar dias passados, alterar status de treinou para falta (e vice-versa) através do seu painel e ver a ofensiva de qualquer aluno.
*   **Aluno:** Visualização apenas ("Read-Only"). O aluno vê seu calendário e seus recordes, mas não pode se "auto-confirmar". Isso garante a veracidade dos dados validados pelo profissional.
