const cursoreVolume = document.getElementById('volumeSlider');
const visualizzaVolume = document.getElementById('volumeValue');


const volumeSalvato = localStorage.getItem('gameVolume') || 25;
cursoreVolume.value = volumeSalvato;
visualizzaVolume.innerText = volumeSalvato;


cursoreVolume.addEventListener('input', () => {
    const valore = cursoreVolume.value;
    visualizzaVolume.innerText = valore;
    
    localStorage.setItem('gameVolume', valore);
});