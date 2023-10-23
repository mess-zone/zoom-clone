export function nomeAnimalAleatorio(): string {
    const animais = [
        "Cachorro",
        "Gato",
        "Elefante",
        "Leão",
        "Tigre",
        "Pássaro",
        "Tartaruga",
        "Girafa",
        "Peixe",
        "Borboleta",
    ];

    const indiceAleatorio = Math.floor(Math.random() * animais.length);
    return animais[indiceAleatorio];
}

export function adjetivoAleatorio(): string {
    const adjetivos = [
        "alegre",
        "ousado",
        "esperto",
        "engraçado",
        "gentil",
        "criativo",
        "curioso",
        "sábio",
        "poderoso",
        "amigável",
    ];

    const indiceAleatorio = Math.floor(Math.random() * adjetivos.length);
    return adjetivos[indiceAleatorio];
}

export function corAleatoriaCSS(): string {
    const letrasHex = "0123456789ABCDEF";
    let cor = "#";

    for (let i = 0; i < 6; i++) {
        const indiceAleatorio = Math.floor(Math.random() * 16);
        cor += letrasHex[indiceAleatorio];
    }

    return cor;
}

export function generateRandomUser() {
    const nomeAnimal = nomeAnimalAleatorio();
    const adjetivo = adjetivoAleatorio();
    const corCSS = corAleatoriaCSS();

    return {
        name: `${nomeAnimal} ${adjetivo}`,
        color: corCSS,
    }
}
