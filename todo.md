# Sistema de Gerenciamento de Chaves - TODO

## Banco de Dados e Backend
- [x] Criar schema do banco de dados (usuários, revendedores, keys, créditos)
- [x] Gerar e aplicar migrações SQL
- [x] Implementar autenticação local com hash de senha
- [x] Criar seed de usuário administrador padrão

## Autenticação e Sessão
- [x] Implementar login/logout com sessão local
- [x] Criar middleware de proteção de rotas
- [x] Implementar verificação de role (admin/revendedor)

## API de Validação de Keys
- [x] Criar endpoint POST /api/validate-key
- [x] Implementar lógica de validação de key
- [x] Testar validação com diferentes estados de key

## Geração e Gerenciamento de Keys
- [x] Implementar geração de keys no formato PROXY-ANDROID-XXXXXXXXXXXXXXX
- [x] Criar sistema de planos (1, 7, 30 dias)
- [x] Implementar geração em lote de keys
- [x] Criar funcionalidades de pausar, banir e resetar dispositivo
- [x] Implementar contagem de tempo apenas após ativação

## Sistema de Créditos
- [x] Criar tabela de transações de crédito
- [x] Implementar custo de crédito por plano
- [x] Criar endpoint para adicionar créditos a revendedor
- [x] Implementar validação de créditos suficientes

## Gerenciamento de Revendedores
- [x] Criar CRUD de revendedores (admin only)
- [x] Implementar criação de revendedor com usuário, senha e saldo inicial
- [x] Criar listagem de revendedores com saldo de créditos

## Interface de Login
- [x] Criar tela de login com campos de usuário e senha
- [x] Implementar validação de credenciais
- [x] Adicionar mensagens de erro/sucesso
- [x] Aplicar estilo branco e vermelho

## Dashboard Admin
- [x] Criar dashboard com estatísticas (total keys, keys ativas, créditos)
- [x] Implementar sidebar de navegação
- [x] Criar seção de gerenciamento de keys
- [x] Criar seção de gerenciamento de revendedores
- [x] Criar seção de criação de keys

## Dashboard Revendedor
- [x] Criar dashboard com estatísticas pessoais
- [x] Implementar sidebar de navegação
- [x] Criar seção de gerenciamento de keys do revendedor
- [x] Criar seção de criação de keys com limite de créditos

## Componentes UI
- [x] Criar componentes de sidebar
- [x] Criar modal de exibição de keys geradas
- [x] Criar componentes de tabela para listagem de keys
- [x] Criar componentes de formulário para criação de keys

## Testes
- [x] Testar fluxo de login
- [x] Testar geração de keys
- [x] Testar validação de keys
- [x] Testar sistema de créditos
- [x] Testar gerenciamento de revendedores
