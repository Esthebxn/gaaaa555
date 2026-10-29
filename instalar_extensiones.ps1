# Instala las extensiones de VS Code usadas en el proyecto
$code = (Get-Command code -ErrorAction SilentlyContinue).Source
if (-not $code) { throw "Instala VS Code y su comando code (Ctrl+Shift+P > Shell Command: Install code command in PATH)." }
& $code --install-extension anthropic.claude-code --force
& $code --install-extension burkeholland.simple-react-snippets --force
& $code --install-extension codeflow-studio.claude-code-extension --force
& $code --install-extension codezombiech.gitignore --force
& $code --install-extension daviddai.deepseek-code-generator --force
& $code --install-extension dsznajder.es7-react-js-snippets --force
& $code --install-extension google.google-antigravity --force
& $code --install-extension hidenobunagai.nvidia-nim-provider --force
& $code --install-extension ikasann-self.vscode-chat-gpt --force
& $code --install-extension jakobhoeg.vscode-pokemon --force
& $code --install-extension mccarter.start-git-bash --force
& $code --install-extension ms-ceintl.vscode-language-pack-es --force
& $code --install-extension msjsdiag.vscode-react-native --force
& $code --install-extension openai.chatgpt --force
& $code --install-extension openai.codex-audio --force
& $code --install-extension pkief.material-icon-theme --force
& $code --install-extension unthrottled.doki-theme --force
