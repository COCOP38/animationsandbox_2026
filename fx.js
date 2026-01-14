document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('triggerZone');
    const panel = document.getElementById('chatPanel');
    const closeBtn = document.getElementById('closeBtn');
    const body = document.body;

    // --- Séquence Temporelle (États n0 -> n1 -> n2) ---
    
    // 1. Délai initial (n0)
    setTimeout(() => {
        // 2. Animation d'amorçage (Sort et rentre)
        trigger.classList.add('intro-anim');
        
        // Une fois l'intro finie, on passe en mode PULSE (n1)
        setTimeout(() => {
            trigger.classList.remove('intro-anim');
            trigger.classList.add('pulse');
        }, 1500);

        // 3. Apparition de l'étiquette (n2) après 3 secondes de pulse
        setTimeout(() => {
            trigger.setAttribute('data-label', 'Un conseil ?');
            trigger.classList.add('flag-visible');
            
            // On cache l'étiquette après 4s pour ne pas polluer
            setTimeout(() => {
                trigger.classList.remove('flag-visible');
            }, 4000);
        }, 4500);

    }, 1000); // Commence 1s après le chargement de la page


    // --- Logique Drag & Swipe (Souris + Tactile) ---
    
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    const dragThreshold = 0.3; // 30% de l'écran

    // Fonction unifiée pour démarrer le drag
    const startDrag = (clientX) => {
        isDragging = true;
        startX = clientX;
        // Stop animations et transitions pour fluidité max
        trigger.classList.remove('pulse', 'intro-anim');
        trigger.style.transition = 'none';
        panel.style.transition = 'none';
    };

    // Fonction unifiée pour le mouvement
    const moveDrag = (clientX) => {
        if (!isDragging) return;
        
        const delta = clientX - startX; // Négatif quand on va vers la gauche
        
        // On autorise seulement le drag vers la gauche
        if (delta < 0) {
            // Effet élastique sur le trigger
            trigger.style.transform = `translateY(-50%) translateX(${delta}px)`;
            
            // Le panneau suit (il est décalé de sa propre largeur initialement)
            // position = LargeurPanel + delta (ex: 300 + -50 = 250)
            const panelWidth = panel.offsetWidth;
            const newPos = Math.max(0, panelWidth + delta); // Ne va pas plus loin que 0
            panel.style.transform = `translateX(${newPos}px)`;
        }
    };

    // Fonction unifiée pour la fin
    const endDrag = (clientX) => {
        if (!isDragging) return;
        isDragging = false;
        
        // On remet les transitions CSS
        trigger.style.transition = '';
        panel.style.transition = '';
        trigger.style.transform = ''; // Nettoie le style inline
        panel.style.transform = '';

        const delta = startX - clientX; // Distance parcourue vers la gauche
        const screenW = window.innerWidth;

        // Si on a tiré plus de 30% de l'écran OU fait un geste rapide
        if (delta > screenW * dragThreshold) {
            openChat();
        } else {
            closeChat();
        }
    };

    // --- Événements TACTILES ---
    trigger.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX), {passive: true});
    window.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX), {passive: true});
    window.addEventListener('touchend', (e) => endDrag(e.changedTouches[0].clientX));

    // --- Événements SOURIS (Pour tester sur PC) ---
    trigger.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Évite la sélection de texte
        startDrag(e.clientX);
    });
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
    window.addEventListener('mouseup', (e) => endDrag(e.clientX));


    // --- Ouverture / Fermeture ---
    function openChat() {
        body.classList.add('chat-open');
        trigger.classList.remove('pulse', 'flag-visible'); // Reset états
    }

    function closeChat() {
        body.classList.remove('chat-open');
        // On remet le pulse après un court délai
        setTimeout(() => trigger.classList.add('pulse'), 500);
    }

    // Clic simple sur le trigger (sans drag)
    trigger.addEventListener('click', () => {
        // Petite sécu pour ne pas ouvrir si on vient de draguer
        if(!isDragging) openChat();
    });

    // Bouton Fermer
    closeBtn.addEventListener('click', closeChat);
});

// ... code précédent ...
    
    // Référence au nouvel élément Glow
    const touchGlow = document.getElementById('touchGlow');

    let isDragging = false;
    let startX = 0;
    
    // Fonction helper pour mettre à jour la position de la lumière
    const updateGlowPosition = (clientY) => {
        // On récupère la position du trigger par rapport à l'écran
        const rect = trigger.getBoundingClientRect();
        
        // On calcule la position Y relative à l'intérieur du trigger
        // (clientY est global, rect.top est la position du haut du trigger)
        let relativeY = clientY - rect.top;
        
        // On s'assure que la lumière ne sort pas de la boîte
        relativeY = Math.max(0, Math.min(relativeY, rect.height));
        
        // Application
        touchGlow.style.top = `${relativeY}px`;
    };

    // --- 1. DÉBUT DU DRAG ---
    const startDrag = (clientX, clientY) => {
        isDragging = true;
        startX = clientX;
        
        // Feedback visuel immédiat
        trigger.classList.add('active-touch'); // Active la distorsion et montre la lumière
        trigger.classList.remove('pulse', 'intro-anim');
        
        // On positionne la lumière immédiatement sous le doigt
        updateGlowPosition(clientY);

        trigger.style.transition = 'none';
        panel.style.transition = 'none';
    };

    // --- 2. MOUVEMENT ---
    const moveDrag = (clientX, clientY) => {
        if (!isDragging) return;
        
        // Mise à jour de la lumière en temps réel
        updateGlowPosition(clientY);

        const delta = clientX - startX;
        
        if (delta < 0) {
            // Déplacement physique
            trigger.style.transform = `translateY(-50%) translateX(${delta}px)`;
            
            const panelWidth = panel.offsetWidth;
            const newPos = Math.max(0, panelWidth + delta);
            panel.style.transform = `translateX(${newPos}px)`;
        }
    };

    // --- 3. FIN DU DRAG ---
    const endDrag = (clientX) => {
        if (!isDragging) return;
        isDragging = false;
        
        // On retire les feedbacks visuels
        trigger.classList.remove('active-touch');
        
        trigger.style.transition = '';
        panel.style.transition = '';
        trigger.style.transform = ''; 
        panel.style.transform = '';

        const delta = startX - clientX; 
        const screenW = window.innerWidth;

        if (delta > screenW * dragThreshold) {
            openChat();
        } else {
            closeChat();
        }
    };

    // --- Événements TACTILES (Updated) ---
    trigger.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY), {passive: true});
    window.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY), {passive: true});
    window.addEventListener('touchend', (e) => endDrag(e.changedTouches[0].clientX));

    // --- Événements SOURIS (Updated) ---
    trigger.addEventListener('mousedown', (e) => {
        e.preventDefault(); 
        startDrag(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', (e) => endDrag(e.clientX));

    // ... le reste du code (openChat, closeChat) ...
