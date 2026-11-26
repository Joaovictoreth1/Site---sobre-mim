export async function copyEmail(address, clipboard) {
    try {
        await clipboard.writeText(address);
        return 'Endereço copiado.';
    } catch {
        return 'Não foi possível copiar automaticamente. Selecione o endereço ou abra o aplicativo de e-mail.';
    }
}

if (typeof document !== 'undefined') {
    if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        const characters = document.querySelectorAll('.animate_characters-character');
        for (const [index, character] of characters.entries()) {
            character.style.transitionDelay = `${index * 25}ms`;
        }
        document.body.classList.add('animate-title');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => document.body.classList.add('loaded'));
        });
    }

    const copyButton = document.getElementById('copyButton');
    const address = document.getElementById('emailAddress');
    const status = document.getElementById('copyStatus');
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
        copyButton.disabled = true;
        status.textContent = '';
        status.textContent = await copyEmail(address.textContent.trim(), navigator.clipboard);
        copyButton.disabled = false;
    });
}
