function openChat() {
  // Prikaži modal nakon skrolovanja
  document.getElementById("razgovori").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
      document.getElementById("chat-modal").style.display = "block";
  }, 500); // Čekaj 500ms dok se skrol ne završi
}


    function closeChat() {
      document.getElementById("chat-modal").style.display = "none";
    }
  

  document.getElementById('toggleCandidates').addEventListener('click', function () {
    const candidatesTable = document.getElementById('candidatesTable');
    if (candidatesTable.style.display === 'none' || !candidatesTable.style.display) {
      candidatesTable.style.display = 'block';
      this.textContent = 'Sakrij kandidate';
    } else {
      candidatesTable.style.display = 'none';
      this.textContent = 'Prikaži kandidate';
    }
  });

