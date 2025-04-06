document.getElementById('show-info').addEventListener('click', function (event) {
    event.preventDefault(); // Sprečava preusmjeravanje
    const infoBlock = document.getElementById('info-block');
    if (infoBlock.style.display === 'none' || infoBlock.style.display === '') {
        infoBlock.style.display = 'block';
    } else {
        infoBlock.style.display = 'none';
    }
});