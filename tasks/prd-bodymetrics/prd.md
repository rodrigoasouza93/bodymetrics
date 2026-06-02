# Documento de Requisitos do Produto (PRD)

**Status:** APROVADO PELO USUÁRIO

## Visão Geral

BodyMetrics é um sistema para pessoas que realizam exames de bioimpedância e querem manter um histórico próprio, centralizado e compreensível da sua evolução física. Hoje, esses exames costumam ficar dispersos em clínicas, arquivos pessoais ou imagens isoladas, dificultando a comparação entre avaliações e a leitura da evolução ao longo do tempo.

A funcionalidade inicial permitirá que o usuário crie uma conta, mantenha um perfil físico, envie um exame de bioimpedância no layout padrão dos exemplos em `docs/bio-rayane.jpeg` e `docs/bio-rodrigo.jpeg`, revise os dados extraídos antes de salvar e acompanhe gráficos comparativos dos exames cadastrados.

O produto deve ajudar o usuário a entender sua evolução de composição corporal de forma informativa, sem diagnóstico médico, prescrição nutricional ou recomendação clínica.

## Objetivos

- Permitir que usuários cadastrem e mantenham seus próprios exames de bioimpedância com privacidade.
- Reduzir o esforço de registro manual por meio de extração de dados a partir de imagem ou PDF do exame.
- Garantir que dados extraídos sejam revisados e confirmados pelo usuário antes de entrarem no histórico.
- Exibir a evolução física por meio de métricas e gráficos comparativos claros.
- Acompanhar métricas de sucesso como: quantidade de contas criadas, exames enviados, exames confirmados, taxa de correção antes do salvamento, quantidade média de exames por usuário e uso dos gráficos de evolução.
- Viabilizar uma base de dados estruturada para futura inclusão de preenchimento manual e suporte a novos layouts de exame.

## Histórias de Usuário

- Como pessoa que faz acompanhamento físico, eu quero criar uma conta para manter meus exames salvos em um lugar privado.
- Como usuário recorrente, eu quero manter meus dados físicos de perfil atualizados para contextualizar minhas análises de evolução.
- Como usuário com um exame de bioimpedância, eu quero enviar uma imagem ou PDF para que o sistema extraia os dados relevantes automaticamente.
- Como usuário, eu quero revisar e corrigir os dados extraídos antes de salvar para evitar que erros de leitura afetem meu histórico.
- Como usuário com múltiplos exames, eu quero comparar massa magra, percentual de gordura, massa de gordura e peso ao longo do tempo para entender minha evolução.
- Como usuário, eu quero receber insights informativos sobre mudanças relevantes entre exames para interpretar melhor minha evolução sem depender apenas de números.
- Como usuário, eu quero editar um exame cadastrado quando identificar erro ou necessidade de ajuste nos dados.
- Como usuário preocupado com privacidade, eu quero acessar apenas meus próprios dados e impedir que outras pessoas vejam minhas informações.

## Principais funcionalidades

### Conta e perfil do usuário

Permite que o usuário crie e mantenha uma conta individual com dados de perfil relevantes para análise física.

Requisitos funcionais:

1. O sistema deve permitir criação de conta de usuário.
2. O sistema deve permitir consulta e alteração de informações de perfil.
3. O perfil deve armazenar dados físicos úteis para análise, incluindo nome, sexo, data de nascimento ou idade, altura, peso de referência quando aplicável e objetivo físico declarado pelo usuário.
4. O sistema deve garantir que cada usuário visualize e gerencie apenas seus próprios dados.

### Cadastro de exame por upload

Permite registrar exames de bioimpedância a partir de arquivo enviado pelo usuário, com suporte inicial ao layout padrão dos exemplos do projeto.

Requisitos funcionais:

5. O sistema deve permitir o envio de imagem ou PDF de exame de bioimpedância.
6. O sistema deve suportar inicialmente o layout padrão representado pelos arquivos `docs/bio-rayane.jpeg` e `docs/bio-rodrigo.jpeg`.
7. O sistema deve extrair dados identificáveis do exame enviado e apresentar os campos ao usuário antes do salvamento.
8. O sistema deve informar ao usuário quando um arquivo não puder ser lido com confiança suficiente.
9. O sistema deve permitir que o usuário cancele o cadastro antes de salvar o exame.

### Revisão e confirmação dos dados extraídos

Evita que erros de leitura sejam incorporados automaticamente ao histórico do usuário.

Requisitos funcionais:

10. O sistema deve apresentar uma tela de revisão com os dados extraídos do exame.
11. O usuário deve conseguir editar campos extraídos antes de confirmar o salvamento.
12. O exame só deve entrar no histórico após confirmação explícita do usuário.
13. O sistema deve destacar campos ausentes, inconsistentes ou de baixa confiança para revisão.

### Dados e métricas do exame

Estrutura os indicadores essenciais para acompanhamento de composição corporal.

Requisitos funcionais:

14. O sistema deve registrar a data e hora do exame quando disponíveis.
15. O sistema deve registrar métricas principais: peso, massa muscular esquelética, massa de gordura, percentual de gordura corporal, IMC e pontuação InBody.
16. O sistema deve registrar métricas de composição corporal quando disponíveis: água corporal total, proteína, minerais e massa livre de gordura.
17. O sistema deve registrar métricas adicionais quando disponíveis: taxa metabólica basal, relação cintura-quadril, nível de gordura visceral, grau de obesidade, peso ideal e controles de peso, gordura e músculo.
18. O sistema deve registrar análises segmentares quando disponíveis, incluindo massa magra e massa gordurosa por braço, perna e tronco.
19. O sistema deve preservar a origem do exame cadastrado para o usuário saber qual arquivo gerou aquele registro.

### Histórico, comparação e gráficos

Permite acompanhar evolução física a partir de múltiplos exames confirmados.

Requisitos funcionais:

20. O sistema deve listar os exames do usuário em ordem cronológica.
21. O sistema deve permitir consultar detalhes de um exame salvo.
22. O sistema deve permitir alterar dados de um exame já cadastrado.
23. O sistema deve exibir gráficos de evolução de peso, massa magra, massa de gordura e percentual de gordura.
24. O sistema deve comparar o exame mais recente com o exame anterior quando houver pelo menos dois exames salvos.
25. O sistema deve indicar variações absolutas e percentuais entre exames comparáveis.
26. O sistema deve lidar com métricas ausentes sem impedir a visualização das demais informações disponíveis.

### Insights informativos

Ajuda o usuário a interpretar mudanças relevantes sem transformar o produto em ferramenta médica.

Requisitos funcionais:

27. O sistema deve gerar insights informativos sobre evolução entre exames, como aumento ou redução de peso, massa magra, massa de gordura e percentual de gordura.
28. Os insights devem deixar claro que são informativos e não substituem avaliação médica, nutricional ou profissional.
29. O sistema não deve emitir diagnóstico, prescrição de dieta, prescrição de treino ou recomendação clínica.

## Experiência do usuário

A experiência principal deve ser simples e orientada à evolução física pessoal:

1. O usuário cria uma conta ou acessa sua conta existente.
2. O usuário completa ou revisa seu perfil físico.
3. O usuário envia uma imagem ou PDF do exame de bioimpedância.
4. O sistema apresenta os dados extraídos em uma tela de revisão.
5. O usuário corrige campos quando necessário e confirma o salvamento.
6. O sistema adiciona o exame ao histórico e atualiza gráficos e comparações.
7. O usuário consulta a evolução e insights informativos.

A interface deve seguir o `DESIGN.md`, com linguagem visual clara, legível e consistente. As telas devem priorizar leitura de dados, revisão segura e comparação visual. Gráficos devem usar rótulos claros, unidades explícitas e estados vazios quando ainda não houver exames suficientes para comparação.

Requisitos de acessibilidade:

- Formulários e campos de revisão devem ter rótulos claros e mensagens de erro compreensíveis.
- A interface deve ser navegável por teclado nas ações principais.
- Cores em gráficos e alertas não devem ser o único meio de comunicar significado.
- Textos, números e unidades devem ter contraste adequado e boa legibilidade.
- Upload, revisão e salvamento devem informar estados de carregamento, sucesso e erro.

## Restrições técnicas de alto nível

- O MVP deve suportar inicialmente o layout padrão de exame de bioimpedância presente nos arquivos de exemplo em `docs`.
- O produto deve aceitar imagem ou PDF como entrada de exame, desde que o arquivo tenha qualidade suficiente para leitura.
- Cada usuário deve acessar apenas os próprios dados, exames, arquivos e gráficos.
- Dados de saúde e composição corporal devem ser tratados como informações sensíveis, com foco em privacidade, segurança e clareza de consentimento.
- O sistema deve manter rastreabilidade entre exame salvo, dados revisados e arquivo de origem.
- A experiência deve prever falhas de leitura, campos ausentes e necessidade de correção manual antes do salvamento.
- Detalhes de arquitetura, bibliotecas, estratégia de extração e armazenamento serão definidos na Especificação Técnica.

## Fora do escopo

- Execução do exame de bioimpedância.
- Compartilhamento de informações com outras pessoas, profissionais, clínicas ou grupos.
- Recomendações médicas, nutricionais ou clínicas.
- Prescrição de treino, dieta, suplementação ou tratamento.
- Integração com clínicas, balanças, dispositivos vestíveis ou equipamentos de bioimpedância.
- Suporte amplo a qualquer layout de exame no MVP.
- Cadastro totalmente manual antes da definição inicial do modelo de dados.
- Análise diagnóstica de doenças, riscos clínicos ou condições médicas.
- Funcionalidades administrativas multiusuário para clínicas ou profissionais de saúde.
