# Atividades da Equipe

Agenda, tarefas e observações do **Victor**, **Vinicius Titon** e **Paulo Pecuch**. Funciona no celular como um app,
sem login e de graça, no GitHub Pages.

Site: https://vctoragto.github.io/atividades/

## Como usar

- **Campo rápido (tela Hoje):** escreva ou toque no 🎤 e fale. O app entende:
  - datas: `hoje`, `amanhã`, `depois de amanhã`, `sexta`, `próxima segunda`, `dia 15`, `15/10`, `semana que vem`, `em 3 dias`
  - horas: `14h`, `14:30`, `às 9`, `meio-dia`, `de manhã`, `à tarde`, `à noite`
  - pessoas: `@paulo`, `Paulo: revisar contrato`, `tarefa do Vinicius ...`, `pra todos`
  - `urgente` ou `!` deixa a tarefa urgente; se começar com `obs:` vira observação
  - exemplo: `amanhã às 14h reunião com cliente @paulo urgente`
- **Hoje:** atrasadas, hoje, amanhã, próximos dias e o que está sem data. Filtro por pessoa.
- **Agenda:** os próximos dias numa faixa e o calendário do mês, com bolinhas da cor de cada pessoa.
- **Notas:** as observações e o histórico do que foi concluído.
- **Equipe:** quanto cada um tem pendente, atrasado e para a semana.
- Para instalar no celular: abra o site e use **Adicionar à tela inicial**.

## Sincronização (uma vez só)

Sem servidor, os dados ficam no `data.json` deste repositório. Para **gravar**, cada aparelho precisa de uma
"chave", que é um token do GitHub. Sem a chave, o app só mostra os dados.

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Repository access:** *Only select repositories* → `atividades`.
3. **Permissions → Repository permissions → Contents: Read and write**. Mais nada.
4. Copie o token (`github_pat_...`), abra o app → toque no seu avatar (canto superior direito) → cole em
   **Chave de sincronização** → **Salvar chave**.
5. Ainda nos Ajustes, use **Mandar link de acesso** para o Vinicius e o Paulo (WhatsApp). Quem abre o link já
   entra conectado e com o nome certo.

O app sincroniza sozinho a cada 30 segundos e quando você volta para ele. Se duas pessoas mexerem ao mesmo
tempo, ele junta as alterações item por item. Sem internet, guarda no aparelho e envia depois.

⚠️ O repositório é público (o GitHub Pages grátis exige isso), então **o conteúdo do `data.json` pode ser visto
por qualquer pessoa** que achar o repositório. Não coloque senhas nem dados sensíveis. O link de acesso tem a
chave dentro: mande só para a equipe. Se ele vazar, revogue o token no GitHub e gere outro.

## Arquivos

- `index.html`, `style.css`, `app.js`: o app
- `data.json`: os dados (atualizado pelo próprio app)
- `logo.png`, `manifest.webmanifest`: ícone e instalação no celular
