# Sobre mim

Página pessoal estática. Fontes e imagens remotas requerem internet.

## Rodar localmente

Na raiz do repositório, execute:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra <http://localhost:8000/>.

## Estrutura

`index.html`: página servida no navegador. `Ads`: original sem extensão, mantido para preservar o caminho legado. Atualize `index.html` para alterar a página publicada.

A CI valida o HTML e verifica arquivos e âncoras locais. Links e serviços externos não são consultados pela CI.
